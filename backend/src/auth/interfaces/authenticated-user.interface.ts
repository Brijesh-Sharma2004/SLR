import { UserRole } from '../../database/schemas/user.schema.js';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
