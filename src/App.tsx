import { useMemo, useState, type ReactNode } from "react";

type TradeKey =
  | "General"
  | "Concrete"
  | "Electrical"
  | "Plumbing"
  | "Earthwork"
  | "Fabrication"
  | "Automotive";

type TabKey = "dashboard" | "estimate" | "assistant" | "inbox";

type LineItem = {
  name: string;
  qty: number;
  unit: string;
  rate: number;
};

type InboxMessage = {
  id: number;
  from: string;
  company: string;
  subject: string;
  priority: "High" | "Medium" | "Low";
  summary: string;
};

const tradeTemplates: Record<TradeKey, LineItem[]> = {
  General: [
    { name: "Mobilization / Setup", qty: 1, unit: "job", rate: 150 },
    { name: "Labor", qty: 8, unit: "hrs", rate: 95 },
    { name: "Materials Allowance", qty: 1, unit: "lot", rate: 350 },
  ],
  Concrete: [
    { name: "Site Prep", qty: 4, unit: "hrs", rate: 105 },
    { name: "Forming", qty: 6, unit: "hrs", rate: 95 },
    { name: "Concrete Placement", qty: 4, unit: "yd", rate: 185 },
  ],
  Electrical: [
    { name: "Service Call / Diagnostics", qty: 1, unit: "job", rate: 125 },
    { name: "Licensed Labor", qty: 6, unit: "hrs", rate: 120 },
    { name: "Materials", qty: 1, unit: "lot", rate: 275 },
  ],
  Plumbing: [
    { name: "Trip Charge", qty: 1, unit: "job", rate: 95 },
    { name: "Labor", qty: 5, unit: "hrs", rate: 115 },
    { name: "Parts", qty: 1, unit: "lot", rate: 225 },
  ],
  Earthwork: [
    { name: "Equipment Time", qty: 6, unit: "hrs", rate: 165 },
    { name: "Operator Labor", qty: 6, unit: "hrs", rate: 85 },
    { name: "Haul / Disposal", qty: 1, unit: "lot", rate: 240 },
  ],
  Fabrication: [
    { name: "Design / Layout", qty: 2, unit: "hrs", rate: 95 },
    { name: "Fabrication Labor", qty: 6, unit: "hrs", rate: 110 },
    { name: "Material", qty: 1, unit: "lot", rate: 400 },
    { name: "Welding / Finishing", qty: 2, unit: "hrs", rate: 110 },
  ],
  Automotive: [
    { name: "Diagnostics", qty: 1, unit: "job", rate: 120 },
    { name: "Labor", qty: 3, unit: "hrs", rate: 95 },
    { name: "Parts", qty: 1, unit: "lot", rate: 250 },
    { name: "Shop Supplies", qty: 1, unit: "lot", rate: 45 },
  ],
};

const inboxMessages: InboxMessage[] = [
  {
    id: 1,
    from: "Sarah Johnson",
    company: "Johnson Property Group",
    subject: "Need bid for retaining wall repair",
    priority: "High",
    summary:
      "Wants a fast quote this week for erosion and wall failure behind duplex.",
  },
  {
    id: 2,
    from: "Mike Torres",
    company: "Homeowner",
    subject: "Concrete patio add-on question",
    priority: "Medium",
    summary: "Asked whether the patio can be extended and what timeline looks like.",
  },
  {
    id: 3,
    from: "Alicia Reed",
    company: "Reed Retail LLC",
    subject: "Electrical estimate follow-up",
    priority: "Low",
    summary: "Needs a revised quote with alternate fixture pricing.",
  },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getRecommendations(trade: string, scope: string, budget: string): string[] {
  const notes: string[] = [
    `Recommend clear scope wording for ${trade.toLowerCase()} work to reduce change-order disputes.`,
    "Add a materials allowance clause to protect margin from supplier fluctuations.",
    "Include schedule language, payment terms, and exclusions in the final estimate.",
  ];

  const scopeLower = scope.toLowerCase();

  if (scopeLower.includes("demo") || scopeLower.includes("remove")) {
    notes.push("Add debris hauling and disposal as a separate line item.");
  }

  if (budget.trim()) {
    notes.push(
      `Customer mentioned target budget around ${budget}; consider a good / better / best option set.`
    );
  }

  return notes;
}

function StatCard(props: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-lg">
      <div className="text-sm text-slate-400">{props.label}</div>
      <div className="mt-2 text-3xl font-black text-white">{props.value}</div>
    </div>
  );
}

