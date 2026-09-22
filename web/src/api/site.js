import { request } from './client';

function deriveTel(phone, whatsapp) {
  if (whatsapp && whatsapp.trim()) return whatsapp.trim();
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (!digits) return null;
  return digits.length === 10 ? `+52${digits}` : `+${digits}`;
}

function mapProduct(product) {
  return {
    name: product.name,
    description: product.description || '',
    price: typeof product.price === 'number' ? `$${product.price.toFixed(2)} pesos` : '',
    image: product.imageUrl || '',
    featured: product.name === 'Karnes en su Jugo',
  };
}

function mapLocation(location) {
  return {
    name: location.name,
    address: location.address,
    phone: location.phone || '',
    tel: deriveTel(location.phone, location.whatsapp),
    image: location.imageUrl || '',
    map: location.mapsUrl || null,
  };
}

function mapPromotion(promotion) {
  const price = typeof promotion.price === 'number' ? `$${promotion.price.toFixed(2)} pesos` : '';
  return {
    name: promotion.title,
    description: promotion.description || '',
    price,
    image: promotion.imageUrl || '',
  };
}

function buildMenuCategories(categories, products) {
  return categories.map((category) => ({
    id: category.id,
    label: category.name,
    items: products.filter((p) => p.categoryId === category.id).map(mapProduct),
  }));
}

export async function fetchSiteData() {
  const [categories, products, locations, promotions, gallery, settings] = await Promise.all([
    request('/categories?limit=100&sort=displayOrder'),
    request('/products?limit=100&sort=displayOrder'),
    request('/locations?limit=100'),
    request('/promotions?limit=100'),
    request('/gallery?limit=100'),
    request('/settings'),
  ]);

  const menuCategories = buildMenuCategories(categories, products);
  const social = {
    facebook: settings?.facebook || '',
    instagram: settings?.instagram || '',
    tiktok: settings?.tiktok || '',
  };

  return {
    categories,
    products,
    menuCategories,
    locations: locations.map(mapLocation),
    promotions: promotions.map(mapPromotion),
    gallery,
    settings,
    social,
  };
}
