import { useEffect } from 'react';
import { useSite } from '../context/SiteContext.jsx';

export default function DynamicFavicon() {
  const { settings } = useSite();

  useEffect(() => {
    const url = settings?.faviconUrl;
    if (!url) return;

    let link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'icon');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }, [settings?.faviconUrl]);

  return null;
}
