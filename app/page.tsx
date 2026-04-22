"use client"

import { useState, useEffect } from "react"
import {
  Building2,
  LayoutDashboard,
  Users,
  Bell,
  TrendingUp,
  Shield,
  Scale,
  ChevronDown,
  Wifi,
  WifiOff,
  Briefcase,
  BookOpen,
  CheckSquare,
  FileText,
  BarChart3,
} from "lucide-react"
import { setApiMode } from "../lib/api"
import type { UserRole } from "@/lib/types"
import { MOCK_RMS, MOCK_INSTITUTIONAL_CLIENTS, getClientById, type InstitutionalClient } from "@/lib/institutionalMock"
import { AdvisorDashboard } from "@/components/frontend/advisor/AdvisorDashboard"
import { ClientListView } from "@/components/frontend/advisor/ClientListView"
import { ClientDetailView } from "@/components/frontend/advisor/ClientDetailView"
import { EscalationQueue } from "@/components/frontend/advisor/EscalationQueue"
import { AdvisorChatView } from "@/components/frontend/advisor/AdvisorChatView"
import { AdvisorScenarioView } from "@/components/frontend/advisor/AdvisorScenarioView"
import { AdminDashboard } from "@/components/frontend/admin/AdminDashboard"
import { DashboardView } from "@/components/frontend/DashboardView"
import { PortfolioView } from "@/components/frontend/PortfolioView"
import { ActivityView } from "@/components/frontend/ActivityView"
import { SageChatPane, SageFloatingButton } from "@/components/frontend/shared/SageChatPane"
import { prefetchWorkIQContext } from "@/lib/advisorApi"

// ─── Types ───────────────────────────────────────────────────────────────────

type RMView = "advisor-dashboard" | "advisor-clients" | "advisor-client-detail" | "advisor-escalations" | "advisor-scenarios"
type ClientView = "dashboard" | "portfolio" | "activity"
type ComplianceView = "admin-dashboard" | "admin-compliance" | "admin-regulatory" | "admin-users"

interface NavItem {
  id: RMView | ClientView | ComplianceView
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function SageInstitutionalApp() {
  // Persona state
  const [currentPersona, setCurrentPersona] = useState<UserRole>("advisor")

  // RM state
  const [rmView, setRmView] = useState<RMView>("advisor-dashboard")
  const [currentRM, setCurrentRM] = useState(MOCK_RMS[0])
  const [selectedClient, setSelectedClient] = useState<InstitutionalClient | null>(null)

  // Client portal state
  const [clientView, setClientView] = useState<ClientView>("dashboard")
  const [portalClient, setPortalClient] = useState(MOCK_INSTITUTIONAL_CLIENTS[0])

  // Compliance state
  const [complianceView, setComplianceView] = useState<ComplianceView>("admin-dashboard")

  // Shared state
  const [isMockMode, setIsMockMode] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isChatPaneOpen, setIsChatPaneOpen] = useState(false)

  // Derived: pending compliance count for badge
  const pendingComplianceCount = 2

  const rmNavItems: NavItem[] = [
    { id: "advisor-dashboard", label: "Book", icon: BookOpen },
    { id: "advisor-clients", label: "Clients", icon: Users },
    { id: "advisor-scenarios", label: "Opportunities", icon: TrendingUp },
    { id: "advisor-escalations", label: "Actions", icon: CheckSquare, badge: pendingComplianceCount },
  ]

