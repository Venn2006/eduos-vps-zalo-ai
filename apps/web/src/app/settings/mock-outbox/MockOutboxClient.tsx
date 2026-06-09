'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ShieldAlert, Play, XCircle, CheckCircle, Clock, Server, Database } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getVietnameseMockStatusLabel,
  getSafeMockSummary,
  MockOutboxStatus,
} from '@eduos/shared/src/lib/mockOutbox';
import { 
  previewSandboxSendReadiness, 
  PreviewSandboxSendReadinessResult,
  createSandboxOutboxItem,
  listSandboxOutboxItems,
  transitionSandboxOutboxItem
} from './actions';

type SandboxOutboxListItem = {
  id: string;
  idempotencyKey: string;
  status: MockOutboxStatus;
  messageSafeSummary: string;
  content?: string;
};

const mockOutboxStatuses: MockOutboxStatus[] = [
  'MOCK_READY',
  'MOCK_QUEUED',
  'MOCK_SENDING',
  'MOCK_SENT',
  'MOCK_FAILED',
  'MOCK_CANCELLED',
];

function toSandboxOutboxListItem(item: {
  id: string;
  idempotencyKey: string;
  status: string;
  messageSafeSummary: string;
}): SandboxOutboxListItem {
  return {
    id: item.id,
    idempotencyKey: item.idempotencyKey,
    status: mockOutboxStatuses.includes(item.status as MockOutboxStatus) ? item.status as MockOutboxStatus : 'MOCK_FAILED',
    messageSafeSummary: item.messageSafeSummary,
  };
}

