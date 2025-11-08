import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogType?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

/**
 * SEO component for managing meta tags and document head
 * Uses react-helmet-async for SSR compatibility
 */
export const SEO = ({
  title = 'Finanza Creativa',
  description = 'Piattaforma avanzata per la gestione e simulazione di investimenti finanziari con Bitcoin. Trading di opzioni, strategie PAC, AI coach e segnali di trading in tempo reale.',
  keywords = 'investimenti, bitcoin, trading, opzioni, PAC, finanza, crypto, BTC, strategie, simulazione, AI coach',
  ogType = 'website',
  ogImage = '/lovable-uploads/logo-favicon.png',
  canonicalUrl,
}: SEOProps) => {
  const fullTitle = title === 'Finanza Creativa' ? title : `${title} | Finanza Creativa`;
  const siteUrl = canonicalUrl || typeof window !== 'undefined' ? window.location.href : '';

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Finanza Creativa Team" />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="theme-color" content="#5D87FF" />

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Finanza Creativa" />
      <meta property="og:locale" content="it_IT" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={siteUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Additional Meta Tags for Web App */}
      <meta name="application-name" content="Finanza Creativa" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Finanza Creativa" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />

      {/* Security & Privacy */}
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="referrer" content="origin-when-cross-origin" />
    </Helmet>
  );
};

export default SEO;
