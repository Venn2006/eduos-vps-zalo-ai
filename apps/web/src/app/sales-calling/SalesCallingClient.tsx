"use client";

import React, { useState } from 'react';
import { logCallOutcome, bookTrial } from '../actions/sales';

import { PhoneCall, Calendar, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function SalesCallingClient({ initialLeads, saleId }: { initialLeads: any[], saleId: string }) {
  const [leads, setLeads] = useState(initialLeads);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTrialForm, setShowTrialForm] = useState(false);
  
  // Trial form state
  const [trialDate, setTrialDate] = useState('');
  const [trialTime, setTrialTime] = useState('');
  const [trialCourse, setTrialCourse] = useState('');

  const currentLead = leads[currentIndex];

  if (!currentLead) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold">Bạn đã gọi hết danh sách!</h2>
        <p className="text-zinc-500 mt-2">Không còn khách hàng nào trong hàng đợi.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Tải lại hàng đợi
        </button>
      </div>
    );
  }

  const handleOutcome = async (outcome: any) => {
    if (outcome === 'BOOKED_TRIAL' && !showTrialForm) {
      setShowTrialForm(true);
      return;
    }

    try {
      setIsSubmitting(true);
      await logCallOutcome(currentLead.id, saleId, outcome);
      alert(`Đã lưu trạng thái: ${outcome}`);
      nextLead();
    } catch (err) {
      alert('Lỗi khi lưu trạng thái');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookTrial = async () => {
    if (!trialDate || !trialTime) {
      alert('Vui lòng chọn ngày và giờ');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const dateStr = `${trialDate}T${trialTime}:00`;
      await bookTrial(currentLead.id, new Date(dateStr), trialCourse || currentLead.interestedCourseId);
      await logCallOutcome(currentLead.id, saleId, 'BOOKED_TRIAL');
      alert('Đã đặt lịch học thử thành công!');
      setShowTrialForm(false);
      nextLead();
    } catch (err) {
      alert('Lỗi khi đặt lịch');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextLead = () => {
    setCurrentIndex(prev => prev + 1);
    setShowTrialForm(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] gap-4">
      {/* LEFT: Queue Sidebar */}
      <div className="w-full md:w-1/4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Hàng đợi (còn {leads.length - currentIndex})</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {leads.slice(currentIndex).map((lead, idx) => (
            <div 
              key={lead.id} 
              className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${idx === 0 ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent'}`}
            >
              <div className="flex justify-between items-start">
                <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{lead.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  lead.temperature === 'HOT' ? 'bg-red-100 text-red-700' :
                  lead.temperature === 'WARM' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {lead.temperature === 'HOT' ? 'Nóng' : 
                   lead.temperature === 'WARM' ? 'Ấm' : 
                   lead.temperature === 'COLD' ? 'Lạnh' : lead.temperature}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">{lead.phone}</p>
              {lead.nextFollowUpAt && (
                <p className="text-xs text-orange-600 mt-1 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(lead.nextFollowUpAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CENTER: Action Panel */}
      <div className="w-full md:w-1/2 flex flex-col gap-4">
        {/* Contact Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{currentLead.name}</h2>
              <p className="text-zinc-500">{currentLead.fullName || 'Chưa có họ tên đầy đủ'}</p>
            </div>
            <a 
              href={`tel:${currentLead.phone}`}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl flex items-center shadow-lg shadow-green-500/20 transition-transform active:scale-95"
            >
              <PhoneCall className="w-5 h-5 mr-2" />
              Gọi Ngay
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg">
              <p className="text-zinc-500">SĐT</p>
              <p className="font-medium">{currentLead.phone}</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg">
              <p className="text-zinc-500">Trạng thái</p>
              <p className="font-medium">
                {currentLead.stage === 'NEW' ? 'Mới' :
                 currentLead.stage === 'CONTACTED' ? 'Đã liên hệ' :
                 currentLead.stage === 'BOOKED_TRIAL' ? 'Đã xếp lịch học thử' :
                 currentLead.stage === 'ATTENDED_TRIAL' ? 'Đã học thử' :
                 currentLead.stage === 'WON' ? 'Thành công (Đã thu tiền)' :
                 currentLead.stage === 'LOST' ? 'Thất bại' : currentLead.stage}
              </p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg">
              <p className="text-zinc-500">Nguồn</p>
              <p className="font-medium">{currentLead.batch?.name || 'Trực tiếp'}</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg">
              <p className="text-zinc-500">Số lần gọi</p>
              <p className="font-medium">{currentLead.callCount}</p>
            </div>
          </div>
        </div>

        {/* Action Logger */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex-1 flex flex-col">
          <h3 className="font-bold text-lg mb-4">Lưu Trạng Thái</h3>
          
          {showTrialForm ? (
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ngày học thử</label>
                <input type="date" value={trialDate} onChange={e => setTrialDate(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Giờ học thử</label>
                <input type="time" value={trialTime} onChange={e => setTrialTime(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700" />
              </div>
              <div className="flex gap-2 pt-4">
                <button onClick={handleBookTrial} disabled={isSubmitting} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700">Xác nhận Đặt lịch</button>
                <button onClick={() => setShowTrialForm(false)} className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700">Hủy</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 flex-1">
              <button disabled={isSubmitting} onClick={() => handleOutcome('NO_ANSWER')} className="p-3 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 text-left flex flex-col justify-center transition-colors">
                <span className="font-medium">Không Nghe Máy</span>
                <span className="text-xs text-zinc-500">Tự động nhắc lại sau 4h</span>
              </button>
              <button disabled={isSubmitting} onClick={() => handleOutcome('BUSY_CALLBACK')} className="p-3 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 text-left flex flex-col justify-center transition-colors">
                <span className="font-medium">Máy Bận / Gọi Lại</span>
                <span className="text-xs text-zinc-500">Hẹn gọi lại sau</span>
              </button>
              <button disabled={isSubmitting} onClick={() => handleOutcome('ASKED_PRICE')} className="p-3 border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left flex flex-col justify-center transition-colors">
                <span className="font-medium text-blue-700 dark:text-blue-400">Hỏi Giá</span>
                <span className="text-xs text-blue-600/70 dark:text-blue-400/70">Tạo nháp báo giá Zalo</span>
              </button>
              <button disabled={isSubmitting} onClick={() => handleOutcome('INTERESTED')} className="p-3 border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left flex flex-col justify-center transition-colors">
                <span className="font-medium text-blue-700 dark:text-blue-400">Quan Tâm</span>
                <span className="text-xs text-blue-600/70 dark:text-blue-400/70">Tạo nháp lộ trình Zalo</span>
              </button>
              <button disabled={isSubmitting} onClick={() => handleOutcome('BOOKED_TRIAL')} className="col-span-2 p-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl hover:bg-zinc-800 dark:hover:bg-white text-center font-bold text-lg shadow-xl shadow-black/10 transition-transform active:scale-95">
                Chốt Học Thử
              </button>
              <button disabled={isSubmitting} onClick={() => handleOutcome('WRONG_NUMBER')} className="p-2 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 text-sm font-medium transition-colors">
                Nhầm Số
              </button>
              <button disabled={isSubmitting} onClick={() => handleOutcome('NOT_INTERESTED')} className="p-2 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 text-sm font-medium transition-colors">
                Không Quan Tâm
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Scripts & Suggestions */}
      <div className="w-full md:w-1/4 flex flex-col gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            Kịch Bản Gợi Ý
          </h3>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <p>"Dạ chào anh/chị, em gọi từ Trung tâm ngoại ngữ OMLIS."</p>
            <p>"Em thấy anh/chị có để lại thông tin tìm hiểu về khóa {currentLead.course?.name || 'học ngoại ngữ'}."</p>
            <p>"Trung tâm đang có lịch học thử miễn phí tuần này..."</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex-1">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-4">Lịch Sử Gọi</h3>
          <div className="space-y-3">
            {currentLead.callAttempts?.length > 0 ? (
              currentLead.callAttempts.map((attempt: any) => (
                <div key={attempt.id} className="text-sm border-l-2 border-zinc-200 dark:border-zinc-700 pl-3">
                  <p className="font-medium">
                    {attempt.outcome === 'NO_ANSWER' ? 'Không nghe máy' :
                     attempt.outcome === 'BUSY_CALLBACK' ? 'Máy bận / Gọi lại' :
                     attempt.outcome === 'WRONG_NUMBER' ? 'Nhầm số' :
                     attempt.outcome === 'NOT_INTERESTED' ? 'Không quan tâm' :
                     attempt.outcome === 'INTERESTED' ? 'Quan tâm' :
                     attempt.outcome === 'ASKED_PRICE' ? 'Hỏi giá' :
                     attempt.outcome === 'BOOKED_TRIAL' ? 'Chốt học thử' : attempt.outcome}
                  </p>
                  <p className="text-xs text-zinc-500">{new Date(attempt.calledAt).toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500 italic">Chưa từng gọi</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
