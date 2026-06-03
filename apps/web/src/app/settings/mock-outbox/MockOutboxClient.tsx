'use client';

import React, { useState } from 'react';
import { ShieldAlert, Play, XCircle, CheckCircle, Clock, Server } from 'lucide-react';
import { 
  MockOutboxItem, 
  transitionMockOutbox, 
  getVietnameseMockStatusLabel,
  getSafeMockSummary
} from '@eduos/shared/src/lib/mockOutbox';
import { previewSandboxSendReadiness, PreviewSandboxSendReadinessResult } from './actions';

export default function MockOutboxClient() {
  const [isRunningCheck, setIsRunningCheck] = useState(false);
  const [previewResult, setPreviewResult] = useState<PreviewSandboxSendReadinessResult | null>(null);

  const runServerCheck = async () => {
    setIsRunningCheck(true);
    try {
      const res = await previewSandboxSendReadiness({
        content: "Hello from sandbox test"
      });
      setPreviewResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunningCheck(false);
    }
  };

  const [items, setItems] = useState<MockOutboxItem[]>([
    {
      id: 'mock-1',
      tenantId: 't-1',
      channel: 'ZALO',
      draftId: 'd-1',
      recipientId: 'r-1',
      content: 'Tin nhắn thử nghiệm 1 [BẢO MẬT]',
      status: 'MOCK_READY',
      idempotencyKey: 'mock_outbox_t-1_ZALO_d-1_r-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  const handleTransition = (id: string, action: Parameters<typeof transitionMockOutbox>[1]) => {
    setItems(current => current.map(item => {
      if (item.id === id) {
        const result = transitionMockOutbox(item, action);
        if (result.success && result.item) {
          return result.item;
        } else {
          alert(`Lỗi: ${result.error}`);
        }
      }
      return item;
    }));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
        <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
        <div>
          <h1 className="text-lg font-bold">Hàng đợi gửi giả lập</h1>
          <p className="text-sm mt-1">Kiểm tra quy trình gửi trong sandbox. Hệ thống chưa gửi thật tới Zalo/Facebook. (Chế độ giả lập, Không gọi connector)</p>
          <p className="text-sm mt-1 italic font-medium text-amber-900">Persisted sandbox outbox is planned but not implemented yet.</p>
        </div>
      </div>

      <div className="mb-6 bg-slate-50 border border-slate-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <ShieldAlert className="w-5 h-5 text-indigo-500" />
          <h2 className="text-md font-bold text-slate-800">Kiểm tra điều kiện gửi thật</h2>
        </div>
        <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1 mb-4">
          <li>Chưa bật gửi thật</li>
          <li>Phase 43 chỉ kiểm tra hợp đồng an toàn</li>
          <li>Không gọi connector</li>
          <li>Không gửi tới Zalo/Facebook</li>
        </ul>
      </div>

      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <Server className="w-5 h-5 text-blue-600" />
          <h2 className="text-md font-bold text-slate-800">Kiểm tra server sandbox</h2>
        </div>
        <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1 mb-4">
          <li>Chạy kiểm tra an toàn phía server</li>
          <li>Không gọi connector</li>
          <li>Không gửi tới Zalo/Facebook</li>
          <li>Không tạo MESSAGE_SENT</li>
          <li>Kết quả chỉ là bản xem trước</li>
        </ul>
        <button 
          onClick={runServerCheck}
          disabled={isRunningCheck}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium text-sm disabled:opacity-50"
        >
          {isRunningCheck ? "Đang kiểm tra..." : "Chạy kiểm tra sandbox"}
        </button>

        {previewResult && (
          <div className="mt-4 p-4 bg-white border border-blue-100 rounded text-sm">
            <div className="font-bold text-slate-800 mb-2">Kết quả: {previewResult.uiLabel}</div>
            <div className="text-slate-600 mb-2">{previewResult.uiDescription}</div>
            <div className="mb-1"><span className="font-semibold">Trạng thái:</span> {previewResult.readinessStatus}</div>
            <div className="mb-1"><span className="font-semibold">canSendRealNow:</span> {previewResult.canSendRealNow ? 'true' : 'false'} (Chưa bật gửi thật)</div>
            
            {previewResult.reasons.length > 0 && (
              <div className="mt-2 text-red-600">
                <span className="font-semibold">Lý do chặn:</span>
                <ul className="list-disc pl-5 mt-1">
                  {previewResult.reasons.map((r: string, i: number) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
            
            {previewResult.auditPreviewMetadata && (
              <div className="mt-4 p-3 bg-slate-50 rounded border border-slate-200">
                <div className="font-semibold text-slate-700 mb-2">Bản xem trước Audit (Không lưu DB)</div>
                <pre className="whitespace-pre-wrap text-xs text-slate-600 overflow-x-auto">
                  {JSON.stringify(previewResult.auditPreviewMetadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-slate-800 text-sm">{item.idempotencyKey}</span>
                <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                  {getVietnameseMockStatusLabel(item.status)}
                </span>
              </div>
              <p className="text-sm text-slate-600">{getSafeMockSummary(item.content)}</p>
            </div>
            
            <div className="flex gap-2">
              {item.status === 'MOCK_READY' && (
                <button onClick={() => handleTransition(item.id, 'QUEUE')} className="flex items-center px-3 py-1.5 text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 rounded">
                  <Clock className="w-4 h-4 mr-1.5" /> Đưa vào hàng đợi giả lập
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
