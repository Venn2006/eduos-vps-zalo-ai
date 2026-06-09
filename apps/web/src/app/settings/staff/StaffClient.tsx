"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Users, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

type StaffRole = 'ADMIN' | 'SALE' | 'TEACHER' | 'ACCOUNTANT';

type StaffMember = {
  id: string;
  role: StaffRole | string;
  status: string;
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
  } | null;
};

export function StaffClient({ initialMembers }: { initialMembers: StaffMember[] }) {
  const [members, setMembers] = useState<StaffMember[]>(initialMembers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'TEACHER' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/settings/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const newMember = await res.json() as StaffMember;
        setMembers([...members, newMember]);
        setIsModalOpen(false);
        toast.success('Thêm nhân viên thành công');
        setFormData({ name: '', email: '', password: '', role: 'TEACHER' });
      } else {
        const err = await res.json().catch(() => null) as { error?: string } | null;
        toast.error(err?.error || 'Lỗi khi thêm nhân sự');
      }
    } catch {
      toast.error('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Quản lý Nhân sự</h2>
        <div className="flex gap-2">
          <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50" onClick={() => window.location.href='/settings/permissions'}>
            Tuỳ chỉnh Phân quyền
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" /> Thêm nhân viên
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Họ và tên</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Vai trò (Role)</th>
                <th className="px-6 py-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map(member => (
                <tr key={member.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-800">{getStaffDisplayName(member)}</td>
                  <td className="px-6 py-4 text-slate-600">{member.user?.email || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-xs font-semibold">
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${member.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                      {member.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" /> Thêm nhân viên mới
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên</label>
                <input
                  type="text" required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email đăng nhập</label>
                <input
                  type="email" required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu tạm</label>
                <input
                  type="text" required minLength={6}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phân quyền</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as StaffRole})}
                >
                  <option value="TEACHER">Giáo viên (Teacher)</option>
                  <option value="SALE">Nhân viên Sales (Sale)</option>
                  <option value="ACCOUNTANT">Kế toán (Accountant)</option>
                  <option value="ADMIN">Quản trị viên (Admin)</option>
                </select>
              </div>
              <div className="pt-4">
                <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
                  {loading ? 'Đang lưu...' : 'Thêm nhân sự'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function getStaffDisplayName(member: StaffMember) {
  if (member.user?.name?.trim()) return member.user.name;
  const localPart = member.user?.email?.split('@')[0]?.trim();
  if (!localPart) return 'Chưa có tên';

  return localPart
    .replace(/[-_.]+/g, ' ')
    .replace(/\d+/g, (digits) => ` ${digits}`)
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
