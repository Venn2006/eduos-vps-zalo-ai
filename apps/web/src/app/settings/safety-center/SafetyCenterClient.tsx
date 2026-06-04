"use client";

import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, ServerOff, PlayCircle, FileUp, ListChecks } from 'lucide-react';
import { connectorMatrix, checklistItems, importTemplates } from '@/lib/safetyCenterDemoData';
import { runSandboxSimulation, SimulatorScenarioId } from '@/lib/sandboxConnectorSimulator';

export function SafetyCenterClient() {
  const [activeTab, setActiveTab] = useState<'readiness' | 'import' | 'simulator'>('readiness');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-success" />
            Trung tâm an toàn (Safety Center)
          </h1>
          <p className="text-slate-500 mt-1">Dashboard quản lý cấu hình an toàn, kết nối và dữ liệu cho bản Demo EduOS.</p>
        </div>
      </div>

      {/* Safety Explanation Panel */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex gap-3 items-start">
        <ShieldAlert className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm text-primary-800">
          <p className="font-semibold mb-1">Quy định bản Demo / Sandbox:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>EduOS hiện tại vẫn là sandbox/demo.</li>
            <li>Không gửi thật Zalo/Facebook. Không kết nối ngân hàng thật.</li>
            <li>Không gọi live LLM. Không scrape tài khoản cá nhân.</li>
            <li>Mọi hành động nhạy cảm chỉ là nháp hoặc cần duyệt.</li>
          </ul>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('readiness')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'readiness' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
        >
          <ListChecks className="w-4 h-4" /> Connector Readiness
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'import' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
        >
          <FileUp className="w-4 h-4" /> Import Wizard (Demo)
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'simulator' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
        >
          <PlayCircle className="w-4 h-4" /> Mô phỏng Connector
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'readiness' && <ReadinessTab />}
        {activeTab === 'import' && <ImportTab />}
        {activeTab === 'simulator' && <SimulatorTab />}
      </div>
    </div>
  );
}

