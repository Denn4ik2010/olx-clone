import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { Roles } from '../auth/decorator/roles-auth.decorator';
import { RolesGuard } from '../auth/guards/roles-auth.guard';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get(':value')
  async getRoleByValue(@Param('value') value: string) {
    return await this.roleService.getRoleByValue(value);
  }

  @Post('')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async createRole(@Body() dto: CreateRoleDto) {
    return await this.roleService.createRole(dto);
  }

  @Delete(':value')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async deleteRoleByValue(@Param('value') roleValue: string) {
    return await this.roleService.deleteRoleByValue(roleValue);
  }
}