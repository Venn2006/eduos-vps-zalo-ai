const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Finance Data...');
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    console.error('No tenant found!');
    return;
  }
  const tenantId = tenant.id;

  // Get some students to attach invoices to
  const students = await prisma.student.findMany({
    where: { tenantId },
    include: { enrollments: true },
    take: 5
  });

  if (students.length === 0) {
    console.log('No students found to attach invoices to. Creating a dummy student.');
    // We should create a dummy student
    const newStudent = await prisma.student.create({
      data: {
        tenantId,
        name: 'Nguyễn Văn Dummy',
        phone: '0988777666'
      }
    });
    students.push(newStudent);
  }

  // Clean up existing invoices first to prevent duplicates
  await prisma.payment.deleteMany({ where: { tenantId } });
  await prisma.invoiceItem.deleteMany({ where: { tenantId } });
  await prisma.invoice.deleteMany({ where: { tenantId } });

  // Create Invoices
  const invoicesToCreate = [
    {
      studentIndex: 0,
      totalAmount: 5000000,
      paidAmount: 5000000,
      remainingAmount: 0,
      dueDate: new Date(),
      status: 'PAID'
    },
    {
      studentIndex: 1 % students.length,
      totalAmount: 6000000,
      paidAmount: 2000000,
      remainingAmount: 4000000,
      dueDate: new Date(new Date().setDate(new Date().getDate() - 5)), // 5 days overdue
      status: 'OVERDUE'
    },
    {
      studentIndex: 2 % students.length,
      totalAmount: 8000000,
      paidAmount: 0,
      remainingAmount: 8000000,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 5)), // Due in 5 days
      status: 'UNPAID'
    },
    {
      studentIndex: 3 % students.length,
      totalAmount: 4000000,
      paidAmount: 4000000,
      remainingAmount: 0,
      dueDate: new Date(),
      status: 'PAID'
    }
  ];

  for (let i = 0; i < invoicesToCreate.length; i++) {
    const invData = invoicesToCreate[i];
    const student = students[invData.studentIndex];
    
    const invoice = await prisma.invoice.create({
      data: {
        tenantId,
        studentId: student.id,
        enrollmentId: student.enrollments?.[0]?.id || null,
        invoiceCode: `INV-${Date.now()}-${i}`,
        totalAmount: invData.totalAmount,
        paidAmount: invData.paidAmount,
        remainingAmount: invData.remainingAmount,
        dueDate: invData.dueDate,
        status: invData.status as any
      }
    });

    if (invData.paidAmount > 0) {
      await prisma.payment.create({
        data: {
          tenantId,
          invoiceId: invoice.id,
          amount: invData.paidAmount,
          paymentMethod: 'BANK_TRANSFER'
        }
      });
    }
  }

  console.log('Finance Data Seeded Successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
