"use client"

import React, { useState } from "react"
import {
  ArrowLeft,
  Building2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Phone,
  Mail,
  Calendar,
  FileText,
  Activity,
  Target,
  AlertTriangle,
  ChevronRight,
  BarChart3,
  CheckCircle2,
  Clock,
  MessageSquare,
  ExternalLink,
} from "lucide-react"
import type { ClientProfile } from "@/lib/types"
import {
  getClientById,
  getActionsByClient,
  formatAum,
  formatRevenue,
  formatReturn,
  formatAlpha,
  clientTypeLabel,
  type InstitutionalClient,
  type RelationshipStatus,
} from "@/lib/institutionalMock"

// ─── Props ────────────────────────────────────────────────────────────────────

interface ClientDetailViewProps {
  client: ClientProfile
  advisorId: string
  onBack: () => void
  isMockMode?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Tab = "overview" | "portfolio" | "actions" | "notes"

function StatusBadge({ status }: { status: RelationshipStatus }) {
  const config = {
    healthy: { label: "Healthy", cls: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300" },
    needs_attention: { label: "Needs Attention", cls: "bg-amber-100 text-amber-800 ring-1 ring-amber-300" },
    at_risk: { label: "At Risk", cls: "bg-red-100 text-red-800 ring-1 ring-red-300" },
  }
  const { label, cls } = config[status]
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>{label}</span>
}

function ActionStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    draft: { label: "Draft", cls: "bg-gray-100 text-gray-600" },
    pending_compliance: { label: "Pending Compliance", cls: "bg-amber-100 text-amber-700" },
    approved: { label: "Approved", cls: "bg-blue-100 text-blue-700" },
    rejected: { label: "Rejected", cls: "bg-red-100 text-red-700" },
    executed: { label: "Executed", cls: "bg-emerald-100 text-emerald-700" },
  }
  const { label, cls } = config[status] ?? { label: status, cls: "bg-gray-100 text-gray-600" }
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

// ─── Portfolio Allocation Bar ─────────────────────────────────────────────────

function AllocationBar({ allocation, benchmark, label }: { allocation: number; benchmark: number; label: string }) {
  const deviation = allocation - benchmark
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600 font-medium truncate">{label}</span>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <span className="font-semibold text-gray-900">{allocation.toFixed(1)}%</span>
          <span className={`text-[10px] font-medium ${deviation > 0 ? "text-emerald-600" : deviation < 0 ? "text-red-600" : "text-gray-400"}`}>
            {deviation > 0 ? "+" : ""}{deviation.toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-blue-500"
          style={{ width: `${Math.min(allocation, 100)}%` }}
        />
        <div
          className="absolute top-0 h-full w-0.5 bg-gray-400"
          style={{ left: `${Math.min(benchmark, 100)}%` }}
        />
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ClientDetailView({ client, advisorId, onBack, isMockMode = true }: ClientDetailViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview")

  const inst = getClientById(client.id) ?? (client as unknown as InstitutionalClient)
  const actions = getActionsByClient(client.id)
  const pendingActions = actions.filter((a) => a.status === "pending_compliance")

  if (!inst) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Client not found.</p>
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "portfolio", label: "Portfolio", icon: BarChart3 },
    { id: "actions", label: `Actions${pendingActions.length > 0 ? ` (${pendingActions.length})` : ""}`, icon: Target },
    { id: "notes", label: "Notes", icon: FileText },
  ]

  return (
    <div className="flex-1 overflow-y-auto">
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:block">Clients</span>
            </button>
            <div className="w-px h-5 bg-gray-200" />
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-blue-100 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-slate-600" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-gray-900 truncate">{inst.name}</h2>
                <p className="text-xs text-gray-400">{clientTypeLabel(inst.type)} · {inst.rm_name}</p>
              </div>
            </div>
            <StatusBadge status={inst.status} />
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 mt-4 bg-gray-50 rounded-xl p-1 border border-gray-100 w-fit">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === id
                    ? "bg-white text-blue-800 shadow-sm border border-gray-100"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── At-Risk Alert ── */}
      {inst.status === "at_risk" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800">Relationship at risk — immediate action required</p>
              <p className="text-xs text-red-600 mt-0.5">{inst.key_risk}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5">

        {/* ══ OVERVIEW TAB ══ */}
        {activeTab === "overview" && (
          <>
            {/* Key metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "AUM", value: formatAum(inst.aum), sub: `${inst.annual_fee_bps}bps fee rate` },
                { label: "Annual Revenue", value: formatRevenue(inst.fee_revenue), sub: "Fee income" },
                { label: "YTD Return", value: formatReturn(inst.ytd_return), sub: `vs ${formatReturn(inst.benchmark_return)} benchmark`, accent: inst.ytd_return >= inst.benchmark_return ? "emerald" : "red" },
                { label: "YTD Alpha", value: formatAlpha(inst.active_return_bps), sub: "Active return", accent: inst.active_return_bps >= 0 ? "emerald" : "red" },
              ].map((m) => (
                <div key={m.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <p className="text-xs text-gray-500 font-medium">{m.label}</p>
                  <p className={`text-xl font-bold mt-1 ${
                    m.accent === "emerald" ? "text-emerald-700" : m.accent === "red" ? "text-red-700" : "text-gray-900"
                  }`}>{m.value}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{m.sub}</p>
                </div>
              ))}
            </div>

            {/* 2-col layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Mandate */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">Investment Mandate</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Strategy</p>
                    <p className="text-sm text-gray-800 mt-0.5">{inst.mandate_description}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Benchmark</p>
                    <p className="text-sm text-gray-800 mt-0.5">{inst.benchmark}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium">Since Inception</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatReturn(inst.inception_return)}</p>
                      <p className="text-[11px] text-gray-400">vs {formatReturn(inst.inception_benchmark_return)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium">Relationship Since</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatDate(inst.onboarded_date)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contacts */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">Key Contacts</h3>
                {[inst.primary_contact, inst.secondary_contact].filter(Boolean).map((c, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-slate-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-700">
                        {c!.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{c!.name}</p>
                      <p className="text-xs text-gray-400">{c!.title}</p>
                      {c!.email && (
                        <a href={`mailto:${c!.email}`} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-1">
                          <Mail className="w-3 h-3" />
                          {c!.email}
                        </a>
                      )}
                    </div>
                    {i === 0 && <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">Primary</span>}
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium">Next Review</p>
                    <p className="text-sm font-semibold text-gray-800">{formatDate(inst.next_review)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium">Last Interaction</p>
                    <p className="text-sm font-semibold text-gray-800">{formatDate(inst.last_interaction)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {inst.description && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Relationship Summary</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{inst.description}</p>
              </div>
            )}
          </>
        )}

        {/* ══ PORTFOLIO TAB ══ */}
        {activeTab === "portfolio" && (
          <>
            {/* Performance banner */}
            <div className={`rounded-2xl p-5 ${
              inst.active_return_bps >= 0
                ? "bg-gradient-to-r from-emerald-700 to-teal-700"
                : "bg-gradient-to-r from-red-700 to-rose-700"
            } text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">YTD Performance vs Benchmark</p>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-3xl font-bold">{formatReturn(inst.ytd_return)}</span>
                    <span className="text-white/60 text-sm">vs {formatReturn(inst.benchmark_return)} benchmark</span>
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10`}>
                  {inst.active_return_bps >= 0
                    ? <ArrowUpRight className="w-5 h-5" />
                    : <ArrowDownRight className="w-5 h-5" />}
                  <span className="text-lg font-bold">{formatAlpha(Math.abs(inst.active_return_bps))}</span>
                </div>
              </div>
            </div>

            {/* Holdings */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Holdings vs Mandate</h3>
                <span className="text-[11px] text-gray-400">Actual vs Benchmark allocation</span>
              </div>
              <div className="divide-y divide-gray-50">
                {inst.holdings.map((h, i) => (
                  <div key={i} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-gray-900">{h.description}</p>
                          {h.ticker && (
                            <span className="text-[11px] text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded">{h.ticker}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{h.asset_class} · {h.sub_class}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">{formatAum(h.value)}</p>
                          <p className="text-[11px] text-gray-400">{h.allocation_pct.toFixed(1)}% of portfolio</p>
                        </div>
                        <div className={`flex items-center gap-0.5 text-xs font-semibold ${
                          h.ytd_return >= h.ytd_benchmark_return ? "text-emerald-600" : "text-red-600"
                        }`}>
                          {h.ytd_return >= h.ytd_benchmark_return
                            ? <TrendingUp className="w-3.5 h-3.5" />
                            : <TrendingDown className="w-3.5 h-3.5" />}
                          {formatReturn(h.ytd_return)} YTD
                        </div>
                      </div>
                    </div>
                    <AllocationBar
                      allocation={h.allocation_pct}
                      benchmark={h.benchmark_allocation_pct}
                      label={`Target: ${h.benchmark_allocation_pct}%`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ══ ACTIONS TAB ══ */}
        {activeTab === "actions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Action Proposals</h3>
              <span className="text-xs text-gray-400">{actions.length} total · {pendingActions.length} pending compliance</span>
            </div>
            {actions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <CheckCircle2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No action proposals for this client</p>
              </div>
            ) : (
              actions.map((action) => (
                <div key={action.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900">{action.title}</p>
                        <ActionStatusBadge status={action.status} />
                        {action.priority === "urgent" && (
                          <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full ring-1 ring-red-200">URGENT</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1 capitalize">{action.type.replace("_", " ")}</p>
                    </div>
                    {action.estimated_trade_size && (
                      <p className="text-sm font-semibold text-gray-800 flex-shrink-0">{formatAum(action.estimated_trade_size)}</p>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{action.description}</p>
                  {action.checklist.length > 0 && (
                    <div className="space-y-1.5">
                      {action.checklist.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${item.passed ? "text-emerald-500" : "text-gray-300"}`} />
                          <span className={`text-xs ${item.passed ? "text-gray-600" : "text-gray-400"}`}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {action.sla_deadline && action.status === "pending_compliance" && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                      <Clock className="w-3.5 h-3.5" />
                      SLA deadline: {formatDate(action.sla_deadline)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ══ NOTES TAB ══ */}
        {activeTab === "notes" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">RM Notes</h3>
            {(inst.recent_notes ?? []).map((note, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-700 leading-relaxed">{note}</p>
                  <p className="text-[11px] text-gray-400 mt-2">Sarah Chen · Relationship Manager</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
