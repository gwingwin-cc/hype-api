import { InjectModel } from '@nestjs/sequelize';
import { Tags } from '../../entity';

export class TagsService {
  constructor(
    @InjectModel(Tags)
    private tagsModel: typeof Tags,
  ) {}

  async all(): Promise<any> {
    return this.tagsModel.findAll();
  }

  async findOne(name: any): Promise<any> {
    return this.tagsModel.findOne({
      where: {
        name: name,
      },
    });
  }

  async createTags(data: Partial<Tags>): Promise<Tags> {
    return await this.tagsModel.create(data);
  }
}
