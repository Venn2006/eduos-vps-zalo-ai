import * as path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "../../../.env") });

import { PrismaClient } from "@prisma/client";
import { clearDatabase, generateDates } from "../src/seed-helpers";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed process...");
  await clearDatabase(prisma);

  // 1. Seed Tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: "Trung Tâm Ngoại Ngữ OMLIS",
      slug: "omlis",
      hotline: "091 900 23 58",
      email: "ms.dungceo@gmail.com",
      address: "Đường Nguyễn Văn Linh, P. Minh Hưng, TX. Chơn Thành, T. Bình Phước",
    }
  });
  const tId = tenant.id;
  console.log(`Created Tenant: ${tenant.name} (${tId})`);

  // 2. Seed Users & Members
  const userSpecs = [
    { email: "owner@omlis.test", role: "OWNER" },
    { email: "sale1@omlis.test", role: "SALE" },
    { email: "sale2@omlis.test", role: "SALE" },
    { email: "teacher1@omlis.test", role: "TEACHER" },
    { email: "teacher2@omlis.test", role: "TEACHER" },
    { email: "teacher3@omlis.test", role: "TEACHER" },
    { email: "accountant@omlis.test", role: "ACCOUNTANT" },
  ];

  const bcrypt = require("bcryptjs");
  const defaultPasswordHash = await bcrypt.hash("ChangeMe123!", 10);

  for (const spec of userSpecs) {
    const u = await prisma.user.create({
      data: { email: spec.email, passwordHash: defaultPasswordHash }
    });
    await prisma.tenantMember.create({
      data: { tenantId: tId, userId: u.id, role: spec.role as any }
    });
  }

  // 3. Seed Automation Templates & Message Templates & Prompt Templates
  const templateNames = ["standard", "kids", "hsk", "topik", "ielts", "adult-communication"];
  const templates = [];
  for (const name of templateNames) {
    const t = await prisma.classAutomationTemplate.create({
      data: { tenantId: tId, name }
    });
    templates.push(t);
  }

  const messageTemplates = [
    { name: "CLASS_REMINDER_60M", content: "Lớp [className] của [studentName] sẽ bắt đầu lúc [startTime].", requiresApproval: false, groupSafe: true, channel: "ZALO_PERSONAL" as any },
    { name: "ATTENDANCE_CONFIRMATION", content: "Điểm danh: [studentName] đã có mặt.", requiresApproval: false, groupSafe: true, channel: "ZALO_PERSONAL" as any },
    { name: "TEACHER_HOMEWORK_REMINDER", content: "Thầy/cô vui lòng giao bài tập cho lớp [className].", requiresApproval: false, groupSafe: true, channel: "ZALO_PERSONAL" as any },
    { name: "HOMEWORK_ASSIGNMENT_TO_CLASS", content: "Bài tập mới: [homeworkTitle]. Hạn nộp: [dueDate].", requiresApproval: false, groupSafe: true, channel: "ZALO_PERSONAL" as any },
    { name: "HOMEWORK_SUBMISSION_RECEIVED", content: "Đã nhận bài của [studentName].", requiresApproval: false, groupSafe: true, channel: "ZALO_PERSONAL" as any },
    { name: "WEEKLY_PARENT_REPORT", content: "Báo cáo tuần [studentName]: [summary]", requiresApproval: true, groupSafe: false, channel: "ZALO_PERSONAL" as any, isSensitive: true },
    { name: "PAYMENT_REMINDER_7D", content: "Học phí của [studentName] sắp đến hạn: [amountDue].", requiresApproval: true, groupSafe: false, channel: "ZALO_PERSONAL" as any, isSensitive: true },
    { name: "PAYMENT_DUE_TODAY", content: "Hôm nay là hạn chót thanh toán [amountDue] cho [studentName].", requiresApproval: true, groupSafe: false, channel: "ZALO_PERSONAL" as any, isSensitive: true },
    { name: "RENEWAL_SUGGESTION", content: "[studentName] chỉ còn 2 buổi học. Quý phụ huynh vui lòng tái tục.", requiresApproval: true, groupSafe: false, channel: "ZALO_PERSONAL" as any, isSensitive: true },
    { name: "POST_TRIAL_24H_FOLLOWUP", content: "Bạn thấy buổi học thử thế nào?", requiresApproval: false, groupSafe: false, channel: "FACEBOOK_PAGE" as any }
  ];
  for (const spec of messageTemplates) {
    await prisma.zaloMessageTemplate.create({ data: { tenantId: tId, ...spec }});
  }

  const promptTemplates = [
    { purpose: "classifyLead", template: "Classify this lead based on message: [message]" },
    { purpose: "suggestFanpageReply", template: "Suggest reply to: [message]" },
    { purpose: "postTrial24hFollowUp", template: "Generate follow up for lead: [leadData]" },
    { purpose: "parseAttendanceMessage", template: "Extract attendance from: [message]" },
    { purpose: "parseHomeworkAssignment", template: "Extract homework assignment from: [message]" },
    { purpose: "gradeHomeworkDraft", template: "Grade this submission: [submissionData]" },
    { purpose: "weeklyParentReport", template: "Generate report from stats: [stats]" },
    { purpose: "politePaymentReminder", template: "Generate polite reminder for [amountDue]" },
    { purpose: "renewalSuggestion", template: "Generate renewal suggestion for [studentName]" }
  ];
  for (const spec of promptTemplates) {
    await prisma.aiPromptTemplate.create({ data: { tenantId: tId, ...spec }});
  }

  // 4. Seed Courses
  const courseNames = ["English Communication", "Chinese HSK Starter", "Korean TOPIK Starter", "IELTS Foundation", "Kids English"];
  const courses = [];
  for (const name of courseNames) {
    const c = await prisma.course.create({
      data: { tenantId: tId, name, level: "Beginner" }
    });
    courses.push(c);
  }

  // 5. Seed Teachers
  const teachers = [];
  for (let i=1; i<=3; i++) {
    const t = await prisma.teacher.create({
      data: { tenantId: tId, name: `Teacher ${i}`, phone: `090000000${i}` }
    });
    teachers.push(t);
  }

  // 6. Seed Classes
  const classCodes = ["HSK1-A05", "HSK1-A06", "TOPIK-A01", "IELTS-F01", "KIDS-E01", "COMM-B01", "HSK2-A01", "IELTS-F02"];
  const classes = [];
  for (let i=0; i<8; i++) {
    const c = await prisma.class.create({
      data: { tenantId: tId, classCode: classCodes[i], courseId: courses[i % courses.length].id, teacherId: teachers[i % teachers.length].id, status: "ACTIVE" }
    });
    
    // Link automation settings
    await prisma.classAutomationSetting.create({
      data: {
        tenantId: tId,
        classId: c.id,
        templateId: templates[i % templates.length].id,
        classReminderEnabled: true,
        attendanceEnabled: true,
        teacherHomeworkReminderEnabled: true,
        homeworkSubmissionEnabled: true,
        rewardEnabled: true,
        sensitiveMessagesRequireApproval: true,
        paymentReminderGroupEnabled: false,
        classReminderMinutesBefore: 60,
        teacherHomeworkReminderMinutesAfterClass: 15
      }
    });
    classes.push(c);
  }

  // Generate 60 future sessions
  for (let i=0; i<60; i++) {
    const c = classes[i % classes.length];
    await prisma.classSession.create({
      data: {
        tenantId: tId, classId: c.id, sessionDate: generateDates(Math.floor(i / classes.length) + 1),
        startTime: generateDates(Math.floor(i / classes.length) + 1), endTime: generateDates(Math.floor(i / classes.length) + 1),
        topic: `Lesson ${Math.floor(i/8) + 1}`
      }
    });
  }

  // 7. Seed Academic (Students & Guardians)
  const students = [];
  const guardians = [];
  for (let i=0; i<80; i++) {
    const guardian = await prisma.guardian.create({
      data: { tenantId: tId, name: `Parent of Student ${i}`, phone: `09222222${i.toString().padStart(2, '0')}` }
    });
    guardians.push(guardian);
    const student = await prisma.student.create({
      data: { tenantId: tId, name: `Student ${i}`, guardianId: guardian.id }
    });
    students.push(student);
    
    await prisma.enrollment.create({
      data: { tenantId: tId, studentId: student.id, classId: classes[i % 8].id }
    });
    
    if (i < 20) {
      await prisma.studentProgressNote.create({
        data: { tenantId: tId, studentId: student.id, note: "Good progress" }
      });
    }
  }

  const sessions = await prisma.classSession.findMany({ where: { tenantId: tId }, take: 100 });
  for (let i=0; i<100; i++) {
    if (!sessions[i]) break;
    await prisma.attendance.create({
      data: { tenantId: tId, classSessionId: sessions[i].id, studentId: students[i % students.length].id, status: "PRESENT" }
    });
  }

  // 8. Seed Zalo Identities
  const studentIdentities = [];
  const guardianIdentities = [];
  const teacherIdentities = [];
  for (let i = 0; i < 80; i++) {
    const sIdentity = await prisma.zaloIdentity.create({
      data: { tenantId: tId, externalUserId: `zalo-student-${i}`, displayName: `Student ${i} Zalo`, phone: `090000${i.toString().padStart(4, '0')}`, studentId: students[i].id, confidenceScore: 1.0 }
    });
    studentIdentities.push(sIdentity);
    const gIdentity = await prisma.zaloIdentity.create({
      data: { tenantId: tId, externalUserId: `zalo-guardian-${i}`, displayName: `Guardian ${i} Zalo`, phone: `091000${i.toString().padStart(4, '0')}`, guardianId: guardians[i].id, confidenceScore: 1.0 }
    });
    guardianIdentities.push(gIdentity);
  }
  for (let i = 0; i < 3; i++) {
    const tIdentity = await prisma.zaloIdentity.create({
      data: { tenantId: tId, externalUserId: `zalo-teacher-${i}`, displayName: `Teacher ${i} Zalo`, phone: `092000${i.toString().padStart(4, '0')}`, teacherId: teachers[i].id, confidenceScore: 1.0 }
    });
    teacherIdentities.push(tIdentity);
  }

  // 9. Seed Zalo Groups & Members
  const zaloAccount = await prisma.zaloPersonalAccount.create({
    data: { tenantId: tId, phoneNumber: "0999999999", displayName: "OMLIS Assistant" }
  });

  const zaloGroups = [];
  for (let i=0; i<8; i++) {
    const g = await prisma.zaloGroup.create({
      data: { tenantId: tId, externalGroupId: `zalo-group-ext-${i}`, name: `Group ${classCodes[i]}`, classId: classes[i].id }
    });
    zaloGroups.push(g);
    
    // Add teacher member
    await prisma.zaloGroupMember.create({
      data: { tenantId: tId, groupId: g.id, zaloIdentityId: teacherIdentities[i % 3].id, role: "TEACHER" }
    });

    // Add students and guardians enrolled in this class
    const enrollments = await prisma.enrollment.findMany({ where: { classId: classes[i].id } });
    for (const enr of enrollments) {
      const sIden = studentIdentities.find(x => x.studentId === enr.studentId);
      if (sIden) {
        await prisma.zaloGroupMember.create({ data: { tenantId: tId, groupId: g.id, zaloIdentityId: sIden.id, role: "STUDENT" } });
      }
      const stu = students.find(x => x.id === enr.studentId);
      if (stu) {
        const gIden = guardianIdentities.find(x => x.guardianId === stu.guardianId);
        if (gIden) {
          await prisma.zaloGroupMember.create({ data: { tenantId: tId, groupId: g.id, zaloIdentityId: gIden.id, role: "GUARDIAN" } });
        }
      }
    }
  }

  // Zalo Messages
  const sampleMessages = ["/setup HSK1-A06", "Có mặt", "IN", "DD: An có mặt, Bình vắng, Chi trễ", "Em xin nghỉ hôm nay", "BT: Làm bài trang 32", "Hạn: 21:00 ngày mai", "Nộp bài - An"];
  for (let i=0; i<50; i++) {
    await prisma.zaloMessage.create({
      data: { tenantId: tId, externalMessageId: `msg-ext-${i}`, direction: i % 2 === 0 ? "INBOUND" : "OUTBOUND", text: sampleMessages[i % sampleMessages.length], groupId: zaloGroups[i % 8].id }
    });
  }

  // 10. Seed Facebook
  const fbPage = await prisma.facebookPage.create({
    data: { tenantId: tId, pageId: "fb-page-123", pageName: "OMLIS Official", pageToken: "token" }
  });

  for (let i=0; i<10; i++) {
    const conv = await prisma.facebookConversation.create({
      data: { tenantId: tId, pageId: fbPage.id, psid: `psid-${i}`, lastMessage: new Date() }
    });
    for (let j=0; j<5; j++) {
      await prisma.facebookMessage.create({
        data: { tenantId: tId, conversationId: conv.id, messageId: `fb-msg-${i}-${j}`, direction: j % 2 === 0 ? "INBOUND" : "OUTBOUND", text: "Hello!" }
      });
    }
  }

  // 11. Seed CRM Leads
  const leads = [];
  for (let i=0; i<50; i++) {
    const l = await prisma.lead.create({
      data: { tenantId: tId, name: `Lead ${i}`, phone: `09111111${i.toString().padStart(2, '0')}`, stage: i < 10 ? "NEW" : (i < 30 ? "CONTACTED" : "WON"), temperature: "HOT" }
    });
    leads.push(l);
  }
  for (let i=0; i<20; i++) {
    await prisma.trialBooking.create({
      data: { tenantId: tId, leadId: leads[i].id, trialDate: generateDates(2), status: "BOOKED" }
    });
  }

  // 12. Seed Homework
  for (let i=0; i<15; i++) {
    const hw = await prisma.homework.create({
      data: { tenantId: tId, classId: classes[i % 8].id, title: `Homework ${i}`, dueAt: generateDates(3) }
    });
    for (let j=0; j<2; j++) {
      const sub = await prisma.homeworkSubmission.create({
        data: { tenantId: tId, homeworkId: hw.id, studentId: students[(i+j) % students.length].id }
      });
      if (j === 0) {
        await prisma.aiGradeDraft.create({
          data: { tenantId: tId, submissionId: sub.id, score: 9.5, comment: "Excellent work!" }
        });
      }
    }
  }

  // 13. Seed Finance
  for (let i=0; i<40; i++) {
    const inv = await prisma.invoice.create({
      data: { tenantId: tId, studentId: students[i].id, totalAmount: 1000000, remainingAmount: i < 10 ? 0 : 500000, dueDate: generateDates(5), status: i < 10 ? "PAID" : "PARTIALLY_PAID" }
    });
    if (i < 30) {
      await prisma.payment.create({ data: { tenantId: tId, invoiceId: inv.id, amount: 500000 } });
    }
    if (i >= 30) {
      await prisma.debtReminder.create({ data: { tenantId: tId, invoiceId: inv.id } });
    }
  }
  for (let i=0; i<15; i++) {
    await prisma.renewalCandidate.create({
      data: { tenantId: tId, studentId: students[i].id, sessionsLeft: 2 }
    });
  }

  // 14. Reports & Deliveries
  const reportStatuses = ["DRAFT", "PENDING_APPROVAL", "SENT", "FAILED"];
  for (let i=0; i<10; i++) {
    const rep = await prisma.weeklyParentReport.create({
      data: { tenantId: tId, studentId: students[i].id, guardianId: guardians[i].id, weekStart: generateDates(-7), weekEnd: generateDates(0), summary: "Weekly summary of progress" }
    });
    await prisma.parentReportDelivery.create({
      data: { tenantId: tId, reportId: rep.id, channel: "ZALO_PERSONAL", status: reportStatuses[i % reportStatuses.length] }
    });
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
