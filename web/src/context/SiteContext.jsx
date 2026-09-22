import { createContext, useContext, useEffect, useState } from 'react';
import { fetchSiteData } from '../api/site';
import {
  menuCategories as fallbackMenu,
  locations as fallbackLocations,
  promotions as fallbackPromotions,
  social as fallbackSocial,
} from '../data/siteData';

const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const [state, setState] = useState({
    loading: true,
    error: null,
    fromFallback: false,
    categories: [],
    products: [],
    menuCategories: [],
    locations: [],
    promotions: [],
    gallery: [],
    settings: null,
    social: fallbackSocial,
  });

  useEffect(() => {
    let active = true;

    fetchSiteData()
      .then((data) => {
        if (!active) return;
        setState({
          loading: false,
          error: null,
          fromFallback: false,
          categories: data.categories,
          products: data.products,
          menuCategories: data.menuCategories,
          locations: data.locations,
          promotions: data.promotions,
          gallery: data.gallery,
          settings: data.settings,
          social: data.social,
        });
      })
      .catch((err) => {
        if (!active) return;
        // Respaldo documentado: si la API no está disponible, se usa el contenido
        // estático de siteData.js para no mostrar el sitio roto.
        console.warn('[site] No se pudo cargar la API; usando contenido de respaldo.', err);
        setState({
          loading: false,
          error: null,
          fromFallback: true,
          categories: [],
          products: [],
          menuCategories: fallbackMenu,
          locations: fallbackLocations,
          promotions: fallbackPromotions,
          gallery: [],
          settings: null,
          social: fallbackSocial,
        });
      });

    return () => {
      active = false;
    };
  }, []);

  return <SiteContext.Provider value={state}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
}
