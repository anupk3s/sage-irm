/**
 * Institutional mock data for Sage Institutional — Relationship Manager platform.
 * Covers: Institutional Clients, RM Profiles, Action Proposals, Opportunities.
 */

// ─── Enums / Literal Types ───────────────────────────────────────────────────

export type InstitutionalClientType =
  | "public_pension"
  | "endowment"
  | "family_office"
  | "corporate_treasury"
  | "sovereign_fund"
  | "foundation"

export type MandateType =
  | "equity"
  | "fixed_income"
  | "multi_asset"
  | "alternatives"
  | "balanced"
  | "esg_balanced"
  | "short_duration"
  | "global_multi_asset"

export type RelationshipStatus = "healthy" | "needs_attention" | "at_risk"

export type ActionType =
  | "rebalance"
  | "new_investment"
  | "mandate_change"
  | "fee_adjustment"
  | "reporting_change"
  | "redemption"

export type ActionStatus =
  | "draft"
  | "pending_compliance"
  | "approved"
  | "rejected"
  | "executed"

export type OpportunityType = "upsell" | "retention" | "new_mandate" | "new_prospect"

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface ContactPerson {
  name: string
  title: string
  email?: string
  phone?: string
}

export interface InstitutionalHolding {
  asset_class: string
  sub_class: string
  description: string
  ticker?: string
  allocation_pct: number
  benchmark_allocation_pct: number
  deviation_bps: number
  value: number
  ytd_return: number
  ytd_benchmark_return: number
}

export interface InstitutionalClient {
  id: string
  name: string
  short_name: string
  type: InstitutionalClientType
  aum: number
  rm_id: string
  rm_name: string
  status: RelationshipStatus
  jurisdiction: "US" | "International"
  mandate_type: MandateType
  mandate_description: string
  benchmark: string
  ytd_return: number
  benchmark_return: number
  active_return_bps: number
  inception_date: string
  inception_return: number
  inception_benchmark_return: number
  primary_contact: ContactPerson
  secondary_contact?: ContactPerson
  annual_fee_bps: number
  fee_revenue: number
  next_review: string
  last_interaction: string
  onboarded_date: string
  open_actions: number
  pending_decisions: number
  description?: string
  key_risk?: string
  holdings: InstitutionalHolding[]
  recent_notes: string[]
}

export interface RMProfile {
  id: string
  name: string
  title: string
  email: string
  phone: string
  client_ids: string[]
  total_aum: number
  total_revenue: number
  ytd_avg_alpha_bps: number
  coverage_regions: string[]
  specializations: string[]
  bio: string
}

export interface ActionProposal {
  id: string
  client_id: string
  client_name: string
  rm_id: string
  rm_name: string
  type: ActionType
  status: ActionStatus
  priority: "low" | "medium" | "high" | "urgent"
  title: string
  description: string
  rationale: string
  estimated_trade_size?: number
  compliance_risk: "low" | "medium" | "high"
  created_at: string
  sla_deadline?: string
  approved_at?: string
  approved_by?: string
  executed_at?: string
  rejection_reason?: string
  compliance_notes: string[]
  required_approvals: string[]
  checklist: { label: string; passed: boolean }[]
}

export interface Opportunity {
  id: string
  client_id: string
  client_name: string
  rm_id: string
  rm_name: string
  type: OpportunityType
  title: string
  description: string
  estimated_aum_impact: number
  estimated_revenue_impact: number
  probability: number
  timeline: string
  next_step: string
  next_step_date: string
  status: "active" | "won" | "lost" | "on_hold"
}

// ─── RM Profiles ─────────────────────────────────────────────────────────────

export const MOCK_RMS: RMProfile[] = [
  {
    id: "rm-001",
    name: "Sarah Chen",
    title: "Head of Institutional Relationships",
    email: "s.chen@sageinstitutional.com",
    phone: "+1 212-555-0141",
    client_ids: ["cli-001", "cli-002", "cli-004", "cli-007"],
    total_aum: 5_580_000_000,
    total_revenue: 19_900_000,
    ytd_avg_alpha_bps: -45,
    coverage_regions: ["Northeast US", "Midwest US"],
    specializations: ["Endowments", "Pensions", "ESG Mandates", "Family Offices"],
    bio: "15 years in institutional asset management. Former portfolio manager at BlackRock before moving to relationship management.",
  },
  {
    id: "rm-002",
    name: "James Park",
    title: "Senior Relationship Manager, Fixed Income",
    email: "j.park@sageinstitutional.com",
    phone: "+1 206-555-0188",
    client_ids: ["cli-003", "cli-005"],
    total_aum: 3_820_000_000,
    total_revenue: 7_970_000,
    ytd_avg_alpha_bps: 40,
    coverage_regions: ["Pacific Northwest", "West Coast"],
    specializations: ["Public Pensions", "Corporate Treasuries", "Fixed Income", "Liability-Driven"],
    bio: "12 years in fixed income and LDI strategies. CFA charterholder. Previously at PIMCO.",
  },
  {
    id: "rm-003",
    name: "Marcus Williams",
    title: "Senior Relationship Manager, Global Accounts",
    email: "m.williams@sageinstitutional.com",
    phone: "+1 212-555-0173",
    client_ids: ["cli-006"],
    total_aum: 6_800_000_000,
    total_revenue: 12_240_000,
    ytd_avg_alpha_bps: 40,
    coverage_regions: ["International", "Middle East", "Asia Pacific"],
    specializations: ["Sovereign Wealth Funds", "Global Multi-Asset", "Alternatives", "FX Overlay"],
    bio: "20 years managing sovereign and supranational relationships across 12 countries. Former MD at JPMorgan Asset Management.",
  },
]

export const MOCK_RM = MOCK_RMS[0]

// ─── Institutional Clients ────────────────────────────────────────────────────

