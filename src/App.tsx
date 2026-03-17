import React, { useMemo, useState } from "react"; import { motion } from "framer-motion"; import { Wrench, Hammer, Building2, ClipboardList, Sparkles, Mail, Phone, User, CheckCircle2, ArrowRight, Calculator, Briefcase, BadgeDollarSign, MessageSquare, Search, Menu, X, Download, ShieldCheck, Star, FileText, Layers3, } from "lucide-react"; import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; import { Button } from "@/components/ui/button"; import { Input } from "@/components/ui/input"; import { Textarea } from "@/components/ui/textarea"; import { Badge } from "@/components/ui/badge"; import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; import { Progress } from "@/components/ui/progress";

const tradeTemplates = { General: [ { name: "Mobilization / Setup", qty: 1, unit: "job", rate: 150 }, { name: "Labor", qty: 8, unit: "hrs", rate: 95 }, { name: "Materials Allowance", qty: 1, unit: "lot", rate: 350 }, ], Concrete: [ { name: "Site Prep", qty: 4, unit: "hrs", rate: 105 }, { name: "Forming", qty: 6, unit: "hrs", rate: 95 }, { name: "Concrete Placement", qty: 4, unit: "yd", rate: 185 }, ], Electrical: [ { name: "Service Call / Diagnostics", qty: 1, unit: "job", rate: 125 }, { name: "Licensed Labor", qty: 6, unit: "hrs", rate: 120 }, { name: "Materials", qty: 1, unit: "lot", rate: 275 }, ], Plumbing: [ { name: "Trip Charge", qty: 1, unit: "job", rate: 95 }, { name: "Labor", qty: 5, unit: "hrs", rate: 115 }, { name: "Parts", qty: 1, unit: "lot", rate: 225 }, ], Earthwork: [ { name: "Equipment Time", qty: 6, unit: "hrs", rate: 165 }, { name: "Operator Labor", qty: 6, unit: "hrs", rate: 85 }, { name: "Haul / Disposal", qty: 1, unit: "lot", rate: 240 }, ], };

const fakeInbox = [ { id: 1, from: "Sarah Johnson", company: "Johnson Property Group", subject: "Need bid for retaining wall repair", priority: "High", summary: "Wants a fast quote this week for erosion and wall failure behind duplex.", }, { id: 2, from: "Mike Torres", company: "Homeowner", subject: "Concrete patio add-on question", priority: "Medium", summary: "Asked whether the patio can be extended and what timeline looks like.", }, { id: 3, from: "Alicia Reed", company: "Reed Retail LLC", subject: "Electrical estimate follow-up", priority: "Low", summary: "Needs a revised quote with alternate fixture pricing.", }, ];

const crmLeads = [ { name: "Front Range Rentals", value: "$8,600", status: "Estimate Sent" }, { name: "Dan Holloway", value: "$2,150", status: "Qualified" }, { name: "Mesa Storage", value: "$14,900", status: "Won" }, { name: "Apex Fitness", value: "$6,300", status: "Follow Up" }, ];

function currency(n: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0, }).format(n); }

function estimateAIRecommendations(trade: string, scope: string, budget: string) { const notes = [ Recommend clear scope wording for ${trade.toLowerCase()} work to reduce change-order disputes., "Add a materials allowance clause to protect margin from supplier fluctuations.", "Include schedule language, payment terms, and exclusions in the final estimate.", ];

if (scope.toLowerCase().includes("demo") || scope.toLowerCase().includes("remove")) { notes.push("Add debris hauling and disposal as a separate line item."); }

if (budget) { notes.push(Customer mentioned target budget around ${budget}; consider a good / better / best option set.); }

return notes; }

