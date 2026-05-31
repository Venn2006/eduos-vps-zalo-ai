const fs = require('fs');
let schema = fs.readFileSync('packages/db/prisma/schema.prisma', 'utf8');

// Replace Lead model
schema = schema.replace(/model Lead \{[\s\S]*?\n\}/, 
`model Lead {
  id           String          @id @default(cuid())
  tenantId     String
  name         String
  fullName     String?
  parentName   String?
  studentName  String?
  phone        String?
  email        String?
  stage        LeadStage       @default(NEW)
  temperature  LeadTemperature @default(WARM)
  sourceId     String?
  assignedToId String?
  interestedCourseId String?
  lastCallAt   DateTime?
  nextFollowUpAt DateTime?
  callCount    Int             @default(0)
  lostReason   String?         @db.Text
  batchId      String?
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
  deletedAt    DateTime?

  source           LeadSource?      @relation(fields: [sourceId], references: [id])
  batch            LeadBatch?       @relation(fields: [batchId], references: [id])
  tenant           Tenant           @relation(fields: [tenantId], references: [id])
  course           Course?          @relation(fields: [interestedCourseId], references: [id])
  trialBookings    TrialBooking[]
  activities       LeadActivity[]
  followUpTasks    FollowUpTask[]
  callAttempts     CallAttempt[]
  enrollmentOffers EnrollmentOffer[]
  enrollments      Enrollment[]

  @@index([tenantId, stage])
  @@index([tenantId, assignedToId])
}`
);

// Replace TrialBooking model
schema = schema.replace(/model TrialBooking \{[\s\S]*?\n\}/,
`model TrialBooking {
  id        String             @id @default(cuid())
  tenantId  String
  leadId    String
  classId   String?
  courseId  String?
  assignedSaleId String?
  studentName String?
  parentName  String?
  phone       String?
  notes       String?            @db.Text
  trialDate DateTime
  status    TrialBookingStatus @default(BOOKED)
  createdAt DateTime           @default(now())
  updatedAt DateTime           @updatedAt

  lead   Lead   @relation(fields: [leadId], references: [id])
  class  Class? @relation(fields: [classId], references: [id])
  course Course? @relation(fields: [courseId], references: [id])
  tenant Tenant @relation(fields: [tenantId], references: [id])

  @@index([tenantId, status])
}`
);

// Add LeadBatch and CallAttempt models to the end
schema += `

model LeadBatch {
  id          String   @id @default(cuid())
  tenantId    String
  name        String
  source      String?
  importedBy  String?
  importedAt  DateTime @default(now())
  totalLeads  Int      @default(0)
  notes       String?  @db.Text

  tenant Tenant @relation(fields: [tenantId], references: [id])
  leads  Lead[]

  @@index([tenantId])
}

model CallAttempt {
  id        String      @id @default(cuid())
  tenantId  String
  leadId    String
  saleId    String?
  outcome   CallOutcome
  notes     String?     @db.Text
  duration  Int?
  calledAt  DateTime    @default(now())

  lead   Lead   @relation(fields: [leadId], references: [id])
  tenant Tenant @relation(fields: [tenantId], references: [id])

  @@index([tenantId, leadId])
}
`;

// Add fields to Tenant if necessary
schema = schema.replace(/leads           Lead\[\]/, 
  'leads           Lead[]\n  leadBatches     LeadBatch[]\n  callAttempts    CallAttempt[]'
);

fs.writeFileSync('packages/db/prisma/schema.prisma', schema);
console.log('Schema updated successfully');