export const MOCK_INSTITUTIONAL_CLIENTS: InstitutionalClient[] = [
  // ── 1. Meridian State Teachers Pension Fund ──
  {
    id: "cli-001",
    name: "Meridian State Teachers Pension Fund",
    short_name: "Meridian Pension",
    type: "public_pension",
    aum: 4_250_000_000,
    rm_id: "rm-001",
    rm_name: "Sarah Chen",
    status: "healthy",
    jurisdiction: "US",
    mandate_type: "balanced",
    mandate_description: "Diversified Growth — 60% Global Equity / 30% Fixed Income / 10% Alternatives",
    benchmark: "60% MSCI ACWI + 30% Bloomberg Agg + 10% HFRI",
    ytd_return: 8.4,
    benchmark_return: 7.9,
    active_return_bps: 50,
    inception_date: "2018-03-01",
    inception_return: 9.1,
    inception_benchmark_return: 8.7,
    primary_contact: { name: "Linda Weston", title: "Chief Investment Officer", email: "l.weston@meridianpension.gov" },
    secondary_contact: { name: "Mark Huang", title: "Deputy CIO", email: "m.huang@meridianpension.gov" },
    annual_fee_bps: 30,
    fee_revenue: 12_750_000,
    next_review: "2026-05-15",
    last_interaction: "2026-04-10",
    onboarded_date: "2018-03-01",
    open_actions: 1,
    pending_decisions: 2,
    description: "One of the largest public pension funds in the state. Board recently approved an increase in alternatives allocation to 17%. Strong relationship; CIO has expressed interest in expanding the mandate.",
    holdings: [
      { asset_class: "US Equity", sub_class: "Large Cap Blend", description: "S&P 500 Index", ticker: "SPY", allocation_pct: 28, benchmark_allocation_pct: 28, deviation_bps: 0, value: 1_190_000_000, ytd_return: 10.2, ytd_benchmark_return: 10.2 },
      { asset_class: "US Equity", sub_class: "Small/Mid Cap", description: "Russell 2500 Index", ticker: "SMMD", allocation_pct: 8, benchmark_allocation_pct: 8, deviation_bps: 0, value: 340_000_000, ytd_return: 7.1, ytd_benchmark_return: 7.1 },
      { asset_class: "International Equity", sub_class: "Developed Markets", description: "MSCI EAFE Index", ticker: "EFA", allocation_pct: 14, benchmark_allocation_pct: 14, deviation_bps: 0, value: 595_000_000, ytd_return: 9.8, ytd_benchmark_return: 9.8 },
      { asset_class: "International Equity", sub_class: "Emerging Markets", description: "MSCI EM Index", ticker: "EEM", allocation_pct: 10, benchmark_allocation_pct: 10, deviation_bps: 0, value: 425_000_000, ytd_return: 5.4, ytd_benchmark_return: 5.4 },
      { asset_class: "Fixed Income", sub_class: "US Core", description: "Bloomberg US Agg", ticker: "AGG", allocation_pct: 18, benchmark_allocation_pct: 20, deviation_bps: -200, value: 765_000_000, ytd_return: 2.1, ytd_benchmark_return: 2.1 },
      { asset_class: "Fixed Income", sub_class: "Inflation-Linked", description: "TIPS", ticker: "TIP", allocation_pct: 7, benchmark_allocation_pct: 7, deviation_bps: 0, value: 297_500_000, ytd_return: 3.2, ytd_benchmark_return: 3.2 },
      { asset_class: "Fixed Income", sub_class: "Investment Grade Credit", description: "IG Corporate Bond", ticker: "LQD", allocation_pct: 5, benchmark_allocation_pct: 3, deviation_bps: 200, value: 212_500_000, ytd_return: 3.8, ytd_benchmark_return: 3.8 },
      { asset_class: "Alternatives", sub_class: "Private Equity", description: "Blackstone PE Fund XII", ticker: "", allocation_pct: 5, benchmark_allocation_pct: 5, deviation_bps: 0, value: 212_500_000, ytd_return: 11.2, ytd_benchmark_return: 8.5 },
      { asset_class: "Alternatives", sub_class: "Real Assets", description: "Global Infrastructure Partners", ticker: "", allocation_pct: 5, benchmark_allocation_pct: 5, deviation_bps: 0, value: 212_500_000, ytd_return: 6.8, ytd_benchmark_return: 6.5 },
    ],
    recent_notes: [
      "Board approved alternatives increase from 10% to 17% at March meeting. Need to source additional manager lineups.",
      "CIO mentioned potential ESG overlay discussion at next review — compliance pre-check required.",
      "Upcoming Q2 board presentation — draft performance attribution report by May 10.",
    ],
  },

  // ── 2. Hartwell University Endowment ──
  {
    id: "cli-002",
    name: "Hartwell University Endowment",
    short_name: "Hartwell Endowment",
    type: "endowment",
    aum: 890_000_000,
    rm_id: "rm-001",
    rm_name: "Sarah Chen",
    status: "needs_attention",
    jurisdiction: "US",
    mandate_type: "esg_balanced",
    mandate_description: "Total Return with ESG Overlay — 65% Equity / 25% FI / 10% Alternatives",
    benchmark: "Cambridge Associates U.S. University Endowment",
    ytd_return: 5.2,
    benchmark_return: 6.8,
    active_return_bps: -160,
    inception_date: "2020-07-15",
    inception_return: 7.4,
    inception_benchmark_return: 8.1,
    primary_contact: { name: "Dr. Patricia Vance", title: "Chief Financial Officer", email: "p.vance@hartwellu.edu" },
    secondary_contact: { name: "Tom Bellamy", title: "Investment Committee Chair", email: "t.bellamy@hartwellu.edu" },
    annual_fee_bps: 45,
    fee_revenue: 4_005_000,
    next_review: "2026-04-28",
    last_interaction: "2026-04-08",
    onboarded_date: "2020-07-15",
    open_actions: 3,
    pending_decisions: 1,
    description: "University endowment with a strict ESG screen. Currently underperforming benchmark by 160bps YTD due to tech sector underweight. Investment Committee review is in 7 days — emergency rebalance proposal pending compliance approval.",
    key_risk: "Underperforming benchmark by 160bps YTD. Investment Committee may request manager review.",
    holdings: [
      { asset_class: "US Equity", sub_class: "ESG Large Cap", description: "MSCI USA ESG Leaders", ticker: "ESGU", allocation_pct: 35, benchmark_allocation_pct: 40, deviation_bps: -500, value: 311_500_000, ytd_return: 6.8, ytd_benchmark_return: 9.2 },
      { asset_class: "International Equity", sub_class: "ESG Developed", description: "MSCI EAFE ESG Select", ticker: "ESGD", allocation_pct: 20, benchmark_allocation_pct: 18, deviation_bps: 200, value: 178_000_000, ytd_return: 8.9, ytd_benchmark_return: 9.1 },
      { asset_class: "International Equity", sub_class: "ESG Emerging", description: "MSCI EM ESG Leaders", ticker: "ESGE", allocation_pct: 10, benchmark_allocation_pct: 7, deviation_bps: 300, value: 89_000_000, ytd_return: 3.1, ytd_benchmark_return: 4.2 },
      { asset_class: "Fixed Income", sub_class: "Green Bonds", description: "Bloomberg MSCI Green Bond", ticker: "BGRN", allocation_pct: 15, benchmark_allocation_pct: 15, deviation_bps: 0, value: 133_500_000, ytd_return: 2.4, ytd_benchmark_return: 2.6 },
      { asset_class: "Fixed Income", sub_class: "Social Impact", description: "Social Bond Portfolio", ticker: "", allocation_pct: 10, benchmark_allocation_pct: 10, deviation_bps: 0, value: 89_000_000, ytd_return: 1.9, ytd_benchmark_return: 2.1 },
      { asset_class: "Alternatives", sub_class: "Impact Private Equity", description: "TPG Rise Fund III", ticker: "", allocation_pct: 10, benchmark_allocation_pct: 10, deviation_bps: 0, value: 89_000_000, ytd_return: 6.2, ytd_benchmark_return: 7.0 },
    ],
    recent_notes: [
      "Investment Committee flagged YTD underperformance at April meeting. Requesting explanation and remediation plan.",
      "Emergency rebalance proposal submitted — reduce US equity tech underweight. PENDING COMPLIANCE.",
      "CFO meeting on April 28 — prepare detailed attribution analysis showing ESG constraint impact.",
    ],
  },

  // ── 3. Pacific NW Municipal Employees Retirement ──
  {
    id: "cli-003",
    name: "Pacific NW Municipal Employees Retirement System",
    short_name: "Pacific NW MERS",
    type: "public_pension",
    aum: 1_720_000_000,
    rm_id: "rm-002",
    rm_name: "James Park",
    status: "healthy",
    jurisdiction: "US",
    mandate_type: "balanced",
    mandate_description: "Conservative Growth — 70% Equity / 30% Fixed Income",
    benchmark: "70% MSCI USA + 30% Bloomberg US Agg",
    ytd_return: 9.1,
    benchmark_return: 8.5,
    active_return_bps: 60,
    inception_date: "2015-06-01",
    inception_return: 8.9,
    inception_benchmark_return: 8.3,
    primary_contact: { name: "Robert Tanaka", title: "Executive Director", email: "r.tanaka@pacificnwmers.gov" },
    secondary_contact: { name: "Angela Morrison", title: "Chief Investment Officer", email: "a.morrison@pacificnwmers.gov" },
    annual_fee_bps: 28,
    fee_revenue: 4_816_000,
    next_review: "2026-06-10",
    last_interaction: "2026-04-02",
    onboarded_date: "2015-06-01",
    open_actions: 0,
    pending_decisions: 1,
    description: "Long-standing client with stable, well-performing mandate. ERISA requirements create need for an infrastructure allocation review. Strong relationship with Executive Director.",
    holdings: [
      { asset_class: "US Equity", sub_class: "Large Cap", description: "S&P 500 Index Fund", ticker: "IVV", allocation_pct: 42, benchmark_allocation_pct: 42, deviation_bps: 0, value: 722_400_000, ytd_return: 10.2, ytd_benchmark_return: 10.2 },
      { asset_class: "US Equity", sub_class: "Small Cap", description: "Russell 2000 Index", ticker: "IWM", allocation_pct: 12, benchmark_allocation_pct: 12, deviation_bps: 0, value: 206_400_000, ytd_return: 7.1, ytd_benchmark_return: 7.1 },
      { asset_class: "International Equity", sub_class: "Developed", description: "MSCI EAFE Fund", ticker: "EFA", allocation_pct: 16, benchmark_allocation_pct: 16, deviation_bps: 0, value: 275_200_000, ytd_return: 9.8, ytd_benchmark_return: 9.8 },
      { asset_class: "Fixed Income", sub_class: "Core", description: "US Aggregate Bond", ticker: "AGG", allocation_pct: 20, benchmark_allocation_pct: 20, deviation_bps: 0, value: 344_000_000, ytd_return: 2.1, ytd_benchmark_return: 2.1 },
      { asset_class: "Fixed Income", sub_class: "Short Duration", description: "Short-Term Bond Fund", ticker: "BSV", allocation_pct: 10, benchmark_allocation_pct: 10, deviation_bps: 0, value: 172_000_000, ytd_return: 3.5, ytd_benchmark_return: 3.5 },
    ],
    recent_notes: [
      "CIO interested in infrastructure allocation to meet ERISA diversification guidance — formal proposal requested for June review.",
      "Annual performance review went well — client satisfied with 60bps of alpha.",
    ],
  },

  // ── 4. Vandermeer Family Office ──
  {
    id: "cli-004",
    name: "Vandermeer Family Office",
    short_name: "Vandermeer FO",
    type: "family_office",
    aum: 425_000_000,
    rm_id: "rm-001",
    rm_name: "Sarah Chen",
    status: "at_risk",
    jurisdiction: "US",
    mandate_type: "alternatives",
    mandate_description: "Multi-Asset with Alternatives Focus — 40% Equity / 30% Alternatives / 30% Fixed Income",
    benchmark: "60/40 MSCI ACWI / Bloomberg Agg Blend",
    ytd_return: 3.8,
    benchmark_return: 6.2,
    active_return_bps: -240,
    inception_date: "2021-02-15",
    inception_return: 5.1,
    inception_benchmark_return: 7.8,
    primary_contact: { name: "Henrik Vandermeer", title: "Principal", email: "h.vandermeer@vandermeerfamily.com" },
    secondary_contact: { name: "Sophia Vandermeer-Klaas", title: "CFO", email: "s.klaas@vandermeerfamily.com" },
    annual_fee_bps: 55,
    fee_revenue: 2_337_500,
    next_review: "2026-04-30",
    last_interaction: "2026-04-05",
    onboarded_date: "2021-02-15",
    open_actions: 2,
    pending_decisions: 2,
    description: "Family office with complex multi-generational wealth management needs. Significantly underperforming benchmark due to alternatives drag. Principal is concerned and has mentioned competitor firms. Retention is the top priority.",
    key_risk: "At risk of full $425M redemption. Underperforming 240bps YTD. Executive intervention may be required.",
    holdings: [
      { asset_class: "US Equity", sub_class: "Quality Factor", description: "Quality Factor ETF", ticker: "QUAL", allocation_pct: 22, benchmark_allocation_pct: 30, deviation_bps: -800, value: 93_500_000, ytd_return: 9.8, ytd_benchmark_return: 10.2 },
      { asset_class: "International Equity", sub_class: "Developed", description: "MSCI EAFE", ticker: "EFA", allocation_pct: 18, benchmark_allocation_pct: 30, deviation_bps: -1200, value: 76_500_000, ytd_return: 9.8, ytd_benchmark_return: 9.8 },
      { asset_class: "Fixed Income", sub_class: "Core", description: "US Aggregate", ticker: "AGG", allocation_pct: 30, benchmark_allocation_pct: 40, deviation_bps: -1000, value: 127_500_000, ytd_return: 2.1, ytd_benchmark_return: 2.1 },
      { asset_class: "Alternatives", sub_class: "Hedge Funds", description: "Multi-Strategy HF Basket", ticker: "", allocation_pct: 15, benchmark_allocation_pct: 0, deviation_bps: 1500, value: 63_750_000, ytd_return: -1.2, ytd_benchmark_return: 0 },
      { asset_class: "Alternatives", sub_class: "Private Credit", description: "Direct Lending Portfolio", ticker: "", allocation_pct: 15, benchmark_allocation_pct: 0, deviation_bps: 1500, value: 63_750_000, ytd_return: 4.1, ytd_benchmark_return: 0 },
    ],
    recent_notes: [
      "URGENT: Henrik Vandermeer expressed dissatisfaction in April 5 call — mentioned Goldman Sachs and Ares as alternatives.",
      "Alternatives underperformance (-1.2% YTD hedge funds) is the primary drag. Propose to restructure alternatives sleeve.",
      "April 30 meeting is critical retention event — bring Senior Managing Director and prepare comprehensive remediation plan.",
    ],
  },

  // ── 5. Cascade Corporate Treasury ──
  {
    id: "cli-005",
    name: "Cascade Technologies Corporate Treasury",
    short_name: "Cascade Treasury",
    type: "corporate_treasury",
    aum: 2_100_000_000,
    rm_id: "rm-002",
    rm_name: "James Park",
    status: "healthy",
    jurisdiction: "US",
    mandate_type: "short_duration",
    mandate_description: "Capital Preservation — Short Duration Fixed Income + Cash Management",
    benchmark: "3-Month T-Bill + 50bps",
    ytd_return: 3.2,
    benchmark_return: 3.0,
    active_return_bps: 20,
    inception_date: "2019-11-01",
    inception_return: 2.8,
    inception_benchmark_return: 2.5,
    primary_contact: { name: "Jennifer Huang", title: "VP Treasury", email: "j.huang@cascadetech.com" },
    secondary_contact: { name: "Michael Torres", title: "CFO", email: "m.torres@cascadetech.com" },
    annual_fee_bps: 15,
    fee_revenue: 3_150_000,
    next_review: "2026-07-01",
    last_interaction: "2026-04-01",
    onboarded_date: "2019-11-01",
    open_actions: 1,
    pending_decisions: 0,
    description: "Tech company treasury with strict capital preservation mandate. Duration extension approved — execution pending. Strong relationship with VP Treasury.",
    holdings: [
      { asset_class: "Money Market", sub_class: "Government MMF", description: "Treasury Money Market Fund", ticker: "VMFXX", allocation_pct: 25, benchmark_allocation_pct: 20, deviation_bps: 500, value: 525_000_000, ytd_return: 5.3, ytd_benchmark_return: 5.3 },
      { asset_class: "Fixed Income", sub_class: "T-Bills", description: "US Treasury Bills (0-3M)", ticker: "BIL", allocation_pct: 30, benchmark_allocation_pct: 40, deviation_bps: -1000, value: 630_000_000, ytd_return: 5.3, ytd_benchmark_return: 5.3 },
      { asset_class: "Fixed Income", sub_class: "Short Treasury", description: "US Treasury (1-3Y)", ticker: "SHY", allocation_pct: 30, benchmark_allocation_pct: 25, deviation_bps: 500, value: 630_000_000, ytd_return: 4.1, ytd_benchmark_return: 4.0 },
      { asset_class: "Fixed Income", sub_class: "Agency", description: "Agency MBS Short Duration", ticker: "MBB", allocation_pct: 15, benchmark_allocation_pct: 15, deviation_bps: 0, value: 315_000_000, ytd_return: 3.8, ytd_benchmark_return: 3.7 },
    ],
    recent_notes: [
      "Duration extension from 2.1 to 3.5 years approved by compliance. Execution scheduled for April 22.",
      "CFO inquiry re: yield enhancement options — will discuss at Q3 review.",
    ],
  },

  // ── 6. NorthStar Sovereign Reserve Fund ──
  {
    id: "cli-006",
    name: "NorthStar Sovereign Reserve Fund",
    short_name: "NorthStar SWF",
    type: "sovereign_fund",
    aum: 6_800_000_000,
    rm_id: "rm-003",
    rm_name: "Marcus Williams",
    status: "healthy",
    jurisdiction: "International",
    mandate_type: "global_multi_asset",
    mandate_description: "Global Multi-Asset — 50% Equity / 30% Fixed Income / 20% Alternatives",
    benchmark: "50% MSCI ACWI + 30% Bloomberg Global Agg + 20% HFRI",
    ytd_return: 10.2,
    benchmark_return: 9.8,
    active_return_bps: 40,
    inception_date: "2012-01-01",
    inception_return: 8.8,
    inception_benchmark_return: 8.2,
    primary_contact: { name: "Director Yusuf Al-Rashid", title: "Chief Investment Officer", email: "y.alrashid@northstarswf.gov" },
    secondary_contact: { name: "Dr. Priya Nair", title: "Head of External Managers", email: "p.nair@northstarswf.gov" },
    annual_fee_bps: 18,
    fee_revenue: 12_240_000,
    next_review: "2026-05-30",
    last_interaction: "2026-04-12",
    onboarded_date: "2012-01-01",
    open_actions: 0,
    pending_decisions: 1,
    description: "Flagship sovereign wealth fund relationship. 14-year track record. CIO is exploring private credit as an addition to the alternatives sleeve. Strategically important account.",
    holdings: [
      { asset_class: "Global Equity", sub_class: "Developed Markets", description: "MSCI World Fund", ticker: "URTH", allocation_pct: 30, benchmark_allocation_pct: 30, deviation_bps: 0, value: 2_040_000_000, ytd_return: 10.8, ytd_benchmark_return: 10.8 },
      { asset_class: "Global Equity", sub_class: "Emerging Markets", description: "MSCI EM Fund", ticker: "EEM", allocation_pct: 15, benchmark_allocation_pct: 15, deviation_bps: 0, value: 1_020_000_000, ytd_return: 5.4, ytd_benchmark_return: 5.4 },
      { asset_class: "Global Equity", sub_class: "Private Equity", description: "PE Secondaries Portfolio", ticker: "", allocation_pct: 5, benchmark_allocation_pct: 5, deviation_bps: 0, value: 340_000_000, ytd_return: 13.2, ytd_benchmark_return: 9.5 },
      { asset_class: "Fixed Income", sub_class: "Global Govts", description: "Bloomberg Global Agg", ticker: "BNDX", allocation_pct: 18, benchmark_allocation_pct: 20, deviation_bps: -200, value: 1_224_000_000, ytd_return: 1.8, ytd_benchmark_return: 1.8 },
      { asset_class: "Fixed Income", sub_class: "EM Debt", description: "JPM EMBI Global", ticker: "EMB", allocation_pct: 12, benchmark_allocation_pct: 10, deviation_bps: 200, value: 816_000_000, ytd_return: 4.9, ytd_benchmark_return: 4.5 },
      { asset_class: "Alternatives", sub_class: "Hedge Funds", description: "Global Macro + CTA Basket", ticker: "", allocation_pct: 12, benchmark_allocation_pct: 12, deviation_bps: 0, value: 816_000_000, ytd_return: 8.9, ytd_benchmark_return: 7.8 },
      { asset_class: "Alternatives", sub_class: "Real Assets", description: "Global Infrastructure + RE", ticker: "", allocation_pct: 8, benchmark_allocation_pct: 8, deviation_bps: 0, value: 544_000_000, ytd_return: 7.2, ytd_benchmark_return: 6.8 },
    ],
    recent_notes: [
      "CIO expressed interest in private credit allocation at March 30 call — potential $340M new sleeve.",
      "Annual review scheduled May 30 — include private credit due diligence package.",
      "ESG reporting requirements increasing per home jurisdiction regulation — coordinate with compliance.",
    ],
  },

  // ── 7. Oakdale Community Foundation ──
  {
    id: "cli-007",
    name: "Oakdale Community Foundation",
    short_name: "Oakdale Foundation",
    type: "foundation",
    aum: 215_000_000,
    rm_id: "rm-001",
    rm_name: "Sarah Chen",
    status: "healthy",
    jurisdiction: "US",
    mandate_type: "esg_balanced",
    mandate_description: "ESG Balanced — 50% ESG Equity / 40% ESG Fixed Income / 10% Impact Alternatives",
    benchmark: "50% MSCI USA ESG Leaders + 40% Bloomberg MSCI Green Bond + 10% HFRI",
    ytd_return: 7.1,
    benchmark_return: 6.9,
    active_return_bps: 20,
    inception_date: "2017-04-01",
    inception_return: 7.8,
    inception_benchmark_return: 7.5,
    primary_contact: { name: "Margaret Collins", title: "Executive Director", email: "m.collins@oakdalefoundation.org" },
    secondary_contact: { name: "David Park", title: "Board Treasurer", email: "d.park@oakdalefoundation.org" },
    annual_fee_bps: 50,
    fee_revenue: 1_075_000,
    next_review: "2026-06-15",
    last_interaction: "2026-03-28",
    onboarded_date: "2017-04-01",
    open_actions: 0,
    pending_decisions: 0,
    description: "Community foundation with strong ESG mission alignment. Stable relationship; board highly satisfied. Modest size but strong reference client for ESG capabilities.",
    holdings: [
      { asset_class: "US Equity", sub_class: "ESG Leaders", description: "MSCI USA ESG Leaders", ticker: "ESGU", allocation_pct: 30, benchmark_allocation_pct: 30, deviation_bps: 0, value: 64_500_000, ytd_return: 9.8, ytd_benchmark_return: 9.8 },
      { asset_class: "International Equity", sub_class: "ESG Developed", description: "MSCI EAFE ESG Select", ticker: "ESGD", allocation_pct: 20, benchmark_allocation_pct: 20, deviation_bps: 0, value: 43_000_000, ytd_return: 8.1, ytd_benchmark_return: 8.1 },
      { asset_class: "Fixed Income", sub_class: "Green Bonds", description: "Bloomberg MSCI Green Bond", ticker: "BGRN", allocation_pct: 25, benchmark_allocation_pct: 25, deviation_bps: 0, value: 53_750_000, ytd_return: 2.4, ytd_benchmark_return: 2.4 },
      { asset_class: "Fixed Income", sub_class: "Social Bonds", description: "Social Impact Bond Fund", ticker: "", allocation_pct: 15, benchmark_allocation_pct: 15, deviation_bps: 0, value: 32_250_000, ytd_return: 1.9, ytd_benchmark_return: 2.0 },
      { asset_class: "Alternatives", sub_class: "Impact PE", description: "TPG Rise Fund III", ticker: "", allocation_pct: 10, benchmark_allocation_pct: 10, deviation_bps: 0, value: 21_500_000, ytd_return: 6.2, ytd_benchmark_return: 5.9 },
    ],
    recent_notes: [
      "Board meeting March 28 — Q1 attribution review was positive. Board expressed appreciation for the ESG reporting quality.",
      "Potential to include as case study in firm's ESG capabilities marketing (get approval from Executive Director).",
    ],
  },
]

