"use client"

import React, { useState } from "react"
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Scale,
  Users,
  BarChart3,
  ChevronRight,
  Building2,
  CheckCheck,
  TrendingUp,
  Activity,
} from "lucide-react"
import type { AdminProfile } from "@/lib/types"
import {
  MOCK_ACTION_PROPOSALS,
  MOCK_INSTITUTIONAL_CLIENTS,
  MOCK_RMS,
  getFirmBookSummary,
  formatAum,
  formatRevenue,
  formatAlpha,
  type ActionProposal,
  type ActionStatus,
} from "@/lib/institutionalMock"

// ─── Props ────────────────────────────────────────────────────────────────────

interface AdminDashboardProps {
  admin: AdminProfile
  isMockMode?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type ComplianceTab = "actions" | "rules" | "audit"

function PriorityBadge({ priority }: { priority: ActionProposal["priority"] }) {
  const config = {
    urgent: { label: "Urgent", cls: "bg-red-100 text-red-700 ring-1 ring-red-200" },
    high: { label: "High", cls: "bg-orange-100 text-orange-700" },
    medium: { label: "Medium", cls: "bg-amber-100 text-amber-700" },
    low: { label: "Low", cls: "bg-gray-100 text-gray-600" },
  }
  const { label, cls } = config[priority]
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
}

function RiskBadge({ risk }: { risk: "low" | "medium" | "high" }) {
  const cls = { low: "bg-emerald-50 text-emerald-700", medium: "bg-amber-50 text-amber-700", high: "bg-red-50 text-red-700" }
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls[risk]} capitalize`}>{risk} risk</span>
}

function daysUntilSla(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

// ─── Regulatory Rules Mock ────────────────────────────────────────────────────

const REGULATORY_RULES = [
  { id: "R001", category: "ERISA", title: "Diversification Requirement", status: "active", jurisdiction: "US", effective: "2025-01-01", detail: "ERISA §404(a)(1)(C): Fiduciary must diversify plan investments to minimize risk of large losses." },
  { id: "R002", category: "MiFID II", title: "Best Execution Obligation", status: "active", jurisdiction: "EU", effective: "2018-01-03", detail: "Investment firms must take all sufficient steps to obtain the best possible result for clients." },
  { id: "R003", category: "SEC", title: "Investment Adviser Fiduciary", status: "active", jurisdiction: "US", effective: "2019-09-10", detail: "Advisers Act: Investment advisers owe a fiduciary duty of loyalty and care to clients." },
  { id: "R004", category: "AIFMD", title: "Alternative Fund Disclosure", status: "active", jurisdiction: "EU", effective: "2013-07-22", detail: "AIFMs must disclose leverage, risk management, liquidity, and asset valuation procedures." },
  { id: "R005", category: "Dodd-Frank", title: "Swap Dealer Registration", status: "active", jurisdiction: "US", effective: "2012-07-16", detail: "Entities engaging in more than $8B notional in swaps must register as swap dealers." },
]

// ─── Audit Trail Mock ─────────────────────────────────────────────────────────

const AUDIT_TRAIL = [
  { id: "A001", timestamp: "2026-04-17T16:45:00Z", actor: "Diana Reyes (CCO)", action: "Approved", target: "Cascade Treasury — Duration Extension", detail: "Approved. Remains within IPS duration guidelines.", risk: "low" as const },
  { id: "A002", timestamp: "2026-04-19T14:30:00Z", actor: "Sarah Chen (RM)", action: "Submitted", target: "Vandermeer — Ares Direct Lending", detail: "Submitted for compliance review. High risk alternative investment.", risk: "high" as const },
  { id: "A003", timestamp: "2026-04-18T09:15:00Z", actor: "Sarah Chen (RM)", action: "Submitted", target: "Hartwell — Emergency Equity Rebalance", detail: "Submitted for compliance review. Urgent — SLA April 23.", risk: "medium" as const },
  { id: "A004", timestamp: "2026-04-15T09:00:00Z", actor: "James Park (RM)", action: "Drafted", target: "Pacific NW — Infrastructure Proposal", detail: "Draft action created. Not yet submitted to compliance.", risk: "low" as const },
  { id: "A005", timestamp: "2026-04-12T11:30:00Z", actor: "Diana Reyes (CCO)", action: "Reviewed", target: "Meridian — Q1 Performance Report", detail: "Compliance reviewed Q1 commentary. Approved for client distribution.", risk: "low" as const },
]

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminDashboard({ admin, isMockMode = true }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<ComplianceTab>("actions")
  const [actionFilter, setActionFilter] = useState<ActionStatus | "all">("pending_compliance")
  const [expandedAction, setExpandedAction] = useState<string | null>("act-001")
  const [actionStatuses, setActionStatuses] = useState<Record<string, ActionStatus>>({})

  const summary = getFirmBookSummary()
  const allActions = MOCK_ACTION_PROPOSALS
  const pendingActions = allActions.filter((a) => a.status === "pending_compliance")
  const filtered = actionFilter === "all" ? allActions : allActions.filter((a) => {
    const effectiveStatus = actionStatuses[a.id] ?? a.status
    return effectiveStatus === actionFilter
  })

  function getEffectiveStatus(action: ActionProposal): ActionStatus {
    return actionStatuses[action.id] ?? action.status
  }

  function approve(actionId: string) { setActionStatuses((prev) => ({ ...prev, [actionId]: "approved" })) }
  function reject(actionId: string) { setActionStatuses((prev) => ({ ...prev, [actionId]: "rejected" })) }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Compliance Dashboard</h2>
            <p className="text-sm text-gray-500 mt-0.5">{admin.name} · Chief Compliance Officer</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 rounded-xl">
            <Shield className="w-4 h-4 text-violet-600" />
            <span className="text-xs font-semibold text-violet-700">Compliance Portal</span>
          </div>
        </div>

        {/* ── Urgent Alert ── */}
        {pendingActions.filter((a) => a.priority === "urgent").length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">Urgent compliance review required</p>
              <p className="text-xs text-red-600 mt-0.5">
                {pendingActions.filter((a) => a.priority === "urgent").map((a) => a.client_name).join(", ")} — SLA deadline approaching
              </p>
            </div>
          </div>
        )}

        {/* ── Firm Metrics ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Firm AUM", value: formatAum(summary.total_aum), sub: `${summary.client_count} relationships`, icon: Building2, accent: "blue" as const },
            { label: "Annual Revenue", value: formatRevenue(summary.total_revenue), sub: "Fee income YTD", icon: TrendingUp, accent: "emerald" as const },
            { label: "Pending Review", value: String(summary.pending_compliance), sub: `${allActions.filter((a) => (actionStatuses[a.id] ?? a.status) === "pending_compliance").length} awaiting sign-off`, icon: Clock, accent: "amber" as const },
            { label: "At-Risk AUM", value: formatAum(summary.at_risk_aum), sub: `${summary.at_risk_count} relationships`, icon: AlertTriangle, accent: "red" as const },
          ].map((m) => {
            const accentCls = {
              blue: { bg: "bg-blue-50", icon: "text-blue-600", ring: "ring-blue-100" },
              emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", ring: "ring-emerald-100" },
              amber: { bg: "bg-amber-50", icon: "text-amber-600", ring: "ring-amber-100" },
              red: { bg: "bg-red-50", icon: "text-red-600", ring: "ring-red-100" },
            }[m.accent]
            return (
              <div key={m.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500 font-medium">{m.label}</span>
                  <div className={`w-8 h-8 rounded-xl ${accentCls.bg} ring-1 ${accentCls.ring} flex items-center justify-center`}>
                    <m.icon className={`w-4 h-4 ${accentCls.icon}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{m.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{m.sub}</p>
              </div>
            )
          })}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-gray-50 rounded-xl p-1 border border-gray-100 w-fit">
          {[
            { id: "actions" as ComplianceTab, label: "Action Queue", icon: CheckSquare, badge: pendingActions.length },
            { id: "rules" as ComplianceTab, label: "Regulatory Rules", icon: Scale },
            { id: "audit" as ComplianceTab, label: "Audit Trail", icon: FileText },
          ].map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === id
                  ? "bg-white text-violet-800 shadow-sm border border-gray-100"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {badge && badge > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══ ACTIONS TAB ══ */}
        {activeTab === "actions" && (
          <div className="space-y-4">
            {/* Status filter */}
            <div className="flex gap-1 flex-wrap">
              {([
                { value: "all", label: "All", count: allActions.length },
                { value: "pending_compliance", label: "Pending", count: allActions.filter((a) => (actionStatuses[a.id] ?? a.status) === "pending_compliance").length },
                { value: "approved", label: "Approved", count: allActions.filter((a) => (actionStatuses[a.id] ?? a.status) === "approved").length },
                { value: "draft", label: "Draft", count: allActions.filter((a) => (actionStatuses[a.id] ?? a.status) === "draft").length },
              ] as const).map(({ value, label, count }) => (
                <button
                  key={value}
                  onClick={() => setActionFilter(value as ActionStatus | "all")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    actionFilter === value
                      ? "bg-violet-600 text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {label}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${actionFilter === value ? "bg-white/20" : "bg-gray-100"}`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {/* Action cards */}
            <div className="space-y-3">
              {filtered.map((action) => {
                const status = getEffectiveStatus(action)
                const isExpanded = expandedAction === action.id
                const slaDays = action.sla_deadline ? daysUntilSla(action.sla_deadline) : null

                return (
                  <div key={action.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                    action.priority === "urgent" && status === "pending_compliance" ? "border-red-200" : "border-gray-100"
                  }`}>
                    <button
                      onClick={() => setExpandedAction(isExpanded ? null : action.id)}
                      className="w-full flex items-start gap-4 p-5 text-left hover:bg-gray-50/50 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        status === "pending_compliance" ? "bg-amber-50" : status === "approved" ? "bg-emerald-50" : status === "rejected" ? "bg-red-50" : "bg-gray-50"
                      }`}>
                        {status === "pending_compliance" && <Clock className="w-5 h-5 text-amber-500" />}
                        {status === "approved" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                        {status === "rejected" && <XCircle className="w-5 h-5 text-red-500" />}
                        {status === "draft" && <FileText className="w-5 h-5 text-gray-400" />}
                        {status === "executed" && <CheckCheck className="w-5 h-5 text-blue-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-gray-900">{action.title}</p>
                              <PriorityBadge priority={action.priority} />
                              <RiskBadge risk={action.compliance_risk} />
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              <span className="text-xs text-gray-500 flex items-center gap-1"><Building2 className="w-3 h-3" /> {action.client_name}</span>
                              <span className="text-xs text-gray-400">{action.rm_name}</span>
                              <span className="text-xs text-gray-400 capitalize">{action.type.replace("_", " ")}</span>
                              {action.estimated_trade_size && <span className="text-xs font-semibold text-gray-700">{formatAum(action.estimated_trade_size)}</span>}
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-right space-y-1">
                            {slaDays !== null && status === "pending_compliance" && (
                              <div className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                                slaDays <= 1 ? "bg-red-100 text-red-700" : slaDays <= 3 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
                              }`}>
                                {slaDays <= 0 ? "SLA overdue" : `${slaDays}d to SLA`}
                              </div>
                            )}
                            {status === "approved" && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">Approved</span>}
                            {status === "rejected" && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">Rejected</span>}
                          </div>
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/40 space-y-4">
                        <div>
                          <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Description</p>
                          <p className="text-sm text-gray-700">{action.description}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1">RM Rationale</p>
                          <p className="text-sm text-gray-700">{action.rationale}</p>
                        </div>

                        {/* Checklist */}
                        <div>
                          <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-2">Compliance Checklist</p>
                          <div className="space-y-2">
                            {action.checklist.map((item, i) => (
                              <div key={i} className="flex items-center gap-2.5">
                                <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${item.passed ? "text-emerald-500" : "text-gray-300"}`} />
                                <span className={`text-xs ${item.passed ? "text-gray-700" : "text-gray-400"}`}>{item.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Compliance notes */}
                        {action.compliance_notes.length > 0 && (
                          <div>
                            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-2">Compliance Notes</p>
                            {action.compliance_notes.map((note, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs text-gray-600 mb-1">
                                <Shield className="w-3.5 h-3.5 text-violet-400 mt-0.5 flex-shrink-0" />
                                {note}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Action buttons */}
                        {status === "pending_compliance" && (
                          <div className="flex gap-3 pt-2">
                            <button
                              onClick={() => approve(action.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => reject(action.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-semibold rounded-xl transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 text-xs font-semibold rounded-xl transition-colors">
                              <FileText className="w-3.5 h-3.5" />
                              Request More Info
                            </button>
                          </div>
                        )}
                        {status === "approved" && (
                          <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3">
                            <CheckCircle2 className="w-4 h-4" />
                            Approved by {admin.name} · Ready for execution
                          </div>
                        )}
                        {status === "rejected" && (
                          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 rounded-xl px-4 py-3">
                            <XCircle className="w-4 h-4" />
                            Rejected · RM has been notified
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ══ RULES TAB ══ */}
        {activeTab === "rules" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{REGULATORY_RULES.length} active rules across {new Set(REGULATORY_RULES.map((r) => r.jurisdiction)).size} jurisdictions</p>
            </div>
            {REGULATORY_RULES.map((rule) => (
              <div key={rule.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">{rule.category}</span>
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{rule.jurisdiction}</span>
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">Active</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mt-2">{rule.title}</p>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{rule.detail}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-[11px] text-gray-400">Effective</p>
                    <p className="text-xs font-medium text-gray-700">{formatDate(rule.effective)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ AUDIT TAB ══ */}
        {activeTab === "audit" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Complete audit trail — all compliance actions and decisions</p>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-50">
                {AUDIT_TRAIL.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-4 px-5 py-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      entry.action === "Approved" ? "bg-emerald-50" : entry.action === "Submitted" ? "bg-amber-50" : "bg-blue-50"
                    }`}>
                      {entry.action === "Approved" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      {entry.action === "Submitted" && <Clock className="w-4 h-4 text-amber-500" />}
                      {entry.action === "Drafted" && <FileText className="w-4 h-4 text-gray-400" />}
                      {entry.action === "Reviewed" && <Shield className="w-4 h-4 text-blue-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{entry.action}: <span className="font-normal text-gray-700">{entry.target}</span></p>
                          <p className="text-xs text-gray-500 mt-0.5">{entry.actor}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{entry.detail}</p>
                        </div>
                        <RiskBadge risk={entry.risk} />
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-[11px] text-gray-400">
                        {new Date(entry.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                      <p className="text-[11px] text-gray-300">
                        {new Date(entry.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// inline icon for tab — avoids import collision
function CheckSquare({ className }: { className?: string }) {
  return <Shield className={className} />
}
