import { ForbiddenRoleMessage } from '@/components/auth/ForbiddenRoleMessage';
import { canAccessRoute } from '@/lib/rbac';
import React from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getSession } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  MessageCircle, Users, AlertTriangle, Briefcase, Bot, 
  Smartphone, Monitor, UsersRound, Phone, Activity, 
  UserCheck, ExternalLink
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export default async function CrmCommandCenterPage() {
  const authSession = await getSession();
  if (!canAccessRoute(authSession?.role, "/crm-command-center")) {
    return <ForbiddenRoleMessage role={authSession?.role} />;
  }

  // MOCK DATA for Phase 52 Demo
  const staffAccounts = [
    { name: 'Nguyễn Văn A', role: 'Tư vấn', status: 'ONLINE', convs: 45, unanswered: 3, leads: 120, lastActive: 'Vừa xong' },
    { name: 'Trần Thị B', role: 'Tư vấn', status: 'ONLINE', convs: 32, unanswered: 0, leads: 85, lastActive: '5 phút trước' },
    { name: 'Lê Văn C', role: 'Giáo viên', status: 'OFFLINE', convs: 15, unanswered: 0, leads: 0, lastActive: '2 giờ trước' },
    { name: 'Phạm Thị D', role: 'Giáo viên', status: 'ONLINE', convs: 28, unanswered: 5, leads: 0, lastActive: '12 phút trước' },
    { name: 'Hoàng Văn E', role: 'Admin', status: 'NEEDS_RELOGIN', convs: 0, unanswered: 0, leads: 0, lastActive: '1 ngày trước' },
    { name: 'Vũ Thị F', role: 'Tư vấn', status: 'ONLINE', convs: 50, unanswered: 12, leads: 150, lastActive: 'Vừa xong' },
    { name: 'Đặng Văn G', role: 'Giáo viên', status: 'ONLINE', convs: 10, unanswered: 1, leads: 0, lastActive: '1 giờ trước' },
    { name: 'Bùi Thị H', role: 'Tư vấn', status: 'OFFLINE', convs: 5, unanswered: 0, leads: 20, lastActive: 'Hôm qua' },
    { name: 'Đỗ Văn I', role: 'Giáo viên', status: 'ONLINE', convs: 22, unanswered: 0, leads: 0, lastActive: 'Vừa xong' },
    { name: 'Ngô Thị K', role: 'Admin', status: 'ONLINE', convs: 18, unanswered: 2, leads: 0, lastActive: '30 phút trước' }
  ];

  const classGroups = [
    { name: 'HSK1-A06 (Tối 2-4-6)', botStatus: 'ACTIVE', members: 15, lastActivity: '10:30', attendance: 'Đã điểm danh', homework: '5/15 nộp' },
    { name: 'IELTS-B02 (Sáng 3-5-7)', botStatus: 'ACTIVE', members: 12, lastActivity: 'Hôm qua', attendance: 'Chưa học', homework: '0/12 nộp' },
    { name: 'KIDS-STARTER-1', botStatus: 'INACTIVE', members: 20, lastActivity: '2 ngày trước', attendance: '-', homework: '-' }
  ];

  return (
    <div className="space-y-6 pb-10">
      <SectionHeader 
        title="Tin nhắn & CRM Command Center" 
        description="Quản lý Fanpage, Zalo OA, Zalo cá nhân, Zalo nhân viên và nhóm lớp trong một nơi."
        action={<Button><ExternalLink className="w-4 h-4 mr-2" /> Tích hợp kênh mới</Button>}
      />

      {/* Tổng quan hôm nay */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-blue-200 bg-blue-50/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm font-medium">Tin nhắn mới</span>
              <MessageCircle className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-slate-800 mt-2">128</div>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm font-medium">Lead mới</span>
              <Users className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-slate-800 mt-2">15</div>
          </CardContent>
        </Card>
        <Card className="border-rose-200 bg-rose-50/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm font-medium">Chưa phản hồi</span>
              <Activity className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-bold text-slate-800 mt-2">23</div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm font-medium">Phàn nàn</span>
              <AlertTriangle className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-slate-800 mt-2">2</div>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm font-medium">Cần giao việc</span>
              <Briefcase className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-slate-800 mt-2">8</div>
          </CardContent>
        </Card>
        <Card className="border-indigo-200 bg-indigo-50/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm font-medium">AI đã xử lý</span>
              <Bot className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold text-slate-800 mt-2">45</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: Kênh và Hotline */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="bg-slate-50 border-b pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Monitor className="w-5 h-5 text-primary" /> Kênh đang kết nối
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y">
              <div className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Monitor className="w-4 h-4"/></div>
                  <div><p className="font-semibold text-sm">Fanpage Trung Tâm</p></div>
                </div>
                <Badge className="bg-success">Kết nối</Badge>
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Smartphone className="w-4 h-4"/></div>
                  <div><p className="font-semibold text-sm">Zalo OA</p></div>
                </div>
                <Badge className="bg-success">Kết nối</Badge>
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600"><UsersRound className="w-4 h-4"/></div>
                  <div><p className="font-semibold text-sm">Nhóm Zalo Lớp</p></div>
                </div>
                <span className="text-sm font-bold text-slate-700">8 Nhóm</span>
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600"><UserCheck className="w-4 h-4"/></div>
                  <div><p className="font-semibold text-sm">Zalo Cá Nhân (Nhân viên)</p></div>
                </div>
                <span className="text-sm font-bold text-slate-700">10 Tài khoản</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-blue-200">
            <CardHeader className="bg-blue-50 border-b border-blue-100 pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                <Phone className="w-5 h-5" /> Zalo Hotline Trung Tâm
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Người quản lý:</span>
                <span className="font-medium">Hoàng Văn E (Admin)</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Quyền trả lời:</span>
                <span className="font-medium">Tất cả Tư vấn viên</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Hội thoại chờ:</span>
                <span className="font-bold text-danger">5</span>
              </div>
              <div className="pt-2 flex gap-2">
                <Button variant="outline" className="flex-1 text-xs">Phân quyền</Button>
                <Button className="flex-1 text-xs bg-blue-600">Mở hộp thư</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cột phải: Tài khoản nhân viên & Nhóm lớp */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="bg-slate-50 border-b pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" /> Tài khoản Zalo Nhân viên
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-primary text-xs">Xem báo cáo chi tiết</Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/50 text-slate-500 border-b">
                    <tr>
                      <th className="px-4 py-3 font-medium">Nhân viên</th>
                      <th className="px-4 py-3 font-medium">Trạng thái Zalo</th>
                      <th className="px-4 py-3 font-medium text-center">Hội thoại</th>
                      <th className="px-4 py-3 font-medium text-center">Chưa trả lời</th>
                      <th className="px-4 py-3 font-medium text-center">Leads</th>
                      <th className="px-4 py-3 font-medium">Hoạt động</th>
                      <th className="px-4 py-3 font-medium text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {staffAccounts.map((staff, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800">{staff.name}</p>
                          <p className="text-[10px] text-slate-500">{staff.role}</p>
                        </td>
                        <td className="px-4 py-3">
                          {staff.status === 'ONLINE' ? (
                            <Badge variant="outline" className="text-success border-success bg-success/5 text-[10px]">Đang kết nối</Badge>
                          ) : staff.status === 'NEEDS_RELOGIN' ? (
                            <Badge variant="outline" className="text-danger border-danger bg-danger/5 text-[10px]">Cần quét QR</Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-500 text-[10px]">Mất kết nối</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center font-medium">{staff.convs}</td>
                        <td className="px-4 py-3 text-center">
                          {staff.unanswered > 0 ? (
                            <span className="font-bold text-danger">{staff.unanswered}</span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center font-medium">{staff.leads}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{staff.lastActive}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2 text-primary">Xem inbox</Button>
                            <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2 text-slate-500">Giao việc</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="bg-slate-50 border-b pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <UsersRound className="w-5 h-5 text-indigo-500" /> Quản lý Nhóm Zalo Lớp
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/50 text-slate-500 border-b">
                    <tr>
                      <th className="px-4 py-3 font-medium">Tên lớp</th>
                      <th className="px-4 py-3 font-medium">Bot Trợ giảng</th>
                      <th className="px-4 py-3 font-medium text-center">Thành viên</th>
                      <th className="px-4 py-3 font-medium text-center">Điểm danh</th>
                      <th className="px-4 py-3 font-medium text-center">Bài tập</th>
                      <th className="px-4 py-3 font-medium text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {classGroups.map((group, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-800">{group.name}</td>
                        <td className="px-4 py-3">
                          {group.botStatus === 'ACTIVE' ? (
                            <span className="flex items-center text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded w-fit">
                              <Bot className="w-3 h-3 mr-1" /> ACTIVE
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">CHƯA BẬT</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">{group.members}</td>
                        <td className="px-4 py-3 text-center text-xs">{group.attendance}</td>
                        <td className="px-4 py-3 text-center text-xs">{group.homework}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2 text-slate-600">Mô phỏng mở nhóm</Button>
                            <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2 text-primary">Xem việc lớp</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
