"use client"

import React, { useState, useEffect } from "react"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ChevronRight,
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  DollarSign,
  Users,
  Target,
  Zap,
  BarChart3,
  Calendar,
  Activity,
  Star,
} from "lucide-react"
import type { AdvisorProfile } from "@/lib/types"
import type { ClientProfile } from "@/lib/types"
import {
  MOCK_INSTITUTIONAL_CLIENTS,
  MOCK_OPPORTUNITIES,
  MOCK_ACTION_PROPOSALS,
  getClientsByRM,
  getBookSummary,
  formatAum,
  formatRevenue,
  formatReturn,
  formatAlpha,
  clientTypeLabel,
  type InstitutionalClient,
} from "@/lib/institutionalMock"

// ─── Props ───────────────────────────────────────────────────────────────────

interface AdvisorDashboardProps {
  advisor: AdvisorProfile
  onNavigateToClients: () => void
  onNavigateToAppointments: () => void
  onSelectClient: (client: ClientProfile) => void
  onRunScenarioAnalysis?: () => void
  onOpenChat?: () => void
  isMockMode?: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: "healthy" | "needs_attention" | "at_risk" }) {
  const colors = {
    healthy: "bg-emerald-500",
    needs_attention: "bg-amber-500",
    at_risk: "bg-red-500",
  }
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[status]} flex-shrink-0`} />
}

function StatusBadge({ status }: { status: "healthy" | "needs_attention" | "at_risk" }) {
  const config = {
    healthy: { label: "Healthy", cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
    needs_attention: { label: "Attention", cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
    at_risk: { label: "At Risk", cls: "bg-red-50 text-red-700 ring-1 ring-red-200" },
  }
  const { label, cls } = config[status]
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
}

function AlphaChip({ bps }: { bps: number }) {
  const pos = bps >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded ${
      pos ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
    }`}>
      {pos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {formatAlpha(Math.abs(bps))}
    </span>
  )
}

// ─── AUM Trend Sparkline ─────────────────────────────────────────────────────

