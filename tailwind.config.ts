import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Professional slate palette
				slate: {
					50: 'hsl(var(--slate-50))',
					100: 'hsl(var(--slate-100))',
					200: 'hsl(var(--slate-200))',
					300: 'hsl(var(--slate-300))',
					400: 'hsl(var(--slate-400))',
					500: 'hsl(var(--slate-500))',
					600: 'hsl(var(--slate-600))',
					700: 'hsl(var(--slate-700))',
					800: 'hsl(var(--slate-800))',
					900: 'hsl(var(--slate-900))',
				},
				// Financial blue accent palette
				financial: {
					50: 'hsl(var(--financial-50))',
					100: 'hsl(var(--financial-100))',
					200: 'hsl(var(--financial-200))',
					300: 'hsl(var(--financial-300))',
					400: 'hsl(var(--financial-400))',
					500: 'hsl(var(--financial-500))',
					600: 'hsl(var(--financial-600))',
					700: 'hsl(var(--financial-700))',
					800: 'hsl(var(--financial-800))',
					900: 'hsl(var(--financial-900))',
				},
				// Terminal green for gains
				gain: {
					50: 'hsl(var(--gain-50))',
					100: 'hsl(var(--gain-100))',
					200: 'hsl(var(--gain-200))',
					300: 'hsl(var(--gain-300))',
					400: 'hsl(var(--gain-400))',
					500: 'hsl(var(--gain-500))',
					600: 'hsl(var(--gain-600))',
					700: 'hsl(var(--gain-700))',
					800: 'hsl(var(--gain-800))',
					900: 'hsl(var(--gain-900))',
				},
				// Terminal red for losses
				loss: {
					50: 'hsl(var(--loss-50))',
					100: 'hsl(var(--loss-100))',
					200: 'hsl(var(--loss-200))',
					300: 'hsl(var(--loss-300))',
					400: 'hsl(var(--loss-400))',
					500: 'hsl(var(--loss-500))',
					600: 'hsl(var(--loss-600))',
					700: 'hsl(var(--loss-700))',
					800: 'hsl(var(--loss-800))',
					900: 'hsl(var(--loss-900))',
				},
				// Cost status colors
				cost: {
					low: 'hsl(var(--cost-low))',
					medium: 'hsl(var(--cost-medium))',
					high: 'hsl(var(--cost-high))',
					critical: 'hsl(var(--cost-critical))',
				},
				// Dark financial surfaces
				surface: {
					1: 'hsl(var(--surface-1))',
					2: 'hsl(var(--surface-2))',
					3: 'hsl(var(--surface-3))',
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				'sharp': 'var(--shadow-sharp)',
				'elevated': 'var(--shadow-elevated)',
				'overlay': 'var(--shadow-overlay)',
			},
			transitionTimingFunction: {
				'fast': 'var(--transition-fast)',
				'base': 'var(--transition-base)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'pulse-glow': {
					'0%, 100%': {
						opacity: '1',
					},
					'50%': {
						opacity: '0.8',
					}
				},
				'count-up': {
					'0%': {
						transform: 'scale(1)',
					},
					'50%': {
						transform: 'scale(1.05)',
					},
					'100%': {
						transform: 'scale(1)',
					}
				},
				'scroll': {
					'0%': {
						transform: 'translateX(0)',
					},
					'100%': {
						transform: 'translateX(-50%)',
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'count-up': 'count-up 0.3s ease-out',
				'scroll': 'scroll 20s linear infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
