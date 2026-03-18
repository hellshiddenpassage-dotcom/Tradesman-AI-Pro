import React, { useMemo, useState } from "react";

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

  // ✅ ADDED
  Fabrication: [
    { name: "Design / Layout", qty: 2, unit: "hrs", rate: 95 },
    { name: "Fabrication Labor", qty: 6, unit: "hrs", rate: 110 },
    { name: "Material", qty: 1, unit: "lot", rate: 400 },
    { name: "Welding / Finishing", qty: 2, unit: "hrs", rate: 110 },
  ],

  // ✅ ADDED
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
    summary: "Wants a fast quote this week.",
  },
  {
    id: 2,
    from: "Mike Torres",
    company: "Homeowner",
    subject: "Concrete patio add-on",
    priority: "Medium",
    summary: "Asked about extending patio.",
  },
  {
    id: 3,
    from: "Alicia Reed",
    company: "Retail LLC",
    subject: "Electrical follow-up",
    priority: "Low",
    summary: "Needs revised quote.",
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [trade, setTrade] = useState<TradeKey>("General");
  const [lineItems, setLineItems] = useState<LineItem[]>([...tradeTemplates.General]);
  const [markup, setMarkup] = useState<number>(18);

  const subtotal = useMemo(
    () => lineItems.reduce((sum, i) => sum + i.qty * i.rate, 0),
    [lineItems]
  );

  const total = useMemo(
    () => subtotal * (1 + markup / 100),
    [subtotal, markup]
  );

  function switchTrade(next: TradeKey) {
    setTrade(next);
    setLineItems([...tradeTemplates[next]]);
  }

  function updateItem(i: number, field: keyof LineItem, value: string) {
    setLineItems((prev) =>
      prev.map((item, idx) =>
        idx === i
          ? {
              ...item,
              [field]:
                field === "qty" || field === "rate"
                  ? Number(value) || 0
                  : value,
            }
          : item
      )
    );
  }

  return (
    <div className="p-6 text-white bg-slate-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Tradesman AI</h1>

      <div className="mb-4 flex gap-2 flex-wrap">
        {(Object.keys(tradeTemplates) as TradeKey[]).map((t) => (
          <button
            key={t}
            onClick={() => switchTrade(t)}
            className={`px-4 py-2 rounded ${
              trade === t ? "bg-orange-500" : "bg-slate-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {lineItems.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={item.name}
              onChange={(e) => updateItem(i, "name", e.target.value)}
              className="bg-slate-800 px-2"
            />
            <input
              type="number"
              value={item.qty}
              onChange={(e) => updateItem(i, "qty", e.target.value)}
              className="bg-slate-800 w-20"
            />
            <input
              value={item.unit}
              onChange={(e) => updateItem(i, "unit", e.target.value)}
              className="bg-slate-800 w-20"
            />
            <input
              type="number"
              value={item.rate}
              onChange={(e) => updateItem(i, "rate", e.target.value)}
              className="bg-slate-800 w-24"
            />
          </div>
        ))}
      </div>

      <div className="mt-6">
        <div>Subtotal: {formatCurrency(subtotal)}</div>
        <div>Total: {formatCurrency(total)}</div>
      </div>
    </div>
  );
}

export default App;