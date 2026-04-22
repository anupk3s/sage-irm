"use client"

import React from "react"
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  BarChart3,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  Bell,
  Sparkles,
  ChevronRight,
  Activity,
} from "lucide-react"
import type { UserProfile } from "@/lib/api"
import {
  MOCK_INSTITUTIONAL_CLIENTS,
  formatAum,
  formatReturn,
  formatAlpha,
  getActionsByClient,
} from "@/lib/institutionalMock"

// ─── Props ────────────────────────────────────────────────────────────────────

interface DashboardViewProps {
  selectedProfile: UserProfile | null
  onNavigate: (view: string) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
}

// ─── Performance Sparkline ────────────────────────────────────────────────────

function PerfSparkline({ positive }: { positive: boolean }) {
  const color = positive ? "#0d9488" : "#dc2626"
  const points = positive
    ? "10,65 80,50 150,42 220,35 290,40 360,25 430,18 500,12"
    : "10,15 80,25 150,30 220,45 290,52 360,58 430,68 500,72"
  return (
    <svg width="100%" height="56" viewBox="0 0 510 80" className="overflow-visible">
      <defs>
        <linearGradient id="clientGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DashboardView({ onNavigate }: DashboardViewProps) {
  // Use the first institutional client as the "portal" client
  const client = MOCK_INSTITUTIONAL_CLIENTS[0]
  const actions = getActionsByClient(client.id)
  const pendingActions = actions.filter((a) => a.status === "pending_compliance" || a.status === "approved")

  const recentActivity = [
    { date: "2026-04-17", type: "report", label: "Q1 2026 Performance Report delivered", detail: "YTD: +8.4% vs benchmark +7.9%" },
    { date: "2026-04-12", type: "meeting", label: "Quarterly review call with Sarah Chen", detail: "Alternatives expansion discussed" },
    { date: "2026-04-05", type: "trade", label: "Portfolio rebalance completed", detail: "Equity sleeve rebalanced to target weights" },
    { date: "2026-03-28", type: "report", label: "March investment commentary received", detail: "Market outlook and positioning update" },
  ]

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── Welcome Banner ── */}
        <div className="bg-gradient-to-r from-teal-900 to-teal-700 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-teal-200 text-sm font-medium">{client.short_name}</p>
              <h2 className="text-2xl font-bold mt-1">{client.primary_contact.name}</h2>
              <p className="text-teal-300 text-sm mt-0.5">{client.primary_contact.title}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "AUM", value: formatAum(client.aum) },
              { label: "YTD Return", value: formatReturn(client.ytd_return) },
              { label: "vs Benchmark", value: formatAlpha(client.active_return_bps) },
              { label: "Strategy", value: "Diversified Growth" },
            ].map((m) => (
              <div key={m.label} className="bg-white/10 rounded-xl px-3 py-2.5">
                <p className="text-[11px] text-teal-200">{m.label}</p>
                <p className="text-sm font-bold text-white mt-0.5">{m.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Performance vs Benchmark ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">YTD Performance</h3>
              <button onClick={() => onNavigate("portfolio")} className="text-xs text-teal-600 font-medium hover:text-teal-800 flex items-center gap-1">
                Full portfolio <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <PerfSparkline positive={client.active_return_bps >= 0} />
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-400">Portfolio</p>
                  <div className="flex items-center gap-1">
                    {client.ytd_return > 0 ? <TrendingUp className="w-4 h-4 text-teal-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
                    <span className="text-lg font-bold text-gray-900">{formatReturn(client.ytd_return)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Benchmark</p>
                  <span className="text-lg font-bold text-gray-500">{formatReturn(client.benchmark_return)}</span>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold ${
                client.active_return_bps >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              }`}>
                {client.active_return_bps >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {formatAlpha(Math.abs(client.active_return_bps))} alpha
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-400">
              Benchmark: {client.benchmark}
            </div>
          </div>

          {/* Mandate Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Investment Mandate</h3>
            <p className="text-sm text-gray-600">{client.mandate_description}</p>
            <div className="space-y-2">
              {client.holdings.slice(0, 4).map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-400 flex-shrink-0" style={{ opacity: 0.4 + 0.15 * i }} />
                  <span className="text-xs text-gray-600 flex-1 truncate">{h.description}</span>
                  <span className="text-xs font-semibold text-gray-900">{h.allocation_pct}%</span>
                </div>
              ))}
              {client.holdings.length > 4 && (
                <p className="text-xs text-gray-400 pl-4">+{client.holdings.length - 4} more holdings</p>
              )}
            </div>
            <button
              onClick={() => onNavigate("portfolio")}
              className="w-full text-center text-xs font-medium text-teal-600 hover:text-teal-800 py-2 border border-teal-100 rounded-xl hover:bg-teal-50 transition-colors"
            >
              View full portfolio →
            </button>
          </div>
        </div>

        {/* ── Actions + Activity ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Pending actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50">
              <Bell className="w-4 h-4 text-teal-500" />
              <h3 className="text-sm font-semibold text-gray-900">Actions & Notifications</h3>
            </div>
            {pendingActions.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No pending actions</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {pendingActions.map((action) => (
                  <div key={action.id} className="flex items-start gap-3 px-5 py-3.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      action.status === "pending_compliance" ? "bg-amber-50" : "bg-blue-50"
                    }`}>
                      {action.status === "pending_compliance"
                        ? <Clock className="w-4 h-4 text-amber-500" />
                        : <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 leading-snug">{action.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 capitalize">
                        {action.status === "pending_compliance" ? "Pending compliance review" : "Approved — execution pending"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent activity */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-500" />
                <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <button onClick={() => onNavigate("activity")} className="text-xs text-teal-600 hover:text-teal-800 flex items-center gap-1">
                All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    item.type === "report" ? "bg-violet-50" : item.type === "meeting" ? "bg-blue-50" : "bg-teal-50"
                  }`}>
                    {item.type === "report" && <FileText className="w-4 h-4 text-violet-500" />}
                    {item.type === "meeting" && <Calendar className="w-4 h-4 text-blue-500" />}
                    {item.type === "trade" && <BarChart3 className="w-4 h-4 text-teal-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 leading-snug">{item.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.detail}</p>
                    <p className="text-[11px] text-gray-300 mt-0.5">{formatDate(item.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Upcoming Review ── */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200/60 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Calendar className="w-5 h-5 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">Annual Review — {formatDate(client.next_review)}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {daysUntil(client.next_review)} days · with {client.rm_name}, Sage Institutional
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Expected agenda: Performance attribution, alternatives expansion, Q3 outlook
            </p>
          </div>
          <div className={`text-xs font-bold px-3 py-1.5 rounded-xl flex-shrink-0 ${
            daysUntil(client.next_review) <= 14 ? "bg-amber-100 text-amber-700" : "bg-blue-50 text-blue-700"
          }`}>
            {daysUntil(client.next_review)}d
          </div>
        </div>

        {/* ── AI Insight ── */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-700 to-teal-900 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-teal-100" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 mb-1">Portfolio Insight</p>
            <p className="text-sm text-gray-600">
              Your portfolio is outperforming its benchmark by <strong className="text-emerald-700">+50bps YTD</strong>. The primary contributors are your Private Equity sleeve (+11.2% YTD) and International Equity (+9.8%). Fixed income is tracking in line with benchmark. Your board-approved alternatives expansion from 10% to 17% creates an opportunity to further diversify return sources ahead of potential equity volatility in H2 2026.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
