export interface MockHomeworkSubmission {
  id: string;
  className: string;
  teacherName: string;
  studentName: string;
  parentName: string;
  parentPhone: string;
  assignmentTitle: string;
  assignmentType: "Reading" | "Vocabulary" | "Grammar" | "Writing" | "Speaking" | "Listening";
  cefrLevel: "A1" | "A2" | "B1" | "B2" | "C1";
  submissionStatus: "Đã nộp" | "Chưa nộp" | "Nộp muộn" | "Cần nhắc";
  aiDraftStatus: "AI chấm nháp" | "Cần giáo viên duyệt" | "Giáo viên đã duyệt demo" | "Cần sửa nhận xét" | "Chưa có";
  aiScoreDraft?: number;
  aiStrengths?: string;
  aiImprovements?: string;
  suggestedTeacherComment?: string;
  parentReportDraftStatus: "Bản nháp" | "Chờ duyệt" | "Đã duyệt demo" | "Chưa có";
  riskNote?: string;
  suggestedNextAction?: string;
}

export const mockHomeworkSubmissions: MockHomeworkSubmission[] = [
  {
    id: "hw-1",
    className: "IELTS-2024-A",
    teacherName: "Thầy John",
    studentName: "Nguyễn Văn A",
    parentName: "Phụ huynh Nguyễn Văn A",
    parentPhone: "[SĐT đã ẩn]",
    assignmentTitle: "IELTS Reading Practice 1",
    assignmentType: "Reading",
    cefrLevel: "B2",
    submissionStatus: "Đã nộp",
    aiDraftStatus: "AI chấm nháp",
    aiScoreDraft: 7.5,
    aiStrengths: "Hiểu tốt ý chính, tìm keyword nhanh",
    aiImprovements: "Hay sai ở dạng True/False/Not Given",
    suggestedTeacherComment: "Kỹ năng đọc lướt tốt, nhưng cần chú ý kỹ hơn vào từ đồng nghĩa ở câu hỏi T/F/NG.",
    parentReportDraftStatus: "Bản nháp",
    riskNote: "Không có",
    suggestedNextAction: "Giáo viên duyệt điểm & báo cáo"
  },
  {
    id: "hw-2",
    className: "IELTS-2024-A",
    teacherName: "Thầy John",
    studentName: "Trần Thị B",
    parentName: "Phụ huynh Trần Thị B",
    parentPhone: "[SĐT đã ẩn]",
    assignmentTitle: "IELTS Writing Task 2",
    assignmentType: "Writing",
    cefrLevel: "B2",
    submissionStatus: "Đã nộp",
    aiDraftStatus: "Cần giáo viên duyệt",
    aiScoreDraft: 6.0,
    aiStrengths: "Cấu trúc bài rõ ràng, có đủ 3 phần",
    aiImprovements: "Từ vựng lặp lại nhiều, sai ngữ pháp mệnh đề quan hệ",
    suggestedTeacherComment: "Cần cải thiện độ đa dạng từ vựng và xem lại ngữ pháp mệnh đề quan hệ.",
    parentReportDraftStatus: "Chờ duyệt",
    riskNote: "Nguy cơ điểm viết dưới target",
    suggestedNextAction: "Giáo viên xem xét và duyệt nhận xét"
  },
  {
    id: "hw-3",
    className: "KIDS-STARTER-1",
    teacherName: "Cô Lan",
    studentName: "Lê Văn C",
    parentName: "Phụ huynh Lê Văn C",
    parentPhone: "[SĐT đã ẩn]",
    assignmentTitle: "Unit 3: My Family - Vocabulary",
    assignmentType: "Vocabulary",
    cefrLevel: "A1",
    submissionStatus: "Chưa nộp",
    aiDraftStatus: "Chưa có",
    parentReportDraftStatus: "Chưa có",
    riskNote: "Đã trễ hạn 2 ngày",
    suggestedNextAction: "Tạo nhắc nhở phụ huynh demo"
  },
  {
    id: "hw-4",
    className: "PET-2024",
    teacherName: "Thầy Mike",
    studentName: "Phạm D",
    parentName: "Phụ huynh Phạm D",
    parentPhone: "[SĐT đã ẩn]",
    assignmentTitle: "PET Speaking Part 2",
    assignmentType: "Speaking",
    cefrLevel: "B1",
    submissionStatus: "Nộp muộn",
    aiDraftStatus: "Giáo viên đã duyệt demo",
    aiScoreDraft: 8.0,
    aiStrengths: "Phát âm rõ ràng, tự tin",
    aiImprovements: "Đôi khi dùng sai thì quá khứ",
    suggestedTeacherComment: "Con làm bài rất tốt, chú ý hơn một chút khi dùng thì quá khứ nhé.",
    parentReportDraftStatus: "Đã duyệt demo",
    suggestedNextAction: "Không (Đã duyệt)"
  }
];
