import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { HypeScript } from '../entity';
import { ScriptService } from './script.service';
import { ScriptController } from './script.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SequelizeModule.forFeature([HypeScript]), AuthModule],
  controllers: [ScriptController],
  providers: [ScriptService],
  exports: [ScriptService],
})
export class ScriptModule {}