export default function TradesmanAIStableBuild() { const [mobileMenuOpen, setMobileMenuOpen] = useState(false); const [activeTab, setActiveTab] = useState("dashboard"); const [signedIn, setSignedIn] = useState(true); const [plan] = useState("Starter"); const [freeEstimatesRemaining, setFreeEstimatesRemaining] = useState(3); const [trade, setTrade] = useState("General"); const [clientName, setClientName] = useState("John Carter"); const [projectName, setProjectName] = useState("Backyard retaining wall repair"); const [scope, setScope] = useState( "Repair failed retaining wall section, regrade affected area, haul debris, and restore drainage path." ); const [budget, setBudget] = useState("$8,000 - $12,000"); const [markup, setMarkup] = useState(18); const [search, setSearch] = useState(""); const [assistantPrompt, setAssistantPrompt] = useState( "Write a professional follow-up message for a customer who has not responded to an estimate in 5 days." );

const [lineItems, setLineItems] = useState(tradeTemplates.General);

const subtotal = useMemo( () => lineItems.reduce((sum, item) => sum + item.qty * item.rate, 0), [lineItems] ); const total = useMemo(() => subtotal * (1 + markup / 100), [subtotal, markup]);

const aiRecommendations = useMemo( () => estimateAIRecommendations(trade, scope, budget), [trade, scope, budget] );

function switchTrade(nextTrade: keyof typeof tradeTemplates) { setTrade(nextTrade); setLineItems(tradeTemplates[nextTrade]); }

function updateLineItem(index: number, field: string, value: string | number) { const updated = [...lineItems]; // @ts-ignore updated[index][field] = field === "name" || field === "unit" ? value : Number(value); setLineItems(updated); }

function addLineItem() { setLineItems([...lineItems, { name: "Custom Line Item", qty: 1, unit: "ea", rate: 100 }]); }

function useFreeEstimate() { if (freeEstimatesRemaining > 0) setFreeEstimatesRemaining((prev) => prev - 1); }

const filteredInbox = fakeInbox.filter((m) => { const q = search.toLowerCase(); return !q || [m.from, m.company, m.subject, m.summary, m.priority].join(" ").toLowerCase().includes(q); });

const assistantOutput = Subject: Quick follow-up on your estimate\n\nHi ${clientName || "there"},\n\nI wanted to follow up on the estimate I sent over for ${projectName || "your project"}. Just checking to see if you had any questions, wanted any revisions, or if you'd like to get on the schedule.\n\nIf it helps, I can also provide an updated option based on your budget or timeline.\n\nThanks,\nTradesman AI User;

return ( <div className="min-h-screen bg-slate-950 text-white"> <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.2),transparent_25%),radial-gradient(circle_at_top_left,rgba(239,68,68,0.22),transparent_30%),linear-gradient(to_bottom,rgba(15,23,42,1),rgba(2,6,23,1))]" /> <div className="relative z-10"> <header className="sticky top-0 border-b border-white/10 bg-slate-950/75 backdrop-blur"> <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6"> <div className="flex items-center gap-3"> <div className="rounded-2xl bg-gradient-to-br from-red-500 via-orange-500 to-amber-400 p-2 shadow-lg shadow-orange-500/20"> <Wrench className="h-5 w-5 text-white" /> </div> <div> <div className="text-lg font-bold tracking-wide">Tradesman AI</div> <div className="text-xs text-slate-300">Sales, estimates, and customer follow-up for contractors</div> </div> </div>

