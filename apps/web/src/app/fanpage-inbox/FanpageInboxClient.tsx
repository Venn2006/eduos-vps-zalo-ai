'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Bot, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { analyzeConversation } from '@eduos/shared/src/lib/conversationIntelligence';
import { ConversationIntelligenceCard } from '@/components/conversation/ConversationIntelligenceCard';
import { GuardrailPreviewCard } from '@/components/conversation/GuardrailPreviewCard';
import { checkMessageQuality } from '@eduos/shared/src/lib/messageQualityGuardrails';
import { createFanpageFollowUpTask, createLeadFromFanpageConversation, queueFanpageSandboxReply } from '../actions/fanpage';

type Conversation = {
  id: string;
  psid: string;
  pageId: string;
  lastMessage: string | Date;
  messages: Array<{
    id: string;
    direction: 'INBOUND' | 'OUTBOUND';
    text: string | null;
  }>;
  lead: {
    id: string;
    name: string;
    stage: string;
    temperature: string;
  } | null;
  suggestions: Array<{
    id: string;
    suggestion: string;
    isUsed: boolean;
  }>;
};


type FanpageFilter = 'ALL' | 'HOT_LEAD' | 'NEEDS_REPLY' | 'HAS_DRAFT';

const normalizeFilter = (value?: string): FanpageFilter => {
  if (value === 'HOT_LEAD' || value === 'NEEDS_REPLY' || value === 'HAS_DRAFT') return value;
  return 'ALL';
};

const latestMessage = (conv: Conversation) => conv.messages[conv.messages.length - 1];
const hasDraft = (conv: Conversation) => conv.suggestions.some((suggestion) => !suggestion.isUsed);
const needsReply = (conv: Conversation) => latestMessage(conv)?.direction === 'INBOUND';

const matchesFilter = (conv: Conversation, filter: FanpageFilter) => {
  if (filter === 'HOT_LEAD') return conv.lead?.temperature === 'HOT';
  if (filter === 'HAS_DRAFT') return hasDraft(conv);
  if (filter === 'NEEDS_REPLY') return needsReply(conv);
  return true;
};

