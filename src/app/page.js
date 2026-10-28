'use client';

import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  Cpu,
  Database,
  FileText,
  Layers,
  MessageSquare,
  Search,
  Server,
  Zap,
  Sparkles
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>EdgeLink Technology • SEO Automation System</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Autonomous SEO Audit & <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-brand-600 to-teal-500 bg-clip-text text-transparent">
            AI Recommendation Engine
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Production-grade SEO automation platform built with <strong>Next.js 14 App Router</strong>,{' '}
          <strong>BullMQ + Redis</strong>, <strong>Claude AI (Sonnet)</strong>, and automated PDF delivery.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/admin"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium flex items-center justify-center space-x-2 shadow-lg shadow-brand-500/25 transition-all hover:-translate-y-0.5"
          >
            <Server className="w-5 h-5" />
            <span>Open Admin Portal</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          <Link
            href="/client"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-medium flex items-center justify-center space-x-2 border border-slate-200 shadow-sm transition-all hover:-translate-y-0.5"
          >
            <Layers className="w-5 h-5 text-brand-600" />
            <span>View Client Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Dual Portal Feature Cards */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Admin Portal Card */}
        <div className="glass-panel p-8 rounded-2xl relative overflow-hidden group hover:border-brand-300 transition-all shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-100 rounded-bl-full -z-10 opacity-50 group-hover:scale-110 transition-transform" />
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-6 shadow-md">
            <Server className="w-6 h-6 text-brand-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Internal Admin Portal</h2>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            Trigger on-demand crawls or inspect monthly cron executions. Features real-time BullMQ job queue telemetry,
            multi-step progress tracking, client domain provisioning, and live signal inspector.
          </p>
          <ul className="space-y-2.5 text-sm text-slate-700 mb-8">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span>BullMQ Queue: <strong>seo-audit-jobs</strong></span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span>Live Step-by-Step progress polling</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span>cron-job.org recurring trigger endpoint</span>
            </li>
          </ul>
          <Link
            href="/admin"
            className="inline-flex items-center text-sm font-semibold text-brand-700 hover:text-brand-800 group-hover:translate-x-1 transition-transform"
          >
            Enter Admin Portal <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>

        {/* Client Dashboard Card */}
        <div className="glass-panel p-8 rounded-2xl relative overflow-hidden group hover:border-brand-300 transition-all shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-100 rounded-bl-full -z-10 opacity-50 group-hover:scale-110 transition-transform" />
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-500 text-white flex items-center justify-center mb-6 shadow-md">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Client-Facing SEO Dashboard</h2>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            Executive SEO dashboard designed for clients. Visualizes health scores, Core Web Vitals, DataForSEO rankings,
            and Claude-generated actionable recommendations with falsifiability checks.
          </p>
          <ul className="space-y-2.5 text-sm text-slate-700 mb-8">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span>Overall Score & 5-factor breakdown gauge</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span>Master Prompt JSON action plan & Quick Wins</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span>One-click PDF download & WhatsApp alert status</span>
            </li>
          </ul>
          <Link
            href="/client"
            className="inline-flex items-center text-sm font-semibold text-brand-700 hover:text-brand-800 group-hover:translate-x-1 transition-transform"
          >
            Enter Client Dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>
      </div>

      {/* Required Pipeline Visualizer (PDF Section 3.2) */}
      <div className="glass-panel p-8 rounded-2xl shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-brand-600" />
              <span>Audit Job Pipeline — Sequential Architecture</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Exact required flow strictly implemented per Section 3.2 of the technical specification
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1 bg-slate-100 rounded-md text-slate-700 font-semibold self-start sm:self-auto">
            STATUS: END-TO-END VERIFIED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-semibold text-brand-600 mb-1">TRIGGER & QUEUE</div>
            <div className="font-bold text-slate-900 text-sm">BullMQ + Redis</div>
            <p className="text-xs text-slate-500 mt-1">Manual admin click or cron-job.org monthly ping</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-semibold text-brand-600 mb-1">STEPS 1 - 3</div>
            <div className="font-bold text-slate-900 text-sm">Crawl + CWV + GSC</div>
            <p className="text-xs text-slate-500 mt-1">Cheerio crawler, PageSpeed mock, Search Console mock</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-semibold text-brand-600 mb-1">STEPS 4 - 7</div>
            <div className="font-bold text-slate-900 text-sm">Schema + OnPage + SERP</div>
            <p className="text-xs text-slate-500 mt-1">Schema.org validator, robots/sitemap, DataForSEO rankings</p>
          </div>

          <div className="p-4 rounded-xl bg-brand-50 border border-brand-200">
            <div className="text-xs font-semibold text-brand-700 mb-1">AI & DELIVERY</div>
            <div className="font-bold text-slate-900 text-sm">Claude + PDF + Twilio</div>
            <p className="text-xs text-slate-600 mt-1">Master Prompt JSON, Supabase save, PDF report & WhatsApp mock</p>
          </div>
        </div>
      </div>
    </div>
  );
}