  const clientNavItems: NavItem[] = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "portfolio", label: "Portfolio", icon: BarChart3 },
    { id: "activity", label: "Activity", icon: FileText },
  ]

  const complianceNavItems: NavItem[] = [
    { id: "admin-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "admin-compliance", label: "Actions", icon: CheckSquare, badge: pendingComplianceCount },
    { id: "admin-regulatory", label: "Rules", icon: Scale },
    { id: "admin-users", label: "Audit", icon: FileText },
  ]

  const navItems =
    currentPersona === "advisor"
      ? rmNavItems
      : currentPersona === "client"
      ? clientNavItems
      : complianceNavItems

  const activeView =
    currentPersona === "advisor"
      ? rmView
      : currentPersona === "client"
      ? clientView
      : complianceView

  const setActiveView = (view: string) => {
    if (currentPersona === "advisor") setRmView(view as RMView)
    else if (currentPersona === "client") setClientView(view as ClientView)
    else setComplianceView(view as ComplianceView)
  }

  const handlePersonaChange = (persona: UserRole) => {
    setCurrentPersona(persona)
    setIsChatPaneOpen(false)
    if (persona === "advisor") setRmView("advisor-dashboard")
    else if (persona === "client") setClientView("dashboard")
    else setComplianceView("admin-dashboard")
  }

  useEffect(() => {
    setApiMode(isMockMode ? "mock" : "live")
    prefetchWorkIQContext()
  }, [isMockMode])

  const handleClientSelect = (client: InstitutionalClient) => {
    setSelectedClient(client)
    setRmView("advisor-client-detail")
  }

  const handleBackFromDetail = () => {
    setSelectedClient(null)
    setRmView("advisor-clients")
  }

  const handleRMSwitch = (rmId: string) => {
    const rm = MOCK_RMS.find((r) => r.id === rmId)
    if (rm) {
      setCurrentRM(rm)
      setSelectedClient(null)
      setRmView("advisor-dashboard")
    }
    setShowDropdown(false)
  }

  // ── Header theming ──
  const getHeaderAccent = () => {
    if (currentPersona === "advisor") return "from-slate-900 to-blue-900"
    if (currentPersona === "admin") return "from-violet-900 to-violet-800"
    return "from-teal-900 to-teal-800"
  }

  const getIconColor = () => {
    if (currentPersona === "advisor") return "text-blue-400"
    if (currentPersona === "admin") return "text-violet-400"
    return "text-teal-400"
  }

  const getAccentClass = (active: boolean) => {
    if (!active) return "text-gray-500 hover:text-gray-700 hover:bg-white/50"
    if (currentPersona === "advisor") return "bg-white text-slate-900 shadow-sm border border-gray-100"
    if (currentPersona === "admin") return "bg-white text-violet-900 shadow-sm border border-gray-100"
    return "bg-white text-teal-900 shadow-sm border border-gray-100"
  }

  const getMobileActiveColor = () => {
    if (currentPersona === "advisor") return { text: "text-blue-700", bg: "bg-blue-50" }
    if (currentPersona === "admin") return { text: "text-violet-700", bg: "bg-violet-50" }
    return { text: "text-teal-700", bg: "bg-teal-50" }
  }

  const personaLabel = () => {
    if (currentPersona === "advisor") return currentRM.name
    if (currentPersona === "admin") return "Compliance"
    return portalClient.short_name
  }

  const personaSubtitle = () => {
    if (currentPersona === "advisor") return currentRM.title
    if (currentPersona === "admin") return "Compliance Officer"
    return "Client Portal"
  }

  const mobileColors = getMobileActiveColor()

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-gray-50/80 to-blue-50/30">
      {/* ── Header ── */}
      <header className="bg-white/95 border-b border-gray-100 sticky top-0 z-40 backdrop-blur-md flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5">
          <div className="flex items-center justify-between">

            {/* Logo + Title */}
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br ${getHeaderAccent()} rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/20`}>
                <Building2 className={`w-4 h-4 sm:w-5 sm:h-5 ${getIconColor()}`} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Sage Institutional</h1>
                <p className="text-[11px] text-gray-400 font-medium">{personaSubtitle()}</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
              {navItems.map(({ id, label, icon: Icon, badge }) => (
                <button
                  key={id}
                  onClick={() => setActiveView(id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${getAccentClass(activeView === id)}`}
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
            </nav>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              {/* Persona / Settings dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                    currentPersona === "advisor"
                      ? "bg-blue-50 hover:bg-blue-100"
                      : currentPersona === "admin"
                      ? "bg-violet-50 hover:bg-violet-100"
                      : "bg-teal-50 hover:bg-teal-100"
                  }`}
                >
                  {currentPersona === "advisor" ? (
                    <Briefcase className="w-4 h-4 text-blue-600" />
                  ) : currentPersona === "admin" ? (
                    <Shield className="w-4 h-4 text-violet-600" />
                  ) : (
                    <Building2 className="w-4 h-4 text-teal-600" />
                  )}
                  <span className={`text-sm font-medium hidden sm:block ${
                    currentPersona === "advisor" ? "text-blue-800" : currentPersona === "admin" ? "text-violet-800" : "text-teal-800"
                  }`}>
                    {personaLabel()}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
                </button>

                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">

                      {/* Persona switcher */}
                      <div className="p-3 border-b border-gray-100">
                        <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold px-1 mb-2">Switch View</p>
                        <div className="flex gap-1">
                          {[
                            { id: "advisor" as UserRole, label: "RM Portal", icon: Briefcase, color: "blue" },
                            { id: "client" as UserRole, label: "Client Portal", icon: Building2, color: "teal" },
                            { id: "admin" as UserRole, label: "Compliance", icon: Shield, color: "violet" },
                          ].map((p) => (
                            <button
                              key={p.id}
                              onClick={() => { handlePersonaChange(p.id); setShowDropdown(false) }}
                              className={`flex-1 flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-[11px] font-medium transition-colors ${
                                currentPersona === p.id
                                  ? `bg-${p.color}-100 text-${p.color}-700 ring-1 ring-${p.color}-200`
                                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              <p.icon className="w-4 h-4" />
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Mode Toggle */}
                      <div className="p-3 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 font-medium">API Mode</span>
                          <button
                            onClick={() => { const newMode = !isMockMode; setIsMockMode(newMode); setApiMode(newMode ? "mock" : "live") }}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                              isMockMode ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {isMockMode ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
                            {isMockMode ? "Demo" : "Live"}
                          </button>
                        </div>
                      </div>

                      {/* RM Switcher */}
                      {currentPersona === "advisor" && (
                        <div className="p-3 border-b border-gray-100">
                          <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold px-1 mb-2">Switch RM</p>
                          {MOCK_RMS.map((rm) => (
                            <button
                              key={rm.id}
                              onClick={() => handleRMSwitch(rm.id)}
                              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${
                                rm.id === currentRM.id ? "bg-blue-50 text-blue-800" : "hover:bg-gray-50 text-gray-700"
                              }`}
                            >
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-slate-200 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-blue-700">
                                  {rm.name.split(" ").map((n) => n[0]).join("")}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{rm.name}</p>
                                <p className="text-[11px] text-gray-400 truncate">{rm.title}</p>
                              </div>
                              {rm.id === currentRM.id && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Client Portal Switcher */}
                      {currentPersona === "client" && (
                        <div className="p-3 border-b border-gray-100">
                          <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold px-1 mb-2">Viewing As</p>
                          {MOCK_INSTITUTIONAL_CLIENTS.slice(0, 4).map((cl) => (
                            <button
                              key={cl.id}
                              onClick={() => { setPortalClient(cl); setShowDropdown(false) }}
                              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${
                                cl.id === portalClient.id ? "bg-teal-50 text-teal-800" : "hover:bg-gray-50 text-gray-700"
                              }`}
                            >
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center flex-shrink-0">
                                <span className="text-[10px] font-bold text-teal-700">
                                  {cl.short_name.slice(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{cl.short_name}</p>
                                <p className="text-[11px] text-gray-400 truncate">{cl.type.replace("_", " ")}</p>
                              </div>
                              {cl.id === portalClient.id && <div className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" />}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="p-3 bg-gray-50">
                        <p className="text-[11px] text-gray-400 px-1">{isMockMode ? "Using demo data" : "Connected to live API"}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Alert bell — RM & compliance */}
              {currentPersona !== "client" && (
                <button
                  className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                  onClick={() => currentPersona === "advisor" ? setRmView("advisor-escalations") : setComplianceView("admin-compliance")}
                >
                  <Bell className="w-5 h-5 text-gray-400" />
                  {pendingComplianceCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                      {pendingComplianceCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-hidden">

        {/* RM Portal Views */}
        {currentPersona === "advisor" && (
          <>
            {rmView === "advisor-dashboard" && (
              <AdvisorDashboard
                advisor={{ id: currentRM.id, name: currentRM.name, email: currentRM.email, role: "advisor", jurisdictions: ["US"], specializations: currentRM.specializations, bio: currentRM.bio, created_at: "2020-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" }}
                onNavigateToClients={() => setRmView("advisor-clients")}
                onNavigateToAppointments={() => setRmView("advisor-escalations")}
                onSelectClient={(c: any) => { const ic = getClientById(c.id); if (ic) handleClientSelect(ic) }}
                onRunScenarioAnalysis={() => setRmView("advisor-scenarios")}
                onOpenChat={() => setIsChatPaneOpen(true)}
                isMockMode={isMockMode}
              />
            )}
            {rmView === "advisor-clients" && (
              <ClientListView
                advisorId={currentRM.id}
                onSelectClient={(c: any) => { const ic = getClientById(c.id); if (ic) handleClientSelect(ic) }}
                isMockMode={isMockMode}
              />
            )}
            {rmView === "advisor-client-detail" && selectedClient && (
              <ClientDetailView
                client={selectedClient as any}
                advisorId={currentRM.id}
                onBack={handleBackFromDetail}
                isMockMode={isMockMode}
              />
            )}
            {rmView === "advisor-escalations" && (
              <EscalationQueue advisorId={currentRM.id} isMockMode={isMockMode} />
            )}
            {rmView === "advisor-scenarios" && (
              <AdvisorScenarioView
                advisor={{ id: currentRM.id, name: currentRM.name, email: currentRM.email, role: "advisor", jurisdictions: ["US"], specializations: currentRM.specializations, created_at: "2020-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" }}
                onSelectClient={(c: any) => { const ic = getClientById(c.id); if (ic) handleClientSelect(ic) }}
                onBack={() => setRmView("advisor-dashboard")}
                isMockMode={isMockMode}
              />
            )}
          </>
        )}

        {/* Client Portal Views */}
        {currentPersona === "client" && (
          <>
            {clientView === "dashboard" && (
              <DashboardView
                selectedProfile={null}
                onNavigate={(view) => {
                  if (view === "planning") setIsChatPaneOpen(true)
                  else setClientView(view as ClientView)
                }}
              />
            )}
            {clientView === "portfolio" && (
              <PortfolioView selectedProfile={null} onBack={() => setClientView("dashboard")} />
            )}
            {clientView === "activity" && (
              <ActivityView selectedProfile={null} onBack={() => setClientView("dashboard")} />
            )}
          </>
        )}

        {/* Compliance Views */}
        {currentPersona === "admin" && (
          <AdminDashboard
            admin={{
              id: "compliance-diana",
              email: "d.reyes@sageinstitutional.com",
              name: "Diana Reyes",
              role: "admin",
              permissions: ["manage_products", "review_compliance", "manage_users", "view_analytics"],
              created_at: "2021-01-01T00:00:00Z",
              updated_at: "2026-01-01T00:00:00Z",
            }}
            isMockMode={isMockMode}
          />
        )}
      </main>

      {/* ── Mobile Bottom Tabs ── */}
      <nav className="md:hidden bg-white border-t border-gray-100 backdrop-blur-md flex-shrink-0 safe-bottom">
        <div className="flex justify-around py-2 pb-3">
          {navItems.map(({ id, label, icon: Icon, badge }) => {
            const isActive = activeView === id
            return (
              <button
                key={id}
                onClick={() => setActiveView(id)}
                className={`relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200 ${
                  isActive ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${isActive ? mobileColors.bg : ""}`}>
                  <Icon className={`w-5 h-5 ${isActive ? mobileColors.text : ""}`} />
                </div>
                <span className={`text-[10px] font-semibold ${isActive ? "text-gray-900" : ""}`}>{label}</span>
                {badge && badge > 0 && (
                  <span className="absolute top-0 right-2 w-3.5 h-3.5 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* ── AI Intelligence Chat ── */}
      {currentPersona !== "admin" && !isChatPaneOpen && (
        <SageFloatingButton
          onClick={() => setIsChatPaneOpen(true)}
          variant={currentPersona === "advisor" ? "advisor" : "client"}
        />
      )}

      <SageChatPane
        isOpen={isChatPaneOpen}
        onClose={() => setIsChatPaneOpen(false)}
        variant={currentPersona === "advisor" ? "advisor" : "client"}
      >
        <AdvisorChatView
          advisor={{ id: currentRM.id, name: currentRM.name, email: currentRM.email, role: "advisor", jurisdictions: ["US"], specializations: currentRM.specializations, created_at: "2020-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" }}
          clients={MOCK_INSTITUTIONAL_CLIENTS.slice(0, 4) as any}
          isMockMode={isMockMode}
          embedded
        />
      </SageChatPane>
    </div>
  )
}