// ─── Helper: Get clients by RM ────────────────────────────────────────────────

export function getClientsByRM(rmId: string): InstitutionalClient[] {
  return MOCK_INSTITUTIONAL_CLIENTS.filter((c) => c.rm_id === rmId)
}

export function getClientById(clientId: string): InstitutionalClient | undefined {
  return MOCK_INSTITUTIONAL_CLIENTS.find((c) => c.id === clientId)
}

// ─── Action Proposals ─────────────────────────────────────────────────────────

export const MOCK_ACTION_PROPOSALS: ActionProposal[] = [
  {
    id: "act-001",
    client_id: "cli-002",
    client_name: "Hartwell University Endowment",
    rm_id: "rm-001",
    rm_name: "Sarah Chen",
    type: "rebalance",
    status: "pending_compliance",
    priority: "urgent",
    title: "Emergency Equity Rebalance — Reduce Tech Underweight",
    description: "Reduce US ESG equity underweight from -500bps to -100bps by increasing ESGU allocation from 35% to 39%. Shift 4% from EM ESG equity (ESGE) to US ESG equity (ESGU). Estimated trade size: $35.6M.",
    rationale: "Portfolio is underperforming benchmark by 160bps YTD primarily due to tech sector underweight in US equity. Investment committee review is April 28 — remediation must be in place before then.",
    estimated_trade_size: 35_600_000,
    compliance_risk: "medium",
    created_at: "2026-04-18T09:15:00Z",
    sla_deadline: "2026-04-23T17:00:00Z",
    compliance_notes: [
      "Proposed rebalance remains within ESG mandate constraints.",
      "ESGU passes all negative screens per mandate IPS.",
    ],
    required_approvals: ["Compliance Officer", "Head of Trading"],
    checklist: [
      { label: "Within mandate allocation bands", passed: true },
      { label: "ESG screens verified for all securities", passed: true },
      { label: "Trade size < 5% single-day market impact threshold", passed: true },
      { label: "Client IPS authorization confirmed", passed: true },
      { label: "Compliance officer sign-off", passed: false },
    ],
  },
  {
    id: "act-002",
    client_id: "cli-004",
    client_name: "Vandermeer Family Office",
    rm_id: "rm-001",
    rm_name: "Sarah Chen",
    type: "new_investment",
    status: "pending_compliance",
    priority: "high",
    title: "Add Ares Capital Direct Lending — $42.5M New Position",
    description: "Initiate 10% allocation to Ares Capital Management Direct Lending Fund IV. Replaces underperforming multi-strategy hedge fund basket. Expected yield: 8.5-10% net. Minimum investment: $5M. Lock-up: 3 years.",
    rationale: "Alternatives sleeve (-1.2% YTD) is the primary drag. Direct lending provides enhanced yield with lower mark-to-market volatility vs. hedge funds. This is key to the retention strategy for Vandermeer.",
    estimated_trade_size: 42_500_000,
    compliance_risk: "high",
    created_at: "2026-04-19T14:30:00Z",
    sla_deadline: "2026-04-26T17:00:00Z",
    compliance_notes: [
      "Alternative investment — requires enhanced due diligence per policy.",
      "3-year lock-up must be disclosed in writing to client.",
      "Ares Capital: AIFM registered, ADV Part 2 on file.",
    ],
    required_approvals: ["Compliance Officer", "Head of Alternatives", "Chief Risk Officer"],
    checklist: [
      { label: "Client suitability — accredited investor confirmed", passed: true },
      { label: "Manager due diligence complete (DDQ, ADV, audited financials)", passed: true },
      { label: "Lock-up period disclosed to client", passed: false },
      { label: "IPS amendment for alternatives sub-limit", passed: false },
      { label: "CRO sign-off on counterparty risk", passed: false },
      { label: "Compliance officer sign-off", passed: false },
    ],
  },
  {
    id: "act-003",
    client_id: "cli-005",
    client_name: "Cascade Technologies Corporate Treasury",
    rm_id: "rm-002",
    rm_name: "James Park",
    type: "rebalance",
    status: "approved",
    priority: "medium",
    title: "Duration Extension — 2.1Y to 3.5Y Average Duration",
    description: "Shift 10% from T-Bills (BIL) to 1-3Y Treasuries (SHY) and 5% from MMF to Agency MBS to extend average portfolio duration from 2.1 years to 3.5 years. Captures additional 80bps of yield on the yield curve.",
    rationale: "Fed pause expected through H1 2026. Extending duration now captures higher rates before potential cuts in H2. Client CFO approved the strategy in Q1 planning session.",
    estimated_trade_size: 315_000_000,
    compliance_risk: "low",
    created_at: "2026-04-14T10:00:00Z",
    sla_deadline: "2026-04-22T17:00:00Z",
    approved_at: "2026-04-17T16:45:00Z",
    approved_by: "Diana Reyes, CCO",
    compliance_notes: [
      "Remains within approved capital preservation mandate.",
      "Duration extension within IPS guideline maximum of 5.0 years.",
      "No new instrument types introduced.",
    ],
    required_approvals: ["Compliance Officer"],
    checklist: [
      { label: "Within mandate duration guidelines", passed: true },
      { label: "Capital preservation mandate maintained", passed: true },
      { label: "Client verbal approval documented", passed: true },
      { label: "Compliance officer sign-off", passed: true },
    ],
  },
  {
    id: "act-004",
    client_id: "cli-001",
    client_name: "Meridian State Teachers Pension Fund",
    rm_id: "rm-001",
    rm_name: "Sarah Chen",
    type: "mandate_change",
    status: "draft",
    priority: "low",
    title: "ESG Overlay Feasibility Assessment — Board Request",
    description: "Evaluate feasibility of applying an ESG screen to the 60% equity sleeve of the Meridian mandate. Board requested a formal assessment at the March meeting. Scope: identify which equity holdings would be excluded, estimate tracking error impact, and draft IPS amendment language.",
    rationale: "Board has growing ESG interest. This is also an opportunity to demonstrate our ESG capabilities and deepen the relationship ahead of the alternatives mandate expansion discussion.",
    compliance_risk: "low",
    created_at: "2026-04-20T11:00:00Z",
    compliance_notes: [],
    required_approvals: ["Compliance Officer", "ESG Team Lead"],
    checklist: [
      { label: "Initial ESG screen feasibility analysis complete", passed: false },
      { label: "Tracking error impact modeled", passed: false },
      { label: "IPS amendment draft prepared", passed: false },
      { label: "Board presentation materials ready", passed: false },
    ],
  },
  {
    id: "act-005",
    client_id: "cli-003",
    client_name: "Pacific NW Municipal Employees Retirement System",
    rm_id: "rm-002",
    rm_name: "James Park",
    type: "new_investment",
    status: "draft",
    priority: "medium",
    title: "Infrastructure Allocation Proposal — 5% New Sleeve",
    description: "Propose a 5% allocation ($86M) to global listed infrastructure to satisfy ERISA diversification guidance. Instrument: Macquarie Infrastructure ETF (MIC) or GS Global Listed Infrastructure strategy. Reduces equity allocation from 70% to 65%.",
    rationale: "CIO flagged ERISA diversification requirement in April meeting. Infrastructure provides inflation protection and lower correlation to equity — also aligns with pension's liability-matching objectives.",
    estimated_trade_size: 86_000_000,
    compliance_risk: "low",
    created_at: "2026-04-15T09:00:00Z",
    compliance_notes: [],
    required_approvals: ["Compliance Officer"],
    checklist: [
      { label: "ERISA diversification analysis complete", passed: false },
      { label: "Manager selection completed", passed: false },
      { label: "IPS allows infrastructure as asset class", passed: true },
      { label: "Compliance officer sign-off", passed: false },
    ],
  },
]

