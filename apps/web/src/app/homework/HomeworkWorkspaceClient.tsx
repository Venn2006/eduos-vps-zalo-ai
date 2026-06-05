"use client";

import React, { useState } from 'react';
import { 
  Sparkles, CheckCircle2, Clock, AlertTriangle, 
  FileEdit, BookOpen, PenTool, LayoutDashboard, Send, Eye
} from 'lucide-react';
import { mockHomeworkSubmissions } from '@/lib/homeworkCurriculumDemoData';
import { generateDemoCurriculum } from '@/lib/curriculumGenerator';
import { Button } from '@/components/ui/Button';

function DemoBanner() {
  return (
    <div className="bg-amber-100 border border-amber-300 text-amber-800 p-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 mb-6">
      <AlertTriangle className="w-5 h-5 text-amber-600" />
      <div>
        <strong>Chế độ Sandbox:</strong> Không có gửi thật qua Zalo, không lưu điểm cuối cùng. Giáo viên duyệt trước khi lưu/gửi.
      </div>
    </div>
  );
}

export function HomeworkWorkspaceClient() {
  const [activeTab, setActiveTab] = useState<'overview' | 'ai-draft' | 'generator' | 'parent-report'>('overview');
  
  const pendingApprovals = mockHomeworkSubmissions.filter(s => s.aiDraftStatus === 'Cần giáo viên duyệt').length;
  const draftReports = mockHomeworkSubmissions.filter(s => s.parentReportDraftStatus === 'Chờ duyệt').length;
  const missingHomeworks = mockHomeworkSubmissions.filter(s => s.submissionStatus === 'Chưa nộp' || s.submissionStatus === 'Nộp muộn').length;
  const aiDrafts = mockHomeworkSubmissions.filter(s => s.aiDraftStatus === 'AI chấm nháp' || s.aiDraftStatus === 'Cần giáo viên duyệt').length;

  const demoCurriculum = generateDemoCurriculum("Demo Passage");

  return (
    <div className="space-y-6 pb-12">
      <DemoBanner />

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`flex-shrink-0 px-5 py-2.5 rounded-full font-semibold text-sm transition-all flex items-center gap-2 border
            ${activeTab === 'overview' 
              ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
        >
          <LayoutDashboard className="w-4 h-4" /> Tổng quan
        </button>
        <button 
          onClick={() => setActiveTab('ai-draft')}
          className={`flex-shrink-0 px-5 py-2.5 rounded-full font-semibold text-sm transition-all flex items-center gap-2 border
            ${activeTab === 'ai-draft' 
              ? 'bg-purple-700 text-white border-purple-700 shadow-md' 
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-purple-50 hover:text-purple-700'}`}
        >
          <Sparkles className="w-4 h-4" /> AI chấm nháp
          {aiDrafts > 0 && <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-bold">{aiDrafts}</span>}
        </button>
        <button 
          onClick={() => setActiveTab('generator')}
          className={`flex-shrink-0 px-5 py-2.5 rounded-full font-semibold text-sm transition-all flex items-center gap-2 border
            ${activeTab === 'generator' 
              ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
        >
          <PenTool className="w-4 h-4" /> Tạo quiz demo
        </button>
        <button 
          onClick={() => setActiveTab('parent-report')}
          className={`flex-shrink-0 px-5 py-2.5 rounded-full font-semibold text-sm transition-all flex items-center gap-2 border
            ${activeTab === 'parent-report' 
              ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
        >
          <BookOpen className="w-4 h-4" /> Báo cáo phụ huynh nháp
          {draftReports > 0 && <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full text-xs font-bold">{draftReports}</span>}
        </button>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="text-sm font-bold text-slate-500 mb-1">Cần giáo viên duyệt</div>
                <div className="text-3xl font-black text-slate-900">{pendingApprovals}</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="text-sm font-bold text-slate-500 mb-1">AI đã chấm nháp</div>
                <div className="text-3xl font-black text-slate-900">{aiDrafts}</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="text-sm font-bold text-slate-500 mb-1">Bài thiếu / Nộp muộn</div>
                <div className="text-3xl font-black text-slate-900">{missingHomeworks}</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="text-sm font-bold text-slate-500 mb-1">Báo cáo phụ huynh nháp</div>
                <div className="text-3xl font-black text-slate-900">{draftReports}</div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                <h3 className="font-bold text-lg text-slate-900">Danh sách Bài tập hiện tại</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-sm font-bold text-slate-500 bg-white">
                      <th className="py-3 px-6 whitespace-nowrap">Học viên / Lớp</th>
                      <th className="py-3 px-6 whitespace-nowrap">Bài tập</th>
                      <th className="py-3 px-6 whitespace-nowrap">Trạng thái nộp</th>
                      <th className="py-3 px-6 whitespace-nowrap">Trạng thái AI</th>
                      <th className="py-3 px-6 whitespace-nowrap">Báo cáo</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium text-slate-800">
                    {mockHomeworkSubmissions.map(hw => (
                      <tr key={hw.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="font-bold text-slate-900">{hw.studentName}</div>
                          <div className="text-slate-500 text-xs mt-1">{hw.className}</div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="font-bold text-slate-700">{hw.assignmentTitle}</div>
                          <div className="text-slate-500 text-xs mt-1">{hw.assignmentType} • {hw.cefrLevel}</div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            hw.submissionStatus === 'Đã nộp' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {hw.submissionStatus}
                          </span>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            hw.aiDraftStatus === 'Cần giáo viên duyệt' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                            hw.aiDraftStatus === 'AI chấm nháp' ? 'bg-blue-100 text-blue-800' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {hw.aiDraftStatus}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-500 whitespace-nowrap">{hw.parentReportDraftStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* AI DRAFT GRADING TAB */}
        {activeTab === 'ai-draft' && (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-bold text-purple-900">AI chỉ chấm nháp</h4>
                <p className="text-sm text-purple-800 mt-1">Giáo viên phải duyệt trước khi lưu điểm/nhận xét. Bản demo không lưu điểm thật.</p>
              </div>
            </div>

            <div className="grid gap-6">
              {mockHomeworkSubmissions.filter(s => s.aiDraftStatus === 'AI chấm nháp' || s.aiDraftStatus === 'Cần giáo viên duyệt').map(hw => (
                <div key={hw.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-rose-100 text-rose-800 text-xs px-2 py-0.5 rounded-full font-bold border border-rose-200">
                          TEACHER_APPROVAL_REQUIRED
                        </span>
                        <h3 className="font-black text-lg text-slate-900">{hw.studentName} - {hw.assignmentTitle}</h3>
                      </div>
                      <p className="text-slate-600 font-medium text-sm">Lớp: {hw.className} | Phụ trách: {hw.teacherName}</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-black text-emerald-600">{hw.aiScoreDraft}/10</div>
                      <div className="text-xs font-bold text-slate-400">ĐIỂM NHÁP</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg">
                      <h4 className="font-bold text-emerald-800 text-sm mb-2 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Điểm mạnh</h4>
                      <p className="text-sm text-emerald-700">{hw.aiStrengths}</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg">
                      <h4 className="font-bold text-amber-800 text-sm mb-2 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Cần cải thiện</h4>
                      <p className="text-sm text-amber-700">{hw.aiImprovements}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg mb-4">
                    <h4 className="font-bold text-slate-700 text-sm mb-2">Gợi ý nhận xét cho giáo viên:</h4>
                    <p className="text-sm text-slate-900 italic">"{hw.suggestedTeacherComment}"</p>
                  </div>

                  <div className="flex gap-2">
                    <Button className="bg-slate-900 text-white hover:bg-slate-800 font-bold">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Duyệt demo
                    </Button>
                    <Button variant="outline" className="font-bold text-slate-600 border-slate-300">
                      <FileEdit className="w-4 h-4 mr-2" /> Yêu cầu sửa demo
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GENERATOR TAB */}
        {activeTab === 'generator' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Trình Tạo Bài Tập & Từ Vựng (Demo Local)</h2>
              <p className="text-slate-600 mb-6">Không gọi live LLM. Tạo bài tập, từ vựng và quiz mô phỏng nhanh từ dữ liệu mẫu.</p>

              <div className="flex gap-2 mb-8">
                <Button className="bg-indigo-600 text-white hover:bg-indigo-700 font-bold">
                  <Sparkles className="w-4 h-4 mr-2" /> Tạo quiz demo
                </Button>
                <Button variant="outline" className="font-bold text-slate-700">
                  <PenTool className="w-4 h-4 mr-2" /> Tạo bài điền từ demo
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-500" /> Từ Vựng Đề Xuất ({demoCurriculum.cefrLevel})</h3>
                  <div className="space-y-3">
                    {demoCurriculum.vocabulary.map((v, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                        <div className="font-bold text-slate-900">{v.word} <span className="text-slate-500 font-normal italic">({v.type})</span> - {v.meaning}</div>
                        <div className="text-sm text-slate-600 mt-1">VD: {v.example}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><LayoutDashboard className="w-5 h-5 text-indigo-500" /> Quiz & Bài Điền Từ</h3>
                  <div className="space-y-4">
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                      <h4 className="font-bold text-sm text-slate-500 mb-2 uppercase">Bài điền từ (Cloze Test)</h4>
                      <p className="text-sm text-slate-800 font-medium leading-relaxed">{demoCurriculum.clozeTest}</p>
                    </div>
                    {demoCurriculum.quizQuestions.map((q, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 p-4 rounded-lg">
                        <div className="font-bold text-slate-900 text-sm mb-2">Q{idx + 1}: {q.question}</div>
                        <ul className="text-sm text-slate-600 space-y-1 mb-2">
                          {q.options.map((opt, i) => (
                            <li key={i}>{opt}</li>
                          ))}
                        </ul>
                        <div className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded inline-block">Đáp án: {q.correctAnswer}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <h3 className="font-bold text-lg mb-3">Nhận xét bài tập đề xuất</h3>
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
                  <p className="text-sm text-indigo-900">{demoCurriculum.teacherNoteDraft}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button className="bg-slate-900 text-white hover:bg-slate-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Giáo viên duyệt & Lưu nháp
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PARENT REPORT TAB */}
        {activeTab === 'parent-report' && (
          <div className="space-y-6">
             <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
              <Eye className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-900">Báo cáo phụ huynh chỉ là bản nháp</h4>
                <p className="text-sm text-amber-800 mt-1">Giáo viên/admin duyệt trước khi gửi. Chưa gửi thật Zalo/Facebook.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockHomeworkSubmissions.filter(s => s.parentReportDraftStatus !== 'Chưa có').map(hw => (
                <div key={hw.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative">
                  <div className="absolute top-4 right-4">
                    <span className="bg-rose-100 text-rose-800 text-[10px] px-2 py-0.5 rounded font-black border border-rose-200 uppercase tracking-wider">
                      Draft_Only
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-1">{hw.studentName}</h3>
                  <div className="text-sm text-slate-500 mb-4">{hw.parentName} • {hw.parentPhone}</div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Bài tập gần nhất:</span>
                      <span className="font-bold text-slate-900">{hw.assignmentTitle}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Điểm số/Trạng thái:</span>
                      <span className="font-bold text-emerald-600">{hw.aiScoreDraft ? `${hw.aiScoreDraft}/10` : hw.submissionStatus}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Lưu ý:</span>
                      <span className="font-bold text-amber-600">{hw.riskNote}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                    <div className="text-xs font-bold text-slate-500 mb-2 uppercase">Nội dung Zalo (Nháp)</div>
                    <p className="text-sm text-slate-800 italic">
                      "Kính gửi {hw.parentName}, EduOS xin cập nhật tình hình học tập của {hw.studentName}. {hw.suggestedTeacherComment || 'Hiện tại con đang học tốt, phụ huynh nhắc con làm bài tập nhé.'}"
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1 bg-slate-900 text-white hover:bg-slate-800 font-bold">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Duyệt báo cáo demo
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