function ReadinessTab() {
  return (
    <div className="space-y-8">
      {/* Safety Status Cards */}
      <div>
        <h2 className="text-lg font-bold mb-4">Trạng thái an toàn hệ thống</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatusCard title="Real Send" status="Đang tắt" icon={ServerOff} type="danger" />
          <StatusCard title="Live LLM" status="Đang tắt" icon={ServerOff} type="danger" />
          <StatusCard title="Banking Sync" status="Chưa kết nối thật" icon={ServerOff} type="warning" />
          <StatusCard title="Mock Outbox" status="Chỉ sandbox" icon={ShieldCheck} type="success" />
          <StatusCard title="Approval Queue" status="Bắt buộc" icon={CheckCircle2} type="success" />
          <StatusCard title="Production Worker" status="Đang tắt" icon={ServerOff} type="danger" />
        </div>
      </div>

      {/* Connector Matrix */}
      <div>
        <h2 className="text-lg font-bold mb-4">Connector Matrix</h2>
        <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
              <tr>
                <th className="p-3">Connector</th>
                <th className="p-3">Trạng thái hiện tại</th>
                <th className="p-3">Cho phép hiện tại</th>
                <th className="p-3">Tương lai</th>
                <th className="p-3">Mức rủi ro</th>
                <th className="p-3">Điều kiện duyệt</th>
              </tr>
            </thead>
            <tbody>
              {connectorMatrix.map(c => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">{c.name}</td>
                  <td className="p-3"><Badge status={c.status} /></td>
                  <td className="p-3 text-slate-600">{c.allowedNow}</td>
                  <td className="p-3 text-slate-600">{c.futureMode}</td>
                  <td className="p-3"><Badge status={c.risk} /></td>
                  <td className="p-3 text-slate-600">{c.approvalReq}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Go/No-Go Checklist */}
      <div>
        <h2 className="text-lg font-bold mb-4">Go/No-Go Checklist (Trước khi live)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {checklistItems.map(item => (
            <div key={item.id} className="flex items-center gap-2 bg-white p-3 border rounded-lg">
              {item.status === 'Done' ? <CheckCircle2 className="w-5 h-5 text-success" /> : <AlertTriangle className="w-5 h-5 text-warning" />}
              <span className="text-sm font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ImportTab() {
  const [importType, setImportType] = useState<keyof typeof importTemplates>('lead');
  const [previewData, setPreviewData] = useState<string>('');
  
  const handlePreview = () => {
    setPreviewData(importTemplates[importType]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 border rounded-lg shadow-sm">
        <h2 className="text-lg font-bold mb-4">Manual Import Wizard (Preview Only)</h2>
        <p className="text-sm text-slate-600 mb-6">Trình mô phỏng tính năng tải lên CSV. Không lưu dữ liệu thật vào DB trong bản demo.</p>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <button onClick={() => setImportType('lead')} className={`p-3 text-sm font-medium border rounded-lg ${importType === 'lead' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200'}`}>Leads</button>
          <button onClick={() => setImportType('student')} className={`p-3 text-sm font-medium border rounded-lg ${importType === 'student' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200'}`}>Học viên/Phụ huynh</button>
          <button onClick={() => setImportType('finance')} className={`p-3 text-sm font-medium border rounded-lg ${importType === 'finance' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200'}`}>Tài chính/Học phí</button>
          <button onClick={() => setImportType('homework')} className={`p-3 text-sm font-medium border rounded-lg ${importType === 'homework' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200'}`}>Điểm danh/Bài tập</button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Sample CSV Content (Deterministic Mock)</label>
          <textarea 
            className="w-full h-32 p-3 border rounded-lg bg-slate-50 font-mono text-xs" 
            value={importTemplates[importType]}
            readOnly
          />
        </div>

        <div className="flex gap-3">
          <button onClick={handlePreview} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90">
            Xem trước import demo
          </button>
          <button className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200">
            Hủy
          </button>
        </div>
      </div>

      {previewData && (
        <div className="bg-white p-6 border rounded-lg shadow-sm">
          <h3 className="font-bold mb-4">Preview Results</h3>
          <div className="bg-warning/10 border border-warning/30 p-3 rounded-lg mb-4 flex items-center gap-2 text-warning-800 text-sm">
            <AlertTriangle className="w-4 h-4" />
            Bản demo chỉ xem trước, chưa lưu dữ liệu thật vào hệ thống. Cần admin duyệt để tiếp tục trong bản live.
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {previewData.split('\\n')[0].split(',').map((header, i) => (
                    <th key={i} className="p-2 font-semibold text-slate-600">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.split('\\n').slice(1).map((row, i) => (
                  <tr key={i} className="border-b">
                    {row.split(',').map((cell, j) => (
                      <td key={j} className="p-2 text-slate-700">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SimulatorTab() {
  const [scenario, setScenario] = useState<SimulatorScenarioId>('new_lead_fanpage');
  const result = runSandboxSimulation(scenario);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-1/3 bg-white p-4 border rounded-lg shadow-sm">
        <h3 className="font-bold mb-4">Chọn Kịch Bản</h3>
        <div className="space-y-2">
          <button onClick={() => setScenario('new_lead_fanpage')} className={`w-full text-left px-3 py-2 text-sm rounded-md ${scenario === 'new_lead_fanpage' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-slate-50'}`}>Lead mới từ Fanpage</button>
          <button onClick={() => setScenario('tuition_question')} className={`w-full text-left px-3 py-2 text-sm rounded-md ${scenario === 'tuition_question' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-slate-50'}`}>Phụ huynh hỏi học phí Zalo</button>
          <button onClick={() => setScenario('teacher_report')} className={`w-full text-left px-3 py-2 text-sm rounded-md ${scenario === 'teacher_report' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-slate-50'}`}>Tạo báo cáo nhận xét</button>
          <button onClick={() => setScenario('finance_reminder')} className={`w-full text-left px-3 py-2 text-sm rounded-md ${scenario === 'finance_reminder' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-slate-50'}`}>Nhắc nợ học phí</button>
          <button onClick={() => setScenario('bank_mock')} className={`w-full text-left px-3 py-2 text-sm rounded-md ${scenario === 'bank_mock' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-slate-50'}`}>Giao dịch ngân hàng</button>
        </div>
      </div>
      
      <div className="w-full md:w-2/3 space-y-4">
        <div className="bg-white p-4 border rounded-lg shadow-sm">
          <h3 className="font-bold mb-4">Pipeline Visualization</h3>
          <div className="space-y-3">
            {result.pipelineSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  step.status === 'pass' ? 'bg-success text-white' : 
                  step.status === 'blocked' ? 'bg-danger text-white' : 
                  step.status === 'sandbox_only' ? 'bg-primary text-white' : 'bg-warning text-white'
                }`}>
                  {step.status === 'pass' ? '✓' : step.status === 'blocked' ? '✕' : step.status === 'sandbox_only' ? 'S' : '!'}
                </div>
                <div>
                  <p className="text-sm font-semibold">{step.name}</p>
                  <p className="text-xs text-slate-500">{step.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 border rounded-lg shadow-sm">
          <h3 className="font-bold mb-2">Automation Mode Mapping</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-slate-500">Classification:</span> <span className="font-medium">{result.workflowClassification}</span></div>
            <div><span className="text-slate-500">Automation Mode:</span> <span className="font-bold text-primary">{result.automationMode}</span></div>
            <div><span className="text-slate-500">Approval Required:</span> <span className="font-medium">{result.approvalRequirement}</span></div>
            <div><span className="text-slate-500">Output:</span> <span className="font-medium">{result.sandboxOutput}</span></div>
          </div>
        </div>

        <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto">
          <p className="text-slate-400 mb-2">// Mock Audit Log Output (No DB Write)</p>
          <pre>{JSON.stringify(result.auditMock, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ title, status, icon: Icon, type }: { title: string, status: string, icon: any, type: 'success' | 'warning' | 'danger' }) {
  const colors = {
    success: 'bg-success/10 border-success/20 text-success-800',
    warning: 'bg-warning/10 border-warning/20 text-warning-800',
    danger: 'bg-danger/10 border-danger/20 text-danger-800',
  };
  const iconColors = {
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[type]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-5 h-5 ${iconColors[type]}`} />
        <span className="font-semibold text-sm">{title}</span>
      </div>
      <div className="text-xs font-bold uppercase tracking-wider">{status}</div>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  let colorClass = 'bg-slate-100 text-slate-800';
  if (status === 'Disabled' || status === 'Prohibited until explicit pilot' || status === 'High') {
    colorClass = 'bg-danger/10 text-danger-800';
  } else if (status === 'Sandbox-only' || status === 'Preview-only' || status === 'Medium') {
    colorClass = 'bg-warning/10 text-warning-800';
  } else if (status === 'Low') {
    colorClass = 'bg-success/10 text-success-800';
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
}
