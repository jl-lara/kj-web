import { Prisma } from '@prisma/client';
import { locationRepository } from '../repositories/location.repository';
import { HttpError } from '../utils/HttpError';

export interface LocationListQuery {
  page: number;
  limit: number;
  order: 'asc' | 'desc';
  sort: 'name' | 'displayOrder' | 'createdAt';
  active?: boolean;
}

export interface CreateLocationInput {
  name: string;
  address: string;
  phone?: string | null;
  schedule?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  mapsUrl?: string | null;
  whatsapp?: string | null;
  imageUrl?: string | null;
  displayOrder: number;
  active: boolean;
}

export type UpdateLocationInput = Partial<CreateLocationInput>;

export const locationService = {
  async list(query: LocationListQuery, isAdminView: boolean) {
    const where: Prisma.LocationWhereInput = {};
    if (isAdminView) {
      if (query.active !== undefined) where.active = query.active;
    } else {
      where.active = true;
    }
    const orderBy = { [query.sort]: query.order } as Prisma.LocationOrderByWithRelationInput;
    const skip = (query.page - 1) * query.limit;
    const { items, total } = await locationRepository.findAll(where, orderBy, skip, query.limit);
    return { items, total };
  },

  async getById(id: string, isAdminView: boolean) {
    const location = await locationRepository.findById(id);
    if (!location) {
      throw new HttpError(404, 'Location not found', 'LOCATION_NOT_FOUND');
    }
    if (!isAdminView && !location.active) {
      throw new HttpError(404, 'Location not found', 'LOCATION_NOT_FOUND');
    }
    return location;
  },

  async create(input: CreateLocationInput) {
    return locationRepository.create({
      name: input.name,
      address: input.address,
      phone: input.phone ?? null,
      schedule: input.schedule ?? null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      mapsUrl: input.mapsUrl ?? null,
      whatsapp: input.whatsapp ?? null,
      imageUrl: input.imageUrl ?? null,
      displayOrder: input.displayOrder,
      active: input.active,
    });
  },

  async update(id: string, input: UpdateLocationInput) {
    const location = await locationRepository.findById(id);
    if (!location) {
      throw new HttpError(404, 'Location not found', 'LOCATION_NOT_FOUND');
    }
    const data: Prisma.LocationUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.address !== undefined) data.address = input.address;
    if (input.phone !== undefined) data.phone = input.phone;
    if (input.schedule !== undefined) data.schedule = input.schedule;
    if (input.latitude !== undefined) data.latitude = input.latitude;
    if (input.longitude !== undefined) data.longitude = input.longitude;
    if (input.mapsUrl !== undefined) data.mapsUrl = input.mapsUrl;
    if (input.whatsapp !== undefined) data.whatsapp = input.whatsapp;
    if (input.imageUrl !== undefined) data.imageUrl = input.imageUrl;
    if (input.displayOrder !== undefined) data.displayOrder = input.displayOrder;
    if (input.active !== undefined) data.active = input.active;
    if (Object.keys(data).length === 0) {
      return location;
    }
    return locationRepository.update(id, data);
  },

  async updateStatus(id: string, active: boolean) {
    const location = await locationRepository.findById(id);
    if (!location) {
      throw new HttpError(404, 'Location not found', 'LOCATION_NOT_FOUND');
    }
    return locationRepository.update(id, { active });
  },

  async remove(id: string) {
    const location = await locationRepository.findById(id);
    if (!location) {
      throw new HttpError(404, 'Location not found', 'LOCATION_NOT_FOUND');
    }
    return locationRepository.remove(id);
  },
};
