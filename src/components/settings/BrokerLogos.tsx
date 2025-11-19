import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export const PionexLogo: React.FC<LogoProps> = ({ size = 40, className = '' }) => (
  <img 
    src="https://images.seeklogo.com/logo-png/42/1/pionex-logo-png_seeklogo-426575.png" 
    alt="Pionex"
    width={size}
    height={size}
    className={`${className} object-contain`}
    onError={(e) => {
      e.currentTarget.src = 'https://www.pionex.com/favicon.ico';
    }}
  />
);

export const BybitLogo: React.FC<LogoProps> = ({ size = 40, className = '' }) => (
  <img 
    src="https://logo.clearbit.com/bybit.com" 
    alt="Bybit"
    width={size}
    height={size}
    className={`${className} object-contain`}
    onError={(e) => {
      e.currentTarget.src = 'https://www.bybit.com/favicon.ico';
    }}
  />
);

export const BinanceLogo: React.FC<LogoProps> = ({ size = 40, className = '' }) => (
  <img 
    src="https://logo.clearbit.com/binance.com" 
    alt="Binance"
    width={size}
    height={size}
    className={`${className} object-contain`}
    onError={(e) => {
      e.currentTarget.src = 'https://www.binance.com/favicon.ico';
    }}
  />
);

export const BitgetLogo: React.FC<LogoProps> = ({ size = 40, className = '' }) => (
  <img 
    src="https://logo.clearbit.com/bitget.com" 
    alt="Bitget"
    width={size}
    height={size}
    className={`${className} object-contain`}
    onError={(e) => {
      e.currentTarget.src = 'https://www.bitget.com/favicon.ico';
    }}
  />
);

export const KucoinLogo: React.FC<LogoProps> = ({ size = 40, className = '' }) => (
  <img 
    src="https://logo.clearbit.com/kucoin.com" 
    alt="KuCoin"
    width={size}
    height={size}
    className={`${className} object-contain`}
    onError={(e) => {
      e.currentTarget.src = 'https://www.kucoin.com/favicon.ico';
    }}
  />
);

export const BingxLogo: React.FC<LogoProps> = ({ size = 40, className = '' }) => (
  <img 
    src="https://logo.clearbit.com/bingx.com" 
    alt="BingX"
    width={size}
    height={size}
    className={`${className} object-contain`}
    onError={(e) => {
      e.currentTarget.src = 'https://www.bingx.com/favicon.ico';
    }}
  />
);
