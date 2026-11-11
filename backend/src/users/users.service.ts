import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  paginatedResponse,
  type PaginatedResponse,
} from '../common/utils/paginated-response.js';
import {
  User,
  type UserDocument,
  UserRole,
} from '../database/schemas/user.schema.js';
import type { UpdateUserDto } from './dto/update-user.dto.js';

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  course: string | null;
  createdAt: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async findById(id: string): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByEmailWithPassword(
    email: string,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email })
      .select('+passwordHash')
      .exec();
  }

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
  }): Promise<UserDocument> {
    return this.userModel.create({
      ...data,
      role: UserRole.User,
    });
  }

  async getProfile(id: string): Promise<PublicUser> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toPublicUser(user);
  }

  async updateProfile(
    id: string,
    dto: UpdateUserDto,
  ): Promise<PublicUser> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('User not found');
    }

    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        { $set: dto },
        { returnDocument: 'after', runValidators: true },
      )
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toPublicUser(user);
  }

  async findAllStudents(
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<PublicUser>> {
    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
      this.userModel
        .find({ role: UserRole.User })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<UserDocument[]>()
        .exec(),
      this.userModel.countDocuments({ role: UserRole.User }).exec(),
    ]);

    return paginatedResponse(
      students.map((student) => this.toPublicUser(student)),
      total,
      { page, limit },
    );
  }

  toPublicUser(user: UserDocument): PublicUser {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      course: user.course?.toString() ?? null,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
