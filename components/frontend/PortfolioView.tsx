"use client"

import React, { useState } from "react"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Building2,
} from "lucide-react"
import type { UserProfile } from "@/lib/api"
import {
  MOCK_INSTITUTIONAL_CLIENTS,
  formatAum,
  formatReturn,
  formatAlpha,
  type InstitutionalHolding,
} from "@/lib/institutionalMock"

// ─── Props ────────────────────────────────────────────────────────────────────

interface PortfolioViewProps {
  selectedProfile: UserProfile | null
  onBack: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type TimeRange = "YTD" | "1Y" | "3Y" | "SI"

// ─── Allocation Bar ───────────────────────────────────────────────────────────

function AllocationBar({ actual, target, color = "#0d9488" }: { actual: number; target: number; color?: string }) {
  const deviation = actual - target
  return (
    <div className="space-y-1.5">
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${Math.min(actual, 100)}%`, backgroundColor: color }} />
        <div className="absolute top-0 h-full w-px bg-gray-400/60" style={{ left: `${Math.min(target, 100)}%` }} />
      </div>
      <div className="flex justify-between text-[11px]">
        <span className="text-gray-500">Target: {target}%</span>
        <span className={deviation > 0.5 ? "text-emerald-600" : deviation < -0.5 ? "text-red-600" : "text-gray-400"}>
          {deviation > 0 ? "+" : ""}{deviation.toFixed(1)}% vs target
        </span>
      </div>
    </div>
  )
}

// ─── Asset Class Colors ───────────────────────────────────────────────────────

const assetColors: Record<string, string> = {
  "US Equity": "#0d9488",
  "International Equity": "#0ea5e9",
  "Global Equity": "#0d9488",
  "Fixed Income": "#6366f1",
  "Alternatives": "#8b5cf6",
  "Money Market": "#64748b",
}

function getColor(assetClass: string): string {
  return assetColors[assetClass] ?? "#94a3b8"
}

// ─── Performance Table ────────────────────────────────────────────────────────

function PerfRow({ client }: { client: ReturnType<typeof MOCK_INSTITUTIONAL_CLIENTS[0]["holdings"][0]["ytd_return"] extends number ? any : any> }) {
  return null
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PortfolioView({ onBack }: PortfolioViewProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>("YTD")
  const [expandedAssetClass, setExpandedAssetClass] = useState<string | null>(null)

  const client = MOCK_INSTITUTIONAL_CLIENTS[0]

  // Group holdings by asset class
  const grouped = client.holdings.reduce<Record<string, InstitutionalHolding[]>>((acc, h) => {
    if (!acc[h.asset_class]) acc[h.asset_class] = []
    acc[h.asset_class].push(h)
    return acc
  }, {})

  const assetClassSummary = Object.entries(grouped).map(([cls, holdings]) => ({
    asset_class: cls,
    total_allocation: holdings.reduce((s, h) => s + h.allocation_pct, 0),
    total_benchmark: holdings.reduce((s, h) => s + h.benchmark_allocation_pct, 0),
    total_value: holdings.reduce((s, h) => s + h.value, 0),
    weighted_return: holdings.reduce((s, h) => s + h.ytd_return * (h.allocation_pct / holdings.reduce((ss, hh) => ss + hh.allocation_pct, 0)), 0),
    holdings,
  }))

  // Performance by range (mock data)
  const perfByRange: Record<TimeRange, { portfolio: number; benchmark: number }> = {
    YTD: { portfolio: client.ytd_return, benchmark: client.benchmark_return },
    "1Y": { portfolio: 9.2, benchmark: 8.8 },
    "3Y": { portfolio: 8.4, benchmark: 7.9 },
    SI: { portfolio: client.inception_return, benchmark: client.inception_benchmark_return },
  }

  const perf = perfByRange[selectedRange]
  const alpha = Math.round((perf.portfolio - perf.benchmark) * 100)

  return (
    <div className="flex-1 overflow-y-auto">
      {/* ── Header ── */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:block">Overview</span>
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-400" />
            <h2 className="text-base font-bold text-gray-900">{client.short_name} — Portfolio</h2>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 space-y-5">

        {/* ── Performance Banner ── */}
        <div className={`rounded-2xl p-6 ${alpha >= 0 ? "bg-gradient-to-r from-teal-800 to-teal-600" : "bg-gradient-to-r from-red-800 to-red-600"} text-white`}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-white/70 text-sm">Performance vs Benchmark</p>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl font-bold">{formatReturn(perf.portfolio)}</span>
                <span className="text-white/60">vs {formatReturn(perf.benchmark)} benchmark</span>
              </div>
              <p className="text-white/60 text-xs mt-1">{client.benchmark}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-base font-bold bg-white/15`}>
                {alpha >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                {formatAlpha(Math.abs(alpha))} alpha
              </div>
              {/* Time range selector */}
              <div className="flex gap-1">
                {(["YTD", "1Y", "3Y", "SI"] as TimeRange[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRange(r)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      selectedRange === r ? "bg-white text-teal-800" : "bg-white/10 text-white/80 hover:bg-white/20"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── AUM Summary ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total AUM", value: formatAum(client.aum), sub: "Market value" },
            { label: "Annual Fee", value: `${client.annual_fee_bps}bps`, sub: formatAum(client.fee_revenue) + " revenue" },
            { label: "Since Inception", value: formatReturn(client.inception_return), sub: `vs ${formatReturn(client.inception_benchmark_return)} benchmark` },
            { label: "Relationship Start", value: new Date(client.onboarded_date).getFullYear().toString(), sub: `${new Date().getFullYear() - new Date(client.onboarded_date).getFullYear()} years` },
          ].map((m) => (
            <div key={m.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 font-medium">{m.label}</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{m.value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{m.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Holdings by Asset Class ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Holdings vs Mandate</h3>
            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-teal-500" /> Actual</span>
              <span className="flex items-center gap-1"><span className="inline-block w-px h-3 bg-gray-400" /> Target</span>
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {assetClassSummary.map((group) => {
              const isExpanded = expandedAssetClass === group.asset_class
              const color = getColor(group.asset_class)
              return (
                <div key={group.asset_class}>
                  {/* Asset class header row */}
                  <button
                    onClick={() => setExpandedAssetClass(isExpanded ? null : group.asset_class)}
                    className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors text-left"
                  >
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-900">{group.asset_class}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-900">{group.total_allocation.toFixed(1)}%</span>
                          <span className="text-xs text-gray-400">{formatAum(group.total_value)}</span>
                          <div className={`flex items-center gap-0.5 text-xs font-semibold ${
                            group.weighted_return >= 0 ? "text-emerald-600" : "text-red-600"
                          }`}>
                            {group.weighted_return >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                            {formatReturn(group.weighted_return)} YTD
                          </div>
                        </div>
                      </div>
                      <AllocationBar actual={group.total_allocation} target={group.total_benchmark} color={color} />
                    </div>
                    <span className={`text-[11px] text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}>▾</span>
                  </button>

                  {/* Expanded sub-holdings */}
                  {isExpanded && (
                    <div className="bg-gray-50/60 border-t border-gray-100 divide-y divide-gray-100">
                      {group.holdings.map((h, i) => (
                        <div key={i} className="px-5 py-3.5 flex items-center gap-4">
                          <div className="w-3 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{h.description}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {h.ticker && (
                                    <span className="text-[11px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{h.ticker}</span>
                                  )}
                                  <span className="text-[11px] text-gray-400">{h.sub_class}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 flex-shrink-0">
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-gray-900">{h.allocation_pct.toFixed(1)}%</p>
                                  <p className="text-[11px] text-gray-400">{formatAum(h.value)}</p>
                                </div>
                                <div className={`text-xs font-semibold ${
                                  h.ytd_return >= h.ytd_benchmark_return ? "text-emerald-600" : "text-red-600"
                                }`}>
                                  {formatReturn(h.ytd_return)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Footer — total */}
          <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Total Portfolio</span>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-gray-900">100.0%</span>
              <span className="text-sm font-semibold text-gray-600">{formatAum(client.aum)}</span>
              <div className={`flex items-center gap-1 text-sm font-bold ${client.ytd_return >= client.benchmark_return ? "text-emerald-600" : "text-red-600"}`}>
                {client.ytd_return >= client.benchmark_return ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {formatReturn(client.ytd_return)} YTD
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
