import { Controller, Post, Get, Param, Body, UseGuards, ValidationPipe } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { WithdrawalService } from './withdrawal.service';
import { JwtGuard } from '../common/guards/jwt.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateWithdrawalOrderDto } from '../common/dtos';
import { UserRole } from '@prisma/client';

@Controller('withdrawals')
export class WithdrawalController {
  constructor(private withdrawalService: WithdrawalService) {}

  // Paso 1: Crear orden de retiro (solo padres/guardianes)
  @Post()
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(UserRole.PARENT, UserRole.GUARDIAN)
  @Throttle({ default: { limit: 20, ttl: 3600000 } }) // 20 orders per hour
  async createWithdrawalOrder(
    @CurrentUser() user: any,
    @Body(ValidationPipe) createWithdrawalOrderDto: CreateWithdrawalOrderDto,
  ) {
    return this.withdrawalService.createWithdrawalOrder(user.id, createWithdrawalOrderDto);
  }

  // Obtener detalles de una orden
  @Get(':orderId')
  @UseGuards(JwtGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 requests per minute
  async getWithdrawalOrder(
    @Param('orderId') orderId: string,
    @CurrentUser() user: any,
  ) {
    return this.withdrawalService.getWithdrawalOrder(orderId, user.id);
  }

  // Listar órdenes del usuario
  @Get()
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(UserRole.PARENT, UserRole.GUARDIAN)
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 requests per minute
  async getUserWithdrawalOrders(@CurrentUser() user: any) {
    return this.withdrawalService.getUserWithdrawalOrders(user.id);
  }

  // Completar retiro (admin o picker)
  @Post(':orderId/complete')
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.PICKER)
  @Throttle({ default: { limit: 50, ttl: 3600000 } }) // 50 completions per hour
  async completeWithdrawal(
    @Param('orderId') orderId: string,
    @CurrentUser() user: any,
  ) {
    return this.withdrawalService.completeWithdrawal(orderId, user.role);
  }

  // Cancelar retiro (solo el padre/guardián)
  @Post(':orderId/cancel')
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(UserRole.PARENT, UserRole.GUARDIAN)
  @Throttle({ default: { limit: 20, ttl: 3600000 } }) // 20 cancellations per hour
  async cancelWithdrawal(
    @Param('orderId') orderId: string,
    @CurrentUser() user: any,
  ) {
    return this.withdrawalService.cancelWithdrawal(orderId, user.id);
  }
}
