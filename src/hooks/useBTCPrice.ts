import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useBTCPrice = (date: string | null) => {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) {
      setPrice(null);
      return;
    }

    const fetchPrice = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check local cache first
        const { data: cached, error: cacheError } = await supabase
          .from('btc_prices')
          .select('price_usd')
          .eq('date', date)
          .maybeSingle();

        if (cacheError) {
          console.error('Error checking BTC price cache:', cacheError);
        }

        if (cached) {
          console.log(`BTC price for ${date} found in cache: $${cached.price_usd}`);
          setPrice(cached.price_usd);
          setLoading(false);
          return;
        }

        // Call edge function to fetch from CoinMarketCap
        console.log(`Fetching BTC price for ${date} from CoinMarketCap...`);
        const { data, error: functionError } = await supabase.functions.invoke('fetch-btc-price', {
          body: { date }
        });

        if (functionError) {
          throw new Error(functionError.message || 'Failed to fetch BTC price');
        }

        if (data?.error) {
          throw new Error(data.error);
        }

        if (data?.price) {
          console.log(`BTC price for ${date}: $${data.price}`);
          setPrice(data.price);
        } else {
          throw new Error('No price data returned');
        }
      } catch (err) {
        console.error('Error fetching BTC price:', err);
        setError(err instanceof Error ? err.message : 'Impossibile recuperare il prezzo BTC');
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
  }, [date]);

  return { price, loading, error };
};
