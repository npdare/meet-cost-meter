import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SyncRequest {
  connection_id?: string
  days_ahead?: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the user from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Invalid user token')
    }

    const { connection_id, days_ahead = 30 }: SyncRequest = await req.json()

    // Get calendar connections
    let connectionsQuery = supabaseClient
      .from('calendar_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (connection_id) {
      connectionsQuery = connectionsQuery.eq('id', connection_id)
    }

    const { data: connections, error: connectionsError } = await connectionsQuery

    if (connectionsError) {
      throw new Error('Failed to fetch calendar connections')
    }

    if (!connections || connections.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active calendar connections found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const syncResults = []

    for (const connection of connections) {
      try {
        let accessToken = connection.access_token

        // Check if token needs refresh
        if (connection.expires_at && new Date(connection.expires_at) <= new Date()) {
          if (connection.refresh_token && connection.provider === 'google') {
            // Refresh Google token
            const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                client_id: Deno.env.get('GOOGLE_OAUTH_CLIENT_ID')!,
                client_secret: Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET')!,
                refresh_token: connection.refresh_token,
                grant_type: 'refresh_token',
              }),
            })

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json()
              accessToken = refreshData.access_token

              const newExpiresAt = refreshData.expires_in 
                ? new Date(Date.now() + refreshData.expires_in * 1000).toISOString()
                : null

              // Update the connection with new token
              await supabaseClient
                .from('calendar_connections')
                .update({
                  access_token: accessToken,
                  expires_at: newExpiresAt
                })
                .eq('id', connection.id)
            } else {
              console.error('Failed to refresh token for connection:', connection.id)
              continue
            }
          } else {
            console.error('Token expired and no refresh token available:', connection.id)
            continue
          }
        }

        if (connection.provider === 'google') {
          // Sync Google Calendar events
          const timeMin = new Date().toISOString()
          const timeMax = new Date(Date.now() + days_ahead * 24 * 60 * 60 * 1000).toISOString()

          const eventsResponse = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
            `timeMin=${encodeURIComponent(timeMin)}&` +
            `timeMax=${encodeURIComponent(timeMax)}&` +
            `singleEvents=true&orderBy=startTime&maxResults=250`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          )

          if (!eventsResponse.ok) {
            throw new Error(`Google Calendar API error: ${await eventsResponse.text()}`)
          }

          const eventsData = await eventsResponse.json()
          const events = eventsData.items || []

          const syncedEvents = []

          for (const event of events) {
            if (!event.start?.dateTime || !event.end?.dateTime) {
              continue // Skip all-day events
            }

            // Check if this is likely a meeting (has attendees or meeting URL)
            const attendees = event.attendees || []
            const isMeeting = attendees.length > 1 || 
                             event.location?.includes('meet.google.com') ||
                             event.location?.includes('zoom.us') ||
                             event.description?.includes('meet.google.com') ||
                             event.description?.includes('zoom.us')

            // Estimate cost based on attendees and duration
            let estimatedCost = 0
            if (isMeeting && attendees.length > 0) {
              const durationHours = (new Date(event.end.dateTime).getTime() - new Date(event.start.dateTime).getTime()) / (1000 * 60 * 60)
              // Rough estimate: $75/hour average per attendee
              estimatedCost = Math.round(attendees.length * 75 * durationHours * 100) / 100
            }

            const eventData = {
              user_id: user.id,
              calendar_connection_id: connection.id,
              provider_event_id: event.id,
              title: event.summary || 'Untitled Event',
              description: event.description || null,
              start_time: event.start.dateTime,
              end_time: event.end.dateTime,
              location: event.location || null,
              attendees: attendees.map((attendee: any) => ({
                email: attendee.email,
                name: attendee.displayName || attendee.email,
                status: attendee.responseStatus
              })),
              meeting_url: extractMeetingUrl(event.description || '', event.location || ''),
              is_meeting: isMeeting,
              estimated_cost: estimatedCost > 0 ? estimatedCost : null,
            }

            syncedEvents.push(eventData)
          }

          // Upsert events
          if (syncedEvents.length > 0) {
            const { error: eventsError } = await supabaseClient
              .from('calendar_events')
              .upsert(syncedEvents, {
                onConflict: 'calendar_connection_id,provider_event_id'
              })

            if (eventsError) {
              console.error('Error syncing events for connection:', connection.id, eventsError)
            }
          }

          syncResults.push({
            connection_id: connection.id,
            provider: connection.provider,
            email: connection.provider_email,
            events_synced: syncedEvents.length,
            meetings_found: syncedEvents.filter(e => e.is_meeting).length
          })
        }

      } catch (error) {
        console.error('Error syncing connection:', connection.id, error)
        syncResults.push({
          connection_id: connection.id,
          provider: connection.provider,
          email: connection.provider_email,
          error: error.message
        })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        sync_results: syncResults,
        total_connections: connections.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Calendar sync error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

function extractMeetingUrl(description: string, location: string): string | null {
  const text = `${description} ${location}`.toLowerCase()
  
  // Common meeting URL patterns
  const patterns = [
    /https?:\/\/meet\.google\.com\/[a-z0-9-]+/i,
    /https?:\/\/.*\.zoom\.us\/[^\s]+/i,
    /https?:\/\/teams\.microsoft\.com\/[^\s]+/i,
    /https?:\/\/.*\.webex\.com\/[^\s]+/i,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      return match[0]
    }
  }

  return null
}