"use client";

import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, ServerOff, PlayCircle, FileUp, ListChecks, Lock, FileText, Rocket, Presentation, Settings, Filter, Eye, ToggleLeft, Users, XCircle } from 'lucide-react';
import { connectorMatrix, checklistItems, importTemplates } from '@/lib/safetyCenterDemoData';
import { runSandboxSimulation, SimulatorScenarioId } from '@/lib/sandboxConnectorSimulator';
import { consentScopes, privacyChecklist } from '@/lib/consentPrivacyDemoData';
import { mockAuditLogs, governanceCounters } from '@/lib/auditGovernanceDemoData';
import { readinessScorecard, blockedCapabilities, pilotScope } from '@/lib/pilotReadinessDemoData';
import { demoStoryline, demoMessaging, doNotPromise, pilotNextSteps } from '@/lib/demoHandoffData';
import { pilotConsentChecklist, featureFlags, importSimulatorWarnings } from '@/lib/phase68-71-demoData';
import { rolePermissionDemoData } from '@/lib/rolePermissionDemoData';

type TabType = 'readiness' | 'import' | 'simulator' | 'consent' | 'audit' | 'pilot' | 'demo' | 'flags' | 'permissions';

export function SafetyCenterClient() {
  const [activeTab, setActiveTab] = useState<TabType>('readiness');

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
      <div className="flex overflow-x-auto gap-1 bg-slate-100 p-1 rounded-lg scrollbar-hide max-w-full">
        <TabButton active={activeTab === 'readiness'} onClick={() => setActiveTab('readiness')} icon={ListChecks} label="Readiness" />
        <TabButton active={activeTab === 'import'} onClick={() => setActiveTab('import')} icon={FileUp} label="Import Wizard" />
        <TabButton active={activeTab === 'simulator'} onClick={() => setActiveTab('simulator')} icon={PlayCircle} label="Simulator" />
        <TabButton active={activeTab === 'consent'} onClick={() => setActiveTab('consent')} icon={Lock} label="Consent & Privacy" />
        <TabButton active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} icon={FileText} label="Audit Log" />
        <TabButton active={activeTab === 'permissions'} onClick={() => setActiveTab('permissions')} icon={Users} label="Permissions" />
        <TabButton active={activeTab === 'flags'} onClick={() => setActiveTab('flags')} icon={Settings} label="Feature Flags" />
        <TabButton active={activeTab === 'demo'} onClick={() => setActiveTab('demo')} icon={Presentation} label="Demo Handoff" />
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'readiness' && <ReadinessTab />}
        {activeTab === 'import' && <ImportTab />}
        {activeTab === 'simulator' && <SimulatorTab />}
        {activeTab === 'consent' && <ConsentPrivacyTab />}
        {activeTab === 'audit' && <AuditGovernanceTab />}
        {activeTab === 'pilot' && <PilotReadinessTab />}
        {activeTab === 'permissions' && <PermissionsTab />}
        {activeTab === 'flags' && <FeatureFlagsTab />}
        {activeTab === 'demo' && <DemoHandoffTab />}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${active ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
}

