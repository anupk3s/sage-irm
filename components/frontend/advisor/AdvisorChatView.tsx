"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import {
  Send,
  Sparkles,
  Building2,
  TrendingUp,
  Shield,
  BarChart3,
  FileText,
  AlertTriangle,
  ChevronDown,
  Loader2,
  User,
  Bot,
} from "lucide-react"
import type { AdvisorProfile, ClientProfile } from "@/lib/types"
import {
  MOCK_INSTITUTIONAL_CLIENTS,
  formatAum,
  formatReturn,
  formatAlpha,
  getClientsByRM,
} from "@/lib/institutionalMock"

// ─── Props ────────────────────────────────────────────────────────────────────

interface AdvisorChatViewProps {
  advisor: AdvisorProfile
  clients: ClientProfile[]
  isMockMode?: boolean
  embedded?: boolean
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string
  role: "user" | "assistant" | "status"
  content: string
  timestamp: Date
}

// ─── Quick Prompts ────────────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  { label: "Book Overview", prompt: "Give me a health summary of my full book of business.", icon: BarChart3 },
  { label: "Underperformers", prompt: "Which clients are underperforming their benchmark? Summarize the key drivers.", icon: TrendingUp },
  { label: "Retention Risk", prompt: "Which relationships are at risk of redemption and what should I do?", icon: AlertTriangle },
  { label: "Opportunities", prompt: "What are the top pipeline opportunities I should prioritize this quarter?", icon: Sparkles },
  { label: "Compliance Check", prompt: "Summarize the pending compliance actions and their SLA status.", icon: Shield },
  { label: "Client Brief", prompt: "Draft a pre-meeting brief for my next client review.", icon: FileText },
]

// ─── Mock AI Responses ────────────────────────────────────────────────────────

