import { CallOutcome } from '@prisma/client';

export interface SuggestionInfo {
  label: string;
  copy: string;
  isMessageSuggested: boolean;
}

export function getSuggestionForOutcome(outcome: CallOutcome | null): SuggestionInfo | null {
  if (!outcome) return null;

  switch (outcome) {
    case 'NO_ANSWER':
      return {
        label: 'Gợi ý nhắn lại sau khi không nghe máy',
        copy: 'Em chào anh/chị, em là tư vấn từ trung tâm. Em vừa gọi để hỗ trợ thông tin lớp học thử cho bé. Khi nào tiện anh/chị nhắn lại giúp em nhé ạ.',
        isMessageSuggested: true
      };
    case 'BUSY_CALLBACK':
      return {
        label: 'Gợi ý hẹn gọi lại',
        copy: 'Dạ em ghi nhận anh/chị đang bận. Em sẽ gọi lại vào khung giờ phù hợp để tư vấn lịch học thử và lộ trình cho bé ạ.',
        isMessageSuggested: true
      };
    case 'INTERESTED':
      return {
        label: 'Gợi ý chăm sóc lead quan tâm',
        copy: 'Anh/chị cho em xin thêm độ tuổi/trình độ hiện tại của bé để em gợi ý lớp học thử phù hợp nhất nhé ạ.',
        isMessageSuggested: true
      };
    case 'ASKED_PRICE':
      return {
        label: 'Gợi ý xử lý câu hỏi học phí',
        copy: 'Dạ học phí sẽ tùy theo chương trình và số buổi học. Em có thể gửi anh/chị lộ trình phù hợp trước, sau đó báo mức học phí chính xác theo lớp ạ.',
        isMessageSuggested: true
      };
    case 'NEEDS_PARENT_APPROVAL':
      return {
        label: 'Gợi ý nhắc phụ huynh trao đổi',
        copy: 'Dạ anh/chị cứ trao đổi thêm với gia đình. Em sẽ giữ thông tin tư vấn và nhắn lại sau để hỗ trợ chọn lịch học thử phù hợp ạ.',
        isMessageSuggested: true
      };
    case 'BOOKED_TRIAL':
      return {
        label: 'Gợi ý xác nhận học thử',
        copy: 'Dạ em đã ghi nhận lịch học thử cho bé. Trung tâm sẽ xác nhận lại thông tin lớp, thời gian và hướng dẫn trước buổi học ạ.',
        isMessageSuggested: true
      };
    case 'ATTENDED_TRIAL':
      return {
        label: 'Gợi ý gọi chốt sau học thử',
        copy: 'Dạ sau buổi học thử, em muốn xin phản hồi của anh/chị về trải nghiệm của bé để tư vấn lộ trình học tiếp theo phù hợp ạ.',
        isMessageSuggested: true
      };
    case 'NOT_INTERESTED':
      return {
        label: 'Gợi ý kết thúc nhẹ nhàng',
        copy: 'Dạ em cảm ơn anh/chị đã phản hồi. Khi nào gia đình có nhu cầu tìm lớp phù hợp cho bé, trung tâm rất sẵn sàng hỗ trợ lại ạ.',
        isMessageSuggested: true
      };
    case 'WRONG_NUMBER':
      return {
        label: 'Không cần nhắn',
        copy: 'Số điện thoại không đúng. Không nên gửi tin nhắn follow-up.',
        isMessageSuggested: false
      };
    case 'PAID':
      return {
        label: 'Gợi ý cảm ơn sau khi đóng phí',
        copy: 'Dạ trung tâm đã ghi nhận thông tin đăng ký của bé. Em cảm ơn anh/chị, trung tâm sẽ tiếp tục hỗ trợ trong quá trình học ạ.',
        isMessageSuggested: true
      };
    case 'LOST':
      return {
        label: 'Gợi ý lưu lý do từ chối',
        copy: 'Ghi lại lý do từ chối để trung tâm cải thiện tư vấn và có thể chăm sóc lại trong tương lai nếu phù hợp.',
        isMessageSuggested: false
      };
    default:
      return null;
  }
}
