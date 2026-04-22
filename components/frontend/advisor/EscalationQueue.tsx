"use client"

import React, { useState } from "react"
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Building2,
  XCircle,
  CheckCheck,
  FileText,
  Shield,
  Zap,
  Filter,
} from "lucide-react"
import {
  MOCK_ACTION_PROPOSALS,
  formatAum,
  clientTypeLabel,
  getClientById,
  type ActionProposal,
  type ActionStatus,
} from "@/lib/institutionalMock"

// ─── Props ────────────────────────────────────────────────────────────────────

interface EscalationQueueProps {
  advisorId: string
  isMockMode?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: ActionProposal["priority"] }) {
  const config = {
    urgent: { label: "Urgent", cls: "bg-red-100 text-red-700 ring-1 ring-red-300" },
    high: { label: "High", cls: "bg-orange-100 text-orange-700 ring-1 ring-orange-200" },
    medium: { label: "Medium", cls: "bg-amber-100 text-amber-700 ring-1 ring-amber-200" },
    low: { label: "Low", cls: "bg-gray-100 text-gray-600" },
  }
  const { label, cls } = config[priority]
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
}

function StatusBadge({ status }: { status: ActionStatus }) {
  const config: Record<ActionStatus, { label: string; cls: string }> = {
    draft: { label: "Draft", cls: "bg-gray-100 text-gray-600" },
    pending_compliance: { label: "Pending Compliance", cls: "bg-amber-100 text-amber-700" },
    approved: { label: "Approved", cls: "bg-blue-100 text-blue-700" },
    rejected: { label: "Rejected", cls: "bg-red-100 text-red-700" },
    executed: { label: "Executed", cls: "bg-emerald-100 text-emerald-700" },
  }
  const { label, cls } = config[status]
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
}

