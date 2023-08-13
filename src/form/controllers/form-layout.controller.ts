import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { FormService } from '../providers/form.service';
import { Permissions } from '../../auth/permission.decorator';
import { PermissionGuard } from '../../auth/guard/permission.guard';
import { InjectModel } from '@nestjs/sequelize';
import { HypeForm } from '../../entity';
import { HypeAuthGuard } from '../../hype-auth.guard';

@Controller('form-layouts')
@UseGuards(HypeAuthGuard, PermissionGuard)
export class FormLayoutController {
  constructor(
    @InjectModel(HypeForm)
    private formModel: typeof HypeForm,
    private formService: FormService,
  ) {}

  @Permissions('form_management')
  @Post(':id/publish')
  async publishLayout(@Request() req, @Param('id') layoutId) {
    await this.formService.publishLayout(req.user, {
      id: layoutId,
    });
  }

  @Permissions('form_management')
  @Patch(':id')
  async updateLayout(
    @Request() req,
    @Param('id') layoutId,
    @Body()
    body: {
      layout: string;
      script: string;
      options: object | any;
      approval: Array<any>;
      enableDraftMode: 0 | 1 | boolean;
      requireCheckMode: 'ALWAYS' | 'BEFORE_ACTIVE' | 'BEFORE_ACTIVELOCK';
    },
  ) {
    return await this.formService.updateLayout(req.user, layoutId, {
      layout: body.layout,
      approval: body.approval,
      script: body.script,
      options: body.options,
      enableDraftMode: body.enableDraftMode,
      requireCheckMode: body.requireCheckMode,
    });
  }
}
