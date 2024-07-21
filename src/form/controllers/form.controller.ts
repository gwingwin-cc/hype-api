import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { FormService } from '../providers/form.service';
import { HypeRequest } from '../../interfaces/request';
import { HypeAnonymousAuthGuard } from '../../hype-anonymous-auth.guard';
import { FormLayoutStateType } from '../../entity';
import { FormRecordStateEnum } from '../../entity/HypeBaseForm';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Form - Public')
@Controller('forms')
export class FormController {
  constructor(private formService: FormService) {}

  @Get('slug/:slug')
  @UseGuards(HypeAnonymousAuthGuard)
  async getFormBySlug(
    @Request() req: HypeRequest,
    @Param('slug') slug: string,
    @Query() query: { layout_state: string },
  ) {
    if (FormRecordStateEnum[query.layout_state] == null) {
      throw new BadRequestException('Invalid layout_state.');
    }
    const form = await this.formService.getForm({
      slug: slug,
      layoutState: query.layout_state as FormLayoutStateType,
      excludeDeleteField: true,
    });
    if (form == null) {
      throw new BadRequestException('Form not found.');
    }
    const hasPermission = await this.formService.validatePermission(
      form.id,
      req.user,
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }
    return form;
  }
  @Get(':id')
  @UseGuards(HypeAnonymousAuthGuard)
  async getForm(
    @Request() req: HypeRequest,
    @Param('id', ParseIntPipe) id: number,
    @Query() query: { layout_state: string },
  ) {
    if (FormRecordStateEnum[query.layout_state] == null) {
      throw new BadRequestException('Invalid layout_state.');
    }
    const form = await this.formService.getForm({
      id: id,
      slug: null,
      layoutState: query.layout_state as FormLayoutStateType,
      excludeDeleteField: true,
    });
    if (form == null) {
      throw new BadRequestException('Form not found.');
    }
    const hasPermission = await this.formService.validatePermission(
      id,
      req.user,
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }
    return form;
  }
}