export function getActionsByRM(rmId: string): ActionProposal[] {
  return MOCK_ACTION_PROPOSALS.filter((a) => a.rm_id === rmId)
}

export function getPendingActions(): ActionProposal[] {
  return MOCK_ACTION_PROPOSALS.filter((a) => a.status === "pending_compliance")
}

export function getActionsByClient(clientId: string): ActionProposal[] {
  return MOCK_ACTION_PROPOSALS.filter((a) => a.client_id === clientId)
}

// ─── Opportunities Pipeline ───────────────────────────────────────────────────

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: "opp-001",
    client_id: "cli-001",
    client_name: "Meridian State Teachers Pension Fund",
    rm_id: "rm-001",
    rm_name: "Sarah Chen",
    type: "upsell",
    title: "Alternatives Mandate Expansion (+$500M)",
    description: "Board approved alternatives increase from 10% to 17%. Need to source and recommend additional manager lineups for PE, real assets, and hedge funds. If won, adds ~$500M to AUM under management.",
    estimated_aum_impact: 500_000_000,
    estimated_revenue_impact: 2_500_000,
    probability: 70,
    timeline: "Q3 2026",
    next_step: "Present alternatives manager lineup at May 15 annual review",
    next_step_date: "2026-05-15",
    status: "active",
  },
  {
    id: "opp-002",
    client_id: "cli-004",
    client_name: "Vandermeer Family Office",
    rm_id: "rm-001",
    rm_name: "Sarah Chen",
    type: "retention",
    title: "Account Retention — Prevent $425M Redemption",
    description: "Vandermeer Family Office is at risk of full redemption due to 240bps underperformance. Must present a credible remediation plan at the April 30 meeting. Senior management attendance required.",
    estimated_aum_impact: -425_000_000,
    estimated_revenue_impact: -2_337_500,
    probability: 45,
    timeline: "Decision by May 2026",
    next_step: "Executive retention presentation with Managing Director",
    next_step_date: "2026-04-30",
    status: "active",
  },
  {
    id: "opp-003",
    client_id: "cli-006",
    client_name: "NorthStar Sovereign Reserve Fund",
    rm_id: "rm-003",
    rm_name: "Marcus Williams",
    type: "new_mandate",
    title: "Private Credit Mandate (+$340M)",
    description: "CIO expressed strong interest in adding a private credit sleeve to the alternatives allocation. Initial conversation at March 30 call. Requires due diligence package and peer comparison analysis.",
    estimated_aum_impact: 340_000_000,
    estimated_revenue_impact: 2_040_000,
    probability: 55,
    timeline: "Q4 2026",
    next_step: "Private credit due diligence package at May 30 review",
    next_step_date: "2026-05-30",
    status: "active",
  },
  {
    id: "opp-004",
    client_id: "cli-003",
    client_name: "Pacific NW Municipal Employees Retirement System",
    rm_id: "rm-002",
    rm_name: "James Park",
    type: "upsell",
    title: "Infrastructure Allocation (+$86M)",
    description: "ERISA diversification requirement creates a need for infrastructure allocation. Well-positioned to win given existing relationship and James Park's LDI expertise. High probability close.",
    estimated_aum_impact: 86_000_000,
    estimated_revenue_impact: 344_000,
    probability: 80,
    timeline: "Q2 2026",
    next_step: "Formal infrastructure proposal at June 10 review",
    next_step_date: "2026-06-10",
    status: "active",
  },
  {
    id: "opp-005",
    client_id: "",
    client_name: "Western States University (Prospect)",
    rm_id: "rm-001",
    rm_name: "Sarah Chen",
    type: "new_prospect",
    title: "New Endowment Mandate RFP (+$650M)",
    description: "Western States University issued an RFP for their $650M endowment. They are looking for a manager with strong ESG capabilities and a proven endowment track record. Oakdale Foundation could serve as a reference.",
    estimated_aum_impact: 650_000_000,
    estimated_revenue_impact: 3_575_000,
    probability: 30,
    timeline: "Q3 2026",
    next_step: "RFP response submission deadline",
    next_step_date: "2026-05-01",
    status: "active",
  },
]

