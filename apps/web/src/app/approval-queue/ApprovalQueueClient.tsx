'use client';

import React, { useState } from 'react';
import { User, MessageCircle, Bot, CheckCircle, XCircle, Clock, Edit2 } from 'lucide-react';
import { GuardrailPreviewCard } from '@/components/conversation/GuardrailPreviewCard';
import { checkMessageQuality } from '@eduos/shared/src/lib/messageQualityGuardrails';

// Mock data representing ZaloOutboxMessage / AiActionDraft for Phase 41
type DraftMessage = {
  id: string;
  targetName: string;
  targetChannel: string;
  contextSummary: string;
  draftContent: string;
  createdAt: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'CANCELLED';
  aiConfidence: number;
};

const MOCK_DRAFTS: DraftMessage[] = [
  {
    id: 'draft-1',
    targetName: 'Phụ huynh bé Tuấn Anh',
    targetChannel: 'Zalo Cá Nhân',
    contextSummary: 'Phụ huynh hỏi về lịch học bù ngày mai.',
    draftContent: 'Dạ chào anh/chị, lịch học bù của bé Tuấn Anh là 18:00 tối mai (Thứ 6). Anh/chị nhớ nhắc bé đi học đúng giờ nhé. Trung tâm cảm ơn ạ!',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    status: 'PENDING_APPROVAL',
    aiConfidence: 0.95,
  },
  {
    id: 'draft-2',
    targetName: 'Khách hàng Mai Hương',
    targetChannel: 'Fanpage Facebook',
    contextSummary: 'Hỏi học phí khoá Tiếng Anh Giao Tiếp.',
    draftContent: 'Dạ em chào chị Hương, học phí khoá Tiếng Anh Giao Tiếp hiện tại đang có ưu đãi giảm 20% chỉ còn 4.500.000đ/khóa 3 tháng. Chị có muốn đăng ký học thử 1 buổi miễn phí để trải nghiệm không ạ?',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    status: 'PENDING_APPROVAL',
    aiConfidence: 0.88,
  },
  {
    id: 'draft-3',
    targetName: 'Group Lớp K12-A1',
    targetChannel: 'Zalo Group',
    contextSummary: 'Thông báo đổi phòng học.',
    draftContent: 'Kính gửi quý phụ huynh, do sự cố kỹ thuật phòng học, buổi học hôm nay lớp K12-A1 sẽ chuyển sang phòng 204. Mong quý phụ huynh thông cảm!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    status: 'PENDING_APPROVAL',
    aiConfidence: 0.98,
  }
];

