"use client"

import React, { useState, useMemo } from "react"
import {
  Search,
  Building2,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import type { ClientProfile } from "@/lib/types"
import {
  MOCK_INSTITUTIONAL_CLIENTS,
  MOCK_RMS,
  getClientsByRM,
  formatAum,
  formatReturn,
  clientTypeLabel,
  type InstitutionalClientType,
  type RelationshipStatus,
} from "@/lib/institutionalMock"

// ─── Props ────────────────────────────────────────────────────────────────────

interface ClientListViewProps {
  advisorId: string
  onSelectClient: (client: ClientProfile) => void
  isMockMode?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: RelationshipStatus }) {
  const config = {
    healthy: { label: "Healthy", cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
    needs_attention: { label: "Needs Attention", cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
    at_risk: { label: "At Risk", cls: "bg-red-50 text-red-700 ring-1 ring-red-200" },
  }
  const { label, cls } = config[status]
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
}

function TypeBadge({ type }: { type: InstitutionalClientType }) {
  const colors: Record<InstitutionalClientType, string> = {
    public_pension: "bg-blue-50 text-blue-700",
    endowment: "bg-indigo-50 text-indigo-700",
    family_office: "bg-purple-50 text-purple-700",
    corporate_treasury: "bg-slate-50 text-slate-700",
    sovereign_fund: "bg-teal-50 text-teal-700",
    foundation: "bg-emerald-50 text-emerald-700",
  }
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colors[type]}`}>
      {clientTypeLabel(type)}
    </span>
  )
}

function AlphaTag({ bps }: { bps: number }) {
  const pos = bps >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded ${
      pos ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
    }`}>
      {pos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(bps)}bps
    </span>
  )
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ClientListView({ advisorId, onSelectClient }: ClientListViewProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<RelationshipStatus | "all">("all")
  const [typeFilter, setTypeFilter] = useState<InstitutionalClientType | "all">("all")
  const [sortBy, setSortBy] = useState<"aum" | "alpha" | "review" | "status">("status")
  const [showFilters, setShowFilters] = useState(false)

  const baseClients = advisorId === "all"
    ? MOCK_INSTITUTIONAL_CLIENTS
    : getClientsByRM(advisorId)

  const rm = MOCK_RMS.find((r) => r.id === advisorId)

  const filtered = useMemo(() => {
    let list = [...baseClients]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.short_name.toLowerCase().includes(q) ||
          c.primary_contact.name.toLowerCase().includes(q) ||
          clientTypeLabel(c.type).toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "all") list = list.filter((c) => c.status === statusFilter)
    if (typeFilter !== "all") list = list.filter((c) => c.type === typeFilter)

    list.sort((a, b) => {
      if (sortBy === "aum") return b.aum - a.aum
      if (sortBy === "alpha") return b.active_return_bps - a.active_return_bps
      if (sortBy === "review") return new Date(a.next_review).getTime() - new Date(b.next_review).getTime()
      const order = { at_risk: 0, needs_attention: 1, healthy: 2 }
      return order[a.status] - order[b.status]
    })
    return list
  }, [baseClients, search, statusFilter, typeFilter, sortBy])

  const totalAum = filtered.reduce((s, c) => s + c.aum, 0)

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Institutional Clients</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {filtered.length} relationship{filtered.length !== 1 ? "s" : ""} · {formatAum(totalAum)} AUM
              {rm ? ` · ${rm.name}` : ""}
            </p>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, contact, or type…"
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-colors ${
              showFilters ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Filter Row */}
        {showFilters && (
          <div className="flex flex-wrap gap-4 bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Status:</span>
              <div className="flex gap-1">
                {(["all", "healthy", "needs_attention", "at_risk"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      statusFilter === s ? "bg-blue-100 text-blue-700" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {s === "all" ? "All" : s === "needs_attention" ? "Attention" : s === "at_risk" ? "At Risk" : "Healthy"}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Type:</span>
              <div className="flex flex-wrap gap-1">
                {(["all", "public_pension", "endowment", "family_office", "corporate_treasury", "sovereign_fund", "foundation"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      typeFilter === t ? "bg-blue-100 text-blue-700" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {t === "all" ? "All" : clientTypeLabel(t as InstitutionalClientType)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-gray-500 font-medium">Sort:</span>
              <div className="flex gap-1">
                {(["status", "aum", "alpha", "review"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      sortBy === s ? "bg-blue-100 text-blue-700" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {s === "status" ? "Status" : s === "aum" ? "AUM" : s === "alpha" ? "Alpha" : "Review"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick status chips */}
        <div className="flex gap-2 flex-wrap">
          {([
            { label: "All", value: "all" as const, count: baseClients.length },
            { label: "At Risk", value: "at_risk" as const, count: baseClients.filter((c) => c.status === "at_risk").length },
            { label: "Needs Attention", value: "needs_attention" as const, count: baseClients.filter((c) => c.status === "needs_attention").length },
            { label: "Healthy", value: "healthy" as const, count: baseClients.filter((c) => c.status === "healthy").length },
          ]).map(({ label, value, count }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value === statusFilter ? "all" : value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                statusFilter === value
                  ? value === "at_risk"
                    ? "bg-red-50 border-red-200 text-red-700"
                    : value === "needs_attention"
                    ? "bg-amber-50 border-amber-200 text-amber-700"
                    : value === "healthy"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {label}
              <span className="text-[10px] font-bold opacity-70">{count}</span>
            </button>
          ))}
        </div>

        {/* Client Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Table header — desktop */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50/80 border-b border-gray-100">
            {["Client", "AUM", "YTD Return", "Alpha", "Next Review", "Status", ""].map((h) => (
              <span key={h} className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</span>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Building2 className="w-10 h-10 text-gray-200 mb-3" />
              <p className="text-sm font-medium text-gray-500">No clients match your filters</p>
              <button onClick={() => { setSearch(""); setStatusFilter("all"); setTypeFilter("all") }} className="mt-2 text-xs text-blue-600 hover:text-blue-800">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((client) => {
                const days = daysUntil(client.next_review)
                return (
                  <button
                    key={client.id}
                    onClick={() => onSelectClient({ id: client.id } as any)}
                    className="w-full text-left hover:bg-blue-50/30 transition-colors group"
                  >
                    {/* Desktop */}
                    <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-blue-50 border border-slate-200/40 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{client.short_name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <TypeBadge type={client.type} />
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{formatAum(client.aum)}</p>
                        <p className="text-[11px] text-gray-400">{client.annual_fee_bps}bps</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          {client.ytd_return >= client.benchmark_return
                            ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                            : <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
                          <span className={`text-sm font-semibold ${client.ytd_return >= client.benchmark_return ? "text-gray-900" : "text-red-700"}`}>
                            {formatReturn(client.ytd_return)}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400">vs {formatReturn(client.benchmark_return)}</p>
                      </div>
                      <div><AlphaTag bps={client.active_return_bps} /></div>
                      <div>
                        <p className={`text-sm font-medium ${days <= 7 ? "text-red-700" : days <= 21 ? "text-amber-700" : "text-gray-700"}`}>
                          {formatDate(client.next_review)}
                        </p>
                        <p className={`text-[11px] ${days <= 7 ? "text-red-500" : "text-gray-400"}`}>
                          {days <= 0 ? "Today" : `in ${days}d`}
                        </p>
                      </div>
                      <div>
                        <StatusBadge status={client.status} />
                        {client.open_actions > 0 && (
                          <p className="text-[11px] text-amber-600 mt-1">{client.open_actions} action{client.open_actions > 1 ? "s" : ""}</p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </div>

                    {/* Mobile */}
                    <div className="md:hidden flex items-center gap-3 px-4 py-3.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-blue-50 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900 truncate">{client.short_name}</p>
                          <StatusBadge status={client.status} />
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{formatAum(client.aum)} · {formatReturn(client.ytd_return)} YTD</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <AlphaTag bps={client.active_return_bps} />
                        <p className={`text-[11px] ${days <= 7 ? "text-red-500" : "text-gray-400"}`}>{formatDate(client.next_review)}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
