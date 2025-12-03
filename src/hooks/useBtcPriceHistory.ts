import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BtcPriceResult {
  price: number;
  source: string;
  date: string;
}

// In-memory cache
const priceCache = new Map<string, BtcPriceResult>();

export function useBtcPriceHistory(date: string | null): {
  data: BtcPriceResult | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const [data, setData] = useState<BtcPriceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = useCallback(async () => {
    if (!date) {
      setData(null);
      return;
    }

    // Check cache first
    const cached = priceCache.get(date);
    if (cached) {
      setData(cached);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try to fetch from Supabase btc_prices table
      const { data: dbPrice, error: dbError } = await supabase
        .from('btc_prices')
        .select('price_usd, source, date')
        .eq('date', date)
        .single();

      if (dbPrice && !dbError) {
        const result: BtcPriceResult = {
          price: dbPrice.price_usd,
          source: dbPrice.source || 'database',
          date: dbPrice.date
        };
        priceCache.set(date, result);
        setData(result);
        setLoading(false);
        return;
      }

      // If not in DB, try CoinGecko historical API
      const dateObj = new Date(date);
      const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getFullYear()}`;
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/bitcoin/history?date=${formattedDate}&localization=false`
      );

      if (!response.ok) {
        throw new Error('CoinGecko API error');
      }

      const cgData = await response.json();
      
      if (cgData?.market_data?.current_price?.usd) {
        const price = cgData.market_data.current_price.usd;
        
        // Save to database for future use
        await supabase
          .from('btc_prices')
          .upsert({
            date,
            price_usd: price,
            source: 'coingecko_historical',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'date'
          });

        const result: BtcPriceResult = {
          price,
          source: 'coingecko',
          date
        };
        priceCache.set(date, result);
        setData(result);
      } else {
        setError('Prezzo non disponibile per questa data');
      }
    } catch (err) {
      console.error('Error fetching BTC price:', err);
      setError('Errore nel recupero del prezzo BTC');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  return { data, loading, error, refetch: fetchPrice };
}

// Utility to clear cache (useful for testing)
export function clearBtcPriceCache() {
  priceCache.clear();
}

// Utility to prefetch multiple dates
export async function prefetchBtcPrices(dates: string[]): Promise<void> {
  const uncachedDates = dates.filter(d => !priceCache.has(d));
  
  if (uncachedDates.length === 0) return;

  const { data: dbPrices } = await supabase
    .from('btc_prices')
    .select('price_usd, source, date')
    .in('date', uncachedDates);

  if (dbPrices) {
    for (const price of dbPrices) {
      priceCache.set(price.date, {
        price: price.price_usd,
        source: price.source || 'database',
        date: price.date
      });
    }
  }
}
