'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  Award,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Compass,
  FileDown,
  Gauge,
  Globe,
  Layers,
  MapPin,
  MessageSquare,
  Search,
  Sparkles,
  TrendingUp,
  Zap,
  Filter
} from 'lucide-react';

export default function ClientDashboard() {
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    loadLatestAudit();
  }, []);

  const loadLatestAudit = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/audits?limit=1');
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        setAudit(json.data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const score = audit?.overallScore || 77;
  const breakdown = audit?.scoreBreakdown || {
    technical: 78,
    on_page: 88,
    content: 72,
    core_web_vitals: 61,
    schema: 85
  };

  const recommendations = Array.isArray(audit?.recommendations) ? audit.recommendations : [];
  const filteredRecs = recommendations.filter((r) => {
    const matchPriority = priorityFilter === 'ALL' || r.priority === priorityFilter;
    const matchCat = categoryFilter === 'ALL' || r.category === categoryFilter;
    return matchPriority && matchCat;
  });

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 border-slate-200">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Executive SEO Audit Report • v1.0</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {audit?.client?.name || 'Smile Dental Clinic Pune'}
          </h1>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
            <span className="flex items-center space-x-1 text-slate-700 font-medium">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{audit?.url || 'https://example-dental-clinic.com'}</span>
            </span>
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Pune, Maharashtra, India</span>
            </span>
            <span>
              Audited: {audit ? new Date(audit.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'Today'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {audit?.pdfPath && (
            <a
              href={audit.pdfPath}
              download
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm flex items-center space-x-2 shadow-md hover:shadow-lg transition-all"
            >
              <FileDown className="w-4 h-4" />
              <span>Download PDF Audit Report</span>
            </a>
          )}

          <Link
            href="/admin"
            className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs sm:text-sm flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <Compass className="w-4 h-4 text-slate-500" />
            <span>Rerun Audit</span>
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Overall Health Score Card */}
        <div className="md:col-span-4 glass-panel p-6 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall SEO Health</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
              Grade B+
            </span>
          </div>

          <div className="flex items-baseline space-x-3 my-2">
            <div className="text-6xl font-black text-slate-900 tracking-tight">{score}</div>
            <div className="text-lg font-bold text-slate-400">/ 100</div>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-teal-500 to-brand-500"
              style={{ width: `${score}%` }}
            />
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Composite score calculated across Technical architecture, On-Page content, Core Web Vitals, and Local
            Schema.org markup.
          </p>
        </div>

        {/* 5-Factor Score Breakdown */}
        <div className="md:col-span-8 glass-panel p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-brand-600" />
              <span>Multi-Factor SEO Score Breakdown</span>
            </h2>
            <span className="text-xs text-slate-400">Evaluated by Claude Master Prompt</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            {[
              { label: 'Technical', val: breakdown.technical, color: 'text-blue-600', bg: 'bg-blue-500' },
              { label: 'On-Page', val: breakdown.on_page, color: 'text-emerald-600', bg: 'bg-emerald-500' },
              { label: 'Content', val: breakdown.content, color: 'text-indigo-600', bg: 'bg-indigo-500' },
              { label: 'Core Web Vitals', val: breakdown.core_web_vitals, color: 'text-amber-600', bg: 'bg-amber-500' },
              { label: 'Schema.org', val: breakdown.schema, color: 'text-teal-600', bg: 'bg-teal-500' }
            ].map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <div className={`text-xl font-extrabold ${item.color}`}>{item.val}%</div>
                <div className="text-[11px] font-semibold text-slate-600 leading-tight">{item.label}</div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-1.5 rounded-full ${item.bg}`} style={{ width: `${item.val}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="glass-panel p-6 rounded-2xl shadow-sm border-l-4 border-l-brand-600 space-y-2">
        <h2 className="text-xs font-bold text-brand-800 uppercase tracking-wider flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Claude AI Executive Summary</span>
        </h2>
        <p className="text-slate-700 text-sm leading-relaxed">
          {audit?.executiveSummary ||
            'https://example-dental-clinic.com displays a solid foundational organic presence in Pune (Position #4 for primary dental queries) but is bottlenecked by sluggish mobile Core Web Vitals (4.2s LCP) and incomplete local Schema markup. Resolving render-blocking scripts and aligning LocalBusiness structured data will directly accelerate rank velocity into the Google Local 3-Pack.'}
        </p>
      </div>

      {/* Core Web Vitals & SERP Rankings Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Web Vitals Card (PageSpeed Insights) */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2">
              <Gauge className="w-4 h-4 text-brand-600" />
              <h2 className="text-sm font-bold text-slate-900">Core Web Vitals & Performance (Mobile)</h2>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              PageSpeed Mock
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <div className="text-xs text-amber-800 font-semibold mb-1">LCP (Mobile)</div>
              <div className="text-lg font-bold text-amber-900">4.2 s</div>
              <div className="text-[10px] text-amber-700 mt-1">Needs Improvement</div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <div className="text-xs text-emerald-800 font-semibold mb-1">CLS (Shift)</div>
              <div className="text-lg font-bold text-emerald-900">0.08</div>
              <div className="text-[10px] text-emerald-700 mt-1">Good (&lt; 0.1)</div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <div className="text-xs text-amber-800 font-semibold mb-1">INP (Response)</div>
              <div className="text-lg font-bold text-amber-900">280 ms</div>
              <div className="text-[10px] text-amber-700 mt-1">Needs Work (&gt; 200)</div>
            </div>
          </div>

          <div className="text-xs space-y-2 pt-2 text-slate-600">
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span>Render-blocking resources:</span>
              <span className="font-semibold text-slate-800">2 blocking stylesheets/scripts</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span>Unused JavaScript bundle:</span>
              <span className="font-semibold text-slate-800">420 KiB wasted payload</span>
            </div>
          </div>
        </div>

        {/* DataForSEO SERP Rankings & Competitors */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-brand-600" />
              <h2 className="text-sm font-bold text-slate-900">SERP Rankings & Search Volume</h2>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              DataForSEO Mock
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-brand-50 border border-brand-200">
            <div>
              <div className="text-xs text-brand-800 font-semibold">Tracked Target Keyword</div>
              <div className="text-base font-bold text-brand-950">"dental clinic pune"</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-brand-700">Search Volume</div>
              <div className="text-base font-extrabold text-brand-900">1,900 / mo</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Organic SERP Competitor Table
            </div>
            {[
              { rank: 4, domain: 'example-dental-clinic.com (You)', isClient: true },
              { rank: 8, domain: 'competitorA.com', isClient: false },
              { rank: 12, domain: 'competitorB.com', isClient: false }
            ].map((c, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                  c.isClient ? 'bg-emerald-50 border border-emerald-200 font-semibold' : 'bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 font-mono flex items-center justify-center text-[10px] font-bold">
                    #{c.rank}
                  </span>
                  <span>{c.domain}</span>
                </div>
                {c.isClient && (
                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Current Client
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* High-Impact Quick Wins (< 2 Hours Effort) */}
      <div className="glass-panel p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <h2 className="text-base font-bold text-slate-900">High-Impact Quick Wins (Effort ≤ 2 Hours)</h2>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            Immediate ROI
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(audit?.quickWins || [
            'Add postalCode (411005) and geo coordinates (lat 18.5204, long 73.8567) to DentalClinic JSON-LD schema (30 mins).',
            'Optimize hero banner image to modern WebP format with fetchpriority="high" to shave 1.2s off LCP (45 mins).',
            'Add target city modifier "Pune" and primary phone number into the homepage title tag (15 mins).'
          ]).map((win, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/70 to-teal-50/50 border border-emerald-200 text-xs text-slate-800 flex items-start space-x-3"
            >
              <div className="p-1 rounded bg-emerald-100 text-emerald-800 flex-shrink-0 mt-0.5">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <p className="leading-relaxed font-medium">{win}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Prioritised Recommendations Section */}
      <div className="glass-panel p-6 rounded-2xl shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Compass className="w-5 h-5 text-brand-600" />
              <span>Prioritised Action Plan & Falsifiability Checks</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Structured recommendations with exact fixes and testable verification criteria
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1 text-xs text-slate-500 mr-2">
              <Filter className="w-3.5 h-3.5" />
              <span>Priority:</span>
            </div>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  priorityFilter === p
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Recommendations List */}
        <div className="space-y-4">
          {filteredRecs.length > 0 ? (
            filteredRecs.map((rec, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                        rec.priority === 'CRITICAL'
                          ? 'bg-red-100 text-red-800'
                          : rec.priority === 'HIGH'
                          ? 'bg-amber-100 text-amber-800'
                          : rec.priority === 'MEDIUM'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {rec.priority}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {rec.category}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                    <span>
                      Impact: <strong className="text-slate-800">{rec.estimated_impact}</strong>
                    </span>
                    <span>
                      Effort: <strong className="text-slate-800">{rec.effort}</strong>
                    </span>
                  </div>
                </div>

                {/* Finding */}
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Finding:</div>
                  <div className="text-sm font-semibold text-slate-900 mt-0.5">{rec.finding}</div>
                </div>

                {/* Fix */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-brand-700 uppercase tracking-wide">Actionable Fix:</div>
                  <div className="text-xs text-slate-800 mt-1 leading-relaxed">{rec.fix}</div>
                </div>

                {/* Falsifiability Check */}
                <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200">
                  <div className="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Falsifiability Verification Check:</span>
                  </div>
                  <div className="text-xs text-emerald-950 mt-1 leading-relaxed">{rec.falsifiability_check}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No recommendations match the selected filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
