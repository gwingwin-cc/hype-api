import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User, HypeRole, UserRoles, HypePermission } from '../entity';
import { hash } from 'argon2';
import { Sequelize } from 'sequelize/types/sequelize';
import { UserApi } from '../entity';

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

  getSequelize(): Sequelize {
    return this.userModel.sequelize;
  }

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
  }): Promise<any[]> {
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

  async deleteUser(byUser, id): Promise<User> {
    const u = await this.userModel.findByPk(id);
    return await u.update({
      deletedAt: new Date(),
      deletedBy: byUser.id,
    });
  }

  async revokeUserApiKey(userId, key) {
    const u = await this.userApiModel.findByPk(key);
    return await u.update({
      deletedAt: new Date(),
      deletedBy: userId,
    });
  }

  async createApiKey(userId): Promise<UserApi> {
    const newUserApi = new UserApi();
    newUserApi.userId = userId;
    newUserApi.createdBy = userId;
    await newUserApi.save();
    return newUserApi;
  }

  async getUserByApiKey(id: string): Promise<User> {
    const apiEntity = await this.userApiModel.findOne({
      where: { id: id },
      include: [User],
    });
    return apiEntity.user;
  }

  async getUserApiKey(userId): Promise<UserApi> {
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

  async all(): Promise<any> {
    return this.userModel.findAll({
      where: {
        deletedAt: null,
        status: 'active',
      },
      attributes: ['id', 'email', 'username'],
    });
  }

  async getUserRoles(user): Promise<Array<HypeRole>> {
    const newUser = await this.userModel.findByPk(user.id, {
      include: [{ model: HypeRole, include: [HypePermission] }],
    });
    return newUser.userRoles;
  }
}