// ... original tabs ReadinessTab, ImportTab, SimulatorTab
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-6">
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
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold">Preview Results</h3>
            <div className="flex gap-2">
              {importSimulatorWarnings[importType]?.map((warn, idx) => (
                <span key={idx} className={`text-xs px-2 py-1 rounded font-medium flex items-center gap-1 ${
                  warn.type === 'consent' || warn.type === 'debt' ? 'bg-danger/10 text-danger-800' : 
                  warn.type === 'phone' ? 'bg-warning/10 text-warning-800' : 'bg-primary/10 text-primary-800'
                }`}>
                  {warn.type === 'approval' ? <ShieldCheck className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  {warn.msg}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-warning/10 border border-warning/30 p-3 rounded-lg mb-4 flex items-center gap-2 text-warning-800 text-sm">
            <AlertTriangle className="w-4 h-4" />
            Bản demo chỉ xem trước, chưa lưu dữ liệu thật vào hệ thống. Cần admin duyệt để tiếp tục trong bản live.
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {previewData.split('\n')[0].split(',').map((header, i) => (
                    <th key={i} className="p-2 font-semibold text-slate-600">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.split('\n').slice(1).map((row, i) => (
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

// Phase 64: Consent & Privacy Tab
function ConsentPrivacyTab() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold mb-2">Tenant Consent & Privacy Center</h2>
        <p className="text-sm text-slate-600 mb-6">EduOS không xử lý dữ liệu thật nếu trung tâm chưa ký Consent. Demo chỉ sử dụng dữ liệu sandbox an toàn.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {consentScopes.map(scope => (
            <div key={scope.id} className="bg-white border rounded-lg p-4 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm mb-2">{scope.name}</h3>
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Hiện tại:</span>
                    <span className="font-semibold text-slate-700">{scope.status}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Tương lai:</span>
                    <span className="font-semibold text-slate-700">{scope.futureMode}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Rủi ro:</span>
                    <Badge status={scope.risk} />
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 text-slate-600 p-2 rounded text-xs text-center font-medium border">
                {scope.blockedReason}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4">Privacy & Data Retention Checklist</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {privacyChecklist.map(item => (
            <div key={item.id} className="flex items-center gap-2 bg-white p-3 border rounded-lg">
              {item.status === 'Done' ? <CheckCircle2 className="w-5 h-5 text-success" /> : <AlertTriangle className="w-5 h-5 text-warning" />}
              <span className="text-sm font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4 mt-8">Pilot Consent Pack (Customer Facing)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {pilotConsentChecklist.map(item => (
            <div key={item.id} className="flex flex-col gap-1 bg-white p-3 border rounded-lg shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{item.text}</span>
                {item.status === 'Done' ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Lock className="w-4 h-4 text-warning" />}
              </div>
              <span className={`text-xs font-semibold ${item.status === 'Done' ? 'text-success' : 'text-warning'}`}>{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Phase 65 & 69: Audit & Governance Tab
function AuditGovernanceTab() {
  const [filter, setFilter] = useState<string>('All');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filters = ['All', 'Admin approval', 'Teacher approval', 'Draft only', 'Blocked', 'Sandbox only'];
  
  const filteredLogs = mockAuditLogs.filter(log => {
    if (filter === 'All') return true;
    if (filter === 'Draft only' && log.automationMode === 'DRAFT_ONLY') return true;
    if (filter === 'Sandbox only' && log.result.includes('Sandbox')) return true;
    if (filter === 'Blocked' && log.result.includes('Blocked')) return true;
    if (filter === 'Admin approval' && log.approvalStatus === 'Requires Admin') return true;
    if (filter === 'Teacher approval' && log.approvalStatus === 'Requires Teacher') return true;
    return false;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold mb-4">Governance Counters (Sandbox Simulation)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <CounterCard title="Real Send Blocked" count={governanceCounters.realSendBlocked} type="danger" />
          <CounterCard title="Draft-Only Items" count={governanceCounters.draftOnlyItems} type="neutral" />
          <CounterCard title="Admin Approval Reqs" count={governanceCounters.adminApprovalRequired} type="warning" />
          <CounterCard title="Teacher Approval Reqs" count={governanceCounters.teacherApprovalRequired} type="warning" />
          <CounterCard title="Connectors Disabled" count={governanceCounters.connectorDisabled} type="danger" />
          <CounterCard title="Import Warnings" count={governanceCounters.importPreviewWarnings} type="neutral" />
          <CounterCard title="Mock Outbox Items" count={governanceCounters.mockOutboxItems} type="success" />
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 rounded-t-lg">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2"><Filter className="w-5 h-5"/> Mock Audit Log Preview</h2>
            <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded mt-2 inline-block">No DB Persistence</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`text-xs px-3 py-1.5 rounded-full border ${filter === f ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-3 text-slate-600">Time</th>
                <th className="p-3 text-slate-600">Source</th>
                <th className="p-3 text-slate-600">Workflow / Event</th>
                <th className="p-3 text-slate-600">Automation Mode</th>
                <th className="p-3 text-slate-600">Actor / Status</th>
                <th className="p-3 text-slate-600">Result</th>
                <th className="p-3 text-slate-600"></th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <React.Fragment key={log.id}>
                  <tr className="border-b last:border-0 hover:bg-slate-50 cursor-pointer" onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}>
                    <td className="p-3 whitespace-nowrap text-xs text-slate-500">{log.time}</td>
                    <td className="p-3 font-medium text-slate-800">{log.source}</td>
                    <td className="p-3 text-slate-700">{log.workflow}</td>
                    <td className="p-3"><Badge status={log.automationMode} /></td>
                    <td className="p-3">
                      <div className="flex flex-col text-xs">
                        <span className="font-semibold text-slate-700">{log.actor}</span>
                        <span className="text-slate-500">{log.approvalStatus}</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-600 text-xs">{log.result}</td>
                    <td className="p-3 text-slate-400"><Eye className="w-4 h-4" /></td>
                  </tr>
                  {expandedLogId === log.id && (
                    <tr className="bg-slate-50 border-b">
                      <td colSpan={7} className="p-4">
                        <div className="text-xs font-mono bg-slate-900 text-green-400 p-3 rounded">
                          {`// Event Detail Payload`}
                          <br />
                          {`{ "id": ${log.id}, "timestamp": "${log.time}", "tenantId": "demo-tenant", "metadata": { "automation": "${log.automationMode}", "action": "${log.workflow}" } }`}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Phase 66: Pilot Readiness Tab
function PilotReadinessTab() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold mb-4">Pilot Go-Live Readiness Scorecard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {readinessScorecard.map(item => (
            <div key={item.id} className="flex items-start gap-2 bg-white p-3 border rounded-lg shadow-sm">
              <div className="mt-0.5 shrink-0">
                {item.status === 'Ready' ? <CheckCircle2 className="w-5 h-5 text-success" /> : 
                 item.status === 'Blocked' ? <AlertTriangle className="w-5 h-5 text-danger" /> :
                 <AlertTriangle className="w-5 h-5 text-warning" />}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">{item.item}</p>
                <p className={`text-xs font-semibold ${
                  item.status === 'Ready' ? 'text-success' : 
                  item.status === 'Blocked' ? 'text-danger' : 'text-warning'
                }`}>{item.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 border rounded-lg shadow-sm">
          <h3 className="font-bold mb-4 text-slate-800">Pilot Scope (Phạm vi Pilot)</h3>
          <ul className="space-y-2">
            {pilotScope.map((scope, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                {scope}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-5 border rounded-lg shadow-sm border-danger/20">
          <h3 className="font-bold mb-4 text-danger-800 flex items-center gap-2">
            <ServerOff className="w-5 h-5" /> Blocked Capabilities (Bị cấm)
          </h3>
          <ul className="space-y-2">
            {blockedCapabilities.map((cap, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                <ShieldAlert className="w-4 h-4 text-danger shrink-0" />
                {cap}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Phase 67: Demo Handoff Tab
function DemoHandoffTab() {
  return (
    <div className="space-y-8">
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
        <h2 className="text-xl font-bold text-primary-800 mb-4 flex items-center gap-2">
          <Presentation className="w-6 h-6" /> Founder Demo Handoff Pack
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-slate-800 mb-3">Thông điệp chính (Demo Messaging)</h3>
            <ul className="space-y-3">
              {demoMessaging.map((msg, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 bg-white p-3 rounded shadow-sm border border-slate-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>{msg}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-danger-800 mb-3">Không hứa tính năng live (Do Not Promise)</h3>
            <ul className="space-y-3">
              {doNotPromise.map((msg, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 bg-white p-3 rounded shadow-sm border border-danger/10">
                  <ShieldAlert className="w-4 h-4 text-danger mt-0.5 shrink-0" />
                  <span>{msg}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-bold text-lg mb-4">Kịch bản Demo (Demo Storyline)</h3>
          <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {demoStoryline.map((step, idx) => (
              <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-primary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  <span className="text-sm font-bold">{idx + 1}</span>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded border shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold text-slate-800">{step.title}</div>
                  </div>
                  <div className="text-xs text-primary font-mono mb-2">{step.route}</div>
                  <div className="text-sm text-slate-600">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-bold text-lg mb-4">Pilot Next Steps</h3>
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <div className="bg-slate-50 p-4 border-b">
              <p className="text-sm text-slate-600">Quy trình bắt đầu chạy thử nghiệm thật với khách hàng (Controlled Pilot)</p>
            </div>
            <ul className="p-4 space-y-3">
              {pilotNextSteps.map((step, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0 border">{idx + 1}</div>
                  <span className="font-medium text-slate-700">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Phase 71: Feature Flags Tab
function FeatureFlagsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold mb-2 flex items-center gap-2"><ToggleLeft className="w-6 h-6 text-primary" /> Tenant Feature Flags (Demo)</h2>
        <p className="text-sm text-slate-600 mb-6">Mô phỏng cài đặt Feature Flags cấp Tenant. Tất cả đều là read-only (chỉ đọc) và bị vô hiệu hóa gửi thật trong bản Demo.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureFlags.map(flag => (
            <div key={flag.id} className="bg-white border rounded-lg p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 text-sm">{flag.label}</p>
                <p className="text-xs text-slate-500 font-mono mt-1">{flag.id}</p>
              </div>
              <div className={`w-12 h-6 rounded-full flex items-center p-1 cursor-not-allowed ${flag.value ? 'bg-primary' : 'bg-slate-200'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${flag.value ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Phase 76: Permissions Tab
function PermissionsTab() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold mb-2 flex items-center gap-2"><Users className="w-6 h-6 text-primary" /> Ma trận quyền truy cập (Role Matrix)</h2>
        <p className="text-sm text-slate-600 mb-4">Mô tả cấu hình phân quyền mô phỏng trong bản demo. Thực tế sẽ áp dụng Role-Based Access Control (RBAC) khắt khe.</p>
        
        <div className="bg-danger/10 border border-danger/20 p-4 rounded-lg mb-6 flex items-start gap-3 text-danger-800 text-sm">
          <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Những việc demo KHÔNG cho phép đối với mọi Role:</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Real send: OFF (Không gửi bất kỳ tin nhắn thật nào ra ngoài)</li>
              <li>Live connector: OFF (Không dùng API thật kết nối ngân hàng/Zalo cá nhân)</li>
              <li>AI chỉ tạo nháp/gợi ý, không bao giờ tự ý hành động bỏ qua sự phê duyệt của con người</li>
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          {rolePermissionDemoData.map(role => (
            <div key={role.roleName} className="bg-white border rounded-lg p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4 pb-4 border-b">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{role.roleName}</h3>
                  <p className="text-sm text-slate-600 mt-1">{role.shortDescription}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-800">{role.demoUserName}</p>
                  <p className="text-xs text-slate-500">{role.demoEmail}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-1"><Eye className="w-4 h-4 text-primary" /> Ai được xem gì?</h4>
                  <ul className="space-y-1">
                    {role.canView.map(v => <li key={v} className="flex items-center gap-2 text-slate-600"><div className="w-1.5 h-1.5 rounded-full bg-slate-400" />{v}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-success" /> Ai được duyệt gì?</h4>
                  <ul className="space-y-1">
                    {role.approvalResponsibilities.length > 0 ? role.approvalResponsibilities.map(a => <li key={a} className="flex items-center gap-2 text-slate-600"><div className="w-1.5 h-1.5 rounded-full bg-success/60" />{a}</li>) : <li className="text-slate-500 italic">Không có quyền duyệt</li>}
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t bg-slate-50 -mx-5 px-5 -mb-5 pb-5 rounded-b-lg">
                <div className="flex gap-2 items-start text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                  <span><strong>Safety Note:</strong> {role.safetyNotes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helpers
function CounterCard({ title, count, type }: { title: string, count: number, type: 'success' | 'warning' | 'danger' | 'neutral' }) {
  const bg = {
    success: 'bg-success/10 text-success-800 border-success/20',
    warning: 'bg-warning/10 text-warning-800 border-warning/20',
    danger: 'bg-danger/10 text-danger-800 border-danger/20',
    neutral: 'bg-slate-100 text-slate-800 border-slate-200'
  }[type];

  return (
    <div className={`p-4 border rounded-lg ${bg} flex flex-col justify-between`}>
      <span className="text-xs font-semibold uppercase mb-2">{title}</span>
      <span className="text-2xl font-bold">{count.toLocaleString()}</span>
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
  if (status === 'Disabled' || status === 'Prohibited until explicit pilot' || status === 'High' || status === 'OFF') {
    colorClass = 'bg-danger/10 text-danger-800';
  } else if (status === 'Sandbox-only' || status === 'Preview-only' || status === 'Medium' || status === 'ADMIN_APPROVAL_REQUIRED' || status === 'TEACHER_APPROVAL_REQUIRED' || status === 'Pending') {
    colorClass = 'bg-warning/10 text-warning-800';
  } else if (status === 'Low' || status === 'AUTO_WITH_DASHBOARD_REPORT' || status === 'Approved') {
    colorClass = 'bg-success/10 text-success-800';
  } else if (status === 'DRAFT_ONLY' || status === 'STAFF_HANDOFF') {
    colorClass = 'bg-primary/10 text-primary-800';
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
}
