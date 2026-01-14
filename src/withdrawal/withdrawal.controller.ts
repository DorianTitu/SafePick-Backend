import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { WithdrawalService } from "./withdrawal.service";
import { JwtGuard } from "../common/guards/jwt.guard";
import { RoleGuard } from "../common/guards/role.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { CreateWithdrawalOrderDto } from "../common/dtos";
import { UserRole } from "@prisma/client";

@Controller("withdrawals")
export class WithdrawalController {
  constructor(private withdrawalService: WithdrawalService) {}

  // Paso 1: Crear orden de retiro (solo padres/guardianes)
  @Post()
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(UserRole.PARENT, UserRole.GUARDIAN)
  @Throttle({ default: { limit: 20, ttl: 3600000 } }) // 20 orders per hour
  async createWithdrawalOrder(
    @CurrentUser() user: any,
    @Body(ValidationPipe) createWithdrawalOrderDto: CreateWithdrawalOrderDto
  ) {
    return this.withdrawalService.createWithdrawalOrder(
      user.id,
      createWithdrawalOrderDto
    );
  }

  // Obtener credenciales del picker (regenera código)
  @Post(":orderId/credentials")
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(UserRole.PARENT, UserRole.GUARDIAN)
  @Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 requests per hour
  async getPickerCredentials(
    @Param("orderId") orderId: string,
    @CurrentUser() user: any
  ) {
    return this.withdrawalService.getPickerCredentials(orderId, user.id);
  }

  // Obtener detalles de una orden
  @Get(":orderId")
  @UseGuards(JwtGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 requests per minute
  async getWithdrawalOrder(
    @Param("orderId") orderId: string,
    @CurrentUser() user: any
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
  @Post(":orderId/complete")
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.PICKER)
  @Throttle({ default: { limit: 50, ttl: 3600000 } }) // 50 completions per hour
  async completeWithdrawal(
    @Param("orderId") orderId: string,
    @CurrentUser() user: any
  ) {
    return this.withdrawalService.completeWithdrawal(orderId, user.role);
  }

  // Cancelar retiro (solo el padre/guardián)
  @Post(":orderId/cancel")
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(UserRole.PARENT, UserRole.GUARDIAN)
  @Throttle({ default: { limit: 20, ttl: 3600000 } }) // 20 cancellations per hour
  async cancelWithdrawal(
    @Param("orderId") orderId: string,
    @CurrentUser() user: any
  ) {
    return this.withdrawalService.cancelWithdrawal(orderId, user.id);
  }

  // Validar QR escaneado (para guardias/admin)
  @Post("validate-qr")
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(UserRole.GUARDIAN, UserRole.ADMIN)
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 scans per minute
  async validateQrCode(@Body("qrToken") qrToken: string) {
    return this.withdrawalService.validateQrCode(qrToken);
  }

  // Escanear QR y completar retiro (PARA GUARDIA)
  @Post("guardian/scan-and-complete")
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(UserRole.GUARDIAN, UserRole.ADMIN)
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 completions per minute
  async scanQrAndComplete(
    @Body("qrToken") qrToken: string,
    @CurrentUser() user: any
  ) {
    return this.withdrawalService.scanQrAndComplete(qrToken, user.id);
  }

  // Obtener orden del picker temporal (autenticado con token temporal)
  @Get("picker/my-order")
  @UseGuards(JwtGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 requests per minute
  async getPickerOrder(@CurrentUser() user: any) {
    return this.withdrawalService.getPickerOrder(user.id);
  }
}
