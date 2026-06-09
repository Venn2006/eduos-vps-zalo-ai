"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, UserPlus, Phone, ShieldAlert, GraduationCap, AlertTriangle, ShieldCheck } from 'lucide-react';

interface StudentListClientProps {
  initialStudents: StudentListItem[];
}

interface StudentListItem {
  id: string;
  name: string;
  phone?: string | null;
  guardianName: string;
  guardianPhone: string;
  enrolledClasses: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskReason: string;
}

export default function StudentListClient({ initialStudents }: StudentListClientProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = initialStudents.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone?.includes(searchTerm) ||
    s.guardianPhone?.includes(searchTerm)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hồ sơ học viên</h1>
          <p className="text-slate-500 text-sm mt-1">Quản lý danh sách học viên và theo dõi nguy cơ nghỉ học.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm tên hoặc số điện thoại học viên/phụ huynh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-80 transition-shadow"
            />
          </div>
          <Link href="/leads" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm">
            <UserPlus className="w-4 h-4" />
            Thêm từ khách tiềm năng
          </Link>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider font-bold text-slate-500">
                <th className="py-4 px-6">Học viên</th>
                <th className="py-4 px-6">Lớp đang học</th>
                <th className="py-4 px-6">Phụ huynh</th>
                <th className="py-4 px-6">Nguy cơ nghỉ học</th>
                <th className="py-4 px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">Không tìm thấy học viên nào.</td>
                </tr>
              ) : filteredStudents.map(student => (
                <tr key={student.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <Link href={`/students/${student.id}`} className="font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                          {student.name}
                        </Link>
                        {student.phone && <div className="text-slate-500 text-xs mt-0.5">{student.phone}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <GraduationCap className="w-4 h-4 text-slate-400" />
                      {student.enrolledClasses}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-slate-800">{student.guardianName}</div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5">
                      <Phone className="w-3 h-3" /> {student.guardianPhone}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {student.riskLevel === 'HIGH' && (
                      <div className="inline-flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                          <AlertTriangle className="w-3.5 h-3.5" /> Cao
                        </span>
                        <span className="text-[11px] text-slate-500 w-48 truncate" title={student.riskReason}>{student.riskReason}</span>
                      </div>
                    )}
                    {student.riskLevel === 'MEDIUM' && (
                      <div className="inline-flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                          <ShieldAlert className="w-3.5 h-3.5" /> Trung bình
                        </span>
                        <span className="text-[11px] text-slate-500 w-48 truncate" title={student.riskReason}>{student.riskReason}</span>
                      </div>
                    )}
                    {student.riskLevel === 'LOW' && (
                      <div className="inline-flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                          <ShieldCheck className="w-3.5 h-3.5" /> Thấp
                        </span>
                        <span className="text-[11px] text-slate-500 w-48 truncate" title={student.riskReason}>{student.riskReason}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link href={`/students/${student.id}`} className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm">
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
