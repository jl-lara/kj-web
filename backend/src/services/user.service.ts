import { UserRole } from '@prisma/client';
import { HttpError } from '../utils/HttpError';
import { hashPassword } from '../utils/password';
import { toSafeUser } from '../utils/userSerializer';
import { userRepository, UserUpdateData } from '../repositories/user.repository';

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  active: boolean;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  active?: boolean;
}

export const userService = {
  async list(page: number, limit: number) {
    const { items, total } = await userRepository.findAll(page, limit);
    return { items: items.map(toSafeUser), total };
  },

  async getById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new HttpError(404, 'User not found', 'USER_NOT_FOUND');
    }
    return toSafeUser(user);
  },

  async create(input: CreateUserInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new HttpError(409, 'Email already in use', 'EMAIL_ALREADY_EXISTS');
    }
    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      active: input.active,
    });
    return toSafeUser(user);
  },

  async update(id: string, input: UpdateUserInput) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new HttpError(404, 'User not found', 'USER_NOT_FOUND');
    }

    if (input.email && input.email !== user.email) {
      const existing = await userRepository.findByEmail(input.email);
      if (existing) {
        throw new HttpError(409, 'Email already in use', 'EMAIL_ALREADY_EXISTS');
      }
    }

    await userService.ensureNotLastAdmin(
      user.id,
      user.role,
      user.active,
      input.role,
      input.active,
    );

    const data: UserUpdateData = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.email !== undefined) data.email = input.email;
    if (input.role !== undefined) data.role = input.role;
    if (input.active !== undefined) data.active = input.active;
    if (input.password) data.passwordHash = await hashPassword(input.password);

    if (Object.keys(data).length === 0) {
      return toSafeUser(user);
    }
    const updated = await userRepository.update(id, data);
    return toSafeUser(updated);
  },

  async updateStatus(id: string, active: boolean) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new HttpError(404, 'User not found', 'USER_NOT_FOUND');
    }
    await userService.ensureNotLastAdmin(user.id, user.role, user.active, user.role, active);
    const updated = await userRepository.update(id, { active });
    return toSafeUser(updated);
  },

  async ensureNotLastAdmin(
    id: string,
    currentRole: UserRole,
    currentActive: boolean,
    newRole?: UserRole,
    newActive?: boolean,
  ): Promise<void> {
    if (currentRole !== UserRole.ADMIN || !currentActive) {
      return;
    }
    const targetRole = newRole ?? currentRole;
    const targetActive = newActive ?? currentActive;
    if (targetRole === UserRole.ADMIN && targetActive === true) {
      return;
    }
    const remaining = await userRepository.countActiveAdminsExcept(id);
    if (remaining === 0) {
      throw new HttpError(409, 'Cannot remove the last active administrator', 'LAST_ADMIN');
    }
  },
};
