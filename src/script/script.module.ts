import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { HypeScript, HypeScriptPermissions } from '../entity';
import { ScriptService } from './script.service';
import { ScriptController } from './script.controller';

@Module({
  imports: [SequelizeModule.forFeature([HypeScript, HypeScriptPermissions])],
  controllers: [ScriptController],
  providers: [ScriptService],
  exports: [ScriptService],
})
export class ScriptModule {}
