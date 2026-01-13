import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { JwtGuard } from '../common/guards/jwt.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('children')
export class ChildrenController {
  constructor(private childrenService: ChildrenService) {}

  @Get()
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(UserRole.PARENT, UserRole.GUARDIAN)
  async getMyChildren(@CurrentUser() user: any) {
    return this.childrenService.getChildrenByParent(user.id);
  }

  @Get(':childId')
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(UserRole.PARENT, UserRole.GUARDIAN)
  async getChild(@Param('childId') childId: string) {
    return this.childrenService.getChildById(childId);
  }
}
