import { useState, useEffect } from 'react';

interface CurrencyInfo {
  code: string;
  symbol: string;
  locale: string;
}

// Currency mapping based on country codes
const CURRENCY_MAP: Record<string, CurrencyInfo> = {
  'US': { code: 'USD', symbol: '$', locale: 'en-US' },
  'CA': { code: 'CAD', symbol: 'C$', locale: 'en-CA' },
  'GB': { code: 'GBP', symbol: '£', locale: 'en-GB' },
  'IE': { code: 'EUR', symbol: '€', locale: 'en-IE' },
  'DE': { code: 'EUR', symbol: '€', locale: 'de-DE' },
  'FR': { code: 'EUR', symbol: '€', locale: 'fr-FR' },
  'ES': { code: 'EUR', symbol: '€', locale: 'es-ES' },
  'IT': { code: 'EUR', symbol: '€', locale: 'it-IT' },
  'NL': { code: 'EUR', symbol: '€', locale: 'nl-NL' },
  'AU': { code: 'AUD', symbol: 'A$', locale: 'en-AU' },
  'NZ': { code: 'NZD', symbol: 'NZ$', locale: 'en-NZ' },
  'JP': { code: 'JPY', symbol: '¥', locale: 'ja-JP' },
  'CN': { code: 'CNY', symbol: '¥', locale: 'zh-CN' },
  'IN': { code: 'INR', symbol: '₹', locale: 'en-IN' },
  'BR': { code: 'BRL', symbol: 'R$', locale: 'pt-BR' },
  'MX': { code: 'MXN', symbol: '$', locale: 'es-MX' },
  'CH': { code: 'CHF', symbol: 'CHF', locale: 'de-CH' },
  'SE': { code: 'SEK', symbol: 'kr', locale: 'sv-SE' },
  'NO': { code: 'NOK', symbol: 'kr', locale: 'nb-NO' },
  'DK': { code: 'DKK', symbol: 'kr', locale: 'da-DK' },
  'SG': { code: 'SGD', symbol: 'S$', locale: 'en-SG' },
  'ZA': { code: 'ZAR', symbol: 'R', locale: 'en-ZA' },
};

const DEFAULT_CURRENCY: CurrencyInfo = { code: 'USD', symbol: '$', locale: 'en-US' };

export const useCurrency = () => {
  const [currency, setCurrency] = useState<CurrencyInfo>(DEFAULT_CURRENCY);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectCurrency = async () => {
      try {
        // Try to get user's position
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
          }
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: false,
          });
        });

        // Get country from coordinates using a reverse geocoding service
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
        );
        
        if (response.ok) {
          const data = await response.json();
          const countryCode = data.countryCode;
          
          if (countryCode && CURRENCY_MAP[countryCode]) {
            setCurrency(CURRENCY_MAP[countryCode]);
          }
        }
      } catch (error) {
        // Fallback: try to detect from browser locale
        try {
          const locale = navigator.language || 'en-US';
          const countryCode = locale.split('-')[1]?.toUpperCase();
          
          if (countryCode && CURRENCY_MAP[countryCode]) {
            setCurrency(CURRENCY_MAP[countryCode]);
          }
        } catch {
          // Use default USD
        }
      } finally {
        setIsLoading(false);
      }
    };

    detectCurrency();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: currency.code === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency.code === 'JPY' ? 0 : 2,
    }).format(amount);
  };

  return {
    currency,
    formatCurrency,
    isLoading,
  };
};