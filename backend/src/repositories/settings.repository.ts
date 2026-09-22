import prisma from '../config/prisma';

export interface SettingsUpdateData {
  siteName?: string;
  description?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  address?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  openingHours?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
}

export const settingsRepository = {
  find() {
    return prisma.siteSettings.findUnique({ where: { singleton: 1 } });
  },
  upsert(data: SettingsUpdateData) {
    return prisma.siteSettings.upsert({
      where: { singleton: 1 },
      create: { singleton: 1, ...data },
      update: data,
    });
  },
};