export function getOpportunitiesByRM(rmId: string): Opportunity[] {
  return MOCK_OPPORTUNITIES.filter((o) => o.rm_id === rmId || o.client_id === "")
}

// ─── Book of Business Summary ──────────────────────────────────────────────────

export interface BookSummary {
  total_aum: number
  total_revenue: number
  client_count: number
  healthy_count: number
  needs_attention_count: number
  at_risk_count: number
  ytd_avg_return: number
  ytd_avg_benchmark: number
  ytd_avg_alpha_bps: number
  pending_actions: number
  pending_compliance: number
  pipeline_value: number
  at_risk_aum: number
}

export function getBookSummary(rmId: string): BookSummary {
  const clients = getClientsByRM(rmId)
  const actions = getActionsByRM(rmId)
  const opportunities = getOpportunitiesByRM(rmId)

  const totalAum = clients.reduce((s, c) => s + c.aum, 0)
  const totalRevenue = clients.reduce((s, c) => s + c.fee_revenue, 0)
  const pendingCompliance = actions.filter((a) => a.status === "pending_compliance").length
  const atRiskAum = clients.filter((c) => c.status === "at_risk").reduce((s, c) => s + c.aum, 0)
  const weightedReturn = clients.reduce((s, c) => s + c.ytd_return * (c.aum / totalAum), 0)
  const weightedBenchmark = clients.reduce((s, c) => s + c.benchmark_return * (c.aum / totalAum), 0)

  return {
    total_aum: totalAum,
    total_revenue: totalRevenue,
    client_count: clients.length,
    healthy_count: clients.filter((c) => c.status === "healthy").length,
    needs_attention_count: clients.filter((c) => c.status === "needs_attention").length,
    at_risk_count: clients.filter((c) => c.status === "at_risk").length,
    ytd_avg_return: +weightedReturn.toFixed(2),
    ytd_avg_benchmark: +weightedBenchmark.toFixed(2),
    ytd_avg_alpha_bps: Math.round((weightedReturn - weightedBenchmark) * 100),
    pending_actions: actions.filter((a) => a.status !== "executed").length,
    pending_compliance: pendingCompliance,
    pipeline_value: opportunities.filter((o) => o.status === "active" && o.estimated_aum_impact > 0).reduce((s, o) => s + o.estimated_aum_impact, 0),
    at_risk_aum: atRiskAum,
  }
}