export default function MockOutboxClient() {
  const [isRunningCheck, setIsRunningCheck] = useState(false);
  const [previewResult, setPreviewResult] = useState<PreviewSandboxSendReadinessResult | null>(null);
  
  const [items, setItems] = useState<SandboxOutboxListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await listSandboxOutboxItems();
      setItems((res.items || []).map(toSandboxOutboxListItem));
    } catch (err) {
      console.error(err);
      toast.error('Không tải được hàng chờ duyệt');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadItems();
    });
  }, [loadItems]);

  const handleCreate = async () => {
    try {
      const res = await createSandboxOutboxItem({
        content: "Tin nhắn thử nghiệm [BẢO MẬT]",
        channel: "ZALO"
      });
      if (res.success && 'item' in res && res.item) {
        setItems(current => [toSandboxOutboxListItem(res.item), ...current]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Không tạo được nháp chờ duyệt');
    }
  };

  const runServerCheck = async () => {
    setIsRunningCheck(true);
    try {
      const res = await previewSandboxSendReadiness({
        content: "Hello from duyệt trước test"
      });
      setPreviewResult(res);
    } catch (err) {
      console.error(err);
      toast.error('Không chạy được kiểm tra duyệt trước');
    } finally {
      setIsRunningCheck(false);
    }
  };

  const handleTransition = async (id: string, action: string) => {
    try {
      const res = await transitionSandboxOutboxItem(id, action);
      if (res.success && 'item' in res && res.item) {
        setItems(current => current.map(item => item.id === id ? toSandboxOutboxListItem(res.item) : item));
      } else if ('error' in res) {
        toast.error(`Lỗi: ${res.error}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Không cập nhật được trạng thái nháp chờ duyệt');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
        <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
        <div>
          <h1 className="text-lg font-bold">Hàng đợi gửi giả lập</h1>
          <p className="text-sm mt-1">Kiểm tra quy trình gửi trong duyệt trước. Hệ thống chưa gửi thật tới Zalo/Facebook. (Chế độ giả lập, Không gọi kết nối)</p>
          <p className="text-sm mt-1 font-medium">Không tạo bản ghi đã gửi, Không gọi kết nối.</p>
        </div>
      </div>

      <div className="mb-6 bg-slate-50 border border-slate-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <ShieldAlert className="w-5 h-5 text-indigo-500" />
          <h2 className="text-md font-bold text-slate-800">Kiểm tra điều kiện gửi thật</h2>
        </div>
        <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1 mb-4">
          <li>Chưa bật gửi thật</li>
          <li>Chỉ kiểm tra hợp đồng an toàn</li>
          <li>Không gọi kết nối</li>
          <li>Không gửi tới Zalo/Facebook</li>
        </ul>
      </div>

      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <Server className="w-5 h-5 text-blue-600" />
          <h2 className="text-md font-bold text-slate-800">Kiểm tra server duyệt trước</h2>
        </div>
        <button 
          onClick={runServerCheck}
          disabled={isRunningCheck}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium text-sm disabled:opacity-50"
        >
          {isRunningCheck ? "Đang kiểm tra..." : "Chạy kiểm tra duyệt trước"}
        </button>

        {previewResult && (
          <div className="mt-4 p-4 bg-white border border-blue-100 rounded text-sm">
            <div className="font-bold text-slate-800 mb-2">Kết quả: {previewResult.uiLabel}</div>
            <div className="text-slate-600 mb-2">{previewResult.uiDescription}</div>
            <div className="mb-1"><span className="font-semibold">Trạng thái:</span> {previewResult.readinessStatus}</div>
            
            {previewResult.reasons.length > 0 && (
              <div className="mt-2 text-red-600">
                <span className="font-semibold">Lý do chặn:</span>
                <ul className="list-disc pl-5 mt-1">
                  {previewResult.reasons.map((r: string, i: number) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-800">Danh sách Danh sách nháp chờ duyệt</h2>
          <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-800 rounded font-semibold flex items-center gap-1">
            <Database className="w-3 h-3" /> Đã lưu thật
          </span>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded font-medium text-sm"
        >
          Tạo nháp chờ duyệt
        </button>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-slate-500 text-sm">Đang tải...</div>
        ) : items.length === 0 ? (
          <div className="text-slate-500 text-sm italic">Chưa có item nào.</div>
        ) : items.map(item => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-slate-800 text-sm">{item.idempotencyKey}</span>
                <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                  {getVietnameseMockStatusLabel(item.status)}
                </span>
              </div>
              <p className="text-sm text-slate-600">{getSafeMockSummary(item.messageSafeSummary || item.content || '')}</p>
              <p className="text-xs text-slate-400 mt-1">Chưa gửi thật • Không gọi kết nối • Không tạo bản ghi đã gửi</p>
            </div>
            
            <div className="flex gap-2">
              {item.status === 'MOCK_READY' && (
                <button onClick={() => handleTransition(item.id, 'QUEUE')} className="flex items-center px-3 py-1.5 text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 rounded">
                  <Clock className="w-4 h-4 mr-1.5" /> Xếp hàng giả lập
                </button>
              )}
              {item.status === 'MOCK_QUEUED' && (
                <button onClick={() => handleTransition(item.id, 'START_SEND')} className="flex items-center px-3 py-1.5 text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded">
                  <Play className="w-4 h-4 mr-1.5" /> Chạy gửi giả lập
                </button>
              )}
              {item.status === 'MOCK_SENDING' && (
                <>
                  <button onClick={() => handleTransition(item.id, 'COMPLETE_SEND')} className="flex items-center px-3 py-1.5 text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded">
                    <CheckCircle className="w-4 h-4 mr-1.5" /> Gửi giả lập thành công
                  </button>
                  <button onClick={() => handleTransition(item.id, 'FAIL_SEND')} className="flex items-center px-3 py-1.5 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded">
                    <XCircle className="w-4 h-4 mr-1.5" /> Đánh dấu lỗi giả lập
                  </button>
                </>
              )}
              {(item.status === 'MOCK_READY' || item.status === 'MOCK_QUEUED') && (
                <button onClick={() => handleTransition(item.id, 'CANCEL')} className="flex items-center px-3 py-1.5 text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 rounded">
                  <XCircle className="w-4 h-4 mr-1.5" /> Hủy giả lập
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
