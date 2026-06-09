import React from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { BookOpen, Sparkles, Users, Briefcase } from 'lucide-react';

export default function DocsPage() {
  return (
    <PageShell
      title="Hướng dẫn sử dụng EduOS CRM"
      description="Tài liệu chi tiết cách vận hành và sử dụng hệ thống."
    >
      <div className="max-w-4xl space-y-8">

        {/* Section 1: Introduction */}
        <section className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-zinc-900 border border-indigo-100 dark:border-zinc-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-400 mb-4">Chào mừng đến với EduOS CRM Workspace</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            Hệ thống EduOS được thiết kế để giải quyết bài toán giao tiếp phân mảnh tại các trung tâm giáo dục. Thay vì quản lý dữ liệu rải rác trên Zalo, Facebook, Google Sheets và phần mềm kế toán riêng biệt, EduOS gom tất cả về một <strong className="text-indigo-600">Trạm điều khiển duy nhất</strong>.
          </p>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            Hệ thống phân quyền (Role-based) đảm bảo mỗi nhân sự chỉ nhìn thấy và xử lý đúng nghiệp vụ của mình, tránh sai sót và quá tải thông tin. Dưới đây là hướng dẫn chi tiết cho từng bộ phận.
          </p>
        </section>

        {/* Section 2: CEO & Quản lý */}
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Hướng dẫn dành cho Giám đốc (CEO/Manager)</h2>
              <p className="text-sm text-slate-500">Giám sát tổng thể, phê duyệt và ra quyết định.</p>
            </div>
          </div>
          <div className="space-y-4 text-slate-600 dark:text-slate-300">
            <h3 className="font-semibold text-slate-800">Các tính năng chính cần quan tâm:</h3>
            <ul className="list-disc pl-5 space-y-3">
              <li>
                <strong>CRM Command Center:</strong> Đây là trạm điều khiển đa kênh. Bạn sẽ thấy ngay <em>Có bao nhiêu học viên sắp nghỉ?</em>, <em>Bao nhiêu task cần admin duyệt?</em>. Các lead có rủi ro cao sẽ được ưu tiên hiển thị để nhân sự xử lý trước.
              </li>
              <li>
                <strong>Tổng quan Tài chính & Tuyển sinh:</strong> Cung cấp biểu đồ trực quan về doanh thu theo tháng, dòng tiền thu/chi, và tỷ lệ chốt Sale của từng nhân sự.
              </li>
              <li>
                <strong>Kho AI có kiểm soát:</strong> Nơi bạn xem các gói AI, cấu hình mức can thiệp và chỉ mở luồng thật sau khi qua Approval Queue, Hàng chờ duyệt và Production Readiness.
              </li>
              <li>
                <strong>Tài khoản nhân viên:</strong> Bạn có quyền cao nhất để cấp quyền truy cập Zalo/Fanpage cho nhân viên. <em>Lưu ý: EduOS chỉ đồng bộ tin nhắn từ tài khoản công việc được cấp, tuyệt đối không scrape tin nhắn Zalo cá nhân ngoài luồng.</em>
              </li>
            </ul>
          </div>
        </section>

        {/* Section 3: Tư vấn viên & Lễ tân */}
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Hướng dẫn dành cho Tư vấn (Sales/CSKH)</h2>
              <p className="text-sm text-slate-500">Xử lý Lead, tư vấn học thử và chốt sale.</p>
            </div>
          </div>
          <div className="space-y-4 text-slate-600 dark:text-slate-300">
            <h3 className="font-semibold text-slate-800">Quy trình làm việc hàng ngày:</h3>
            <ul className="list-disc pl-5 space-y-3">
              <li>
                <strong>Sáng:</strong> Mở <code>Tin nhắn & Zalo (Team Inbox)</code>. Lọc các tin nhắn <em>Chưa nhận</em> hoặc <em>Quá SLA</em> để xử lý trước. Dữ liệu từ Hotline Zalo, OA và Fanpage sẽ được gom về chung khi kết nối tương ứng đã cấu hình.
              </li>
              <li>
                <strong>Trưa:</strong> Vào module <code>Lead & Data</code> để gọi điện Telesale. Hệ thống sẽ có kịch bản gọi gợi ý bên cạnh. Cập nhật trạng thái Lead (Từ <em>Mới</em> sang <em>Đã hẹn thử</em>).
              </li>
              <li>
                <strong>Sử dụng AI:</strong> Khi chat với khách hàng, AI chỉ tạo nháp/gợi ý dựa trên dữ liệu đã có. Nhân sự phải đọc lại, chỉnh sửa và đi qua quy trình duyệt trước khi gửi thật.
              </li>
            </ul>
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-amber-800 text-sm mt-4">
              <strong>Lưu ý quan trọng:</strong> Nếu khách hàng hỏi về điểm số hoặc chuyên môn mà Sale không nắm được, hãy chuyển giao hội thoại sang cho Giáo vụ. Không tự ý trả lời sai thông tin chuyên môn.
            </div>
          </div>
        </section>

        {/* Section 4: Học vụ & Giáo viên */}
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Hướng dẫn dành cho Giáo viên & Học vụ</h2>
              <p className="text-sm text-slate-500">Quản lý lớp, chất lượng đào tạo và báo cáo.</p>
            </div>
          </div>
          <div className="space-y-4 text-slate-600 dark:text-slate-300">
            <h3 className="font-semibold text-slate-800">Quy trình làm việc hàng ngày:</h3>
            <ul className="list-disc pl-5 space-y-3">
              <li>
                <strong>Điểm danh & Nhận xét:</strong> Sau mỗi buổi học, vào module <code>Điểm danh</code>. Đánh dấu vắng mặt/có mặt. EduOS tạo nháp báo cáo để giáo viên/học vụ duyệt; bản pilot chưa tự gửi tin thật ra Zalo phụ huynh.
              </li>
              <li>
                <strong>Bài tập (AI hỗ trợ):</strong> Chụp ảnh bài làm của học sinh tải lên mục <code>Bài tập & AI Chấm nháp</code>. AI OCR sẽ quét lỗi sai và tạo bảng điểm nháp. Giáo viên chỉ cần duyệt lại thay vì chấm từ con số 0.
              </li>
              <li>
                <strong>Nhóm lớp Zalo:</strong> Theo dõi trạng thái nhóm lớp từ máy tính. Thông báo chung chỉ được chuẩn bị dưới dạng nháp/duyệt trước cho tới khi kết nối thật được duyệt mở.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 5: Các gói dịch vụ AI */}
        <section className="bg-fuchsia-50 dark:bg-fuchsia-950/20 border border-fuchsia-200 dark:border-fuchsia-900/50 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 border-b border-fuchsia-100 pb-4">
            <div className="w-12 h-12 rounded-xl bg-fuchsia-100 text-fuchsia-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-fuchsia-900 dark:text-fuchsia-300">Thông tin các Gói dịch vụ AI (AI Addons)</h2>
              <p className="text-sm text-fuchsia-700">EduOS cung cấp 9 Agent AI riêng biệt. Giám đốc có thể bật/tắt (A-la-carte) từng tính năng để tối ưu chi phí.</p>
            </div>
          </div>
          <div className="space-y-4 text-fuchsia-900 dark:text-fuchsia-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-white/60 dark:bg-white/5 p-4 rounded-xl border border-fuchsia-100 dark:border-white/10">
                <h4 className="font-bold mb-1">1. AI Nhắc lịch học</h4>
                <p className="text-sm opacity-80">Tạo nháp nhắc phụ huynh/học viên trước giờ học, chờ duyệt trước khi gửi thật.</p>
              </div>
              <div className="bg-white/60 dark:bg-white/5 p-4 rounded-xl border border-fuchsia-100 dark:border-white/10">
                <h4 className="font-bold mb-1">2. AI Điểm danh Zalo</h4>
                <p className="text-sm opacity-80">Hỗ trợ đọc tín hiệu điểm danh trong nhóm lớp khi kết nối đã được cấu hình an toàn.</p>
              </div>
              <div className="bg-white/60 dark:bg-white/5 p-4 rounded-xl border border-fuchsia-100 dark:border-white/10">
                <h4 className="font-bold mb-1">3. AI Nhắc giáo viên</h4>
                <p className="text-sm opacity-80">Tạo nhắc việc nội bộ cho giáo viên sau buổi học.</p>
              </div>
              <div className="bg-white/60 dark:bg-white/5 p-4 rounded-xl border border-fuchsia-100 dark:border-white/10">
                <h4 className="font-bold mb-1">4. AI Chấm bài & Khen thưởng</h4>
                <p className="text-sm opacity-80">Tạo bản chấm nháp, giáo viên duyệt trước khi lưu kết quả hoặc gửi thông báo.</p>
              </div>
              <div className="bg-white/60 dark:bg-white/5 p-4 rounded-xl border border-fuchsia-100 dark:border-white/10">
                <h4 className="font-bold mb-1">5. AI Tư vấn Fanpage</h4>
                <p className="text-sm opacity-80">Gợi ý câu trả lời và chuyển lead đủ thông tin cho Telesale xử lý.</p>
              </div>
              <div className="bg-white/60 dark:bg-white/5 p-4 rounded-xl border border-fuchsia-100 dark:border-white/10">
                <h4 className="font-bold mb-1">6. AI Nhắc tái phí Zalo</h4>
                <p className="text-sm opacity-80">Lọc học sinh sắp hết số buổi và tạo nháp chăm sóc tái phí.</p>
              </div>
              <div className="bg-white/60 dark:bg-white/5 p-4 rounded-xl border border-fuchsia-100 dark:border-white/10">
                <h4 className="font-bold mb-1">7. AI Chấm điểm Telesale</h4>
                <p className="text-sm opacity-80">Ghi nhận kết quả cuộc gọi và hỗ trợ đánh giá chất lượng tư vấn khi có dữ liệu hợp lệ.</p>
              </div>
              <div className="bg-white/60 dark:bg-white/5 p-4 rounded-xl border border-fuchsia-100 dark:border-white/10">
                <h4 className="font-bold mb-1">8. AI Phân tích Cảm xúc</h4>
                <p className="text-sm opacity-80">Phân tích hội thoại đã đồng bộ và cảnh báo khi có tín hiệu phàn nàn/rủi ro.</p>
              </div>
              <div className="bg-white/60 dark:bg-white/5 p-4 rounded-xl border border-fuchsia-100 dark:border-white/10 md:col-span-2">
                <h4 className="font-bold mb-1">9. AI Trợ lý CEO</h4>
                <p className="text-sm opacity-80">Trợ lý phân tích số liệu tài chính, tuyển sinh và gợi ý việc cần kiểm tra tiếp theo.</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </PageShell>
  );
}