function SectionCard(props: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-lg">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white">{props.title}</h2>
        {props.subtitle ? (
          <p className="mt-1 text-sm text-slate-400">{props.subtitle}</p>
        ) : null}
      </div>
      {props.children}
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [trade, setTrade] = useState<TradeKey>("General");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    ...tradeTemplates.General,
  ]);
  const [clientName, setClientName] = useState<string>("John Carter");
  const [projectName, setProjectName] = useState<string>(
    "Backyard retaining wall repair"
  );
  const [scope, setScope] = useState<string>(
    "Repair failed retaining wall section, regrade affected area, haul debris, and restore drainage path."
  );
  const [budget, setBudget] = useState<string>("$8,000 - $12,000");
  const [markup, setMarkup] = useState<number>(18);
  const [freeEstimatesRemaining, setFreeEstimatesRemaining] = useState<number>(3);
  const [search, setSearch] = useState<string>("");

  const subtotal = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + item.qty * item.rate, 0);
  }, [lineItems]);

  const total = useMemo(() => {
    return subtotal * (1 + markup / 100);
  }, [subtotal, markup]);

  const recommendations = useMemo(() => {
    return getRecommendations(trade, scope, budget);
  }, [trade, scope, budget]);

  const filteredInbox = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return inboxMessages;

    return inboxMessages.filter((message) => {
      const haystack = [
        message.from,
        message.company,
        message.subject,
        message.priority,
        message.summary,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [search]);

  const assistantOutput = useMemo(() => {
    return `Subject: Quick follow-up on your estimate

Hi ${clientName},

I wanted to follow up on the estimate I sent over for ${projectName}. Just checking to see if you had any questions, wanted any revisions, or if you'd like to get on the schedule.

If it helps, I can also provide an updated option based on your budget or timeline.

Thanks,
Tradesman AI User`;
  }, [clientName, projectName]);

  function switchTrade(nextTrade: TradeKey) {
    setTrade(nextTrade);
    setLineItems([...tradeTemplates[nextTrade]]);
  }

  function updateLineItem(index: number, field: keyof LineItem, value: string) {
    setLineItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        if (field === "qty" || field === "rate") {
          return {
            ...item,
            [field]: Number(value) || 0,
          };
        }

        return {
          ...item,
          [field]: value,
        } as LineItem;
      })
    );
  }

  function addLineItem() {
    setLineItems((prev) => [
      ...prev,
      { name: "Custom Line Item", qty: 1, unit: "ea", rate: 100 },
    ]);
  }

  function useFreeEstimate() {
    setFreeEstimatesRemaining((prev) => (prev > 0 ? prev - 1 : 0));
  }

  function priorityClass(priority: InboxMessage["priority"]): string {
    if (priority === "High") return "bg-red-500/20 text-red-200";
    if (priority === "Medium") return "bg-orange-500/20 text-orange-200";
    return "bg-slate-500/20 text-slate-200";
  }

  const tabButtonBase =
    "rounded-2xl border px-4 py-2 text-sm font-semibold transition";
  const inactiveTab =
    "border-white/15 bg-white/5 text-white hover:bg-white/10";
  const activeTabClass =
    "border-orange-500 bg-orange-500 text-white hover:bg-orange-500/90";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.18),transparent_25%),radial-gradient(circle_at_top_left,rgba(239,68,68,0.2),transparent_28%)]">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="mb-8 rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl backdrop-blur">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center rounded-full bg-orange-500/20 px-4 py-2 text-sm font-semibold text-orange-200">
                  Contractor sales MVP
                </div>

                <h1 className="text-4xl font-black tracking-tight md:text-6xl">
                  Tradesman AI
                </h1>

                <p className="mt-4 max-w-2xl text-base text-slate-300 md:text-lg">
                  Fast estimates, AI follow-up, inbox triage, and a cleaner
                  contractor workflow with 3 free AI-assisted estimates built in.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button className="rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 px-5 py-3 font-semibold text-white transition hover:opacity-90">
                    Start 3 Free Estimates
                  </button>
                  <button className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10">
                    PWA Ready
                  </button>
                </div>
              </div>

              <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="text-lg font-bold">Free usage</div>
                <p className="mt-1 text-sm text-slate-300">
                  Every new contractor gets AI access during free estimate usage.
                </p>

                <div className="mt-5 text-sm text-slate-400">
                  Free estimates remaining
                </div>
                <div className="mt-2 text-5xl font-black text-orange-300">
                  {freeEstimatesRemaining}
                </div>

                <button
                  onClick={useFreeEstimate}
                  disabled={freeEstimatesRemaining === 0}
                  className="mt-4 w-full rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Use 1 Free Estimate
                </button>
              </div>
            </div>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="This Month's Quotes" value="18" />
            <StatCard label="Close Rate" value="31%" />
            <StatCard label="Active Leads" value="27" />
            <StatCard label="Assistant Actions" value="54" />
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`${tabButtonBase} ${
                activeTab === "dashboard" ? activeTabClass : inactiveTab
              }`}
            >
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab("estimate")}
              className={`${tabButtonBase} ${
                activeTab === "estimate" ? activeTabClass : inactiveTab
              }`}
            >
              Estimate Builder
            </button>

            <button
              onClick={() => setActiveTab("assistant")}
              className={`${tabButtonBase} ${
                activeTab === "assistant" ? activeTabClass : inactiveTab
              }`}
            >
              AI Assistant
            </button>

            <button
              onClick={() => setActiveTab("inbox")}
              className={`${tabButtonBase} ${
                activeTab === "inbox" ? activeTabClass : inactiveTab
              }`}
            >
              Inbox Assistant
            </button>
          </div>

          {activeTab === "dashboard" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <SectionCard title="Why this is sellable now">
                <div className="space-y-3 text-slate-300">
                  <p>Fast quotes and fast follow-up are real contractor pain points.</p>
                  <p>3 free AI-assisted estimates make it easy to offer a no-risk test.</p>
                  <p>This version is clean enough to demo locally without feeling half-baked.</p>
                  <p>It can grow into subscriptions, CRM, invoicing, and real messaging later.</p>
                </div>
              </SectionCard>

              <SectionCard title="Next production layer">
                <div className="space-y-3 text-slate-300">
                  <p>Stripe subscriptions and usage tracking</p>
                  <p>Auth and database persistence</p>
                  <p>PDF estimate export</p>
                  <p>Email and SMS delivery</p>
                  <p>Real inbox integrations</p>
                </div>
              </SectionCard>
            </div>
          )}

          {activeTab === "estimate" && (
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <SectionCard
                title="Estimate Builder"
                subtitle="Simple, stable, editable estimate workflow."
              >
                <div className="space-y-5">
                  <div>
                    <div className="mb-2 text-sm text-slate-300">Trade</div>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(tradeTemplates) as TradeKey[]).map((key) => (
                        <button
                          key={key}
                          onClick={() => switchTrade(key)}
                          className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                            trade === key ? activeTabClass : inactiveTab
                          }`}
                        >
                          {key}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="mb-2 text-sm text-slate-300">Client name</div>
                      <input
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                      />
                    </div>

                    <div>
                      <div className="mb-2 text-sm text-slate-300">Project name</div>
                      <input
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 text-sm text-slate-300">Scope</div>
                    <textarea
                      value={scope}
                      onChange={(e) => setScope(e.target.value)}
                      className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="mb-2 text-sm text-slate-300">Budget note</div>
                      <input
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                      />
                    </div>

                    <div>
                      <div className="mb-2 text-sm text-slate-300">Markup %</div>
                      <input
                        type="number"
                        value={markup}
                        onChange={(e) => setMarkup(Number(e.target.value) || 0)}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="font-semibold text-white">Line Items</div>
                      <button
                        onClick={addLineItem}
                        className="rounded-2xl bg-orange-500 px-4 py-2 font-semibold text-white transition hover:bg-orange-500/90"
                      >
                        Add Item
                      </button>
                    </div>

                    <div className="space-y-3">
                      {lineItems.map((item, index) => (
                        <div
                          key={index}
                          className="grid gap-2 md:grid-cols-[1.5fr_0.6fr_0.6fr_0.8fr]"
                        >
                          <input
                            value={item.name}
                            onChange={(e) =>
                              updateLineItem(index, "name", e.target.value)
                            }
                            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none"
                          />
                          <input
                            type="number"
                            value={item.qty}
                            onChange={(e) =>
                              updateLineItem(index, "qty", e.target.value)
                            }
                            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none"
                          />
                          <input
                            value={item.unit}
                            onChange={(e) =>
                              updateLineItem(index, "unit", e.target.value)
                            }
                            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none"
                          />
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) =>
                              updateLineItem(index, "rate", e.target.value)
                            }
                            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </SectionCard>

              <div className="space-y-6">
                <SectionCard title="Estimate Summary">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Markup ({markup}%)</span>
                      <span>{formatCurrency(total - subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xl font-bold text-white">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="AI Recommendations">
                  <div className="space-y-3 text-sm text-slate-300">
                    {recommendations.map((note) => (
                      <div
                        key={note}
                        className="rounded-2xl border border-white/10 bg-white/5 p-3"
                      >
                        {note}
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>
            </div>
          )}

          {activeTab === "assistant" && (
            <SectionCard
              title="AI Assistant"
              subtitle="Demo follow-up message generation for contractors."
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <div className="mb-2 text-sm text-slate-300">Suggested output</div>
                  <textarea
                    readOnly
                    value={assistantOutput}
                    className="min-h-[260px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                  />
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-slate-300">
                  <div className="mb-3 text-lg font-semibold text-white">
                    What this demonstrates
                  </div>
                  <p className="mb-2">
                    Contractors can generate follow-ups fast without staring at a blank screen.
                  </p>
                  <p className="mb-2">
                    This is good enough for sales demos while real AI calls get wired in later.
                  </p>
                  <p>
                    The free estimate offer becomes stronger because users immediately feel useful output.
                  </p>
                </div>
              </div>
            </SectionCard>
          )}

          {activeTab === "inbox" && (
            <SectionCard
              title="Inbox Assistant"
              subtitle="Demo inbox triage for estimate requests and follow-up opportunities."
            >
              <div>
                <div className="mb-5">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search inbox..."
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                  />
                </div>

                <div className="grid gap-4">
                  {filteredInbox.map((message) => (
                    <div
                      key={message.id}
                      className="rounded-3xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold text-white">{message.subject}</div>
                          <div className="text-sm text-slate-400">
                            {message.from} • {message.company}
                          </div>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityClass(
                            message.priority
                          )}`}
                        >
                          {message.priority}
                        </span>
                      </div>

                      <div className="mt-3 text-sm text-slate-300">
                        {message.summary}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button className="rounded-2xl border border-white/15 bg-transparent px-4 py-2 font-semibold text-white transition hover:bg-white/10">
                          Draft Reply
                        </button>
                        <button className="rounded-2xl border border-white/15 bg-transparent px-4 py-2 font-semibold text-white transition hover:bg-white/10">
                          Create Estimate
                        </button>
                        <button className="rounded-2xl border border-white/15 bg-transparent px-4 py-2 font-semibold text-white transition hover:bg-white/10">
                          Mark Hot Lead
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;