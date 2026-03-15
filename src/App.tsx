import React, { useEffect, useMemo, useState } from "react";

const BASIC_STRIPE_LINK = "https://buy.stripe.com/eVqdR26372Cb7BW8Y5d7q03";
const PRO_STRIPE_LINK = "https://buy.stripe.com/dRmfZa3UZa4D7BWgqxd7q04";

type ThemeMode = "dark" | "light";
type Plan = "basic" | "pro";
type Tool =
  | "dashboard"
  | "settings"
  | "estimate"
  | "scope"
  | "invoice"
  | "contract"
  | "troubleshoot";

type CompanySettings = {
  companyName: string;
  location: string;
  laborRate: number;
  equipmentRate: number;
  materialPricePerTon: number;
  markupPercent: number;
  taxPercent: number;
  mobilizationDefault: number;
  dumpFeesDefault: number;
  currency: string;
  dashboardLanguage: string;
  documentLanguage: string;
};

type EstimateForm = {
  jobType: string;
  length: number;
  width: number;
  depthInches: number;
  material: string;
  materialPricePerTon: number;
  laborHours: number;
  laborRate: number;
  equipmentHours: number;
  equipmentRate: number;
  mobilization: number;
  dumpFees: number;
  markupPercent: number;
  notes: string;
};

type ScopeForm = {
  projectName: string;
  jobDescription: string;
  materials: string;
  customerNotes: string;
  exclusions: string;
  timeline: string;
};

type InvoiceItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

type InvoiceForm = {
  customerName: string;
  jobName: string;
  invoiceNumber: string;
  taxPercent: number;
  notes: string;
  items: InvoiceItem[];
};

type ContractForm = {
  contractTitle: string;
  clientName: string;
  projectName: string;
  scopeOfWork: string;
  contractPrice: string;
  startDate: string;
  completionTerms: string;
  paymentTerms: string;
  exclusions: string;
  warranty: string;
  signatures: string;
};

type TroubleForm = {
  machine: string;
  symptom: string;
  recentWork: string;
  severity: string;
};

const SETTINGS_KEY = "tradesman_ai_company_settings_v2";
const THEME_KEY = "tradesman_ai_theme_v2";
const PLAN_KEY = "tradesman_ai_plan_v2";

const defaultSettings: CompanySettings = {
  companyName: "Your Company",
  location: "Your City",
  laborRate: 85,
  equipmentRate: 110,
  materialPricePerTon: 22,
  markupPercent: 18,
  taxPercent: 0,
  mobilizationDefault: 150,
  dumpFeesDefault: 0,
  currency: "USD",
  dashboardLanguage: "English",
  documentLanguage: "English",
};

function getInitialSettings(): CompanySettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

function getInitialTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function getInitialPlan(): Plan {
  try {
    const saved = localStorage.getItem(PLAN_KEY);
    return saved === "pro" ? "pro" : "basic";
  } catch {
    return "basic";
  }
}

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [plan, setPlan] = useState<Plan>(getInitialPlan);
  const [tool, setTool] = useState<Tool>("dashboard");
  const [output, setOutput] = useState(
    "Your generated output will appear here."
  );

  const [settings, setSettings] = useState<CompanySettings>(getInitialSettings);

  const [estimate, setEstimate] = useState<EstimateForm>({
    jobType: "Pad Prep / Gravel",
    length: 40,
    width: 60,
    depthInches: 6,
    material: "Road Base",
    materialPricePerTon: getInitialSettings().materialPricePerTon,
    laborHours: 8,
    laborRate: getInitialSettings().laborRate,
    equipmentHours: 6,
    equipmentRate: getInitialSettings().equipmentRate,
    mobilization: getInitialSettings().mobilizationDefault,
    dumpFees: getInitialSettings().dumpFeesDefault,
    markupPercent: getInitialSettings().markupPercent,
    notes: "",
  });

  const [scope, setScope] = useState<ScopeForm>({
    projectName: "",
    jobDescription: "",
    materials: "",
    customerNotes: "",
    exclusions:
      "Hidden underground obstructions, unmarked utilities, weather delays, and work not specifically listed.",
    timeline:
      "Work to be scheduled based on weather, access, material availability, and contractor availability.",
  });

  const [invoice, setInvoice] = useState<InvoiceForm>({
    customerName: "",
    jobName: "",
    invoiceNumber: "1001",
    taxPercent: getInitialSettings().taxPercent,
    notes: "",
    items: [
      {
        description: "Labor",
        quantity: 8,
        unitPrice: getInitialSettings().laborRate,
      },
      {
        description: "Equipment",
        quantity: 6,
        unitPrice: getInitialSettings().equipmentRate,
      },
      {
        description: "Material Delivery",
        quantity: 20,
        unitPrice: getInitialSettings().materialPricePerTon,
      },
    ],
  });

  const [contract, setContract] = useState<ContractForm>({
    contractTitle: "Service Agreement",
    clientName: "",
    projectName: "",
    scopeOfWork: "",
    contractPrice: "",
    startDate: "",
    completionTerms:
      "Completion timeline is subject to weather, site access, material availability, and unforeseen field conditions.",
    paymentTerms:
      "Payment due according to invoice terms unless otherwise agreed in writing.",
    exclusions:
      "Hidden conditions, unmarked utilities, permit fees unless specified, and work not explicitly listed in the scope of work.",
    warranty:
      "Workmanship warranty applies only to labor performed by contractor and does not cover customer-supplied materials, abuse, neglect, or acts of nature.",
    signatures:
      "Client Signature: ____________________    Date: __________\nContractor Signature: ____________________    Date: __________",
  });

  const [trouble, setTrouble] = useState<TroubleForm>({
    machine: "",
    symptom: "",
    recentWork: "",
    severity: "Machine runs but performance is limited",
  });

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(PLAN_KEY, plan);
  }, [plan]);

  const colors = useMemo(() => {
    if (theme === "light") {
      return {
        pageBg: "#eef2f7",
        panelBg: "#ffffff",
        panelAlt: "#f6f7fb",
        border: "#d6dbe6",
        text: "#1f2937",
        muted: "#667085",
        accent: "#8b5cf6",
        accentSoft: "#efe7ff",
        outputBg: "#f8fafc",
        inputBg: "#ffffff",
        danger: "#b42318",
        success: "#067647",
      };
    }

    return {
      pageBg: "#0f1724",
      panelBg: "#17202d",
      panelAlt: "#1d2939",
      border: "#334155",
      text: "#edf2f7",
      muted: "#a8b3c7",
      accent: "#9b87f5",
      accentSoft: "#241f3c",
      outputBg: "#111827",
      inputBg: "#0f1724",
      danger: "#ef4444",
      success: "#22c55e",
    };
  }, [theme]);

  const estimateMath = useMemo(() => {
    const cubicFeet = estimate.length * estimate.width * (estimate.depthInches / 12);
    const cubicYards = cubicFeet / 27;
    const tons = cubicYards * 1.4;
    const laborCost = estimate.laborHours * estimate.laborRate;
    const equipmentCost = estimate.equipmentHours * estimate.equipmentRate;
    const materialCost = tons * estimate.materialPricePerTon;
    const directCost =
      laborCost +
      equipmentCost +
      materialCost +
      estimate.mobilization +
      estimate.dumpFees;
    const markupAmount = directCost * (estimate.markupPercent / 100);
    const total = directCost + markupAmount;

    return {
      cubicYards,
      tons,
      laborCost,
      equipmentCost,
      materialCost,
      directCost,
      markupAmount,
      total,
    };
  }, [estimate]);

  function currency(value: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: settings.currency || "USD",
      maximumFractionDigits: 2,
    }).format(isNaN(value) ? 0 : value);
  }

  function num(value: number) {
    return Number.isFinite(value) ? value.toFixed(2) : "0.00";
  }

  function applySettingsToForms() {
    setEstimate((prev) => ({
      ...prev,
      laborRate: settings.laborRate,
      equipmentRate: settings.equipmentRate,
      materialPricePerTon: settings.materialPricePerTon,
      markupPercent: settings.markupPercent,
      mobilization: settings.mobilizationDefault,
      dumpFees: settings.dumpFeesDefault,
    }));

    setInvoice((prev) => ({
      ...prev,
      taxPercent: settings.taxPercent,
      items: [
        { description: "Labor", quantity: 8, unitPrice: settings.laborRate },
        {
          description: "Equipment",
          quantity: 6,
          unitPrice: settings.equipmentRate,
        },
        {
          description: "Material Delivery",
          quantity: 20,
          unitPrice: settings.materialPricePerTon,
        },
      ],
    }));

    setOutput(`COMPANY SETTINGS SAVED

Company:
${settings.companyName}

Location:
${settings.location}

Defaults Updated:
- Labor Rate: ${currency(settings.laborRate)}
- Equipment Rate: ${currency(settings.equipmentRate)}
- Material Price / Ton: ${currency(settings.materialPricePerTon)}
- Markup: ${settings.markupPercent}%
- Tax: ${settings.taxPercent}%
- Dashboard Language: ${settings.dashboardLanguage}
- Document Language: ${settings.documentLanguage}`);
  }

  function generateEstimate() {
    setOutput(`ESTIMATE SUMMARY

Company:
${settings.companyName}

Location:
${settings.location}

Job Type:
${estimate.jobType}

Dimensions:
${estimate.length} ft x ${estimate.width} ft x ${estimate.depthInches} in

Material:
${estimate.material}

Calculated Volume:
${num(estimateMath.cubicYards)} cubic yards

Estimated Tonnage:
${num(estimateMath.tons)} tons

COST BREAKDOWN
Labor (${estimate.laborHours} hrs @ ${currency(estimate.laborRate)}/hr): ${currency(
      estimateMath.laborCost
    )}
Equipment (${estimate.equipmentHours} hrs @ ${currency(
      estimate.equipmentRate
    )}/hr): ${currency(estimateMath.equipmentCost)}
Material (${num(estimateMath.tons)} tons @ ${currency(
      estimate.materialPricePerTon
    )}/ton): ${currency(estimateMath.materialCost)}
Mobilization: ${currency(estimate.mobilization)}
Dump Fees: ${currency(estimate.dumpFees)}

Direct Cost: ${currency(estimateMath.directCost)}
Markup (${estimate.markupPercent}%): ${currency(estimateMath.markupAmount)}

TOTAL ESTIMATE: ${currency(estimateMath.total)}

Notes:
${estimate.notes || "No additional notes entered."}`);
  }

  function generateScope() {
    setOutput(`SCOPE OF WORK

Company:
${settings.companyName}

Project:
${scope.projectName || "Not specified"}

Work Description:
${scope.jobDescription || "No description entered."}

Materials / Inclusions:
${scope.materials || "To be determined based on final conditions and approval."}

Customer Notes / Site Conditions:
${scope.customerNotes || "No customer notes entered."}

Timeline:
${scope.timeline}

Exclusions:
${scope.exclusions}

Contractor Statement:
${settings.companyName} will provide labor, equipment, and standard operating procedures necessary to complete the work in a professional manner consistent with normal industry practices. Any change in conditions, access, quantities, or customer-requested additions may require a change order or revised pricing.`);
  }

  function generateInvoice() {
    const subtotal = invoice.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const tax = subtotal * (invoice.taxPercent / 100);
    const total = subtotal + tax;

    const lineItems = invoice.items
      .map(
        (item, index) =>
          `${index + 1}. ${item.description} — Qty: ${item.quantity} × ${currency(
            item.unitPrice
          )} = ${currency(item.quantity * item.unitPrice)}`
      )
      .join("\n");

    setOutput(`INVOICE / QUOTE

Company:
${settings.companyName}

Location:
${settings.location}

Invoice #:
${invoice.invoiceNumber}

Customer:
${invoice.customerName || "Not specified"}

Job:
${invoice.jobName || "Not specified"}

LINE ITEMS
${lineItems}

Subtotal: ${currency(subtotal)}
Tax (${invoice.taxPercent}%): ${currency(tax)}

TOTAL DUE: ${currency(total)}

Notes:
${invoice.notes || "No additional notes entered."}`);
  }

  function generateContract() {
    setOutput(`${contract.contractTitle.toUpperCase()}

Contractor:
${settings.companyName}

Location:
${settings.location}

Client:
${contract.clientName || "Not specified"}

Project:
${contract.projectName || "Not specified"}

Start Date:
${contract.startDate || "Not specified"}

Contract Price:
${contract.contractPrice || "To be determined"}

SCOPE OF WORK
${contract.scopeOfWork || "No scope entered."}

COMPLETION TERMS
${contract.completionTerms}

PAYMENT TERMS
${contract.paymentTerms}

EXCLUSIONS
${contract.exclusions}

WARRANTY / LIMITATION
${contract.warranty}

SIGNATURES
${contract.signatures}`);
  }

  function generateTroubleshoot() {
    if (plan !== "pro") {
      setOutput(
        "Troubleshooting Assistant is part of the Pro plan. Upgrade to Pro to unlock AI-assisted troubleshooting."
      );
      return;
    }

    setOutput(`AI TROUBLESHOOTING ASSISTANT

Company:
${settings.companyName}

Machine / Vehicle:
${trouble.machine || "Machine not specified"}

Reported Symptom:
${trouble.symptom || "No symptom entered"}

Recent Repairs / Events:
${trouble.recentWork || "No recent work entered."}

Severity:
${trouble.severity}

LIKELY CAUSE AREAS
1. Electrical power / fuse / relay / switch issue
2. Hydraulic restriction, low pressure, or control issue
3. Sensor, safety interlock, or input issue
4. Mechanical wear, binding, or failed component

STEP-BY-STEP CHECKS
1. Verify battery voltage, grounds, and visible wiring
2. Check all relevant fuses, relays, and safety switches
3. Inspect fluid levels, filters, leaks, and hydraulic hoses
4. Listen for solenoid engagement or pump load changes
5. Test suspect circuits with a multimeter
6. Verify pressure or flow if hydraulic performance is affected
7. Compare working and non-working functions if applicable

RECOMMENDED TOOLS
- Multimeter
- Test light
- Hydraulic pressure gauge
- Infrared thermometer
- Basic hand tools
- Service manual / wiring diagram if available

LIKELY REPAIR DIRECTION
Start with electrical and fluid checks before replacing parts. Confirm whether the issue is input-related, pressure-related, or component-related, then isolate the failed section.`);
  }

  function generateFromActiveTool() {
    if (tool === "settings") applySettingsToForms();
    if (tool === "estimate") generateEstimate();
    if (tool === "scope") generateScope();
    if (tool === "invoice") generateInvoice();
    if (tool === "contract") generateContract();
    if (tool === "troubleshoot") generateTroubleshoot();
  }

  function copyOutput() {
    navigator.clipboard.writeText(output);
  }

  function toolBtnStyle(active: boolean, disabled = false): React.CSSProperties {
    return {
      width: "100%",
      textAlign: "left",
      padding: "14px 16px",
      borderRadius: 12,
      border: `1px solid ${active ? colors.accent : colors.border}`,
      background: active ? colors.accentSoft : colors.panelBg,
      color: colors.text,
      cursor: "pointer",
      fontWeight: 700,
      marginBottom: 10,
      opacity: disabled ? 0.65 : 1,
    };
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.pageBg,
        color: colors.text,
        fontFamily: "Inter, Arial, sans-serif",
        padding: 20,
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            background: `linear-gradient(180deg, ${colors.panelAlt}, ${colors.panelBg})`,
            border: `1px solid ${colors.border}`,
            borderRadius: 18,
            padding: 20,
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: 32, fontWeight: 900 }}>Tradesman AI</div>
            <div style={{ color: colors.muted, marginTop: 6 }}>
              Contractor tools for estimates, scopes, invoices, contracts, and Pro troubleshooting.
            </div>
          </div>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            style={secondaryBtn(colors)}
          >
            Switch to {theme === "dark" ? "Light" : "Dark"} Theme
          </button>
        </div>

        <div
          style={{
            background: colors.panelBg,
            border: `1px solid ${colors.border}`,
            borderRadius: 16,
            padding: 18,
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Choose Your Plan</div>
          <div style={{ color: colors.muted, marginBottom: 16 }}>
            Basic gives you the core business tools. Pro adds AI-assisted troubleshooting.
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            <div
              style={{
                border: `1px solid ${plan === "basic" ? colors.accent : colors.border}`,
                borderRadius: 14,
                padding: 18,
                background: plan === "basic" ? colors.accentSoft : colors.outputBg,
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Basic</div>
              <div style={{ fontSize: 30, fontWeight: 900, marginBottom: 8 }}>$9/mo</div>
              <div style={{ color: colors.muted, marginBottom: 12 }}>5-day free trial</div>
              <div style={{ lineHeight: 1.7, marginBottom: 16 }}>
                • Estimate Generator
                <br />
                • Scope Writer
                <br />
                • Invoice / Quote Builder
                <br />
                • Contract Builder
                <br />
                • Company Settings / Saved Defaults
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => setPlan("basic")} style={secondaryBtn(colors)}>
                  Use Basic View
                </button>
                <button
                  onClick={() => window.open(BASIC_STRIPE_LINK, "_blank")}
                  style={primaryBtn(colors)}
                >
                  Start Basic
                </button>
              </div>
            </div>

            <div
              style={{
                border: `1px solid ${plan === "pro" ? colors.accent : colors.border}`,
                borderRadius: 14,
                padding: 18,
                background: plan === "pro" ? colors.accentSoft : colors.outputBg,
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Pro</div>
              <div style={{ fontSize: 30, fontWeight: 900, marginBottom: 8 }}>$19/mo</div>
              <div style={{ color: colors.muted, marginBottom: 12 }}>AI-powered plan</div>
              <div style={{ lineHeight: 1.7, marginBottom: 16 }}>
                • Everything in Basic
                <br />
                • AI Troubleshooting Assistant
                <br />
                • Advanced AI-assisted outputs
                <br />
                • Future multilingual AI features
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => setPlan("pro")} style={secondaryBtn(colors)}>
                  Use Pro View
                </button>
                <button
                  onClick={() => window.open(PRO_STRIPE_LINK, "_blank")}
                  style={primaryBtn(colors)}
                >
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 20,
          }}
        >
          <div>
            <div
              style={{
                background: colors.panelBg,
                border: `1px solid ${colors.border}`,
                borderRadius: 16,
                padding: 16,
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Tools</div>

              <button
                style={toolBtnStyle(tool === "dashboard")}
                onClick={() => setTool("dashboard")}
              >
                Dashboard
              </button>
              <button
                style={toolBtnStyle(tool === "settings")}
                onClick={() => setTool("settings")}
              >
                Company Settings
              </button>
              <button
                style={toolBtnStyle(tool === "estimate")}
                onClick={() => setTool("estimate")}
              >
                Estimate Generator
              </button>
              <button
                style={toolBtnStyle(tool === "scope")}
                onClick={() => setTool("scope")}
              >
                Scope of Work Writer
              </button>
              <button
                style={toolBtnStyle(tool === "invoice")}
                onClick={() => setTool("invoice")}
              >
                Invoice / Quote Builder
              </button>
              <button
                style={toolBtnStyle(tool === "contract")}
                onClick={() => setTool("contract")}
              >
                Contract Builder
              </button>
              <button
                style={toolBtnStyle(tool === "troubleshoot", plan !== "pro")}
                onClick={() => {
                  setTool("troubleshoot");
                  if (plan !== "pro") {
                    setOutput(
                      "Troubleshooting Assistant is a Pro feature. Use the Pro plan card above to upgrade."
                    );
                  }
                }}
              >
                Troubleshooting Assistant (Pro)
              </button>

              <div
                style={{
                  marginTop: 14,
                  padding: 14,
                  borderRadius: 12,
                  background: colors.outputBg,
                  border: `1px solid ${colors.border}`,
                  color: colors.muted,
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                Current view: <strong>{plan === "pro" ? "Pro" : "Basic"}</strong>
                <br />
                Settings save in this browser so you do not have to re-enter your rates every time.
              </div>
            </div>
          </div>

          <div>
            {tool === "dashboard" && (
              <Card title="Dashboard" colors={colors}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 12,
                  }}
                >
                  <Metric label="Plan" value={plan === "pro" ? "Pro" : "Basic"} colors={colors} />
                  <Metric label="Labor Rate" value={currency(settings.laborRate)} colors={colors} />
                  <Metric
                    label="Equipment Rate"
                    value={currency(settings.equipmentRate)}
                    colors={colors}
                  />
                  <Metric
                    label="Material Price/Ton"
                    value={currency(settings.materialPricePerTon)}
                    colors={colors}
                  />
                </div>

                <div style={{ marginTop: 18, color: colors.muted, lineHeight: 1.7 }}>
                  Use Company Settings to set your rates, then generate estimates, scopes,
                  invoices, contracts, and Pro troubleshooting reports from the tools above.
                </div>
              </Card>
            )}

            {tool === "settings" && (
              <Card title="Company Settings" colors={colors}>
                <Grid>
                  <Field
                    label="Company Name"
                    value={settings.companyName}
                    onChange={(v) => setSettings({ ...settings, companyName: v })}
                    colors={colors}
                  />
                  <Field
                    label="Location"
                    value={settings.location}
                    onChange={(v) => setSettings({ ...settings, location: v })}
                    colors={colors}
                  />
                  <Field
                    label="Labor Rate / Hr"
                    type="number"
                    value={String(settings.laborRate)}
                    onChange={(v) => setSettings({ ...settings, laborRate: Number(v) || 0 })}
                    colors={colors}
                  />
                  <Field
                    label="Equipment Rate / Hr"
                    type="number"
                    value={String(settings.equipmentRate)}
                    onChange={(v) => setSettings({ ...settings, equipmentRate: Number(v) || 0 })}
                    colors={colors}
                  />
                  <Field
                    label="Material Price / Ton"
                    type="number"
                    value={String(settings.materialPricePerTon)}
                    onChange={(v) =>
                      setSettings({ ...settings, materialPricePerTon: Number(v) || 0 })
                    }
                    colors={colors}
                  />
                  <Field
                    label="Markup %"
                    type="number"
                    value={String(settings.markupPercent)}
                    onChange={(v) => setSettings({ ...settings, markupPercent: Number(v) || 0 })}
                    colors={colors}
                  />
                  <Field
                    label="Tax %"
                    type="number"
                    value={String(settings.taxPercent)}
                    onChange={(v) => setSettings({ ...settings, taxPercent: Number(v) || 0 })}
                    colors={colors}
                  />
                  <Field
                    label="Mobilization Default"
                    type="number"
                    value={String(settings.mobilizationDefault)}
                    onChange={(v) =>
                      setSettings({ ...settings, mobilizationDefault: Number(v) || 0 })
                    }
                    colors={colors}
                  />
                  <Field
                    label="Dump Fees Default"
                    type="number"
                    value={String(settings.dumpFeesDefault)}
                    onChange={(v) =>
                      setSettings({ ...settings, dumpFeesDefault: Number(v) || 0 })
                    }
                    colors={colors}
                  />
                  <Field
                    label="Currency"
                    value={settings.currency}
                    onChange={(v) => setSettings({ ...settings, currency: v.toUpperCase() })}
                    colors={colors}
                  />
                  <Field
                    label="Dashboard Language"
                    value={settings.dashboardLanguage}
                    onChange={(v) => setSettings({ ...settings, dashboardLanguage: v })}
                    colors={colors}
                  />
                  <Field
                    label="Document Language"
                    value={settings.documentLanguage}
                    onChange={(v) => setSettings({ ...settings, documentLanguage: v })}
                    colors={colors}
                  />
                </Grid>
              </Card>
            )}

            {tool === "estimate" && (
              <Card title="Estimate Generator" colors={colors}>
                <Grid>
                  <Field
                    label="Job Type"
                    value={estimate.jobType}
                    onChange={(v) => setEstimate({ ...estimate, jobType: v })}
                    colors={colors}
                  />
                  <Field
                    label="Material"
                    value={estimate.material}
                    onChange={(v) => setEstimate({ ...estimate, material: v })}
                    colors={colors}
                  />
                  <Field
                    label="Length (ft)"
                    type="number"
                    value={String(estimate.length)}
                    onChange={(v) => setEstimate({ ...estimate, length: Number(v) || 0 })}
                    colors={colors}
                  />
                  <Field
                    label="Width (ft)"
                    type="number"
                    value={String(estimate.width)}
                    onChange={(v) => setEstimate({ ...estimate, width: Number(v) || 0 })}
                    colors={colors}
                  />
                  <Field
                    label="Depth (in)"
                    type="number"
                    value={String(estimate.depthInches)}
                    onChange={(v) =>
                      setEstimate({ ...estimate, depthInches: Number(v) || 0 })
                    }
                    colors={colors}
                  />
                  <Field
                    label="Material Price / Ton"
                    type="number"
                    value={String(estimate.materialPricePerTon)}
                    onChange={(v) =>
                      setEstimate({
                        ...estimate,
                        materialPricePerTon: Number(v) || 0,
                      })
                    }
                    colors={colors}
                  />
                  <Field
                    label="Labor Hours"
                    type="number"
                    value={String(estimate.laborHours)}
                    onChange={(v) =>
                      setEstimate({ ...estimate, laborHours: Number(v) || 0 })
                    }
                    colors={colors}
                  />
                  <Field
                    label="Labor Rate / Hr"
                    type="number"
                    value={String(estimate.laborRate)}
                    onChange={(v) => setEstimate({ ...estimate, laborRate: Number(v) || 0 })}
                    colors={colors}
                  />
                  <Field
                    label="Equipment Hours"
                    type="number"
                    value={String(estimate.equipmentHours)}
                    onChange={(v) =>
                      setEstimate({ ...estimate, equipmentHours: Number(v) || 0 })
                    }
                    colors={colors}
                  />
                  <Field
                    label="Equipment Rate / Hr"
                    type="number"
                    value={String(estimate.equipmentRate)}
                    onChange={(v) =>
                      setEstimate({ ...estimate, equipmentRate: Number(v) || 0 })
                    }
                    colors={colors}
                  />
                  <Field
                    label="Mobilization"
                    type="number"
                    value={String(estimate.mobilization)}
                    onChange={(v) =>
                      setEstimate({ ...estimate, mobilization: Number(v) || 0 })
                    }
                    colors={colors}
                  />
                  <Field
                    label="Dump Fees"
                    type="number"
                    value={String(estimate.dumpFees)}
                    onChange={(v) => setEstimate({ ...estimate, dumpFees: Number(v) || 0 })}
                    colors={colors}
                  />
                  <Field
                    label="Markup %"
                    type="number"
                    value={String(estimate.markupPercent)}
                    onChange={(v) =>
                      setEstimate({ ...estimate, markupPercent: Number(v) || 0 })
                    }
                    colors={colors}
                  />
                </Grid>

                <Area
                  label="Notes"
                  value={estimate.notes}
                  onChange={(v) => setEstimate({ ...estimate, notes: v })}
                  colors={colors}
                />

                <div
                  style={{
                    marginTop: 16,
                    background: colors.outputBg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 12,
                    padding: 14,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 10,
                  }}
                >
                  <Metric label="Cubic Yards" value={num(estimateMath.cubicYards)} colors={colors} />
                  <Metric label="Estimated Tons" value={num(estimateMath.tons)} colors={colors} />
                  <Metric label="Direct Cost" value={currency(estimateMath.directCost)} colors={colors} />
                  <Metric label="Estimated Total" value={currency(estimateMath.total)} colors={colors} />
                </div>
              </Card>
            )}

            {tool === "scope" && (
              <Card title="Scope of Work Writer" colors={colors}>
                <Field
                  label="Project Name"
                  value={scope.projectName}
                  onChange={(v) => setScope({ ...scope, projectName: v })}
                  colors={colors}
                />
                <Area
                  label="Job Description"
                  value={scope.jobDescription}
                  onChange={(v) => setScope({ ...scope, jobDescription: v })}
                  colors={colors}
                />
                <Area
                  label="Materials / Inclusions"
                  value={scope.materials}
                  onChange={(v) => setScope({ ...scope, materials: v })}
                  colors={colors}
                />
                <Area
                  label="Customer Notes / Site Conditions"
                  value={scope.customerNotes}
                  onChange={(v) => setScope({ ...scope, customerNotes: v })}
                  colors={colors}
                />
                <Area
                  label="Timeline"
                  value={scope.timeline}
                  onChange={(v) => setScope({ ...scope, timeline: v })}
                  colors={colors}
                />
                <Area
                  label="Exclusions"
                  value={scope.exclusions}
                  onChange={(v) => setScope({ ...scope, exclusions: v })}
                  colors={colors}
                />
              </Card>
            )}

            {tool === "invoice" && (
              <Card title="Invoice / Quote Builder" colors={colors}>
                <Grid>
                  <Field
                    label="Customer Name"
                    value={invoice.customerName}
                    onChange={(v) => setInvoice({ ...invoice, customerName: v })}
                    colors={colors}
                  />
                  <Field
                    label="Job Name"
                    value={invoice.jobName}
                    onChange={(v) => setInvoice({ ...invoice, jobName: v })}
                    colors={colors}
                  />
                  <Field
                    label="Invoice Number"
                    value={invoice.invoiceNumber}
                    onChange={(v) => setInvoice({ ...invoice, invoiceNumber: v })}
                    colors={colors}
                  />
                  <Field
                    label="Tax %"
                    type="number"
                    value={String(invoice.taxPercent)}
                    onChange={(v) => setInvoice({ ...invoice, taxPercent: Number(v) || 0 })}
                    colors={colors}
                  />
                </Grid>

                <div style={{ marginTop: 14 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: colors.muted,
                      marginBottom: 8,
                    }}
                  >
                    Line Items
                  </div>

                  {invoice.items.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr 1fr auto",
                        gap: 10,
                        marginBottom: 10,
                      }}
                    >
                      <input
                        value={item.description}
                        onChange={(e) => {
                          const items = [...invoice.items];
                          items[index].description = e.target.value;
                          setInvoice({ ...invoice, items });
                        }}
                        placeholder="Description"
                        style={inputStyle(colors)}
                      />
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const items = [...invoice.items];
                          items[index].quantity = Number(e.target.value) || 0;
                          setInvoice({ ...invoice, items });
                        }}
                        placeholder="Qty"
                        style={inputStyle(colors)}
                      />
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const items = [...invoice.items];
                          items[index].unitPrice = Number(e.target.value) || 0;
                          setInvoice({ ...invoice, items });
                        }}
                        placeholder="Unit Price"
                        style={inputStyle(colors)}
                      />
                      <button
                        onClick={() => {
                          const items = invoice.items.filter((_, i) => i !== index);
                          setInvoice({
                            ...invoice,
                            items: items.length
                              ? items
                              : [{ description: "", quantity: 1, unitPrice: 0 }],
                          });
                        }}
                        style={dangerBtn(colors)}
                      >
                        X
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() =>
                      setInvoice({
                        ...invoice,
                        items: [...invoice.items, { description: "", quantity: 1, unitPrice: 0 }],
                      })
                    }
                    style={secondaryBtn(colors)}
                  >
                    Add Line Item
                  </button>
                </div>

                <Area
                  label="Notes"
                  value={invoice.notes}
                  onChange={(v) => setInvoice({ ...invoice, notes: v })}
                  colors={colors}
                />
              </Card>
            )}

            {tool === "contract" && (
              <Card title="Contract Builder" colors={colors}>
                <Grid>
                  <Field
                    label="Contract Title"
                    value={contract.contractTitle}
                    onChange={(v) => setContract({ ...contract, contractTitle: v })}
                    colors={colors}
                  />
                  <Field
                    label="Client Name"
                    value={contract.clientName}
                    onChange={(v) => setContract({ ...contract, clientName: v })}
                    colors={colors}
                  />
                  <Field
                    label="Project Name"
                    value={contract.projectName}
                    onChange={(v) => setContract({ ...contract, projectName: v })}
                    colors={colors}
                  />
                  <Field
                    label="Contract Price"
                    value={contract.contractPrice}
                    onChange={(v) => setContract({ ...contract, contractPrice: v })}
                    colors={colors}
                  />
                  <Field
                    label="Start Date"
                    value={contract.startDate}
                    onChange={(v) => setContract({ ...contract, startDate: v })}
                    colors={colors}
                  />
                </Grid>

                <Area
                  label="Scope of Work"
                  value={contract.scopeOfWork}
                  onChange={(v) => setContract({ ...contract, scopeOfWork: v })}
                  colors={colors}
                />
                <Area
                  label="Completion Terms"
                  value={contract.completionTerms}
                  onChange={(v) => setContract({ ...contract, completionTerms: v })}
                  colors={colors}
                />
                <Area
                  label="Payment Terms"
                  value={contract.paymentTerms}
                  onChange={(v) => setContract({ ...contract, paymentTerms: v })}
                  colors={colors}
                />
                <Area
                  label="Exclusions"
                  value={contract.exclusions}
                  onChange={(v) => setContract({ ...contract, exclusions: v })}
                  colors={colors}
                />
                <Area
                  label="Warranty / Limitation"
                  value={contract.warranty}
                  onChange={(v) => setContract({ ...contract, warranty: v })}
                  colors={colors}
                />
                <Area
                  label="Signatures"
                  value={contract.signatures}
                  onChange={(v) => setContract({ ...contract, signatures: v })}
                  colors={colors}
                />
              </Card>
            )}

            {tool === "troubleshoot" && (
              <Card title="Troubleshooting Assistant (Pro)" colors={colors}>
                <Field
                  label="Machine / Vehicle"
                  value={trouble.machine}
                  onChange={(v) => setTrouble({ ...trouble, machine: v })}
                  colors={colors}
                />
                <Area
                  label="Main Symptom"
                  value={trouble.symptom}
                  onChange={(v) => setTrouble({ ...trouble, symptom: v })}
                  colors={colors}
                />
                <Area
                  label="Recent Work / Relevant History"
                  value={trouble.recentWork}
                  onChange={(v) => setTrouble({ ...trouble, recentWork: v })}
                  colors={colors}
                />
                <Field
                  label="Severity"
                  value={trouble.severity}
                  onChange={(v) => setTrouble({ ...trouble, severity: v })}
                  colors={colors}
                />
              </Card>
            )}

            {tool !== "dashboard" && (
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
                <button onClick={generateFromActiveTool} style={primaryBtn(colors)}>
                  {tool === "settings" ? "Save Settings" : "Generate Output"}
                </button>
                <button onClick={copyOutput} style={secondaryBtn(colors)}>
                  Copy Output
                </button>
              </div>
            )}

            <div
              style={{
                background: colors.panelBg,
                border: `1px solid ${colors.border}`,
                borderRadius: 16,
                padding: 18,
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 800 }}>Generated Output</div>
                <button onClick={copyOutput} style={secondaryBtn(colors)}>
                  Copy
                </button>
              </div>

              <div
                style={{
                  background: colors.outputBg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 12,
                  minHeight: 360,
                  padding: 16,
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.55,
                  color: colors.text,
                  overflowWrap: "anywhere",
                }}
              >
                {output}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  colors,
  children,
}: {
  title: string;
  colors: any;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: colors.panelBg,
        border: `1px solid ${colors.border}`,
        borderRadius: 16,
        padding: 18,
        marginBottom: 18,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>{title}</div>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 14,
      }}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  colors,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  colors: any;
  type?: string;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: "block",
          fontSize: 13,
          marginBottom: 6,
          fontWeight: 700,
          color: colors.muted,
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle(colors)}
      />
    </div>
  );
}

