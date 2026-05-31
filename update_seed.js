const fs = require('fs');
let seed = fs.readFileSync('packages/db/prisma/seed.ts', 'utf8');

const newCRMSection = `// 11. Seed CRM Leads, Batches, and Trials
  const saleMembers = await prisma.tenantMember.findMany({
    where: { tenantId: tId, role: 'SALE' },
    include: { user: true }
  });
  
  const leadBatches = [];
  for (let i = 0; i < 3; i++) {
    const batch = await prisma.leadBatch.create({
      data: { tenantId: tId, name: \`Facebook Ads Campaign \${i+1}\`, source: 'Facebook', totalLeads: 50 }
    });
    leadBatches.push(batch);
  }

  const leads = [];
  const stages = ['NEW', 'CONTACTED', 'QUALIFIED', 'BOOKED_TRIAL', 'ATTENDED_TRIAL', 'WON', 'LOST'];
  for (let i = 0; i < 150; i++) {
    const saleId = saleMembers[i % saleMembers.length].userId;
    const stage = stages[Math.floor(Math.random() * stages.length)];
    const batchId = leadBatches[i % 3].id;
    
    const l = await prisma.lead.create({
      data: { 
        tenantId: tId, 
        name: \`Lead \${i}\`,
        fullName: \`Lead \${i} Full Name\`,
        phone: \`0911111\${i.toString().padStart(3, '0')}\`,
        stage: stage,
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
            outcome: outcomes[Math.floor(Math.random() * outcomes.length)]
          }
        });
      }
    }
  }

  // 30 Trial bookings
  const bookedLeads = leads.filter(l => ['BOOKED_TRIAL', 'ATTENDED_TRIAL', 'WON'].includes(l.stage)).slice(0, 30);
  for (let i = 0; i < bookedLeads.length; i++) {
    const l = bookedLeads[i];
    const status = i < 5 ? 'CONVERTED' : (i < 15 ? 'ATTENDED' : 'BOOKED');
    await prisma.trialBooking.create({
      data: {
        tenantId: tId,
        leadId: l.id,
        courseId: l.interestedCourseId,
        trialDate: generateDates(i % 5),
        status: status,
        studentName: l.fullName,
        phone: l.phone,
        assignedSaleId: l.assignedToId
      }
    });
  }

  // 12. Seed Homework`;

seed = seed.replace(/\/\/ 11\. Seed CRM Leads[\s\S]*?\/\/ 12\. Seed Homework/, newCRMSection);

fs.writeFileSync('packages/db/prisma/seed.ts', seed);
console.log('Seed file updated successfully');
