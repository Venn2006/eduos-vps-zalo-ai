"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Building2, Mail, Lock, User, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    centerName: '',
    fullName: '',
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.centerName || !formData.fullName || !formData.email || !formData.password) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Đăng ký thành công! Đang chuyển hướng...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        toast.error(data.error || 'Đăng ký thất bại');
        setLoading(false);
      }
    } catch {
      toast.error('Lỗi kết nối máy chủ');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-900 overflow-hidden items-center justify-center p-12">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-600/30 rounded-full mix-blend-multiply filter blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-fuchsia-600/30 rounded-full mix-blend-multiply filter blur-3xl -translate-x-1/3 translate-y-1/3"></div>

        <div className="relative z-10 w-full max-w-lg text-white space-y-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center font-black text-purple-700 text-xl shadow-lg">
              E
            </div>
            <h1 className="text-4xl font-bold tracking-tight drop-shadow-md">Edu<span className="text-fuchsia-300">OS</span></h1>
          </div>

          <h2 className="text-4xl font-extrabold leading-tight">Quản lý trung tâm hiện đại với AI có kiểm soát</h2>
          <p className="text-xl text-indigo-200">
            Trải nghiệm CRM, học vụ, tài chính và AI gợi ý trong môi trường an toàn. Gửi tin thật chỉ mở sau khi cấu hình và duyệt readiness.
          </p>

          <ul className="space-y-4 pt-4">
            {['Khởi tạo trung tâm nhanh', 'CRM tích hợp Zalo & Fanpage theo duyệt trước', 'AI nháp câu trả lời để nhân sự duyệt', 'Hệ thống điểm danh & quản lý học phí'].map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-fuchsia-400 shrink-0" />
                <span className="text-lg text-indigo-100">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white relative">
        <div className="mx-auto w-full max-w-sm lg:max-w-md relative z-10">
          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Đăng ký tài khoản</h2>
            <p className="mt-2 text-base text-slate-600">Bắt đầu dùng thử có kiểm soát ngay hôm nay</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Tên Trung tâm</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="centerName"
                  value={formData.centerName}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors sm:text-sm"
                  placeholder="Ví dụ: Omlis English Center"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Họ và tên của bạn</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors sm:text-sm"
                  placeholder="Nguyễn Văn A"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Email quản trị</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors sm:text-sm"
                  placeholder="admin@omlis.test"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full py-6 text-base font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 shadow-lg shadow-purple-500/30 rounded-xl"
                disabled={loading}
              >
                {loading ? 'Đang khởi tạo...' : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" /> Tạo trung tâm ngay <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>

            <p className="text-center text-sm text-slate-600 pt-4">
              Đã có tài khoản? <Link href="/login" className="font-bold text-purple-600 hover:text-purple-500">Đăng nhập</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
