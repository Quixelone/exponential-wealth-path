import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export const PionexLogo: React.FC<LogoProps> = ({ size = 40, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" className={className} fill="none">
    <rect width="40" height="40" rx="8" fill="#0066FF"/>
    <path d="M20 10L28 15V25L20 30L12 25V15L20 10Z" fill="white" opacity="0.9"/>
    <path d="M20 18L24 20.5V25.5L20 28L16 25.5V20.5L20 18Z" fill="#0066FF"/>
  </svg>
);

export const BybitLogo: React.FC<LogoProps> = ({ size = 40, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" className={className} fill="none">
    <rect width="40" height="40" rx="8" fill="#F7A600"/>
    <path d="M14 12H18V28H14V12Z" fill="white"/>
    <path d="M22 12H26V20H22V12Z" fill="white"/>
    <path d="M22 24H26V28H22V24Z" fill="white" opacity="0.7"/>
  </svg>
);

export const BinanceLogo: React.FC<LogoProps> = ({ size = 40, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" className={className} fill="none">
    <rect width="40" height="40" rx="8" fill="#F0B90B"/>
    <path d="M20 12L23 15L20 18L17 15L20 12Z" fill="white"/>
    <path d="M14 18L17 21L14 24L11 21L14 18Z" fill="white"/>
    <path d="M26 18L29 21L26 24L23 21L26 18Z" fill="white"/>
    <path d="M20 24L23 27L20 30L17 27L20 24Z" fill="white"/>
    <path d="M20 18L23 21L20 24L17 21L20 18Z" fill="white"/>
  </svg>
);

export const BitgetLogo: React.FC<LogoProps> = ({ size = 40, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" className={className} fill="none">
    <rect width="40" height="40" rx="8" fill="#00C087"/>
    <circle cx="20" cy="20" r="8" fill="white" opacity="0.9"/>
    <path d="M20 14V26M14 20H26" stroke="#00C087" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

export const KucoinLogo: React.FC<LogoProps> = ({ size = 40, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" className={className} fill="none">
    <rect width="40" height="40" rx="8" fill="#24AE8F"/>
    <path d="M14 12V28M14 12L24 20M14 28L24 20M24 20L28 24M24 20L28 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const BingxLogo: React.FC<LogoProps> = ({ size = 40, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" className={className} fill="none">
    <rect width="40" height="40" rx="8" fill="#FF4D6A"/>
    <path d="M20 12L28 16V24L20 28L12 24V16L20 12Z" fill="white" opacity="0.9"/>
    <circle cx="20" cy="20" r="4" fill="#FF4D6A"/>
  </svg>
);
