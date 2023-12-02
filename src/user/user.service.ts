import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User, HypeRole, UserRoles, HypePermission } from '../entity';
import { hash } from 'argon2';
import { UserApi } from '../entity';
import { randomUUID } from 'crypto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(UserApi)
    private userApiModel: typeof UserApi,
    @InjectModel(UserRoles)
    private userRolesModel: typeof UserRoles,
    @InjectModel(HypeRole)
    private roleModel: typeof HypeRole,
  ) {}

  async findOne(userWhereUniqueInput: any): Promise<User | null> {
    return this.userModel.findOne({
      where: {
        ...userWhereUniqueInput,
      },
      include: [HypeRole],
    });
  }

  async find(params: {
    skip?: number;
    take?: number;
    where?: any;
  }): Promise<User[]> {
    const { skip, take, where } = params;
    return this.userModel.findAll({
      where: {
        ...where,
      },
      offset: skip,
      limit: take,
      order: [['id', 'DESC']],
      attributes: { exclude: ['passwordHash'] },
      include: [{ model: HypeRole, attributes: ['id', 'name', 'slug'] }],
    });
  }

  async count(params: { where?: any }): Promise<number> {
    // console.log('count');
    return this.userModel.count({
      where: {
        ...params.where,
      },
    });
  }

  async hashPassword(password: string): Promise<string> {
    return await hash(password);
  }

  async createUser(data: Partial<User>): Promise<User> {
    const createdUser = await this.userModel.create(data);
    Logger.log(`createUser ${createdUser.id}`, 'createUser');
    return createdUser;
  }

  async updateUser(params: { where: any; data: Partial<User> }): Promise<User> {
    const { where, data } = params;
    const user = await this.userModel.findOne({ where });
    return user.update(data);
  }

  async deleteUser(byUser: User, id: number): Promise<User> {
    const u = await this.userModel.findByPk(id);
    return await u.update({
      deletedAt: new Date(),
      deletedBy: byUser.id,
    });
  }

  async revokeUserApiKey(userId: number, key: string) {
    const u = await this.userApiModel.findByPk(key);
    return await u.update({
      deletedAt: new Date(),
      deletedBy: userId,
    });
  }

  async createApiKey(userId: number): Promise<UserApi> {
    const newUserApi = new UserApi();
    newUserApi.id = randomUUID();
    newUserApi.userId = userId;
    newUserApi.createdBy = userId;
    await newUserApi.save();
    return newUserApi;
  }

  async deleteApiKey(key: string) {
    return this.userApiModel.destroy({
      where: {
        id: key,
      },
    });
  }

  async getUserByApiKey(id: string): Promise<User> {
    const apiEntity = await this.userApiModel.findOne({
      where: { id: id },
      include: [User],
    });
    return apiEntity.user;
  }

  async getUserApiKey(userId: number): Promise<UserApi> {
    return await this.userApiModel.findOne({
      where: { userId: userId },
    });
  }

  async findApiKey(key: string): Promise<UserApi> {
    return await this.userApiModel.findOne({
      where: { id: key },
    });
  }

  async findByUserName(username: string): Promise<User> {
    return this.userModel.findOne({ where: { username } });
  }

  async getUserRoles(id: number): Promise<Array<HypeRole>> {
    const newUser = await this.userModel.findByPk(id, {
      include: [{ model: HypeRole, include: [HypePermission] }],
    });
    return newUser.userRoles;
  }
}
