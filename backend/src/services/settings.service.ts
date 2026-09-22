import { settingsRepository, SettingsUpdateData } from '../repositories/settings.repository';
import { storageService } from './storage.service';

export const settingsService = {
  get() {
    return settingsRepository.find();
  },

  async update(data: SettingsUpdateData) {
    const current = await settingsRepository.find();
    const updated = await settingsRepository.upsert(data);

    if (current) {
      if (data.logoUrl !== undefined && data.logoUrl !== current.logoUrl) {
        await storageService.removeByUrl(current.logoUrl);
      }
      if (data.faviconUrl !== undefined && data.faviconUrl !== current.faviconUrl) {
        await storageService.removeByUrl(current.faviconUrl);
      }
    }

    return updated;
  },
};
