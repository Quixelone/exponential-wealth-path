import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

interface BtcPriceData {
  price: number;
  change24h: number;
  lastUpdated: Date;
}

async function fetchBtcPrice(): Promise<BtcPriceData> {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true'
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch BTC price');
  }
  
  const data = await response.json();
  
  return {
    price: data.bitcoin.usd,
    change24h: data.bitcoin.usd_24h_change || 0,
    lastUpdated: new Date(),
  };
}

export function useRealtimeBtcPrice(refreshInterval = 30000) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['btcPrice'],
    queryFn: fetchBtcPrice,
    refetchInterval: refreshInterval,
    staleTime: refreshInterval - 5000,
    retry: 3,
    retryDelay: 2000,
  });

  return {
    price: data?.price ?? 0,
    change24h: data?.change24h ?? 0,
    lastUpdated: data?.lastUpdated ?? null,
    isLoading,
    error,
    refetch,
  };
}
