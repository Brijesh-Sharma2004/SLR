import { UserRole } from '../../database/schemas/user.schema.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}