export function FanpageInboxClient({ initialConversations, initialFilter = 'ALL' }: { initialConversations: Conversation[], initialFilter?: string }) {
  const router = useRouter();
  const initialFilterValue = normalizeFilter(initialFilter);
  const [leadOverrides, setLeadOverrides] = useState<Record<string, NonNullable<Conversation['lead']>>>({});
  const [usedSuggestionIds, setUsedSuggestionIds] = useState<Set<string>>(() => new Set());
  const [activeConvId, setActiveConvId] = useState(() => {
    const initialFiltered = initialConversations.filter((conv) => matchesFilter(conv, initialFilterValue));
    return initialFiltered[0]?.id;
  });
  const [filter, setFilter] = useState<FanpageFilter>(initialFilterValue);
  const [inputValue, setInputValue] = useState('');
  const [isQueueingReply, setIsQueueingReply] = useState(false);
  const [isCreatingViệc, setIsCreatingViệc] = useState(false);
  const [isCreatingKhách, setIsCreatingKhách] = useState(false);

  const conversations = useMemo(() => initialConversations.map(conv => ({
    ...conv,
    lead: leadOverrides[conv.id] ?? conv.lead,
    suggestions: conv.suggestions.map(suggestion => usedSuggestionIds.has(suggestion.id) ? { ...suggestion, isUsed: true } : suggestion)
  })), [initialConversations, leadOverrides, usedSuggestionIds]);

  const filteredConversations = conversations.filter((conv) => matchesFilter(conv, filter));

  const activeConv = conversations.find(c => c.id === activeConvId);
  const intelligenceResult = activeConv ? analyzeConversation(activeConv.messages.map((m) => m.text || '').join('\n'), 'FACEBOOK') : null;

  const handleQueueReply = async (content: string, suggestionId?: string) => {
    if (!activeConv) return;
    setIsQueueingReply(true);
    try {
      await queueFanpageSandboxReply(activeConv.id, content, suggestionId);
      if (suggestionId) {
        setUsedSuggestionIds(prev => new Set(prev).add(suggestionId));
      }
      toast.success('Đã đưa tin nhắn vào Hàng chờ duyệt');
      setInputValue('');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể queue tin nhắn');
    } finally {
      setIsQueueingReply(false);
    }
  };

  const handleCreateViệc = async () => {
    if (!activeConv) return;
    setIsCreatingViệc(true);
    try {
      await createFanpageFollowUpTask(activeConv.id, `Chăm sóc hội thoại Fanpage ${activeConv.lead?.name || activeConv.psid}`);
      toast.success('Đã tạo việc chăm sóc');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tạo việc');
    } finally {
      setIsCreatingViệc(false);
    }
  };

  const handleCreateKhách = async () => {
    if (!activeConv) return;
    setIsCreatingKhách(true);
    try {
      const lead = await createLeadFromFanpageConversation(activeConv.id);
      setLeadOverrides(prev => ({
        ...prev,
        [activeConv.id]: {
          id: lead.id,
          name: lead.name,
          stage: lead.stage,
          temperature: lead.temperature,
        }
      }));
      toast.success('Đã tạo khách từ hội thoại Fanpage');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tạo lead');
    } finally {
      setIsCreatingKhách(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      {/* LEFT COLUMN: List */}
      <div className="w-1/4 border-r border-slate-200 flex flex-col bg-slate-50">
        <div className="p-4 border-b border-slate-200 bg-white">
          <select 
            value={filter} 
            onChange={e => {
              const newFilter = normalizeFilter(e.target.value);
              setFilter(newFilter);
              const newFiltered = conversations.filter((conv) => matchesFilter(conv, newFilter));
              setActiveConvId(newFiltered[0]?.id);
              setInputValue('');
            }}
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả tin nhắn</option>
            <option value="HOT_LEAD">Khách nóng (Trial Intent)</option>
            <option value="NEEDS_REPLY">Tin mới từ khách</option>
            <option value="HAS_DRAFT">Có nháp AI</option>
          </select>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map(conv => {
            const latestMsg = conv.messages[conv.messages.length - 1];
            return (
              <button
                key={conv.id}
                type="button"
                className={`w-full p-4 border-b border-slate-100 text-left hover:bg-slate-100 transition-colors ${activeConvId === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'bg-white'}`}
                onClick={() => {
                  setActiveConvId(conv.id);
                  setInputValue('');
                }}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-slate-800 text-sm truncate">{conv.lead?.name || `Khách FB (${conv.psid.slice(0, 5)})`}</h4>
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {new Date(conv.lastMessage).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <p className="text-xs text-slate-600 truncate">{latestMsg?.text || 'Bắt đầu cuộc trò chuyện...'}</p>
                {conv.suggestions?.length > 0 && !conv.suggestions[0].isUsed && (
                  <div className="mt-2 flex items-center text-[10px] text-orange-600 font-medium">
                    <Bot className="w-3 h-3 mr-1" /> Có AI Draft
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* CENTER COLUMN: Chat */}
      <div className="w-2/4 border-r border-slate-200 flex flex-col bg-slate-50 relative">
        {activeConv ? (
          <>
            <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-slate-800">{activeConv.lead?.name || `Khách FB (${activeConv.psid})`}</h3>
                <p className="text-xs text-slate-500">Đến từ: Fanpage ID {activeConv.pageId}</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeConv.messages.map((msg) => {
                const isOutbound = msg.direction === 'OUTBOUND';
                return (
                  <div key={msg.id} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] p-3 rounded-lg text-sm ${isOutbound ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'}`}>
                      {msg.text}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* AI Intelligence Card */}
            {intelligenceResult && (
              <div className="px-4 mb-4">
                <ConversationIntelligenceCard result={intelligenceResult} />
              </div>
            )}

            {/* AI Draft Area */}
            {activeConv.suggestions && activeConv.suggestions.length > 0 && !activeConv.suggestions[0].isUsed && (
              <div className="mx-4 mb-4">
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-orange-700 font-semibold text-sm">
                      <Bot className="w-4 h-4 mr-1.5" /> AI Đề Xuất Trả Lời
                    </div>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-bold">
                      Tự động (Rủi ro thấp)
                    </span>
                  </div>
                  <p className="text-sm text-slate-800 bg-white p-3 border border-orange-100 rounded mb-3">
                    {activeConv.suggestions[0].suggestion}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mb-2">
                    <button 
                      onClick={() => setInputValue(activeConv.suggestions[0].suggestion)}
                      className="px-3 py-1.5 bg-orange-600 text-white text-xs font-medium rounded hover:bg-orange-700 flex items-center justify-center transition-colors flex-1"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" /> Sao chép vào ô trả lời
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQueueReply(activeConv.suggestions[0].suggestion, activeConv.suggestions[0].id)}
                      disabled={isQueueingReply}
                      className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-medium rounded hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1"
                    >
                      {isQueueingReply ? 'Đang đưa vào hàng chờ duyệt...' : 'Đưa vào Hàng chờ duyệt'}
                    </button>
                    <Link href="/approval-queue" className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-medium rounded hover:bg-blue-200 transition-colors flex-1 text-center">
                      Mở hàng chờ duyệt
                    </Link>
                  </div>
                  <span className="text-[10px] text-slate-500 block w-full text-center">
                    Mô phỏng AI tự trả lời theo cấu hình. Không gửi thật.
                  </span>
                </div>
                <GuardrailPreviewCard result={checkMessageQuality({
                  message: activeConv.suggestions[0].suggestion,
                  channel: "FANPAGE",
                  audience: "PARENT",
                  staffRole: "SALE",
                })} />
              </div>
            )}

            {/* Manual Input */}
            <div className="p-4 bg-white border-t border-slate-200">
              <div className="flex items-center space-x-2">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && inputValue.trim() && !isQueueingReply) {
                      void handleQueueReply(inputValue);
                    }
                  }}
                  placeholder="Nhập tin nhắn thủ công (Gõ '/' để dùng mẫu)..." 
                  className="flex-1 border border-slate-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleQueueReply(inputValue)}
                  disabled={!inputValue.trim() || isQueueingReply}
                  aria-label="Đưa tin nhắn vào Hàng chờ duyệt"
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            Chọn một cuộc trò chuyện để xem
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: CRM Profile */}
      <div className="w-1/4 bg-white flex flex-col">
        {activeConv ? (
          <>
            <div className="p-4 border-b border-slate-200 bg-slate-50 font-semibold text-slate-800 flex items-center">
              <User className="w-4 h-4 mr-2" /> Hồ sơ khách
            </div>
            <div className="p-4">
              {activeConv.lead ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-semibold">Tên Phụ huynh/Học viên</label>
                    <p className="font-medium text-slate-800">{activeConv.lead.name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-semibold">Trạng thái</label>
                    <p className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full inline-block mt-1 font-medium">
                      {activeConv.lead.stage === 'WON' ? 'Đã chốt' :
                       activeConv.lead.stage === 'BOOKED_TRIAL' ? 'Đã đặt học thử' :
                       activeConv.lead.stage === 'ATTENDED_TRIAL' ? 'Đã học thử' :
                       activeConv.lead.stage === 'QUALIFIED' ? 'Tiềm năng' :
                       activeConv.lead.stage === 'LOST' ? 'Mất cơ hội' :
                       activeConv.lead.stage === 'CONTACTED' ? 'Đã liên hệ' :
                       activeConv.lead.stage === 'NEW' ? 'Mới' : activeConv.lead.stage}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-semibold">Mức độ quan tâm</label>
                    <div className="flex items-center mt-1">
                      <span className={`w-2.5 h-2.5 rounded-full mr-2 ${activeConv.lead.temperature === 'HOT' ? 'bg-red-500' : 'bg-yellow-400'}`}></span>
                      <span className="text-sm font-medium">{activeConv.lead.temperature}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <Link href="/leads" className="block w-full py-2 bg-slate-100 text-slate-700 rounded text-sm font-medium hover:bg-slate-200 transition-colors text-center">
                      Mở danh sách khách
                    </Link>
                    <button
                      type="button"
                      onClick={handleCreateViệc}
                      disabled={isCreatingViệc}
                      className="w-full py-2 mt-2 bg-blue-50 text-blue-700 rounded text-sm font-medium hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isCreatingViệc ? 'Đang tạo việc...' : 'Tạo việc chăm sóc'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500 mb-4">Chưa có khách liên kết.</p>
                  <button
                    type="button"
                    onClick={handleCreateKhách}
                    disabled={isCreatingKhách}
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isCreatingKhách ? 'Đang tạo khách...' : 'Tạo khách mới'}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            Không có thông tin
          </div>
        )}
      </div>
    </div>
  );
}