<nav className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" className="text-white hover:bg-white/10">Features</Button>
          <Button variant="ghost" className="text-white hover:bg-white/10">Pricing</Button>
          <Button variant="ghost" className="text-white hover:bg-white/10">Download</Button>
          <Button className="rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90">
            {signedIn ? "Open Workspace" : "Start Free"}
          </Button>
        </nav>

        <Button
          variant="ghost"
          className="md:hidden text-white hover:bg-white/10"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-white/10 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            <Button variant="ghost" className="justify-start text-white hover:bg-white/10">Features</Button>
            <Button variant="ghost" className="justify-start text-white hover:bg-white/10">Pricing</Button>
            <Button variant="ghost" className="justify-start text-white hover:bg-white/10">Download</Button>
            <Button className="justify-start rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90">
              {signedIn ? "Open Workspace" : "Start Free"}
            </Button>
          </div>
        </div>
      )}
    </header>

    <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur"
        >
          <Badge className="mb-4 rounded-full bg-orange-500/20 px-3 py-1 text-orange-200 hover:bg-orange-500/20">
            Built for contractors, trades, and service businesses
          </Badge>
          <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">
            Quote jobs faster. Follow up automatically. Win more work.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-300 md:text-lg">
            A lively contractor-first workspace with homeowner lead capture, 3 free AI-powered estimates,
            estimate generation, customer follow-up, and inbox assistance in one clean build.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button className="rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 px-5 text-white hover:opacity-90">
              Start with 3 Free Estimates <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" className="rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10">
              <Download className="mr-2 h-4 w-4" /> Downloadable PWA Ready
            </Button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { icon: ClipboardList, title: "3 Free AI Estimates", desc: "Let every new user experience the value before paying." },
              { icon: MessageSquare, title: "AI Assistant", desc: "Write follow-ups, revisions, and customer messages in seconds." },
              { icon: Mail, title: "Inbox Assistant", desc: "Sort leads, summarize requests, and prioritize hot opportunities." },
            ].map((item, idx) => (
              <Card key={idx} className="rounded-3xl border-white/10 bg-slate-900/70 text-white">
                <CardContent className="p-5">
                  <item.icon className="mb-3 h-8 w-8 text-orange-400" />
                  <div className="font-semibold">{item.title}</div>
                  <div className="mt-1 text-sm text-slate-300">{item.desc}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="grid gap-4"
        >
          <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ShieldCheck className="h-5 w-5 text-green-400" /> MVP Status
              </CardTitle>
              <CardDescription className="text-slate-300">
                Stable sales-first build that can be shown to contractors now.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                  <span>Core product completion</span>
                  <span>82%</span>
                </div>
                <Progress value={82} />
              </div>
              <div className="grid gap-3 text-sm text-slate-200">
                {[
                  "Landing page and contractor value proposition",
                  "3 free estimate usage model",
                  "Estimate builder workspace",
                  "AI follow-up assistant",
                  "Inbox assistant demo workflow",
                  "Downloadable PWA positioning",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-white/10 bg-gradient-to-br from-red-500/15 via-orange-500/10 to-slate-900 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-300">Current plan</div>
                  <div className="text-2xl font-bold">{plan}</div>
                </div>
                <Badge className="rounded-full bg-green-500/20 text-green-200 hover:bg-green-500/20">
                  Live Demo State
                </Badge>
              </div>
              <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-sm text-slate-300">Free estimates remaining</div>
                <div className="mt-1 text-4xl font-black text-orange-300">{freeEstimatesRemaining}</div>
                <div className="mt-2 text-sm text-slate-300">
                  Includes AI assistant access during free estimate usage.
                </div>
                <Button
                  onClick={useFreeEstimate}
                  disabled={freeEstimatesRemaining === 0}
                  className="mt-4 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90 disabled:opacity-50"
                >
                  Use 1 Free Estimate
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[260px_1fr]">
        <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-white h-fit">
          <CardContent className="p-4">
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="rounded-2xl bg-orange-500/20 p-2">
                <User className="h-5 w-5 text-orange-300" />
              </div>
              <div>
                <div className="font-semibold">Contractor Workspace</div>
                <div className="text-xs text-slate-400">Single build / demo-ready</div>
              </div>
            </div>

            <div className="space-y-2">
              {[
                ["dashboard", Briefcase, "Dashboard"],
                ["estimate", Calculator, "Estimate Builder"],
                ["assistant", Sparkles, "AI Assistant"],
                ["inbox", Mail, "Inbox Assistant"],
                ["leads", Layers3, "Leads"],
              ].map(([value, Icon, label]) => (
                <Button
                  key={String(value)}
                  variant="ghost"
                  onClick={() => setActiveTab(String(value))}
                  className={`w-full justify-start rounded-2xl text-white hover:bg-white/10 ${
                    activeTab === value ? "bg-white/10" : ""
                  }`}
                >
                  <Icon className="mr-2 h-4 w-4 text-orange-300" />
                  {label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {activeTab === "dashboard" && (
            <div className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "This Month's Quotes", value: "18", icon: FileText },
                  { label: "Close Rate", value: "31%", icon: BadgeDollarSign },
                  { label: "Active Leads", value: "27", icon: Building2 },
                  { label: "Assistant Actions", value: "54", icon: Sparkles },
                ].map((item) => (
                  <Card key={item.label} className="rounded-3xl border-white/10 bg-slate-900/80 text-white">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-slate-400">{item.label}</div>
                          <div className="mt-2 text-3xl font-black">{item.value}</div>
                        </div>
                        <div className="rounded-2xl bg-orange-500/15 p-3">
                          <item.icon className="h-5 w-5 text-orange-300" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-white">
                  <CardHeader>
                    <CardTitle>What makes this sellable now</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 text-sm text-slate-300">
                    {[
                      "Clear painkiller: faster estimates and faster follow-up for contractors.",
                      "Built-in free usage model: 3 free AI-assisted estimates before upgrade.",
                      "Looks modern enough to demo locally without being embarrassed by bland UI.",
                      "Expandable into subscriptions, CRM, invoices, and full customer comms later.",
                    ].map((item) => (
                      <div key={item} className="flex gap-2"><Star className="mt-0.5 h-4 w-4 text-orange-300" />{item}</div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-white">
                  <CardHeader>
                    <CardTitle>What still gets added later</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 text-sm text-slate-300">
                    {[
                      "Real authentication and database",
                      "Stripe subscription and usage tracking",
                      "PDF estimate export and branded proposals",
                      "Real email / SMS delivery",
                      "Full contractor inbox integrations",
                    ].map((item) => (
                      <div key={item} className="flex gap-2"><Hammer className="mt-0.5 h-4 w-4 text-red-300" />{item}</div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "estimate" && (
            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-orange-300" /> Estimate Builder
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    AI-guided estimate workflow with editable line items and markup.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm text-slate-300">Trade</label>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(tradeTemplates).map((t) => (
                          <Button
                            key={t}
                            variant="outline"
                            onClick={() => switchTrade(t as keyof typeof tradeTemplates)}
                            className={`rounded-2xl border-white/10 text-white hover:bg-white/10 ${trade === t ? "bg-white/10" : "bg-white/5"}`}
                          >
                            {t}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm text-slate-300">Target markup %</label>
                      <Input
                        type="number"
                        value={markup}
                        onChange={(e) => setMarkup(Number(e.target.value || 0))}
                        className="rounded-2xl border-white/10 bg-white/5 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm text-slate-300">Client name</label>
                      <Input value={clientName} onChange={(e) => setClientName(e.target.value)} className="rounded-2xl border-white/10 bg-white/5 text-white" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm text-slate-300">Project name</label>
                      <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} className="rounded-2xl border-white/10 bg-white/5 text-white" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Scope of work</label>
                    <Textarea value={scope} onChange={(e) => setScope(e.target.value)} className="min-h-[110px] rounded-2xl border-white/10 bg-white/5 text-white" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Budget note</label>
                    <Input value={budget} onChange={(e) => setBudget(e.target.value)} className="rounded-2xl border-white/10 bg-white/5 text-white" />
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="font-semibold">Line Items</div>
                      <Button onClick={addLineItem} className="rounded-2xl bg-orange-500 text-white hover:bg-orange-500/90">Add Item</Button>
                    </div>
                    <div className="space-y-3">
                      {lineItems.map((item, index) => (
                        <div key={index} className="grid gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 md:grid-cols-[1.5fr_0.6fr_0.6fr_0.8fr]">
                          <Input value={item.name} onChange={(e) => updateLineItem(index, "name", e.target.value)} className="rounded-xl border-white/10 bg-slate-950/70 text-white" />
                          <Input value={item.qty} type="number" onChange={(e) => updateLineItem(index, "qty", e.target.value)} className="rounded-xl border-white/10 bg-slate-950/70 text-white" />
                          <Input value={item.unit} onChange={(e) => updateLineItem(index, "unit", e.target.value)} className="rounded-xl border-white/10 bg-slate-950/70 text-white" />
                          <Input value={item.rate} type="number" onChange={(e) => updateLineItem(index, "rate", e.target.value)} className="rounded-xl border-white/10 bg-slate-950/70 text-white" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-white">
                  <CardHeader>
                    <CardTitle>Estimate Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-slate-300"><span>Subtotal</span><span>{currency(subtotal)}</span></div>
                    <div className="flex items-center justify-between text-slate-300"><span>Markup ({markup}%)</span><span>{currency(total - subtotal)}</span></div>
                    <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xl font-bold"><span>Total</span><span>{currency(total)}</span></div>
                    <div className="rounded-2xl bg-green-500/10 p-3 text-sm text-green-200">
                      Great starter quote for demo purposes. Next step is branded PDF export.
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-orange-300" /> AI Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-slate-300">
                    {aiRecommendations.map((tip) => (
                      <div key={tip} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        {tip}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "assistant" && (
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-orange-300" /> AI Assistant
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Helps users feel the product during the free estimate experience.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Prompt</label>
                    <Textarea
                      value={assistantPrompt}
                      onChange={(e) => setAssistantPrompt(e.target.value)}
                      className="min-h-[180px] rounded-2xl border-white/10 bg-white/5 text-white"
                    />
                  </div>
                  <Button className="rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90">
                    Generate Response
                  </Button>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Output</label>
                  <div className="min-h-[240px] whitespace-pre-wrap rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-slate-200">
                    {assistantOutput}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "inbox" && (
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-orange-300" /> Inbox Assistant
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Demo inbox triage for estimate requests and follow-up opportunities.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="relative">
                  <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search inbox..."
                    className="rounded-2xl border-white/10 bg-white/5 pl-9 text-white"
                  />
                </div>
                <div className="grid gap-4">
                  {filteredInbox.map((message) => (
                    <div key={message.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold">{message.subject}</div>
                          <div className="text-sm text-slate-400">{message.from} • {message.company}</div>
                        </div>
                        <Badge className={`rounded-full ${message.priority === "High" ? "bg-red-500/20 text-red-200" : message.priority === "Medium" ? "bg-orange-500/20 text-orange-200" : "bg-slate-500/20 text-slate-200"}`}>
                          {message.priority}
                        </Badge>
                      </div>
                      <div className="mt-3 text-sm text-slate-300">{message.summary}</div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button variant="outline" className="rounded-2xl border-white/10 bg-transparent text-white hover:bg-white/10">Draft Reply</Button>
                        <Button variant="outline" className="rounded-2xl border-white/10 bg-transparent text-white hover:bg-white/10">Create Estimate</Button>
                        <Button variant="outline" className="rounded-2xl border-white/10 bg-transparent text-white hover:bg-white/10">Mark Hot Lead</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "leads" && (
            <Card className="rounded-3xl border-white/10 bg-slate-900/80 text-white">
              <CardHeader>
                <CardTitle>Lead Pipeline</CardTitle>
                <CardDescription className="text-slate-300">Simple contractor CRM view for demos and early sales.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {crmLeads.map((lead) => (
                  <Card key={lead.name} className="rounded-3xl border-white/10 bg-white/5 text-white">
                    <CardContent className="p-5">
                      <div className="text-lg font-bold">{lead.name}</div>
                      <div className="mt-2 text-3xl font-black text-orange-300">{lead.value}</div>
                      <Badge className="mt-3 rounded-full bg-white/10 text-slate-200 hover:bg-white/10">{lead.status}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          {
            icon: Phone,
            title: "Local sales ready",
            desc: "You can call local contractors and let them test 3 free AI-assisted estimates right away.",
          },
          {
            icon: Download,
            title: "PWA direction",
            desc: "This structure is positioned for installable web app deployment on mobile and desktop.",
          },
          {
            icon: Sparkles,
            title: "Expand next",
            desc: "Stripe, auth, PDF export, and true AI / inbox integrations are the next production layer.",
          },
        ].map((item) => (
          <Card key={item.title} className="rounded-3xl border-white/10 bg-slate-900/70 text-white">
            <CardContent className="p-5">
              <item.icon className="mb-3 h-7 w-7 text-orange-300" />
              <div className="font-semibold">{item.title}</div>
              <div className="mt-2 text-sm text-slate-300">{item.desc}</div>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  </div>
</div>

); }