function RiskBadge({ risk }: { risk: "low" | "medium" | "high" }) {
  const config = {
    low: "bg-emerald-50 text-emerald-700",
    medium: "bg-amber-50 text-amber-700",
    high: "bg-red-50 text-red-700",
  }
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${config[risk]} capitalize`}>{risk} risk</span>
}

function TypeLabel({ type }: { type: ActionProposal["type"] }) {
  const labels: Record<ActionProposal["type"], string> = {
    rebalance: "Portfolio Rebalance",
    new_investment: "New Investment",
    mandate_change: "Mandate Change",
    fee_adjustment: "Fee Adjustment",
    reporting_change: "Reporting Change",
    redemption: "Redemption",
  }
  return <span className="text-xs text-gray-400 capitalize">{labels[type] ?? type}</span>
}

function daysUntilSla(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

// ─── Action Card ──────────────────────────────────────────────────────────────

function ActionCard({ action, isExpanded, onToggle }: {
  action: ActionProposal
  isExpanded: boolean
  onToggle: () => void
}) {
  const [localStatus, setLocalStatus] = useState<ActionStatus>(action.status)
  const client = getClientById(action.client_id)
  const slaDays = action.sla_deadline ? daysUntilSla(action.sla_deadline) : null

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
      action.priority === "urgent" ? "border-red-200" : "border-gray-100"
    }`}>
      {/* Header row */}
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-4 p-5 text-left hover:bg-gray-50/50 transition-colors"
      >
        {/* Status icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          localStatus === "pending_compliance"
            ? "bg-amber-50"
            : localStatus === "approved"
            ? "bg-blue-50"
            : localStatus === "executed"
            ? "bg-emerald-50"
            : localStatus === "rejected"
            ? "bg-red-50"
            : "bg-gray-50"
        }`}>
          {localStatus === "pending_compliance" && <Clock className="w-5 h-5 text-amber-500" />}
          {localStatus === "approved" && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
          {localStatus === "executed" && <CheckCheck className="w-5 h-5 text-emerald-500" />}
          {localStatus === "rejected" && <XCircle className="w-5 h-5 text-red-500" />}
          {localStatus === "draft" && <FileText className="w-5 h-5 text-gray-400" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-gray-900">{action.title}</p>
                <PriorityBadge priority={action.priority} />
                <StatusBadge status={localStatus} />
              </div>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500">{action.client_name}</span>
                </div>
                <TypeLabel type={action.type} />
                <RiskBadge risk={action.compliance_risk} />
                {action.estimated_trade_size && (
                  <span className="text-xs font-semibold text-gray-700">{formatAum(action.estimated_trade_size)}</span>
                )}
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              {slaDays !== null && localStatus === "pending_compliance" && (
                <div className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                  slaDays <= 1 ? "bg-red-100 text-red-700" : slaDays <= 3 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
                }`}>
                  {slaDays <= 0 ? "SLA overdue" : `${slaDays}d to SLA`}
                </div>
              )}
              {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 mt-2 ml-auto" /> : <ChevronDown className="w-4 h-4 text-gray-400 mt-2 ml-auto" />}
            </div>
          </div>
        </div>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-4 bg-gray-50/40">
          {/* Description */}
          <div>
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Description</p>
            <p className="text-sm text-gray-700">{action.description}</p>
          </div>

          {/* Rationale */}
          <div>
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1">RM Rationale</p>
            <p className="text-sm text-gray-700">{action.rationale}</p>
          </div>

          {/* Checklist */}
          {action.checklist.length > 0 && (
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
          )}

          {/* Compliance notes */}
          {action.compliance_notes.length > 0 && (
            <div>
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-2">Compliance Notes</p>
              {action.compliance_notes.map((note, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                  <Shield className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                  {note}
                </div>
              ))}
            </div>
          )}

          {/* Required approvals */}
          <div>
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-2">Required Approvals</p>
            <div className="flex gap-2 flex-wrap">
              {action.required_approvals.map((approver) => (
                <span key={approver} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-medium">
                  {approver}
                </span>
              ))}
            </div>
          </div>

          {/* Action buttons — for pending compliance */}
          {localStatus === "pending_compliance" && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setLocalStatus("approved")}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Approve
              </button>
              <button
                onClick={() => setLocalStatus("rejected")}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-semibold rounded-xl transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 text-xs font-semibold rounded-xl transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                Request Info
              </button>
            </div>
          )}

          {localStatus === "approved" && (
            <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 rounded-xl px-4 py-3">
              <CheckCircle2 className="w-4 h-4" />
              Approved · Ready for execution
            </div>
          )}

          {localStatus === "rejected" && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 rounded-xl px-4 py-3">
              <XCircle className="w-4 h-4" />
              Rejected · RM notified
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function EscalationQueue({ advisorId, isMockMode = true }: EscalationQueueProps) {
  const [filter, setFilter] = useState<ActionStatus | "all">("all")
  const [expandedId, setExpandedId] = useState<string | null>("act-001")

  const allActions = advisorId === "all"
    ? MOCK_ACTION_PROPOSALS
    : MOCK_ACTION_PROPOSALS.filter((a) => a.rm_id === advisorId)

  const filtered = filter === "all" ? allActions : allActions.filter((a) => a.status === filter)

  const counts = {
    all: allActions.length,
    pending_compliance: allActions.filter((a) => a.status === "pending_compliance").length,
    approved: allActions.filter((a) => a.status === "approved").length,
    draft: allActions.filter((a) => a.status === "draft").length,
    executed: allActions.filter((a) => a.status === "executed").length,
  }

  const sortedFiltered = [...filtered].sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
    const statusOrder = { pending_compliance: 0, approved: 1, draft: 2, executed: 3, rejected: 4 }
    if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status]
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Action Pipeline</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {counts.pending_compliance > 0
                ? `${counts.pending_compliance} action${counts.pending_compliance > 1 ? "s" : ""} pending compliance approval`
                : "All actions are up to date"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <Zap className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Compliance alert */}
        {counts.pending_compliance > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                {counts.pending_compliance} action{counts.pending_compliance > 1 ? "s" : ""} require compliance sign-off
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                {allActions.filter((a) => a.priority === "urgent" && a.status === "pending_compliance").length > 0
                  ? "Urgent actions present — review immediately"
                  : "Review and approve or reject to unblock the RM"}
              </p>
            </div>
          </div>
        )}

        {/* Status filter tabs */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm w-fit flex-wrap">
          {([
            { value: "all", label: "All" },
            { value: "pending_compliance", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "draft", label: "Draft" },
            { value: "executed", label: "Executed" },
          ] as const).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === value
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                filter === value ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              }`}>
                {counts[value as keyof typeof counts] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Action cards */}
        {sortedFiltered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <CheckCheck className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">No actions in this category</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedFiltered.map((action) => (
              <ActionCard
                key={action.id}
                action={action}
                isExpanded={expandedId === action.id}
                onToggle={() => setExpandedId(expandedId === action.id ? null : action.id)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
