"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Calendar, Download, Filter, MessageSquare, Phone, Search, Tag, User } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export type ContactRole = 'STUDENT' | 'GUARDIAN' | 'LEAD' | 'TEACHER';

export type ContactRow = {
  id: string;
  name: string;
  phone: string;
  role: ContactRole;
  linkedEntity: string;
  labels: string[];
  lastInteraction: string;
  lastInteractionMs: number;
  assignedStaff: string;
  source: string;
  href: string;
};

const roleConfig: Record<ContactRole, { label: string; bg: string; text: string; dot: string }> = {
  STUDENT: { label: 'Học viên', bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  GUARDIAN: { label: 'Phụ huynh', bg: 'bg-teal-100', text: 'text-teal-700', dot: 'bg-teal-500' },
  LEAD: { label: 'Khách tiềm năng', bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', dot: 'bg-fuchsia-500' },
  TEACHER: { label: 'Giáo viên', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
};

function csvCell(value: unknown) {
  const text = value == null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function ContactsClient({ contacts, initialQuery = '' }: { contacts: ContactRow[]; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [role, setRole] = useState<ContactRole | 'ALL'>('ALL');

  const filteredContacts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return contacts.filter((contact) => {
      const roleMatch = role === 'ALL' || contact.role === role;
      const textMatch = !normalizedQuery || [
        contact.name,
        contact.phone,
        contact.linkedEntity,
        contact.source,
        contact.assignedStaff,
        ...contact.labels,
      ].join(' ').toLowerCase().includes(normalizedQuery);

      return roleMatch && textMatch;
    });
  }, [contacts, query, role]);

  const exportCsv = () => {
    const rows = [
      ['name', 'phone', 'role', 'linkedEntity', 'labels', 'lastInteraction', 'assignedStaff', 'source'],
      ...filteredContacts.map((contact) => [
        contact.name,
        contact.phone,
        contact.role,
        contact.linkedEntity,
        contact.labels.join('; '),
        contact.lastInteraction,
        contact.assignedStaff,
        contact.source,
      ]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'contacts-export.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="flex flex-1 flex-col shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo tên, SĐT, lớp, nhãn..."
            className="w-full rounded-md border border-slate-200 py-2 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600">
            <Filter className="h-4 w-4 text-slate-500" />
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as ContactRole | 'ALL')}
              className="bg-transparent outline-none"
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="LEAD">Khách</option>
              <option value="STUDENT">Học viên</option>
              <option value="GUARDIAN">Phụ huynh</option>
              <option value="TEACHER">Giáo viên</option>
            </select>
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Download className="h-4 w-4" /> Xuất CSV
          </button>
          <Badge className="rounded-md bg-slate-100 px-3 py-2 text-slate-700">
            <Tag className="mr-2 h-4 w-4" /> {filteredContacts.length}/{contacts.length}
          </Badge>
        </div>
      </div>

      <CardContent className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-slate-50/80 font-medium text-slate-500">
            <tr>
              <th className="rounded-tl-xl px-6 py-4">Liên hệ</th>
              <th className="px-6 py-4">Vai trò</th>
              <th className="px-6 py-4">Liên kết</th>
              <th className="px-6 py-4">Nhãn</th>
              <th className="px-6 py-4">Tương tác cuối</th>
              <th className="px-6 py-4 text-center">Nguồn</th>
              <th className="rounded-tr-xl px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm font-medium text-slate-500">
                  Không có liên hệ phù hợp bộ lọc.
                </td>
              </tr>
            ) : (
              filteredContacts.map((contact) => {
                const roleData = roleConfig[contact.role];
                return (
                  <tr key={contact.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn('flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm', roleData.dot)}>
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{contact.name}</p>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                            <Phone className="h-3 w-3" /> {contact.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('rounded-md px-2.5 py-1 text-xs font-bold', roleData.bg, roleData.text)}>
                        {roleData.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-700">{contact.linkedEntity}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex max-w-[240px] flex-wrap gap-1.5">
                        {contact.labels.map((label) => (
                          <span key={label} className="whitespace-nowrap rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                            {label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-xs">{contact.lastInteraction}</span>
                      </div>
                      <p className="mt-0.5 text-[10px] text-slate-400">Phụ trách: {contact.assignedStaff}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
                        {contact.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href="/team-inbox" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-primary/5 hover:text-primary" title="Mở hộp thư đội nhóm">
                          <MessageSquare className="h-4 w-4" />
                        </Link>
                        <Link href={contact.href} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900" title="Mở hồ sơ liên quan">
                          <User className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
