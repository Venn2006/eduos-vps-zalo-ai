import React from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { prisma } from '@eduos/db';

export default async function ZaloGroupsPage() {
  // Fetch groups
  const groups = await prisma.zaloGroup.findMany({
    include: {
      class: {
        include: {
          automationSetting: true,
        }
      }
    }
  });

  return (
    <PageShell 
      title="Zalo Groups" 
      description="Quản lý các nhóm Zalo lớp học"
    >
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Danh sách nhóm Zalo (Zalo VPS Connector)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-3">Tên nhóm</th>
                <th className="p-3">Loại</th>
                <th className="p-3">Lớp liên kết</th>
                <th className="p-3">Trạng thái Automation</th>
                <th className="p-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {groups.map(g => (
                <tr key={g.id} className="border-b">
                  <td className="p-3 font-medium">{g.name}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-gray-100 rounded text-sm">{g.groupType}</span>
                  </td>
                  <td className="p-3">
                    {g.class ? (
                      <span className="text-blue-600 font-semibold">{g.class.classCode}</span>
                    ) : (
                      <span className="text-gray-400 italic">Chưa liên kết</span>
                    )}
                  </td>
                  <td className="p-3">
                    {g.class?.automationSetting ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Đã kích hoạt
                      </span>
                    ) : (
                      <span className="text-gray-400">---</span>
                    )}
                  </td>
                  <td className="p-3">
                    <button className="text-blue-500 hover:underline mr-3">Copy Setup Cmd</button>
                    <button className="text-blue-500 hover:underline">Lịch sử</button>
                  </td>
                </tr>
              ))}
              {groups.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-3 text-center text-gray-500">Chưa có nhóm nào. Vui lòng thêm Zalo Assistant vào nhóm.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}

