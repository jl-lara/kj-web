import { healthRepository } from '../repositories/health.repository';

export const healthService = {
  async check(): Promise<{ database: string }> {
    const connected = await healthRepository.isDatabaseConnected();
    return { database: connected ? 'connected' : 'disconnected' };
  },
};