function AumSparkline({ positive }: { positive: boolean }) {
  const color = positive ? "#16a34a" : "#dc2626"
  // Simulate a sparkline with a simple SVG path
  const points = positive
    ? "10,70 60,55 110,45 160,38 210,42 260,30 310,20 360,15"
    : "10,20 60,30 110,28 160,42 210,50 260,55 310,65 360,70"
  return (
    <svg width="100%" height="60" viewBox="0 0 370 80" className="overflow-visible">
      <defs>
        <linearGradient id={`sgrad-${positive}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  accent = "blue",
}: {
  label: string
  value: string
  sub?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: "up" | "down" | "neutral"
  accent?: "blue" | "emerald" | "amber" | "red" | "violet"
}) {
  const accents = {
    blue: { bg: "bg-blue-50", icon: "text-blue-600", ring: "ring-blue-100" },
    emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", ring: "ring-emerald-100" },
    amber: { bg: "bg-amber-50", icon: "text-amber-600", ring: "ring-amber-100" },
    red: { bg: "bg-red-50", icon: "text-red-600", ring: "ring-red-100" },
    violet: { bg: "bg-violet-50", icon: "text-violet-600", ring: "ring-violet-100" },
  }
  const a = accents[accent]
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        <div className={`w-8 h-8 rounded-xl ${a.bg} ring-1 ${a.ring} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${a.icon}`} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
        {sub && (
          <p className={`text-xs font-medium mt-0.5 flex items-center gap-1 ${
            trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-600" : "text-gray-400"
          }`}>
            {trend === "up" && <TrendingUp className="w-3 h-3" />}
            {trend === "down" && <TrendingDown className="w-3 h-3" />}
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdvisorDashboard({
  advisor,
  onNavigateToClients,
  onSelectClient,
  onRunScenarioAnalysis,
  onOpenChat,
  isMockMode = true,
}: AdvisorDashboardProps) {
  const clients = getClientsByRM(advisor.id)
  const summary = getBookSummary(advisor.id)
  const pendingActions = MOCK_ACTION_PROPOSALS.filter(
    (a) => a.rm_id === advisor.id && a.status === "pending_compliance"
  )
  const activeOpps = MOCK_OPPORTUNITIES.filter(
    (o) => o.rm_id === advisor.id && o.status === "active" && o.estimated_aum_impact > 0
  )

  // Sort clients: at_risk first, then needs_attention, then healthy
  const sortedClients = [...clients].sort((a, b) => {
    const order = { at_risk: 0, needs_attention: 1, healthy: 2 }
    return order[a.status] - order[b.status]
  })

  const upcomingReviews = [...clients]
    .filter((c) => new Date(c.next_review) >= new Date())
    .sort((a, b) => new Date(a.next_review).getTime() - new Date(b.next_review).getTime())
    .slice(0, 4)

  function daysUntil(dateStr: string): number {
    const diff = new Date(dateStr).getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── Page Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Book of Business</h2>
            <p className="text-sm text-gray-500 mt-0.5">{advisor.name} · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
          </div>
          <button
            onClick={onOpenChat}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-800 to-blue-900 text-white text-sm font-medium rounded-xl shadow-sm hover:from-slate-700 hover:to-blue-800 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Ask Intelligence
          </button>
        </div>

        {/* ── Alert Banner for At-Risk Clients ── */}
        {summary.at_risk_count > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-800">
                {summary.at_risk_count} relationship{summary.at_risk_count > 1 ? "s" : ""} at risk — {formatAum(summary.at_risk_aum)} AUM
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                {clients.filter((c) => c.status === "at_risk").map((c) => c.short_name).join(", ")} require immediate attention.
              </p>
            </div>
            <button onClick={onNavigateToClients} className="text-xs font-semibold text-red-700 hover:text-red-900 flex items-center gap-1 flex-shrink-0">
              View <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ── Compliance Alert ── */}
        {pendingActions.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800">
                {pendingActions.length} action{pendingActions.length > 1 ? "s" : ""} awaiting compliance approval
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                {pendingActions.filter((a) => a.priority === "urgent").length > 0
                  ? `${pendingActions.filter((a) => a.priority === "urgent").length} urgent — review before SLA deadline`
                  : "Review pending approvals to unblock client actions"}
              </p>
            </div>
          </div>
        )}

        {/* ── Book Metrics ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total AUM"
            value={formatAum(summary.total_aum)}
            sub="Across all mandates"
            icon={DollarSign}
            accent="blue"
          />
          <MetricCard
            label="Annual Revenue"
            value={formatRevenue(summary.total_revenue)}
            sub="Fee income YTD"
            icon={Activity}
            accent="emerald"
            trend="up"
          />
          <MetricCard
            label="Relationships"
            value={String(summary.client_count)}
            sub={`${summary.healthy_count} healthy · ${summary.needs_attention_count} attention · ${summary.at_risk_count} at risk`}
            icon={Users}
            accent={summary.at_risk_count > 0 ? "red" : "blue"}
          />
          <MetricCard
            label="Avg. YTD Alpha"
            value={formatAlpha(summary.ytd_avg_alpha_bps)}
            sub={`Book: ${formatReturn(summary.ytd_avg_return)} vs ${formatReturn(summary.ytd_avg_benchmark)} benchmark`}
            icon={BarChart3}
            accent={summary.ytd_avg_alpha_bps >= 0 ? "emerald" : "red"}
            trend={summary.ytd_avg_alpha_bps >= 0 ? "up" : "down"}
          />
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Client Health List — 2 cols */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">Relationships</h3>
              <button onClick={onNavigateToClients} className="text-xs text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {sortedClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => onSelectClient({ id: client.id } as any)}
                  className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/80 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-blue-100 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900 truncate">{client.short_name}</p>
                      <StatusBadge status={client.status} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{clientTypeLabel(client.type)} · {formatAum(client.aum)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${client.ytd_return >= client.benchmark_return ? "text-gray-900" : "text-red-700"}`}>
                        {formatReturn(client.ytd_return)}
                      </span>
                      <AlphaChip bps={client.active_return_bps} />
                    </div>
                    {client.open_actions > 0 && (
                      <span className="text-[10px] text-amber-600 font-medium">{client.open_actions} open action{client.open_actions > 1 ? "s" : ""}</span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">

            {/* Upcoming Reviews */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50">
                <Calendar className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-semibold text-gray-900">Upcoming Reviews</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {upcomingReviews.map((client) => {
                  const days = daysUntil(client.next_review)
                  return (
                    <div key={client.id} className="flex items-center gap-3 px-5 py-3">
                      <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                        days <= 7 ? "bg-red-50" : days <= 21 ? "bg-amber-50" : "bg-blue-50"
                      }`}>
                        <span className={`text-xs font-bold ${days <= 7 ? "text-red-700" : days <= 21 ? "text-amber-700" : "text-blue-700"}`}>
                          {days <= 0 ? "TODAY" : `${days}d`}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{client.short_name}</p>
                        <p className="text-[11px] text-gray-400">{formatDate(client.next_review)}</p>
                      </div>
                      <StatusDot status={client.status} />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Pipeline */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-violet-500" />
                  <h3 className="text-sm font-semibold text-gray-900">Pipeline</h3>
                </div>
                <button onClick={onRunScenarioAnalysis} className="text-xs text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {activeOpps.slice(0, 3).map((opp) => (
                  <div key={opp.id} className="px-5 py-3 flex items-start gap-3">
                    <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                      opp.type === "retention" ? "bg-red-400" : opp.type === "new_prospect" ? "bg-violet-400" : "bg-emerald-400"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{opp.title}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{opp.probability}% · {formatAum(opp.estimated_aum_impact)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50 rounded-b-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Total pipeline</span>
                  <span className="text-xs font-bold text-gray-800">{formatAum(summary.pipeline_value)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── AI Insights Strip ── */}
        <div className="bg-gradient-to-r from-slate-800 to-blue-900 rounded-2xl p-5 text-white">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-blue-200" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white mb-1">Intelligence Digest</p>
              <ul className="space-y-1.5 text-xs text-blue-100">
                <li className="flex items-start gap-2">
                  <span className="text-blue-300 mt-0.5">•</span>
                  <span><strong className="text-white">Hartwell Endowment</strong> is 160bps below benchmark — committee review in 7 days. Emergency rebalance pending compliance.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-300 mt-0.5">•</span>
                  <span><strong className="text-white">Vandermeer</strong> alternatives drag worsened this week. Retention meeting April 30 — recommend senior management presence.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-300 mt-0.5">•</span>
                  <span><strong className="text-white">Meridian</strong> board approved alternatives expansion to 17%. Pipeline opportunity: +$500M by Q3 2026.</span>
                </li>
              </ul>
            </div>
            <button
              onClick={onOpenChat}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition-colors flex-shrink-0"
            >
              <Zap className="w-3.5 h-3.5" />
              Deep dive
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
