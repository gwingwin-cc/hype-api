import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { FormService } from '../providers/form.service';
import { Permissions } from '../../auth/permission.decorator';
import { PermissionGuard } from '../../auth/guard/permission.guard';
import { HypeAuthGuard } from '../../hype-auth.guard';
import { HypeRequest } from '../../interfaces/request';
import { UpdateFormLayoutRequest } from '../dto/form.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Form - Management')
@ApiBearerAuth()
@Controller('form-layouts')
@UseGuards(HypeAuthGuard, PermissionGuard)
export class FormLayoutController {
  constructor(private formService: FormService) {}

  @Permissions('form_management')
  @Post(':id/publish')
  async publishLayout(
    @Request() req: HypeRequest,
    @Param('id', new ParseIntPipe()) layoutId: number,
  ) {
    await this.formService.publishLayout(req.user, {
      id: layoutId,
    });
  }

  @Permissions('form_management')
  @Patch(':id')
  async updateLayout(
    @Request() req: HypeRequest,
    @Param('id', new ParseIntPipe()) layoutId: number,
    @Body()
    body: UpdateFormLayoutRequest,
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