function Area({
  label,
  value,
  onChange,
  colors,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  colors: any;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: "block",
          fontSize: 13,
          marginBottom: 6,
          fontWeight: 700,
          color: colors.muted,
        }}
      >
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...inputStyle(colors),
          minHeight: 100,
          resize: "vertical",
          fontFamily: "inherit",
        }}
      />
    </div>
  );
}

function Metric({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: any;
}) {
  return (
    <div
      style={{
        background: colors.panelBg,
        border: `1px solid ${colors.border}`,
        borderRadius: 10,
        padding: 12,
      }}
    >
      <div style={{ fontSize: 12, color: colors.muted, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: colors.text }}>{value}</div>
    </div>
  );
}

function inputStyle(colors: any): React.CSSProperties {
  return {
    width: "100%",
    boxSizing: "border-box",
    background: colors.inputBg,
    color: colors.text,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    padding: "12px 12px",
    outline: "none",
  };
}

function primaryBtn(colors?: any): React.CSSProperties {
  return {
    background: colors?.accent || "#9b87f5",
    color: "white",
    border: "none",
    borderRadius: 12,
    padding: "13px 18px",
    fontWeight: 800,
    cursor: "pointer",
  };
}

function secondaryBtn(colors?: any): React.CSSProperties {
  return {
    background: colors?.panelAlt || "#1d2939",
    color: colors?.text || "#edf2f7",
    border: `1px solid ${colors?.border || "#334155"}`,
    borderRadius: 12,
    padding: "13px 18px",
    fontWeight: 700,
    cursor: "pointer",
  };
}

function dangerBtn(colors?: any): React.CSSProperties {
  return {
    background: colors?.danger || "#ef4444",
    color: "white",
    border: "none",
    borderRadius: 10,
    padding: "0 12px",
    fontWeight: 800,
    cursor: "pointer",
  };
}