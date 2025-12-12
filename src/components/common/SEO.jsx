import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import ogImageAsset from '../../assets/images/favicon/og-image.png'

/**
 * SEO Component with Open Graph and Twitter Card meta tags
 * Industry standard implementation for social media link previews
 * 
 * @param {Object} props
 * @param {string} props.title - Page title (default: site default)
 * @param {string} props.description - Page description (default: site default)
 * @param {string} props.image - OG image URL (default: imported from assets/images/favicon/og-image.png)
 * @param {string} props.type - OG type (default: 'website')
 * @param {string} props.keywords - Meta keywords
 * @param {string} props.author - Page author
 * @param {Object} props.og - Additional OG properties
 * @param {Object} props.twitter - Additional Twitter Card properties
 */
function SEO({
  title,
  description,
  image,
  type = 'website',
  keywords,
  author,
  og = {},
  twitter = {},
}) {
  const location = useLocation()
  
  // Site defaults
  const siteName = 'Property Insights Australia'
  const siteUrl = typeof window !== 'undefined' 
    ? `${window.location.protocol}//${window.location.host}`
    : 'https://propertyinsights.com.au' // Fallback URL
  const defaultTitle = `${siteName} | Search Property Prices & Market Data`
  const defaultDescription = 'Get instant property estimates, comparable sales, suburb insights, and rental data for any Australian property. Free property reports delivered to your email.'
  // Import og-image from assets (similar to logo pattern) and convert to absolute URL
  const defaultImage = ogImageAsset.startsWith('http') 
    ? ogImageAsset 
    : ogImageAsset.startsWith('/')
    ? `${siteUrl}${ogImageAsset}`
    : `${siteUrl}/${ogImageAsset}`
  
  // Use provided values or fall back to defaults
  const pageTitle = title ? `${title} | ${siteName}` : defaultTitle
  const pageDescription = description || defaultDescription
  const pageImage = image || defaultImage
  const pageUrl = `${siteUrl}${location.pathname}${location.search}`
  
  // Ensure image URL is absolute (handle both imported assets and string paths)
  const ogImage = pageImage.startsWith('http') 
    ? pageImage 
    : pageImage.startsWith('/')
    ? `${siteUrl}${pageImage}`
    : `${siteUrl}/${pageImage}`
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={pageDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      {author && <meta name="author" content={author} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={pageTitle} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_AU" />
      
      {/* Additional OG properties */}
      {og.locale && <meta property="og:locale:alternate" content={og.locale} />}
      {og.article && (
        <>
          {og.article.publishedTime && (
            <meta property="article:published_time" content={og.article.publishedTime} />
          )}
          {og.article.modifiedTime && (
            <meta property="article:modified_time" content={og.article.modifiedTime} />
          )}
          {og.article.author && (
            <meta property="article:author" content={og.article.author} />
          )}
          {og.article.section && (
            <meta property="article:section" content={og.article.section} />
          )}
          {og.article.tags && og.article.tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={twitter.card || "summary_large_image"} />
      <meta name="twitter:url" content={pageUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={pageTitle} />
      {twitter.site && <meta name="twitter:site" content={twitter.site} />}
      {twitter.creator && <meta name="twitter:creator" content={twitter.creator} />}
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="theme-color" content="#10b981" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={pageUrl} />
    </Helmet>
  )
}

export default SEO