export function ApprovalQueueClient() {
  const [drafts, setDrafts] = useState<DraftMessage[]>(MOCK_DRAFTS);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(drafts[0]?.id || null);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  const activeDraft = drafts.find(d => d.id === activeDraftId);

  const pendingDrafts = drafts.filter(d => d.status === 'PENDING_APPROVAL');
  const processedDrafts = drafts.filter(d => d.status !== 'PENDING_APPROVAL');

  const handleSelect = (draft: DraftMessage) => {
    setActiveDraftId(draft.id);
    setEditMode(false);
  };

  const handleApprove = (id: string, content: string) => {
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, status: 'APPROVED', draftContent: content } : d));
    setEditMode(false);
    // Auto-select next pending draft
    const nextPending = drafts.find(d => d.id !== id && d.status === 'PENDING_APPROVAL');
    if (nextPending) setActiveDraftId(nextPending.id);
  };

  const handleReject = (id: string) => {
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, status: 'CANCELLED' } : d));
    setEditMode(false);
    // Auto-select next pending draft
    const nextPending = drafts.find(d => d.id !== id && d.status === 'PENDING_APPROVAL');
    if (nextPending) setActiveDraftId(nextPending.id);
  };

  const startEdit = () => {
    if (activeDraft) {
      setEditedContent(activeDraft.draftContent);
      setEditMode(true);
    }
  };

  return (
    <div className="flex h-[calc(100vh-180px)]">
      {/* Left Column: Queue List */}
      <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50 h-full">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h3 className="font-semibold text-slate-800">Nháp cần duyệt ({pendingDrafts.length})</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {pendingDrafts.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p>Không có tin nháp nào cần duyệt.</p>
            </div>
          )}
          {pendingDrafts.map(draft => (
            <div 
              key={draft.id}
              onClick={() => handleSelect(draft)}
              className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors ${activeDraftId === draft.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'bg-white'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-semibold text-slate-800 text-sm">{draft.targetName}</h4>
                <span className="text-xs text-slate-500">
                  {new Date(draft.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <p className="text-xs font-medium text-indigo-600 mb-1">{draft.targetChannel}</p>
              <p className="text-sm text-slate-600 line-clamp-2">{draft.draftContent}</p>
            </div>
          ))}

          {processedDrafts.length > 0 && (
            <>
              <div className="p-4 border-y border-slate-200 bg-slate-100 mt-4">
                <h3 className="font-semibold text-slate-700 text-sm">Đã xử lý ({processedDrafts.length})</h3>
              </div>
              {processedDrafts.map(draft => (
                <div 
                  key={draft.id}
                  onClick={() => handleSelect(draft)}
                  className={`p-4 border-b border-slate-100 cursor-pointer opacity-70 hover:opacity-100 transition-colors ${activeDraftId === draft.id ? 'bg-slate-100 border-l-4 border-l-slate-400' : 'bg-white'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-slate-800 text-sm line-through">{draft.targetName}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${draft.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {draft.status === 'APPROVED' ? 'Duyệt nháp để sử dụng thủ công' : 'Từ chối'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-1">{draft.draftContent}</p>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Right Column: Detail & Actions */}
      <div className="w-2/3 flex flex-col bg-white h-full relative">
        {activeDraft ? (
          <>
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-1">{activeDraft.targetName}</h2>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <span className="flex items-center"><MessageCircle className="w-4 h-4 mr-1 text-slate-400" /> {activeDraft.targetChannel}</span>
                  <span className="flex items-center"><Clock className="w-4 h-4 mr-1 text-slate-400" /> Tạo lúc: {new Date(activeDraft.createdAt).toLocaleString('vi-VN')}</span>
                </div>
              </div>
              <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded text-sm font-semibold flex items-center">
                <Bot className="w-4 h-4 mr-2" /> AI Draft
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Context */}
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Ngữ cảnh (Context)</h3>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-slate-700 text-sm">
                  {activeDraft.contextSummary}
                </div>
              </div>

              {/* Draft Content */}
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Nội dung dự thảo (Draft)</span>
                  {activeDraft.status === 'PENDING_APPROVAL' && !editMode && (
                    <button onClick={startEdit} className="text-indigo-600 hover:text-indigo-800 flex items-center text-xs normal-case">
                      <Edit2 className="w-3 h-3 mr-1" /> Chỉnh sửa
                    </button>
                  )}
                </h3>
                
                {editMode ? (
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full h-32 p-4 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800 bg-indigo-50/30"
                  />
                ) : (
                  <div className={`p-4 border rounded-lg text-sm text-slate-800 ${activeDraft.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-200' : activeDraft.status === 'CANCELLED' ? 'bg-red-50 border-red-200' : 'bg-white border-slate-300'}`}>
                    {activeDraft.draftContent}
                  </div>
                )}
              </div>

              {/* Guardrails (only if pending) */}
              {activeDraft.status === 'PENDING_APPROVAL' && (
                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Kiểm duyệt An toàn (Guardrails)</h3>
                  <GuardrailPreviewCard result={checkMessageQuality({
                    message: editMode ? editedContent : activeDraft.draftContent,
                    channel: activeDraft.targetChannel.includes('Zalo') ? 'ZALO' : 'FANPAGE',
                    audience: 'PARENT',
                    staffRole: 'SALE',
                  })} />
                </div>
              )}
            </div>

            {/* Actions Footer */}
            {activeDraft.status === 'PENDING_APPROVAL' && (
              <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                {editMode ? (
                  <>
                    <button 
                      onClick={() => setEditMode(false)}
                      className="px-6 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      Hủy sửa
                    </button>
                    <button 
                      onClick={() => handleApprove(activeDraft.id, editedContent)}
                      className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" /> Lưu & Chấp nhận
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => handleReject(activeDraft.id)}
                      className="px-6 py-2.5 bg-white border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors flex items-center"
                    >
                      <XCircle className="w-5 h-5 mr-2" /> Từ chối
                    </button>
                    <button 
                      onClick={() => handleApprove(activeDraft.id, activeDraft.draftContent)}
                      className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center shadow-sm"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" /> Duyệt nháp để sử dụng thủ công
                    </button>
                  </>
                )}
              </div>
            )}
            {activeDraft.status !== 'PENDING_APPROVAL' && (
              <div className={`p-4 border-t border-slate-200 text-center font-medium ${activeDraft.status === 'APPROVED' ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                {activeDraft.status === 'APPROVED' ? 'Tin nhắn đã được duyệt (Chưa xếp hàng gửi, Chưa có outbox gửi thật, Không tự động gửi)' : 'Tin nhắn nháp đã bị hủy'}
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 h-full">
            <CheckCircle className="w-16 h-16 text-slate-200 mb-4" />
            <p className="text-lg">Tuyệt vời! Không còn tin nhắn nào cần duyệt.</p>
          </div>
        )}
      </div>
    </div>
  );
}