function getMockResponse(message: string): string {
  const msg = message.toLowerCase()

  if (msg.includes("health") || msg.includes("book") || msg.includes("overview")) {
    return `**Book of Business Health Summary**

Your book currently manages **$16.2B AUM** across 7 institutional relationships generating **$40.2M in annual revenue**.

**Status breakdown:**
- ✅ 5 relationships healthy (Meridian, Pacific NW, Cascade, NorthStar, Oakdale)
- ⚠️ 1 needs attention (Hartwell Endowment — -160bps YTD vs benchmark)
- 🔴 1 at risk (Vandermeer Family Office — -240bps, potential redemption)

**Weighted book alpha:** +18bps YTD (AUM-weighted). Strong contributors are NorthStar (+40bps) and Pacific NW MERS (+60bps), offsetting the Hartwell and Vandermeer drag.

**Priority actions:**
1. Hartwell compliance review for emergency rebalance (SLA: April 23)
2. Vandermeer retention meeting on April 30 — escalate to MD
3. Meridian alternatives expansion — $500M opportunity for Q3`
  }

  if (msg.includes("underperform") || msg.includes("benchmark")) {
    return `**Underperforming Relationships**

Two clients are currently below benchmark:

**🔴 Vandermeer Family Office** — -240bps YTD
- Portfolio return: +3.8% vs benchmark +6.2%
- Primary driver: Multi-strategy hedge fund sleeve at -1.2% YTD (worst contributor)
- Secondary: Equity underweight vs benchmark allocation
- Action: Alternatives restructure proposal pending compliance. April 30 meeting is critical.

**⚠️ Hartwell University Endowment** — -160bps YTD
- Portfolio return: +5.2% vs benchmark +6.8%
- Primary driver: US equity underweight (-500bps vs benchmark) missing tech sector rally
- ESG constraints limit full alignment with MSCI USA benchmark
- Action: Emergency rebalance proposal in compliance queue — **SLA April 23**

All other relationships are outperforming or in line with their respective benchmarks.`
  }

  if (msg.includes("retention") || msg.includes("risk") || msg.includes("redemption")) {
    return `**Retention Risk Analysis**

**🔴 Critical: Vandermeer Family Office ($425M)**
- Status: At risk of full redemption
- Issue: -240bps underperformance since inception, deteriorating in 2026
- Trigger: Principal Henrik Vandermeer mentioned Goldman Sachs and Ares in April 5 call
- Timeline: Decision expected by May 2026
- **Recommended actions:**
  1. Bring Senior Managing Director to April 30 meeting
  2. Present alternatives restructure plan (Ares Direct Lending proposal in compliance)
  3. Offer fee concession analysis as a last resort
  4. Prepare performance attribution showing ESG/macro constraints vs. active manager decisions

Probability of retention: **45%** — aggressive intervention required.

No other relationships currently flagged for redemption risk.`
  }

  if (msg.includes("opportunit") || msg.includes("pipeline") || msg.includes("priorit")) {
    return `**Pipeline Priorities — Q2 2026**

**Total pipeline value: $1.576B AUM / $8.5M revenue**

Ranked by probability × impact:

1. **Pacific NW MERS — Infrastructure ($86M)** · 80% probability · Q2 2026
   Highest conviction. ERISA requirement creates genuine need. Strong relationship. Submit formal proposal at June 10 review.

2. **Meridian Pension — Alternatives Expansion ($500M)** · 70% probability · Q3 2026
   Board-approved mandate to increase alternatives from 10% to 17%. Present manager lineup at May 15 annual review. High revenue impact: +$2.5M.

3. **NorthStar SWF — Private Credit ($340M)** · 55% probability · Q4 2026
   CIO expressed strong interest. Prepare due diligence package for May 30 review.

4. **Western States University RFP ($650M)** · 30% probability · Q3 2026
   RFP response due May 1. Use Oakdale Foundation as reference for ESG capabilities.

5. **Vandermeer Retention ($425M)** · 45% probability of retaining
   Treat as the priority that offsets other wins — losing this negates all Q2 pipeline gains.`
  }

  if (msg.includes("compliance") || msg.includes("action") || msg.includes("sla")) {
    return `**Compliance Action Status**

**2 actions pending compliance approval:**

1. **Hartwell — Emergency Equity Rebalance** 🔴 URGENT
   - SLA: April 23, 2026 (2 days remaining)
   - Risk level: Medium
   - Trade size: $35.6M
   - Checklist: 4/5 items passed (missing compliance sign-off only)
   - **Recommend: Approve today**

2. **Vandermeer — Ares Direct Lending ($42.5M)** ⚠️ HIGH
   - SLA: April 26, 2026 (5 days)
   - Risk level: High (alternatives, 3-year lock-up)
   - Checklist: 2/6 items passed (lock-up disclosure, IPS amendment, CRO sign-off pending)
   - **Recommend: Resolve outstanding items before approval**

**1 approved action awaiting execution:**
- Cascade Treasury — Duration Extension ($315M) · Execution target: April 22

**2 draft actions** not yet in compliance queue (Meridian ESG overlay, Pacific NW infrastructure).`
  }

  if (msg.includes("brief") || msg.includes("meeting") || msg.includes("prep")) {
    return `**Pre-Meeting Brief — Upcoming Reviews**

**April 28 — Hartwell University Endowment** ⚠️ PRIORITY
- CIO: Dr. Patricia Vance
- Agenda: YTD performance review, emergency rebalance update, ESG constraint discussion
- Key message: Underperformance driven by ESG constraints (tech underweight), not manager selection. Rebalance in progress.
- Talking points: Attribution analysis, peer ESG endowment comparison, forward-looking outlook
- Risk: Investment Committee may request manager review if explanation insufficient

**April 30 — Vandermeer Family Office** 🔴 CRITICAL
- Principal: Henrik Vandermeer
- Agenda: Retention presentation, alternatives restructure proposal
- Key message: Acknowledge underperformance. Present concrete remediation plan. Show commitment.
- Bring: Senior Managing Director, detailed attribution, Ares Direct Lending proposal
- Target outcome: 6-month extension with mandate changes

**May 15 — Meridian State Teachers Pension** ✅ POSITIVE
- CIO: Linda Weston
- Agenda: Annual review, alternatives expansion discussion
- Opportunity: $500M alternatives mandate — present manager lineup
- Prep: PE, real assets, hedge fund manager comparisons`
  }

  return `I've analyzed your question about "${message}".

As your institutional intelligence assistant, I can help you with:
- **Book health analysis** — portfolio performance, alpha attribution, relationship status
- **Client insights** — underperformance drivers, mandate alignment, contact history
- **Action pipeline** — compliance status, SLA tracking, approval workflows
- **Opportunity pipeline** — deal prioritization, pipeline value, win probability
- **Meeting preparation** — pre-meeting briefs, talking points, agenda suggestions
- **Compliant drafting** — client communications, performance commentary, reports

Try one of the quick prompts below or ask me something specific about a client or your book.`
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdvisorChatView({ advisor, isMockMode = true, embedded = false }: AdvisorChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Good morning, ${advisor.name.split(" ")[0]}. I'm your institutional intelligence assistant.\n\nI have full context on your book of business — ${MOCK_INSTITUTIONAL_CLIENTS.length} relationships, $16.2B AUM, and your current action pipeline. How can I help you today?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [selectedClient, setSelectedClient] = useState<string>("all")
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const clients = getClientsByRM(advisor.id)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsStreaming(true)

    // Status message
    const statusId = (Date.now() + 1).toString()
    setMessages((prev) => [...prev, { id: statusId, role: "status", content: "Analyzing your book…", timestamp: new Date() }])

    await new Promise((r) => setTimeout(r, 1200))

    setMessages((prev) => prev.filter((m) => m.id !== statusId))

    // Stream the response word by word
    const responseText = getMockResponse(text)
    const assistantId = (Date.now() + 2).toString()

    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "", timestamp: new Date() }])

    const words = responseText.split(" ")
    for (let i = 0; i < words.length; i += 4) {
      await new Promise((r) => setTimeout(r, 40))
      const chunk = words.slice(i, i + 4).join(" ") + " "
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m))
      )
    }

    setIsStreaming(false)
  }, [isStreaming])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  // Simple markdown-like renderer
  function renderContent(text: string) {
    const lines = text.split("\n")
    return lines.map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return <p key={i} className="font-bold text-gray-900 mt-3 mb-1 first:mt-0">{line.slice(2, -2)}</p>
      }
      if (line.startsWith("- ") || line.startsWith("• ") || line.startsWith("✅ ") || line.startsWith("⚠️ ") || line.startsWith("🔴 ")) {
        const content = line.replace(/^[•\-✅⚠️🔴]\s?/, "")
        const parts = content.split(/\*\*(.*?)\*\*/g)
        return (
          <div key={i} className="flex items-start gap-2 my-0.5">
            <span className="text-gray-400 mt-0.5 flex-shrink-0">{line.match(/^[✅⚠️🔴]/) ? line[0] : "·"}</span>
            <p className="text-sm text-gray-700">
              {parts.map((p, j) => j % 2 === 1 ? <strong key={j} className="font-semibold text-gray-900">{p}</strong> : p)}
            </p>
          </div>
        )
      }
      if (line.match(/^\d+\. /)) {
        const parts = line.slice(line.indexOf(". ") + 2).split(/\*\*(.*?)\*\*/g)
        return (
          <div key={i} className="flex items-start gap-2 my-0.5">
            <span className="text-gray-400 text-xs mt-1 flex-shrink-0 font-semibold">{line.match(/^\d+/)![0]}.</span>
            <p className="text-sm text-gray-700">
              {parts.map((p, j) => j % 2 === 1 ? <strong key={j} className="font-semibold text-gray-900">{p}</strong> : p)}
            </p>
          </div>
        )
      }
      if (line === "") return <div key={i} className="h-1" />
      const parts = line.split(/\*\*(.*?)\*\*/g)
      return (
        <p key={i} className="text-sm text-gray-700 leading-relaxed">
          {parts.map((p, j) => j % 2 === 1 ? <strong key={j} className="font-semibold text-gray-900">{p}</strong> : p)}
        </p>
      )
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-5 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-800 to-blue-900 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-200" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Sage Intelligence</p>
              <p className="text-[11px] text-gray-400">Institutional RM Assistant</p>
            </div>
          </div>
          {/* Client context selector */}
          <div className="relative">
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="appearance-none text-xs bg-gray-50 border border-gray-200 text-gray-700 pl-3 pr-7 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="all">All Clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.short_name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => {
          if (msg.role === "status") {
            return (
              <div key={msg.id} className="flex items-center gap-2 text-xs text-gray-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {msg.content}
              </div>
            )
          }

          if (msg.role === "user") {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[80%] bg-gradient-to-br from-slate-800 to-blue-900 text-white px-4 py-3 rounded-2xl rounded-br-sm text-sm">
                  {msg.content}
                </div>
              </div>
            )
          }

          return (
            <div key={msg.id} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-slate-100 to-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-blue-700" />
              </div>
              <div className="flex-1 bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm space-y-0.5">
                {renderContent(msg.content)}
                {msg.content === "" && (
                  <span className="inline-block w-1 h-4 bg-blue-500 animate-pulse" />
                )}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="flex-shrink-0 px-4 pb-2">
          <div className="grid grid-cols-2 gap-2">
            {QUICK_PROMPTS.map(({ label, prompt, icon: Icon }) => (
              <button
                key={label}
                onClick={() => sendMessage(prompt)}
                className="flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-800 transition-all text-left shadow-sm"
              >
                <Icon className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2 border-t border-gray-100 bg-white">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your book, clients, or actions…"
            rows={1}
            className="flex-1 resize-none px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-all"
            style={{ maxHeight: "120px" }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-slate-800 to-blue-900 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:from-slate-700 hover:to-blue-800 transition-all flex-shrink-0"
          >
            {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-2">
          For informational purposes only. All actions require compliance review before execution.
        </p>
      </div>
    </div>
  )
}
