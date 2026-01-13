import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChildrenService {
  constructor(private prisma: PrismaService) {}

  async getChildrenByParent(parentId: string) {
    return await this.prisma.child.findMany({
      where: { parentId },
      select: {
        id: true,
        name: true,
        grade: true,
        school: true,
      },
    });
  }

  async getChildById(childId: string) {
    return await this.prisma.child.findUnique({
      where: { id: childId },
    });
  }

  async createChild(parentId: string, data: { name: string; grade: string; school: string }) {
    return await this.prisma.child.create({
      data: {
        ...data,
        parentId,
      },
    });
  }
}
