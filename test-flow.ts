/**
 * Test Flow - Simula el flujo completo de SafePick sin necesidad de servidor
 * 1. Register user
 * 2. Login
 * 3. Create child
 * 4. Create withdrawal order
 * 5. Complete withdrawal
 */

import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as qrcode from 'qrcode';

const prisma = new PrismaClient();

async function testFlow() {
  try {
    console.log('🚀 Starting SafePick Flow Test\n');

    // Step 1: Register user
    console.log('1️⃣ REGISTER: Creating parent user...');
    const hashedPassword = await bcrypt.hash('SecurePass123!@', 10);
    const parent = await prisma.user.create({
      data: {
        email: 'parent@test.com',
        password: hashedPassword,
        name: 'John Doe',
        role: UserRole.PARENT,
        cedula: '12345678',
        phone: '+34123456789',
      },
    });
    console.log('✅ Parent created:', { id: parent.id, email: parent.email });

    // Step 2: Create child
    console.log('\n2️⃣ CREATE CHILD: Adding child to parent...');
    const child = await prisma.child.create({
      data: {
        name: 'Emma Doe',
        grade: '3rd',
        school: 'Lincoln Elementary',
        parentId: parent.id,
      },
    });
    console.log('✅ Child created:', { id: child.id, name: child.name });

    // Step 3: Create withdrawal order
    console.log('\n3️⃣ CREATE WITHDRAWAL ORDER: Parent creates pickup order...');
    const withdrawalOrder = await prisma.withdrawalOrder.create({
      data: {
        childId: child.id,
        parentId: parent.id,
        picker: {
          create: {
            name: 'Maria Garcia',
            cedula: '87654321',
            phone: '+34987654321',
            relationship: 'tía',
          },
        },
      },
      include: {
        child: true,
        picker: true,
      },
    });
    console.log('✅ Withdrawal order created:', {
      id: withdrawalOrder.id,
      status: withdrawalOrder.status,
      picker: withdrawalOrder.picker?.name,
    });

    // Step 4: Generate QR Code
    console.log('\n4️⃣ GENERATE QR: Creating QR code for pickup...');
    if (!withdrawalOrder.picker) {
      throw new Error('Picker is required');
    }

    const qrData = {
      orderId: withdrawalOrder.id,
      childName: withdrawalOrder.child.name,
      pickerName: withdrawalOrder.picker.name,
      pickerCedula: withdrawalOrder.picker.cedula,
      timestamp: new Date(),
    };

    const qrCode = await qrcode.toDataURL(JSON.stringify(qrData));
    console.log('✅ QR Code generated (length:', qrCode.length, 'chars)');

    // Step 5: Validate and update order to VALIDATED
    console.log('\n5️⃣ VALIDATE ORDER: Updating order to VALIDATED status...');
    const validatedOrder = await prisma.withdrawalOrder.update({
      where: { id: withdrawalOrder.id },
      data: {
        qrCode: qrCode,
        status: 'VALIDATED',
      },
      include: {
        child: true,
        picker: true,
      },
    });
    console.log('✅ Order validated:', {
      id: validatedOrder.id,
      status: validatedOrder.status,
    });

    // Step 6: Complete withdrawal
    console.log('\n6️⃣ COMPLETE WITHDRAWAL: Picker picks up child...');
    const completedOrder = await prisma.withdrawalOrder.update({
      where: { id: validatedOrder.id },
      data: {
        status: 'COMPLETED',
        withdrawalDate: new Date(),
      },
      include: {
        child: true,
        picker: true,
      },
    });
    console.log('✅ Withdrawal completed:', {
      id: completedOrder.id,
      status: completedOrder.status,
      withdrawalDate: completedOrder.withdrawalDate,
      childName: completedOrder.child.name,
      pickerName: completedOrder.picker?.name,
    });

    // Step 7: Verify data
    console.log('\n7️⃣ VERIFY DATA: Retrieving all data...');
    const allOrders = await prisma.withdrawalOrder.findMany({
      where: { parentId: parent.id },
      include: {
        child: true,
        picker: true,
      },
    });

    console.log('✅ Total orders:', allOrders.length);
    console.log('📊 Order summary:');
    allOrders.forEach((order) => {
      console.log(`  - Order ${order.id}: ${order.status} (Child: ${order.child.name}, Picker: ${order.picker?.name})`);
    });

    console.log('\n✅✅✅ FLOW TEST COMPLETED SUCCESSFULLY ✅✅✅\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFlow();