// ─── Firm-Wide Book Summary (all RMs) ─────────────────────────────────────────

export function getFirmBookSummary(): BookSummary {
  const clients = MOCK_INSTITUTIONAL_CLIENTS
  const actions = MOCK_ACTION_PROPOSALS
  const opportunities = MOCK_OPPORTUNITIES

  const totalAum = clients.reduce((s, c) => s + c.aum, 0)
  const totalRevenue = clients.reduce((s, c) => s + c.fee_revenue, 0)
  const pendingCompliance = actions.filter((a) => a.status === "pending_compliance").length
  const atRiskAum = clients.filter((c) => c.status === "at_risk").reduce((s, c) => s + c.aum, 0)
  const weightedReturn = clients.reduce((s, c) => s + c.ytd_return * (c.aum / totalAum), 0)
  const weightedBenchmark = clients.reduce((s, c) => s + c.benchmark_return * (c.aum / totalAum), 0)

  return {
    total_aum: totalAum,
    total_revenue: totalRevenue,
    client_count: clients.length,
    healthy_count: clients.filter((c) => c.status === "healthy").length,
    needs_attention_count: clients.filter((c) => c.status === "needs_attention").length,
    at_risk_count: clients.filter((c) => c.status === "at_risk").length,
    ytd_avg_return: +weightedReturn.toFixed(2),
    ytd_avg_benchmark: +weightedBenchmark.toFixed(2),
    ytd_avg_alpha_bps: Math.round((weightedReturn - weightedBenchmark) * 100),
    pending_actions: actions.filter((a) => a.status !== "executed").length,
    pending_compliance: pendingCompliance,
    pipeline_value: opportunities.filter((o) => o.status === "active" && o.estimated_aum_impact > 0).reduce((s, o) => s + o.estimated_aum_impact, 0),
    at_risk_aum: atRiskAum,
  }
}

// ─── Format Helpers ───────────────────────────────────────────────────────────

export function formatAum(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

export function formatRevenue(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

export function formatReturn(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`
}

export function formatAlpha(bps: number): string {
  return `${bps >= 0 ? "+" : ""}${bps}bps`
}

export function clientTypeLabel(type: InstitutionalClientType): string {
  const labels: Record<InstitutionalClientType, string> = {
    public_pension: "Public Pension",
    endowment: "Endowment",
    family_office: "Family Office",
    corporate_treasury: "Corporate Treasury",
    sovereign_fund: "Sovereign Fund",
    foundation: "Foundation",
  }
  return labels[type] ?? type
}
