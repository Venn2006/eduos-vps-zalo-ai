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
    { name: "CLASS_REMINDER_60M", content: "OMLIS xin chào các bạn 💛\n\n⏰ Sắp đến giờ học rồi, mọi người chuẩn bị tài liệu sẵn sàng nhé!\n\n🕕 Thời gian: [startTime] - [endTime]\n📚 Lớp: [className]\n👩‍🏫 Giáo viên: [teacherName]\n\n🚨 LƯU Ý: Xin phép vắng/trễ ❌ KHÔNG NHẮN TRÊN GROUP NÀY.\n👉 Vui lòng inbox riêng Zalo Admin [adminPhone] để được hỗ trợ và nhận bài bù ạ.\n\nChúc cả lớp học thật năng lượng nhé! 🥰", requiresApproval: false, groupSafe: true, channel: "ZALO_PERSONAL" as any, isSensitive: false },
    { name: "ATTENDANCE_CONFIRMATION", content: "Điểm danh: [studentName] đã có mặt.", requiresApproval: false, groupSafe: true, channel: "ZALO_PERSONAL" as any },
    { name: "TEACHER_HOMEWORK_REMINDER", content: "Thầy/cô ơi, lớp [className] vừa kết thúc nhưng chưa có bài tập về nhà.\n\nThầy/cô có thể gửi bài tập theo mẫu:\nBT: [nội dung bài tập]\nHạn: [ngày/giờ nộp]", requiresApproval: false, groupSafe: true, channel: "ZALO_PERSONAL" as any },
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
  const courseNames = ["Tiếng Anh giao tiếp", "Tiếng Trung HSK nhập môn", "Tiếng Hàn TOPIK nhập môn", "IELTS nền tảng", "Tiếng Anh trẻ em"];
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
      data: { tenantId: tId, name: `Giáo viên ${i}`, phone: `090000000${i}` }
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
        topic: `Buổi học ${Math.floor(i/8) + 1}`
      }
    });
  }

  // Create one specific session 60 minutes from now for immediate testing
  const now = new Date();
  const testStartTime = new Date(now.getTime() + 60 * 60 * 1000);
  const testEndTime = new Date(now.getTime() + 120 * 60 * 1000);
  await prisma.classSession.create({
    data: {
      tenantId: tId,
      classId: classes[0].id,
      sessionDate: testStartTime,
      startTime: testStartTime,
      endTime: testEndTime,
      topic: "Buổi kiểm tra nhắc lịch"
    }
  });

  // Create one specific session that ended exactly 15 minutes ago for testing homework reminder
  const pastEndTime = new Date(now.getTime() - 15 * 60 * 1000);
  const pastStartTime = new Date(pastEndTime.getTime() - 60 * 60 * 1000);
  await prisma.classSession.create({
    data: {
      tenantId: tId,
      classId: classes[0].id,
      sessionDate: pastStartTime,
      startTime: pastStartTime,
      endTime: pastEndTime,
      topic: "Buổi học cần nhắc bài tập"
    }
  });

  // 7. Seed Academic (Students & Guardians)
  const students = [];
  const guardians = [];
  const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
  const firstNames = ['Anh', 'Tuấn', 'Dũng', 'Minh', 'Thành', 'Hoa', 'Lan', 'Trang', 'Hương', 'Quỳnh', 'Thảo', 'Phương', 'Linh', 'Nhung', 'Nam', 'Phong', 'Sơn', 'Hùng', 'Tâm', 'Bình'];
  for (let i=0; i<80; i++) {
    const studentName = `${lastNames[i % lastNames.length]} ${firstNames[i % firstNames.length]} ${i + 1}`;
    const guardian = await prisma.guardian.create({
      data: { tenantId: tId, name: `Phụ huynh ${studentName}`, phone: `09222222${i.toString().padStart(2, '0')}` }
    });
    guardians.push(guardian);
    const student = await prisma.student.create({
      data: { tenantId: tId, name: studentName, guardianId: guardian.id }
    });
    students.push(student);
    
    await prisma.enrollment.create({
      data: { tenantId: tId, studentId: student.id, classId: classes[i % 8].id }
    });
    
    if (i < 20) {
      await prisma.studentProgressNote.create({
        data: { tenantId: tId, studentId: student.id, note: "Tiến bộ tốt, cần duy trì chuyên cần." }
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
      data: { tenantId: tId, externalUserId: `zalo-student-${i}`, displayName: `${students[i].name} Zalo`, phone: `090000${i.toString().padStart(4, '0')}`, studentId: students[i].id, confidenceScore: 1.0 }
    });
    studentIdentities.push(sIdentity);
    const gIdentity = await prisma.zaloIdentity.create({
      data: { tenantId: tId, externalUserId: `zalo-guardian-${i}`, displayName: `${guardians[i].name} Zalo`, phone: `091000${i.toString().padStart(4, '0')}`, guardianId: guardians[i].id, confidenceScore: 1.0 }
    });
    guardianIdentities.push(gIdentity);
  }
  for (let i = 0; i < 3; i++) {
    const tIdentity = await prisma.zaloIdentity.create({
      data: { tenantId: tId, externalUserId: `zalo-teacher-${i}`, displayName: `${teachers[i].name} Zalo`, phone: `092000${i.toString().padStart(4, '0')}`, teacherId: teachers[i].id, confidenceScore: 1.0 }
    });
    teacherIdentities.push(tIdentity);
  }

  // 9. Seed Zalo Groups & Members
  const zaloAccount = await prisma.zaloPersonalAccount.create({
    data: { tenantId: tId, phoneNumber: "0999999999", displayName: "OMLIS Assistant" }
  });

  await prisma.zaloConnectorSession.create({
    data: { tenantId: tId, accountId: zaloAccount.id, status: "OFFLINE", lastPing: new Date() }
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

  const fbScenarios = [
    {
      psid: "psid-001",
      leadName: "Nguyễn Hương",
      stage: "NEW",
      messages: [
        { text: "Dạ trung tâm cho em hỏi khóa IELTS Foundation học phí bao nhiêu ạ?", dir: "INBOUND" },
        { text: "Chào bạn! Khóa IELTS Foundation tại OMLIS có học phí là 4.500.000 VNĐ / khóa (3 tháng). Bạn muốn đăng ký học ở chi nhánh nào ạ?", dir: "OUTBOUND" },
        { text: "Em ở gần Chơn Thành, có lớp tối thứ 3, 5, 7 không ạ?", dir: "INBOUND" }
      ],
      aiDraft: "Dạ hiện tại chi nhánh Chơn Thành có lớp tối 3-5-7 lúc 18h30 - 20h00 ạ. Chị để lại số điện thoại để trung tâm tư vấn kỹ hơn nhé!"
    },
    {
      psid: "psid-002",
      leadName: "Trần Minh",
      stage: "POTENTIAL",
      messages: [
        { text: "Trung tâm có lớp HSK 2 không?", dir: "INBOUND" },
        { text: "Dạ có ạ, lớp HSK 2 cơ bản sắp khai giảng vào đầu tháng tới. Anh/chị đã từng học tiếng Trung ở đâu chưa ạ?", dir: "OUTBOUND" },
        { text: "Mình tự học ở nhà sơ sơ, muốn qua trung tâm test trình độ để xếp lớp.", dir: "INBOUND" }
      ],
      aiDraft: "Dạ vâng ạ. Mời anh ghé trung tâm vào sáng cuối tuần để test trình độ miễn phí nhé. Anh cho em xin tên và SĐT để em đặt lịch hẹn cho mình ạ."
    },
    {
      psid: "psid-003",
      leadName: "Phạm Thảo",
      stage: "WAITING_TRIAL",
      messages: [
        { text: "Chị muốn hỏi lớp tiếng Anh cho bé 6 tuổi.", dir: "INBOUND" },
        { text: "Dạ khóa Kids English dành cho bé 6 tuổi đang có chương trình học thử 2 buổi miễn phí. Chị muốn đăng ký cho bé học thử không ạ?", dir: "OUTBOUND" },
        { text: "Bé nhà chị nhát lắm, không biết có theo kịp không. Đăng ký học thử thì thứ mấy có lớp?", dir: "INBOUND" }
      ],
      aiDraft: "Dạ lớp Kids English có giáo viên nước ngoài và trợ giảng hỗ trợ bé rất nhiệt tình nên chị yên tâm nhé! Lớp học thử có vào tối Thứ 4 và sáng Chủ Nhật tuần này. Chị thu xếp cho bé học buổi nào được ạ?"
    }
  ];

  for (let i = 0; i < fbScenarios.length; i++) {
    const scenario = fbScenarios[i];
    
    // Create lead for this fb conversation
    const lead = await prisma.lead.create({
      data: {
        tenantId: tId,
        name: scenario.leadName,
        stage: scenario.stage as any,
        temperature: "HOT",
        phone: "09" + Math.floor(10000000 + Math.random() * 90000000),
      }
    });

    const conv = await prisma.facebookConversation.create({
      data: { 
        tenantId: tId, 
        pageId: fbPage.id, 
        psid: scenario.psid, 
        lastMessage: new Date(),
        leadId: lead.id
      }
    });

    for (let j = 0; j < scenario.messages.length; j++) {
      await prisma.facebookMessage.create({
        data: { 
          tenantId: tId, 
          conversationId: conv.id, 
          messageId: `fb-msg-${i}-${j}`, 
          direction: scenario.messages[j].dir as any, 
          text: scenario.messages[j].text 
        }
      });
    }

    if (scenario.aiDraft) {
      await prisma.aiSuggestion.create({
        data: {
          tenantId: tId,
          context: `FACEBOOK_CONVERSATION:${conv.id}`,
          suggestion: scenario.aiDraft,
          isUsed: false
        }
      });
    }
  }

  // 11. Seed CRM Leads, Batches, and Trials
  const saleMembers = await prisma.tenantMember.findMany({
    where: { tenantId: tId, role: 'SALE' },
    include: { user: true }
  });
  
  const leadBatches = [];
  for (let i = 0; i < 3; i++) {
    const batch = await prisma.leadBatch.create({
      data: { tenantId: tId, name: `Facebook Ads Campaign ${i+1}`, source: 'Facebook', totalLeads: 50 }
    });
    leadBatches.push(batch);
  }

  const leads = [];
  const stages = ['NEW', 'NO_ANSWER', 'CALLBACK', 'INTERESTED', 'POTENTIAL', 'WAITING_TRIAL', 'TRIALING', 'TRIALED', 'REGISTERED', 'NOT_POTENTIAL', 'NO_NEED'];
  for (let i = 0; i < 150; i++) {
    const saleId = saleMembers[i % saleMembers.length].userId;
    const stage = stages[Math.floor(Math.random() * stages.length)];
    const batchId = leadBatches[i % 3].id;
    
    const leadName = lastNames[i % lastNames.length] + ' ' + firstNames[i % firstNames.length];
    const l = await prisma.lead.create({
      data: { 
        tenantId: tId, 
        name: leadName,
        fullName: leadName,
        phone: `0911111${i.toString().padStart(3, '0')}`,
        stage: stage as any,
        temperature: stage === 'NEW' ? 'COLD' : 'HOT',
        assignedToId: saleId,
        batchId: batchId,
        callCount: stage === 'NEW' ? 0 : Math.floor(Math.random() * 3) + 1,
        interestedCourseId: courses[i % courses.length].id
      }
    });
    leads.push(l);

    // Seed Call Attempts
    if (l.callCount > 0) {
      const outcomes = ['NO_ANSWER', 'BUSY_CALLBACK', 'WRONG_NUMBER', 'INTERESTED', 'NOT_INTERESTED', 'ASKED_PRICE'];
      for(let j=0; j<l.callCount; j++) {
        await prisma.callAttempt.create({
          data: {
            tenantId: tId,
            leadId: l.id,
            saleId: saleId,
            outcome: outcomes[Math.floor(Math.random() * outcomes.length)] as any
          }
        });
      }
    }
  }

  // 30 Trial bookings
  const bookedLeads = leads.filter(l => ['WAITING_TRIAL', 'TRIALING', 'TRIALED', 'REGISTERED'].includes(l.stage)).slice(0, 30);
  for (let i = 0; i < bookedLeads.length; i++) {
    const l = bookedLeads[i];
    const status = i < 5 ? 'CONVERTED' : (i < 15 ? 'ATTENDED' : 'BOOKED');
    await prisma.trialBooking.create({
      data: {
        tenantId: tId,
        leadId: l.id,
        courseId: l.interestedCourseId,
        trialDate: generateDates(i % 5),
        status: status as any,
        studentNameSnapshot: l.fullName,
        phoneSnapshot: l.phone,
        assignedSaleId: l.assignedToId
      }
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
    let invoiceStatus = "PAID";
    let remainingAmount = 0;
    
    if (i >= 10 && i < 20) {
      invoiceStatus = "PARTIALLY_PAID";
      remainingAmount = 500000;
    } else if (i >= 20) {
      invoiceStatus = "UNPAID";
      remainingAmount = 1000000;
    }
    
    const inv = await prisma.invoice.create({
      data: { 
        tenantId: tId, 
        studentId: students[i].id, 
        guardianId: guardians[i % guardians.length].id,
        invoiceCode: `INV-${new Date().getFullYear()}-${(i+1).toString().padStart(4, '0')}`,
        totalAmount: 1000000, 
        remainingAmount: remainingAmount, 
        dueDate: generateDates(5), 
        status: invoiceStatus as any 
      }
    });
    if (i < 30) {
      await prisma.payment.create({ data: { tenantId: tId, invoiceId: inv.id, amount: 500000 } });
    }
    if (i >= 30) {
      await prisma.debtReminder.create({ 
        data: { 
          tenantId: tId, 
          invoiceId: inv.id,
          studentId: students[i].id,
          guardianId: guardians[i % guardians.length].id,
          reminderType: "OVERDUE",
          daysOffset: 3,
          draftContent: `OMLIS xin chào phụ huynh của bé ${students[i].name}...`,
          targetChannel: "ZALO_PERSONAL"
        } 
      });
    }
  }
  for (let i=0; i<15; i++) {
    await prisma.renewalCandidate.create({
      data: { 
        tenantId: tId, 
        studentId: students[i].id, 
        remainingSessions: 2,
        expectedEndDate: generateDates(10),
        suggestedRenewalCourse: "Level 2 Advanced",
        renewalAmountEstimate: 2500000
      }
    });
  }

  // 14. Reports & Deliveries
  const reportStatuses = ["DRAFT", "PENDING_TEACHER_REVIEW", "PENDING_ADMIN_APPROVAL", "APPROVED", "SENT"];
  for (let i=0; i<10; i++) {
    const riskFlags = i % 3 === 0 ? [{ type: "ATTENDANCE_RISK", severity: "MEDIUM", reason: "Absent 2 times", suggestedAction: "Contact parent", visibleToParent: true }] : [];
    const rep = await prisma.weeklyParentReport.create({
      data: { 
        tenantId: tId, 
        studentId: students[i].id, 
        guardianId: guardians[i].id, 
        weekStart: generateDates(-7), 
        weekEnd: generateDates(0), 
        attendanceSummaryJson: "{}",
        homeworkSummaryJson: "{}",
        gradingSummaryJson: "{}",
        rewardSummaryJson: "{}",
        riskFlagsJson: JSON.stringify(riskFlags),
        aiDraftContent: "Weekly summary of progress draft...",
        status: reportStatuses[i % reportStatuses.length] as any
      }
    });
    await prisma.parentReportDelivery.create({
      data: { 
        tenantId: tId, 
        reportId: rep.id, 
        guardianId: guardians[i].id,
        targetChannel: "ZALO_PERSONAL", 
        status: "DRAFT" 
      }
    });
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
