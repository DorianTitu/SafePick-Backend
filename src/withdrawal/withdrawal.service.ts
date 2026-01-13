import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWithdrawalOrderDto } from '../common/dtos';
import * as qrcode from 'qrcode';
import { WithdrawalStatus } from '@prisma/client';

@Injectable()
export class WithdrawalService {
  constructor(private prisma: PrismaService) {}

  // Paso 1: Crear orden de retiro con datos del picker
  async createWithdrawalOrder(userId: string, createWithdrawalOrderDto: CreateWithdrawalOrderDto) {
    // Verificar que el niño existe y pertenece al usuario
    const child = await this.prisma.child.findUnique({
      where: { id: createWithdrawalOrderDto.childId },
    });

    if (!child) {
      throw new NotFoundException('Child not found');
    }

    if (child.parentId !== userId) {
      throw new BadRequestException('Child does not belong to this user');
    }

    // Crear la orden de retiro
    const withdrawalOrder = await this.prisma.withdrawalOrder.create({
      data: {
        childId: createWithdrawalOrderDto.childId,
        parentId: userId,
        picker: {
          create: {
            name: createWithdrawalOrderDto.pickerName,
            cedula: createWithdrawalOrderDto.pickerCedula,
            phone: createWithdrawalOrderDto.pickerPhone,
            relationship: createWithdrawalOrderDto.relationship,
          },
        },
      },
      include: {
        child: true,
        picker: true,
      },
    });

    if (!withdrawalOrder.picker) {
      throw new BadRequestException('Picker information is required');
    }

    // Generar QR directamente sin OTP
    const qrData = {
      orderId: withdrawalOrder.id,
      childName: withdrawalOrder.child.name,
      pickerName: withdrawalOrder.picker.name,
      pickerCedula: withdrawalOrder.picker.cedula,
      timestamp: new Date(),
    };

    const qrCode = await qrcode.toDataURL(JSON.stringify(qrData));

    // Actualizar orden con QR y cambiar estado a VALIDATED
    const updatedOrder = await this.prisma.withdrawalOrder.update({
      where: { id: withdrawalOrder.id },
      data: {
        qrCode: qrCode,
        status: WithdrawalStatus.VALIDATED,
      },
      include: {
        child: true,
        picker: true,
      },
    });

    if (!updatedOrder.picker) {
      throw new BadRequestException('Picker information is required');
    }

    return {
      withdrawalOrderId: updatedOrder.id,
      message: 'Withdrawal order created successfully',
      pickerInfo: {
        name: updatedOrder.picker.name,
        cedula: updatedOrder.picker.cedula,
        relationship: updatedOrder.picker.relationship,
      },
      qrCode: updatedOrder.qrCode,
    };
  }

  // Obtener detalles de una orden
  async getWithdrawalOrder(orderId: string, userId: string) {
    const order = await this.prisma.withdrawalOrder.findUnique({
      where: { id: orderId },
      include: {
        child: true,
        picker: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Withdrawal order not found');
    }

    if (order.parentId !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    return order;
  }

  // Listar órdenes del usuario
  async getUserWithdrawalOrders(userId: string) {
    return await this.prisma.withdrawalOrder.findMany({
      where: { parentId: userId },
      include: {
        child: true,
        picker: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Completar retiro (para administrador o picker)
  async completeWithdrawal(orderId: string, role: string) {
    const order = await this.prisma.withdrawalOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Withdrawal order not found');
    }

    if (order.status !== WithdrawalStatus.VALIDATED) {
      throw new BadRequestException('Withdrawal order must be validated first');
    }

    const updatedOrder = await this.prisma.withdrawalOrder.update({
      where: { id: orderId },
      data: {
        status: WithdrawalStatus.COMPLETED,
        withdrawalDate: new Date(),
      },
      include: {
        child: true,
        picker: true,
      },
    });

    return {
      success: true,
      message: 'Withdrawal completed successfully',
      order: updatedOrder,
    };
  }

  // Cancelar retiro
  async cancelWithdrawal(orderId: string, userId: string) {
    const order = await this.prisma.withdrawalOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Withdrawal order not found');
    }

    if (order.parentId !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    const updatedOrder = await this.prisma.withdrawalOrder.update({
      where: { id: orderId },
      data: { status: WithdrawalStatus.CANCELLED },
      include: {
        child: true,
        picker: true,
      },
    });

    return {
      success: true,
      message: 'Withdrawal cancelled',
      order: updatedOrder,
    };
  }
}
