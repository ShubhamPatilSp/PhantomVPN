import { useEffect } from 'react';

/**
 * SEO component — sets document title and meta tags.
 * Lightweight alternative to react-helmet (no extra dependency needed).
 */
export default function SEO({ title, description, path }) {
  useEffect(() => {
    // Set document title
    document.title = title
      ? `${title} — PhantomVPN`
      : 'PhantomVPN — Invisible. Unstoppable. Free.';

    // Set meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description || 'Premium VPN with 95+ server locations. Military-grade encryption, privacy tools, and zero-log policy.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description || 'Premium VPN with 95+ server locations. Military-grade encryption, privacy tools, and zero-log policy.';
      document.head.appendChild(meta);
    }

    // Set canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    const url = `https://phantomvpn.com${path || window.location.pathname}`;
    if (canonical) {
      canonical.setAttribute('href', url);
    } else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = url;
      document.head.appendChild(link);
    }

    // Open Graph meta tags
    setMetaProperty('og:title', title || 'PhantomVPN');
    setMetaProperty('og:description', description || 'Premium VPN with 95+ server locations.');
    setMetaProperty('og:url', url);
    setMetaProperty('og:type', 'website');
    setMetaProperty('og:site_name', 'PhantomVPN');

    // Twitter Card
    setMetaProperty('twitter:card', 'summary_large_image');
    setMetaProperty('twitter:title', title || 'PhantomVPN');
    setMetaProperty('twitter:description', description || 'Premium VPN with 95+ server locations.');
  }, [title, description, path]);

  return null;
}

function setMetaProperty(property, content) {
  // Check both name and property attributes
  let meta = document.querySelector(`meta[property="${property}"]`)
    || document.querySelector(`meta[name="${property}"]`);

  if (meta) {
    meta.setAttribute('content', content);
  } else {
    meta = document.createElement('meta');
    if (property.startsWith('og:') || property.startsWith('twitter:')) {
      meta.setAttribute('property', property);
    } else {
      meta.setAttribute('name', property);
    }
    meta.content = content;
    document.head.appendChild(meta);
  }
}
