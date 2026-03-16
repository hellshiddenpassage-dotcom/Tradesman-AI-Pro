import React, { useEffect, useMemo, useState } from "react";

const BASIC_STRIPE_LINK = "https://buy.stripe.com/eVqdR26372Cb7BW8Y5d7q03";
const PRO_STRIPE_LINK = "https://buy.stripe.com/dRmfZa3UZa4D7BWgqxd7q04";

type ThemeMode = "dark" | "light";
type Plan = "basic" | "pro";
type Tool =
  | "dashboard"
  | "settings"
  | "customers"
  | "saved"
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

type Customer = {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
};

type SavedDoc = {
  id: string;
  type: string;
  title: string;
  customerName: string;
  createdAt: string;
  content: string;
};

type EstimateForm = {
  customerName: string;
  jobType: string;
  siteAddress: string;
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
  customerName: string;
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

const SETTINGS_KEY = "tradesman_ai_company_settings_v5";
const THEME_KEY = "tradesman_ai_theme_v5";
const PLAN_KEY = "tradesman_ai_plan_v5";
const CUSTOMERS_KEY = "tradesman_ai_customers_v5";
const DOCS_KEY = "tradesman_ai_saved_docs_v5";

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

function getInitialCustomers(): Customer[] {
  try {
    const saved = localStorage.getItem(CUSTOMERS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function getInitialDocs(): SavedDoc[] {
  try {
    const saved = localStorage.getItem(DOCS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [plan, setPlan] = useState<Plan>(getInitialPlan);
  const [tool, setTool] = useState<Tool>("dashboard");
  const [output, setOutput] = useState("Your generated output will appear here.");

  const [settings, setSettings] = useState<CompanySettings>(getInitialSettings);
  const [customers, setCustomers] = useState<Customer[]>(getInitialCustomers);
  const [savedDocs, setSavedDocs] = useState<SavedDoc[]>(getInitialDocs);

  const [customerForm, setCustomerForm] = useState<Customer>({
    id: "",
    name: "",
    company: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  const [estimate, setEstimate] = useState<EstimateForm>({
    customerName: "",
    jobType: "Pad Prep / Gravel",
    siteAddress: "",
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
    customerName: "",
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

  useEffect(() => {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(DOCS_KEY, JSON.stringify(savedDocs));
  }, [savedDocs]);

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

  function exportPDF() {
    const jspdfLib = (window as any).jspdf;
    if (!jspdfLib?.jsPDF) {
      alert("PDF library did not load.");
      return;
    }

    const { jsPDF } = jspdfLib;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const left = 14;
    const right = pageWidth - 14;
    let y = 18;

    const ensurePage = (needed = 10) => {
      if (y + needed > pageHeight - 16) {
        doc.addPage();
        y = 18;
      }
    };

    const addHeader = (title: string, subtitle?: string) => {
      doc.setFillColor(23, 32, 45);
      doc.rect(0, 0, pageWidth, 30, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text(settings.companyName || "Tradesman AI", left, 14);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(settings.location || "", left, 21);
      doc.setFontSize(17);
      doc.setFont("helvetica", "bold");
      doc.text(title, right, 16, { align: "right" });
      if (subtitle) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(subtitle, right, 22, { align: "right" });
      }
      doc.setTextColor(33, 37, 41);
      y = 40;
    };

    const addSection = (title: string) => {
      ensurePage(12);
      doc.setFillColor(239, 231, 255);
      doc.rect(left, y - 5, right - left, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text(title, left + 2, y);
      doc.setTextColor(33, 37, 41);
      y += 10;
    };

    const addTextBlock = (text: string) => {
      const lines = doc.splitTextToSize(text || "", right - left);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      lines.forEach((line: string) => {
        ensurePage(6);
        doc.text(line, left, y);
        y += 5;
      });
      y += 2;
    };

    const addKeyValue = (label: string, value: string) => {
      ensurePage(6);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`${label}:`, left, y);
      doc.setFont("helvetica", "normal");
      doc.text(value || "-", left + 38, y);
      y += 6;
    };

    const addMoneyRow = (label: string, value: string, bold = false) => {
      ensurePage(6);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(10);
      doc.text(label, left, y);
      doc.text(value, right, y, { align: "right" });
      y += 6;
    };

    const addLineItemTable = () => {
      addSection("Line Items");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Description", left, y);
      doc.text("Qty", 120, y);
      doc.text("Unit", 150, y);
      doc.text("Total", right, y, { align: "right" });
      y += 4;
      doc.line(left, y, right, y);
      y += 5;

      invoice.items.forEach((item) => {
        ensurePage(8);
        const total = item.quantity * item.unitPrice;
        const lines = doc.splitTextToSize(item.description || "-", 95);
        doc.setFont("helvetica", "normal");
        doc.text(lines, left, y);
        doc.text(String(item.quantity), 120, y);
        doc.text(currency(item.unitPrice), 150, y);
        doc.text(currency(total), right, y, { align: "right" });
        y += Math.max(lines.length * 5, 6);
        y += 2;
      });
    };

    if (tool === "estimate") {
      addHeader("Estimate", estimate.jobType || "Job Estimate");
      addSection("Customer");
      addKeyValue("Customer Name", estimate.customerName || "Not specified");
      addKeyValue("Site Address", estimate.siteAddress || "Not specified");

      addSection("Project Information");
      addKeyValue("Job Type", estimate.jobType);
      addKeyValue(
        "Dimensions",
        `${estimate.length} ft × ${estimate.width} ft × ${estimate.depthInches} in`
      );
      addKeyValue("Material", estimate.material);
      addKeyValue("Volume", `${num(estimateMath.cubicYards)} cubic yards`);
      addKeyValue("Estimated Tons", `${num(estimateMath.tons)} tons`);

      addSection("Cost Breakdown");
      addMoneyRow(
        `Labor (${estimate.laborHours} hrs @ ${currency(estimate.laborRate)}/hr)`,
        currency(estimateMath.laborCost)
      );
      addMoneyRow(
        `Equipment (${estimate.equipmentHours} hrs @ ${currency(
          estimate.equipmentRate
        )}/hr)`,
        currency(estimateMath.equipmentCost)
      );
      addMoneyRow(
        `Material (${num(estimateMath.tons)} tons @ ${currency(
          estimate.materialPricePerTon
        )}/ton)`,
        currency(estimateMath.materialCost)
      );
      addMoneyRow("Mobilization", currency(estimate.mobilization));
      addMoneyRow("Dump Fees", currency(estimate.dumpFees));
      addMoneyRow("Direct Cost", currency(estimateMath.directCost));
      addMoneyRow(
        `Markup (${estimate.markupPercent}%)`,
        currency(estimateMath.markupAmount)
      );
      addMoneyRow("Total Estimate", currency(estimateMath.total), true);

      addSection("Notes");
      addTextBlock(estimate.notes || "No additional notes entered.");

      doc.save("TradesmanAI_Estimate.pdf");
      return;
    }

    if (tool === "scope") {
      addHeader("Scope of Work", scope.projectName || "Project Scope");
      addSection("Customer");
      addKeyValue("Customer Name", scope.customerName || "Not specified");

      addSection("Project Information");
      addKeyValue("Project Name", scope.projectName || "Not specified");

      addSection("Work Description");
      addTextBlock(scope.jobDescription || "No description entered.");

      addSection("Materials / Inclusions");
      addTextBlock(
        scope.materials || "To be determined based on final conditions and approval."
      );

      addSection("Customer Notes / Site Conditions");
      addTextBlock(scope.customerNotes || "No customer notes entered.");

      addSection("Timeline");
      addTextBlock(scope.timeline);

      addSection("Exclusions");
      addTextBlock(scope.exclusions);

      doc.save("TradesmanAI_ScopeOfWork.pdf");
      return;
    }

    if (tool === "invoice") {
      const subtotal = invoice.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );
      const tax = subtotal * (invoice.taxPercent / 100);
      const total = subtotal + tax;

      addHeader("Invoice / Quote", `Invoice # ${invoice.invoiceNumber}`);

      addSection("Customer");
      addKeyValue("Customer Name", invoice.customerName || "Not specified");
      addKeyValue("Job Name", invoice.jobName || "Not specified");

      addLineItemTable();

      addSection("Totals");
      addMoneyRow("Subtotal", currency(subtotal));
      addMoneyRow(`Tax (${invoice.taxPercent}%)`, currency(tax));
      addMoneyRow("Total Due", currency(total), true);

      addSection("Notes");
      addTextBlock(invoice.notes || "No additional notes entered.");

      doc.save("TradesmanAI_Invoice.pdf");
      return;
    }

    if (tool === "contract") {
      addHeader(contract.contractTitle || "Contract", contract.projectName || "");

      addSection("Parties");
      addKeyValue("Contractor", settings.companyName);
      addKeyValue("Client", contract.clientName || "Not specified");
      addKeyValue("Project", contract.projectName || "Not specified");
      addKeyValue("Start Date", contract.startDate || "Not specified");
      addKeyValue("Contract Price", contract.contractPrice || "To be determined");

      addSection("Scope of Work");
      addTextBlock(contract.scopeOfWork || "No scope entered.");

      addSection("Completion Terms");
      addTextBlock(contract.completionTerms);

      addSection("Payment Terms");
      addTextBlock(contract.paymentTerms);

      addSection("Exclusions");
      addTextBlock(contract.exclusions);

      addSection("Warranty / Limitation");
      addTextBlock(contract.warranty);

      addSection("Signatures");
      addTextBlock(contract.signatures);

      doc.save("TradesmanAI_Contract.pdf");
      return;
    }

    if (tool === "troubleshoot") {
      addHeader("Troubleshooting Report", trouble.machine || "");

      addSection("Machine Information");
      addKeyValue("Machine / Vehicle", trouble.machine || "Machine not specified");
      addKeyValue("Severity", trouble.severity || "Not specified");

      addSection("Reported Symptom");
      addTextBlock(trouble.symptom || "No symptom entered.");

      addSection("Recent Repairs / Events");
      addTextBlock(trouble.recentWork || "No recent work entered.");

      addSection("Initial Diagnostic Direction");
      addTextBlock(
        plan !== "pro"
          ? "Troubleshooting Assistant is part of the Pro plan. Upgrade to Pro to unlock AI-assisted troubleshooting."
          : `Likely Cause Areas
1. Electrical power / fuse / relay / switch issue
2. Hydraulic restriction, low pressure, or control issue
3. Sensor, safety interlock, or input issue
4. Mechanical wear, binding, or failed component

Recommended Checks
1. Verify battery voltage, grounds, and visible wiring
2. Check all relevant fuses, relays, and safety switches
3. Inspect fluid levels, filters, leaks, and hydraulic hoses
4. Listen for solenoid engagement or pump load changes
5. Test suspect circuits with a multimeter`
      );

      doc.save("TradesmanAI_Troubleshooting.pdf");
      return;
    }

    const lines = doc.splitTextToSize(output || "No output generated yet.", 180);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(lines, 14, 20);
    doc.save("TradesmanAI_Document.pdf");
  }

  function saveCurrentOutput(type: string, title: string, customerName: string) {
    if (!output || output === "Your generated output will appear here.") {
      alert("Generate output first.");
      return;
    }

    const doc: SavedDoc = {
      id: uid(),
      type,
      title: title || `${type} document`,
      customerName: customerName || "",
      createdAt: new Date().toLocaleString(),
      content: output,
    };

    setSavedDocs((prev) => [doc, ...prev]);
    setOutput(`${type.toUpperCase()} SAVED

Title:
${doc.title}

Customer:
${doc.customerName || "Not specified"}

Saved:
${doc.createdAt}

The document has been saved locally in this browser.`);
  }

  function loadSavedDoc(doc: SavedDoc) {
    setOutput(doc.content);
    setTool("saved");
  }

  function deleteSavedDoc(id: string) {
    setSavedDocs((prev) => prev.filter((d) => d.id !== id));
  }

  function saveCustomer() {
    if (!customerForm.name.trim()) {
      alert("Customer name is required.");
      return;
    }

    if (customerForm.id) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === customerForm.id ? customerForm : c))
      );
      setOutput(`CUSTOMER UPDATED

Name:
${customerForm.name}

Company:
${customerForm.company || "-"}

Phone:
${customerForm.phone || "-"}

Email:
${customerForm.email || "-"}`);
    } else {
      const newCustomer = { ...customerForm, id: uid() };
      setCustomers((prev) => [newCustomer, ...prev]);
      setOutput(`CUSTOMER SAVED

Name:
${newCustomer.name}

Company:
${newCustomer.company || "-"}

Phone:
${newCustomer.phone || "-"}

Email:
${newCustomer.email || "-"}`);
    }

    setCustomerForm({
      id: "",
      name: "",
      company: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
    });
  }

  function editCustomer(c: Customer) {
    setCustomerForm(c);
    setTool("customers");
  }

  function deleteCustomer(id: string) {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  }

  function useCustomer(name: string) {
    setEstimate((prev) => ({ ...prev, customerName: name }));
    setScope((prev) => ({ ...prev, customerName: name }));
    setInvoice((prev) => ({ ...prev, customerName: name }));
    setContract((prev) => ({ ...prev, clientName: name }));
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
- Tax: ${settings.taxPercent}%`);
  }

  function generateEstimate() {
    setOutput(`ESTIMATE SUMMARY

Company:
${settings.companyName}

Location:
${settings.location}

Customer:
${estimate.customerName || "Not specified"}

Site Address:
${estimate.siteAddress || "Not specified"}

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

Customer:
${scope.customerName || "Not specified"}

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
${scope.exclusions}`);
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
${trouble.recentWork || "No recent work entered"}

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
7. Compare working and non-working functions if applicable`);
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
              Contractor tools for estimates, scopes, invoices, contracts, saved jobs, saved customers, and Pro troubleshooting.
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
                • Saved Customers
                <br />
                • Saved Jobs / Documents
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
                • Professional PDF exports
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
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

              <button style={toolBtnStyle(tool === "dashboard")} onClick={() => setTool("dashboard")}>
                Dashboard
              </button>
              <button style={toolBtnStyle(tool === "settings")} onClick={() => setTool("settings")}>
                Company Settings
              </button>
              <button style={toolBtnStyle(tool === "customers")} onClick={() => setTool("customers")}>
                Customers
              </button>
              <button style={toolBtnStyle(tool === "saved")} onClick={() => setTool("saved")}>
                Saved Jobs / Docs
              </button>
              <button style={toolBtnStyle(tool === "estimate")} onClick={() => setTool("estimate")}>
                Estimate Generator
              </button>
              <button style={toolBtnStyle(tool === "scope")} onClick={() => setTool("scope")}>
                Scope of Work Writer
              </button>
              <button style={toolBtnStyle(tool === "invoice")} onClick={() => setTool("invoice")}>
                Invoice / Quote Builder
              </button>
              <button style={toolBtnStyle(tool === "contract")} onClick={() => setTool("contract")}>
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
                  <Metric label="Customers" value={String(customers.length)} colors={colors} />
                  <Metric label="Saved Docs" value={String(savedDocs.length)} colors={colors} />
                  <Metric label="Labor Rate" value={currency(settings.laborRate)} colors={colors} />
                </div>
              </Card>
            )}

            {tool === "settings" && (
              <Card title="Company Settings" colors={colors}>
                <Grid>
                  <Field label="Company Name" value={settings.companyName} onChange={(v) => setSettings({ ...settings, companyName: v })} colors={colors} />
                  <Field label="Location" value={settings.location} onChange={(v) => setSettings({ ...settings, location: v })} colors={colors} />
                  <Field label="Labor Rate / Hr" type="number" value={String(settings.laborRate)} onChange={(v) => setSettings({ ...settings, laborRate: Number(v) || 0 })} colors={colors} />
                  <Field label="Equipment Rate / Hr" type="number" value={String(settings.equipmentRate)} onChange={(v) => setSettings({ ...settings, equipmentRate: Number(v) || 0 })} colors={colors} />
                  <Field label="Material Price / Ton" type="number" value={String(settings.materialPricePerTon)} onChange={(v) => setSettings({ ...settings, materialPricePerTon: Number(v) || 0 })} colors={colors} />
                  <Field label="Markup %" type="number" value={String(settings.markupPercent)} onChange={(v) => setSettings({ ...settings, markupPercent: Number(v) || 0 })} colors={colors} />
                  <Field label="Tax %" type="number" value={String(settings.taxPercent)} onChange={(v) => setSettings({ ...settings, taxPercent: Number(v) || 0 })} colors={colors} />
                  <Field label="Mobilization Default" type="number" value={String(settings.mobilizationDefault)} onChange={(v) => setSettings({ ...settings, mobilizationDefault: Number(v) || 0 })} colors={colors} />
                  <Field label="Dump Fees Default" type="number" value={String(settings.dumpFeesDefault)} onChange={(v) => setSettings({ ...settings, dumpFeesDefault: Number(v) || 0 })} colors={colors} />
                  <Field label="Currency" value={settings.currency} onChange={(v) => setSettings({ ...settings, currency: v.toUpperCase() })} colors={colors} />
                </Grid>
              </Card>
            )}

            {tool === "customers" && (
              <Card title="Customers" colors={colors}>
                <Grid>
                  <Field label="Customer Name" value={customerForm.name} onChange={(v) => setCustomerForm({ ...customerForm, name: v })} colors={colors} />
                  <Field label="Company" value={customerForm.company} onChange={(v) => setCustomerForm({ ...customerForm, company: v })} colors={colors} />
                  <Field label="Phone" value={customerForm.phone} onChange={(v) => setCustomerForm({ ...customerForm, phone: v })} colors={colors} />
                  <Field label="Email" value={customerForm.email} onChange={(v) => setCustomerForm({ ...customerForm, email: v })} colors={colors} />
                  <Field label="Address" value={customerForm.address} onChange={(v) => setCustomerForm({ ...customerForm, address: v })} colors={colors} />
                </Grid>
                <Area label="Notes" value={customerForm.notes} onChange={(v) => setCustomerForm({ ...customerForm, notes: v })} colors={colors} />

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
                  <button onClick={saveCustomer} style={primaryBtn(colors)}>
                    {customerForm.id ? "Update Customer" : "Save Customer"}
                  </button>
                </div>

                <div style={{ display: "grid", gap: 12 }}>
                  {customers.length === 0 ? (
                    <div style={{ color: colors.muted }}>No saved customers yet.</div>
                  ) : (
                    customers.map((c) => (
                      <div
                        key={c.id}
                        style={{
                          background: colors.outputBg,
                          border: `1px solid ${colors.border}`,
                          borderRadius: 12,
                          padding: 14,
                        }}
                      >
                        <div style={{ fontWeight: 800 }}>{c.name}</div>
                        <div style={{ color: colors.muted, marginTop: 4 }}>
                          {c.company || "-"} | {c.phone || "-"} | {c.email || "-"}
                        </div>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                          <button onClick={() => useCustomer(c.name)} style={secondaryBtn(colors)}>
                            Use in Forms
                          </button>
                          <button onClick={() => editCustomer(c)} style={secondaryBtn(colors)}>
                            Edit
                          </button>
                          <button onClick={() => deleteCustomer(c.id)} style={dangerBtn(colors)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            )}

            {tool === "saved" && (
              <Card title="Saved Jobs / Documents" colors={colors}>
                <div style={{ display: "grid", gap: 12 }}>
                  {savedDocs.length === 0 ? (
                    <div style={{ color: colors.muted }}>No saved documents yet.</div>
                  ) : (
                    savedDocs.map((d) => (
                      <div
                        key={d.id}
                        style={{
                          background: colors.outputBg,
                          border: `1px solid ${colors.border}`,
                          borderRadius: 12,
                          padding: 14,
                        }}
                      >
                        <div style={{ fontWeight: 800 }}>{d.title}</div>
                        <div style={{ color: colors.muted, marginTop: 4 }}>
                          {d.type} | {d.customerName || "No customer"} | {d.createdAt}
                        </div>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                          <button onClick={() => loadSavedDoc(d)} style={secondaryBtn(colors)}>
                            Open
                          </button>
                          <button onClick={() => deleteSavedDoc(d.id)} style={dangerBtn(colors)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            )}

            {tool === "estimate" && (
              <Card title="Estimate Generator" colors={colors}>
                <Grid>
                  <Field label="Customer Name" value={estimate.customerName} onChange={(v) => setEstimate({ ...estimate, customerName: v })} colors={colors} />
                  <Field label="Site Address" value={estimate.siteAddress} onChange={(v) => setEstimate({ ...estimate, siteAddress: v })} colors={colors} />
                  <Field label="Job Type" value={estimate.jobType} onChange={(v) => setEstimate({ ...estimate, jobType: v })} colors={colors} />
                  <Field label="Material" value={estimate.material} onChange={(v) => setEstimate({ ...estimate, material: v })} colors={colors} />
                  <Field label="Length (ft)" type="number" value={String(estimate.length)} onChange={(v) => setEstimate({ ...estimate, length: Number(v) || 0 })} colors={colors} />
                  <Field label="Width (ft)" type="number" value={String(estimate.width)} onChange={(v) => setEstimate({ ...estimate, width: Number(v) || 0 })} colors={colors} />
                  <Field label="Depth (in)" type="number" value={String(estimate.depthInches)} onChange={(v) => setEstimate({ ...estimate, depthInches: Number(v) || 0 })} colors={colors} />
                  <Field label="Material Price / Ton" type="number" value={String(estimate.materialPricePerTon)} onChange={(v) => setEstimate({ ...estimate, materialPricePerTon: Number(v) || 0 })} colors={colors} />
                  <Field label="Labor Hours" type="number" value={String(estimate.laborHours)} onChange={(v) => setEstimate({ ...estimate, laborHours: Number(v) || 0 })} colors={colors} />
                  <Field label="Labor Rate / Hr" type="number" value={String(estimate.laborRate)} onChange={(v) => setEstimate({ ...estimate, laborRate: Number(v) || 0 })} colors={colors} />
                  <Field label="Equipment Hours" type="number" value={String(estimate.equipmentHours)} onChange={(v) => setEstimate({ ...estimate, equipmentHours: Number(v) || 0 })} colors={colors} />
                  <Field label="Equipment Rate / Hr" type="number" value={String(estimate.equipmentRate)} onChange={(v) => setEstimate({ ...estimate, equipmentRate: Number(v) || 0 })} colors={colors} />
                  <Field label="Mobilization" type="number" value={String(estimate.mobilization)} onChange={(v) => setEstimate({ ...estimate, mobilization: Number(v) || 0 })} colors={colors} />
                  <Field label="Dump Fees" type="number" value={String(estimate.dumpFees)} onChange={(v) => setEstimate({ ...estimate, dumpFees: Number(v) || 0 })} colors={colors} />
                  <Field label="Markup %" type="number" value={String(estimate.markupPercent)} onChange={(v) => setEstimate({ ...estimate, markupPercent: Number(v) || 0 })} colors={colors} />
                </Grid>

                <Area label="Notes" value={estimate.notes} onChange={(v) => setEstimate({ ...estimate, notes: v })} colors={colors} />

                <div style={{ marginTop: 16, background: colors.outputBg, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                  <Metric label="Cubic Yards" value={num(estimateMath.cubicYards)} colors={colors} />
                  <Metric label="Estimated Tons" value={num(estimateMath.tons)} colors={colors} />
                  <Metric label="Direct Cost" value={currency(estimateMath.directCost)} colors={colors} />
                  <Metric label="Estimated Total" value={currency(estimateMath.total)} colors={colors} />
                </div>
              </Card>
            )}

            {tool === "scope" && (
              <Card title="Scope of Work Writer" colors={colors}>
                <Grid>
                  <Field label="Customer Name" value={scope.customerName} onChange={(v) => setScope({ ...scope, customerName: v })} colors={colors} />
                  <Field label="Project Name" value={scope.projectName} onChange={(v) => setScope({ ...scope, projectName: v })} colors={colors} />
                </Grid>
                <Area label="Job Description" value={scope.jobDescription} onChange={(v) => setScope({ ...scope, jobDescription: v })} colors={colors} />
                <Area label="Materials / Inclusions" value={scope.materials} onChange={(v) => setScope({ ...scope, materials: v })} colors={colors} />
                <Area label="Customer Notes / Site Conditions" value={scope.customerNotes} onChange={(v) => setScope({ ...scope, customerNotes: v })} colors={colors} />
                <Area label="Timeline" value={scope.timeline} onChange={(v) => setScope({ ...scope, timeline: v })} colors={colors} />
                <Area label="Exclusions" value={scope.exclusions} onChange={(v) => setScope({ ...scope, exclusions: v })} colors={colors} />
              </Card>
            )}

            {tool === "invoice" && (
              <Card title="Invoice / Quote Builder" colors={colors}>
                <Grid>
                  <Field label="Customer Name" value={invoice.customerName} onChange={(v) => setInvoice({ ...invoice, customerName: v })} colors={colors} />
                  <Field label="Job Name" value={invoice.jobName} onChange={(v) => setInvoice({ ...invoice, jobName: v })} colors={colors} />
                  <Field label="Invoice Number" value={invoice.invoiceNumber} onChange={(v) => setInvoice({ ...invoice, invoiceNumber: v })} colors={colors} />
                  <Field label="Tax %" type="number" value={String(invoice.taxPercent)} onChange={(v) => setInvoice({ ...invoice, taxPercent: Number(v) || 0 })} colors={colors} />
                </Grid>

                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: colors.muted, marginBottom: 8 }}>
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

                <Area label="Notes" value={invoice.notes} onChange={(v) => setInvoice({ ...invoice, notes: v })} colors={colors} />
              </Card>
            )}

            {tool === "contract" && (
              <Card title="Contract Builder" colors={colors}>
                <Grid>
                  <Field label="Contract Title" value={contract.contractTitle} onChange={(v) => setContract({ ...contract, contractTitle: v })} colors={colors} />
                  <Field label="Client Name" value={contract.clientName} onChange={(v) => setContract({ ...contract, clientName: v })} colors={colors} />
                  <Field label="Project Name" value={contract.projectName} onChange={(v) => setContract({ ...contract, projectName: v })} colors={colors} />
                  <Field label="Contract Price" value={contract.contractPrice} onChange={(v) => setContract({ ...contract, contractPrice: v })} colors={colors} />
                  <Field label="Start Date" value={contract.startDate} onChange={(v) => setContract({ ...contract, startDate: v })} colors={colors} />
                </Grid>
                <Area label="Scope of Work" value={contract.scopeOfWork} onChange={(v) => setContract({ ...contract, scopeOfWork: v })} colors={colors} />
                <Area label="Completion Terms" value={contract.completionTerms} onChange={(v) => setContract({ ...contract, completionTerms: v })} colors={colors} />
                <Area label="Payment Terms" value={contract.paymentTerms} onChange={(v) => setContract({ ...contract, paymentTerms: v })} colors={colors} />
                <Area label="Exclusions" value={contract.exclusions} onChange={(v) => setContract({ ...contract, exclusions: v })} colors={colors} />
                <Area label="Warranty / Limitation" value={contract.warranty} onChange={(v) => setContract({ ...contract, warranty: v })} colors={colors} />
                <Area label="Signatures" value={contract.signatures} onChange={(v) => setContract({ ...contract, signatures: v })} colors={colors} />
              </Card>
            )}

            {tool === "troubleshoot" && (
              <Card title="Troubleshooting Assistant (Pro)" colors={colors}>
                <Field label="Machine / Vehicle" value={trouble.machine} onChange={(v) => setTrouble({ ...trouble, machine: v })} colors={colors} />
                <Area label="Main Symptom" value={trouble.symptom} onChange={(v) => setTrouble({ ...trouble, symptom: v })} colors={colors} />
                <Area label="Recent Work / Relevant History" value={trouble.recentWork} onChange={(v) => setTrouble({ ...trouble, recentWork: v })} colors={colors} />
                <Field label="Severity" value={trouble.severity} onChange={(v) => setTrouble({ ...trouble, severity: v })} colors={colors} />
              </Card>
            )}

            {tool !== "dashboard" && tool !== "customers" && tool !== "saved" && (
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
                <button onClick={generateFromActiveTool} style={primaryBtn(colors)}>
                  {tool === "settings" ? "Save Settings" : "Generate Output"}
                </button>
                <button onClick={copyOutput} style={secondaryBtn(colors)}>
                  Copy
                </button>
                <button onClick={exportPDF} style={secondaryBtn(colors)}>
                  Export PDF
                </button>
                {tool === "estimate" && (
                  <button
                    onClick={() => saveCurrentOutput("estimate", `${estimate.jobType} Estimate`, estimate.customerName)}
                    style={secondaryBtn(colors)}
                  >
                    Save Estimate
                  </button>
                )}
                {tool === "scope" && (
                  <button
                    onClick={() => saveCurrentOutput("scope", scope.projectName || "Scope of Work", scope.customerName)}
                    style={secondaryBtn(colors)}
                  >
                    Save Scope
                  </button>
                )}
                {tool === "invoice" && (
                  <button
                    onClick={() => saveCurrentOutput("invoice", `Invoice ${invoice.invoiceNumber}`, invoice.customerName)}
                    style={secondaryBtn(colors)}
                  >
                    Save Invoice
                  </button>
                )}
                {tool === "contract" && (
                  <button
                    onClick={() => saveCurrentOutput("contract", contract.projectName || contract.contractTitle, contract.clientName)}
                    style={secondaryBtn(colors)}
                  >
                    Save Contract
                  </button>
                )}
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
                  flexWrap: "wrap",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 800 }}>Generated Output</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button onClick={copyOutput} style={secondaryBtn(colors)}>
                    Copy
                  </button>
                  <button onClick={exportPDF} style={secondaryBtn(colors)}>
                    Export PDF
                  </button>
                </div>
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