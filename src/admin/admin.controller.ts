import {
  ClassSerializerInterceptor,
  Controller,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { PermissionGuard } from '../auth/guard/permission.guard';
import { Permissions } from '../auth/permission.decorator';
import { HypeRequest } from '../interfaces/request';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@UseInterceptors(ClassSerializerInterceptor)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @UseGuards(PermissionGuard)
  @Permissions('admin')
  @Post('init-project')
  async initProject(@Request() req: HypeRequest) {
    return this.adminService.initProject(req.user);
  }
}
