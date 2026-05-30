import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function countModels() {
  const counts = {
    Tenant: await prisma.tenant.count(),
    User: await prisma.user.count(),
    Student: await prisma.student.count(),
    Guardian: await prisma.guardian.count(),
    Teacher: await prisma.teacher.count(),
    Course: await prisma.course.count(),
    Class: await prisma.class.count(),
    ClassSession: await prisma.classSession.count(),
    ZaloGroup: await prisma.zaloGroup.count(),
    ZaloIdentity: await prisma.zaloIdentity.count(),
    ZaloGroupMember: await prisma.zaloGroupMember.count(),
    ZaloMessage: await prisma.zaloMessage.count(),
    ZaloMessageTemplate: await prisma.zaloMessageTemplate.count(),
    ClassAutomationTemplate: await prisma.classAutomationTemplate.count(),
    ClassAutomationSetting: await prisma.classAutomationSetting.count(),
    AiPromptTemplate: await prisma.aiPromptTemplate.count(),
    WeeklyParentReport: await prisma.weeklyParentReport.count(),
    ParentReportDelivery: await prisma.parentReportDelivery.count(),
    Lead: await prisma.lead.count(),
    Invoice: await prisma.invoice.count(),
    Payment: await prisma.payment.count(),
    Homework: await prisma.homework.count(),
    HomeworkSubmission: await prisma.homeworkSubmission.count(),
  };
  
  console.log(JSON.stringify(counts, null, 2));
}

countModels().catch(console.error).finally(() => prisma.$disconnect());
