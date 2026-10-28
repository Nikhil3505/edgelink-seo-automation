'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Activity,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileDown,
  Layers,
  Terminal,
  ExternalLink,
  Plus,
  RefreshCw,
  Building,
  MapPin,
  Send,
  Sparkles,
  Server
} from 'lucide-react';

export default function AdminPortal() {
  const [clients, setClients] = useState([]);
  const [audits, setAudits] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [targetUrl, setTargetUrl] = useState('https://example-dental-clinic.com');
  const [businessType, setBusinessType] = useState('Dental Clinic');
  const [city, setCity] = useState('Pune');
  const [state, setState] = useState('Maharashtra');

  // Execution & Progress state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAudit, setActiveAudit] = useState(null);
  const [pollInterval, setPollInterval] = useState(null);
  const [notification, setNotification] = useState(null);

  // Load clients and audits on mount
  useEffect(() => {
    loadClients();
    loadAudits();
  }, []);

  const loadClients = async () => {
    try {
      const res = await fetch('/api/clients');
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        setClients(json.data);
        setSelectedClientId(json.data[0].id);
        setTargetUrl(json.data[0].websiteUrl || 'https://example-dental-clinic.com');
        setBusinessType(json.data[0].businessType || 'Dental Clinic');
        setCity(json.data[0].city || 'Pune');
        setState(json.data[0].state || 'Maharashtra');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadAudits = async () => {
    try {
      const res = await fetch('/api/audits?limit=15');
      const json = await res.json();
      if (json.success) {
        setAudits(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Trigger Audit (Section 3.2: manual admin click)
  const handleTriggerAudit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null);

    try {
      const res = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl,
          clientId: selectedClientId,
          businessType,
          city,
          state
        })
      });

      const data = await res.json();
      if (data.success) {
        setNotification({
          type: 'success',
          text: `Audit job queued in BullMQ (Job ID: ${data.bullJobId}). Pipeline execution started!`
        });

        // Set active audit and start polling progress
        const initialAudit = {
          id: data.auditId,
          url: targetUrl,
          status: 'QUEUED',
          progress: 5,
          currentStep: 'BullMQ: Queued in seo-audit-jobs'
        };
        setActiveAudit(initialAudit);
        startPolling(data.auditId);
      } else {
        setNotification({ type: 'error', text: data.error || 'Failed to trigger audit' });
      }
    } catch (err) {
      setNotification({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Poll audit status until completed or failed
  const startPolling = (auditId) => {
    if (pollInterval) clearInterval(pollInterval);

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/audits/${auditId}`);
        const json = await res.json();
        if (json.success && json.data) {
          setActiveAudit(json.data);

          if (json.data.status === 'COMPLETED' || json.data.status === 'FAILED') {
            clearInterval(interval);
            loadAudits();
          }
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, 1200);

    setPollInterval(interval);
  };

  useEffect(() => {
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [pollInterval]);

  // Trigger external cron simulation
  const handleTriggerCron = async () => {
    try {
      const res = await fetch('/api/cron');
      const data = await res.json();
      if (data.success) {
        setNotification({
          type: 'success',
          text: `cron-job.org simulation fired! Scheduled ${data.scheduledCount} recurring audits.`
        });
        loadAudits();
      }
    } catch (e) {
      setNotification({ type: 'error', text: e.message });
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-slate-900 text-brand-400">
              <Terminal className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">EdgeLink Admin Portal</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Audit Job Queue Runner • BullMQ (seo-audit-jobs) • 7-Step Crawl Pipeline Telemetry
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleTriggerCron}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 flex items-center space-x-1.5 shadow-sm transition-all"
            title="Triggers the cron-job.org scheduled route"
          >
            <Clock className="w-3.5 h-3.5 text-brand-600" />
            <span>Simulate Monthly Cron</span>
          </button>

          <button
            onClick={() => {
              loadAudits();
              loadClients();
            }}
            className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 shadow-sm"
            title="Refresh tables"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span>{notification.text}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-xs font-bold px-2 py-0.5">
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Audit Trigger Form + Active Job Progress Monitor */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Col: Trigger Form */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Play className="w-4 h-4 text-brand-600 fill-brand-600" />
              <span>Queue New SEO Audit Job</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Dispatches job to BullMQ queue <code className="bg-slate-100 px-1 py-0.5 rounded">seo-audit-jobs</code>
            </p>
          </div>

          <form onSubmit={handleTriggerAudit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Select Client</label>
              <select
                value={selectedClientId}
                onChange={(e) => {
                  setSelectedClientId(e.target.value);
                  const found = clients.find((c) => c.id === e.target.value);
                  if (found) {
                    setTargetUrl(found.websiteUrl);
                    setBusinessType(found.businessType || 'Dental Clinic');
                    setCity(found.city || 'Pune');
                    setState(found.state || 'Maharashtra');
                  }
                }}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Website URL to Audit</label>
              <input
                type="text"
                required
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example-dental-clinic.com"
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Business Sector</label>
                <input
                  type="text"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Location (City)</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Enqueuing Job...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Run Full Audit Pipeline</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Mock Status Badge */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-semibold">Mock Mode (USE_MOCKS):</span>
              <span className="font-mono text-emerald-600 font-bold">true</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Safe testing mode active. Ingests PageSpeed, GSC, and DataForSEO mocks without incurring 3rd-party API
              costs or API keys.
            </p>
          </div>
        </div>

        {/* Right Col: Live Progress Telemetry & Current Pipeline Step */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-brand-600" />
                <span>Live Pipeline Progress Monitor</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Real-time worker telemetry updating from BullMQ</p>
            </div>
            {activeAudit && (
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase ${
                  activeAudit.status === 'COMPLETED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : activeAudit.status === 'FAILED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800 animate-pulse'
                }`}
              >
                {activeAudit.status}
              </span>
            )}
          </div>

          {activeAudit ? (
            <div className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>Current Task: {activeAudit.currentStep || 'Initializing...'}</span>
                  <span>{activeAudit.progress || 0}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-brand-500 to-teal-400 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${activeAudit.progress || 0}%` }}
                  />
                </div>
              </div>

              {/* Sequential Steps Checklist */}
              <div className="space-y-2.5">
                {[
                  { step: 'Step 1: Fetch + Cheerio crawls URL', thresh: 12 },
                  { step: 'Step 2: PageSpeed Insights API (MOCKED)', thresh: 24 },
                  { step: 'Step 3: Google Search Console (MOCKED)', thresh: 36 },
                  { step: 'Step 4: Schema.org validator', thresh: 48 },
                  { step: 'Step 5: On-page analysis', thresh: 60 },
                  { step: 'Step 6: robots.txt + sitemap.xml check', thresh: 72 },
                  { step: 'Step 7: DataForSEO rankings (MOCKED)', thresh: 82 },
                  { step: 'Claude API: analyse all signals -> structured JSON', thresh: 88 },
                  { step: 'Supabase/Neon (Postgres): store audit result', thresh: 93 },
                  { step: 'PDF Report Generator (Puppeteer/PDF)', thresh: 97 },
                  { step: 'Twilio WhatsApp -> console.log mock', thresh: 100 }
                ].map((s, idx) => {
                  const isDone = (activeAudit.progress || 0) >= s.thresh;
                  const isCurrent =
                    (activeAudit.progress || 0) < s.thresh &&
                    (idx === 0 || (activeAudit.progress || 0) >= [0, 12, 24, 36, 48, 60, 72, 82, 88, 93, 97][idx]);

                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-2.5 rounded-lg text-xs transition-colors ${
                        isDone
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-100'
                          : isCurrent
                          ? 'bg-brand-50 text-brand-900 border border-brand-200 font-semibold'
                          : 'bg-slate-50 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        ) : isCurrent ? (
                          <RefreshCw className="w-4 h-4 text-brand-600 animate-spin flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0" />
                        )}
                        <span>{s.step}</span>
                      </div>
                      <span className="font-mono text-[11px] opacity-75">
                        {isDone ? 'Completed' : isCurrent ? 'Running...' : 'Pending'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Audit Completed Action Bar */}
              {activeAudit.status === 'COMPLETED' && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-emerald-900 text-sm">
                      Audit Finished with Score: {activeAudit.overallScore}/100
                    </div>
                    <div className="text-xs text-emerald-700">Report & WhatsApp dispatch mock ready</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {activeAudit.pdfPath && (
                      <a
                        href={activeAudit.pdfPath}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 flex items-center space-x-1 shadow-sm"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </a>
                    )}
                    <Link
                      href="/client"
                      className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 text-xs font-semibold hover:bg-emerald-50 flex items-center space-x-1"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>View in Dashboard</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <Server className="w-12 h-12 mx-auto text-slate-300" />
              <div className="text-sm font-medium text-slate-600">No Active Audit Job Running</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Select a client and click <strong>Run Full Audit Pipeline</strong> to dispatch an audit job to BullMQ
                and see live progress here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Audits Table */}
      <div className="glass-panel p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Audit Records</h3>
            <p className="text-xs text-slate-500">Persisted in database (Supabase/Neon)</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">{audits.length} Audits Logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Audit ID</th>
                <th className="py-3 px-4 font-semibold">Client / Target URL</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Health Score</th>
                <th className="py-3 px-4 font-semibold">WhatsApp Alert</th>
                <th className="py-3 px-4 font-semibold">PDF Report</th>
                <th className="py-3 px-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {audits.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-700">{a.id}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{a.client?.name || 'Smile Dental Clinic'}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-xs">{a.url}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold text-[10px] uppercase ${
                        a.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : a.status === 'FAILED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold">
                    {a.overallScore ? (
                      <span className={a.overallScore >= 75 ? 'text-emerald-600' : 'text-amber-600'}>
                        {a.overallScore}/100
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700">
                      {a.whatsappStatus || 'pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {a.pdfPath ? (
                      <a
                        href={a.pdfPath}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-600 hover:text-brand-800 flex items-center space-x-1 font-semibold"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {new Date(a.createdAt).toLocaleString('en-IN', {
                      dateStyle: 'short',
                      timeStyle: 'short'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
