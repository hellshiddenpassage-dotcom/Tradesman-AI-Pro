import React, { useEffect, useMemo, useState } from "react";

const BASIC_STRIPE_LINK = "https://buy.stripe.com/eVqdR26372Cb7BW8Y5d7q03";
const PRO_STRIPE_LINK = "https://buy.stripe.com/dRmfZa3UZa4D7BWgqxd7q04";

const SUPABASE_URL = "https://ljizlaabarhyzocfcsba.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqaXpsYWFiYXJoeXpvY2Zjc2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1ODcxNTIsImV4cCI6MjA4OTE2MzE1Mn0.eJstZOcLE_BALH1JMhju4zQonRxMQwk5DbEXpYUIKbw";

const supabase = (window as any).supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

type ThemeMode = "dark" | "light";
type Plan = "basic" | "pro";
type Tool =
  | "dashboard"
  | "settings"
  | "customers"
  | "saved"
  | "aiBuilder"
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

type AiBuilderForm = {
  customerName: string;
  projectType: string;
  prompt: string;
};

const SETTINGS_KEY = "tradesman_ai_company_settings_v9";
const THEME_KEY = "tradesman_ai_theme_v9";
const PLAN_KEY = "tradesman_ai_plan_v9";

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
  const [session, setSession] = useState<any>(null);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [plan, setPlan] = useState<Plan>(getInitialPlan);
  const [tool, setTool] = useState<Tool>("dashboard");
  const [output, setOutput] = useState("Your generated output will appear here.");

  const [settings, setSettings] = useState<CompanySettings>(getInitialSettings);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [savedDocs, setSavedDocs] = useState<SavedDoc[]>([]);
  const [cloudLoading, setCloudLoading] = useState(false);

  const [customerForm, setCustomerForm] = useState<Customer>({
    id: "",
    name: "",
    company: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  const [aiBuilder, setAiBuilder] = useState<AiBuilderForm>({
    customerName: "",
    projectType: "Shop Pad / Gravel",
    prompt: "",
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
    let mounted = true;

    supabase.auth.getSession().then((result: any) => {
      if (mounted) {
        setSession(result?.data?.session ?? null);
        setAuthLoading(false);
      }
    });

    const authListener = supabase.auth.onAuthStateChange(
      (_event: any, nextSession: any) => {
        setSession(nextSession);
        setAuthLoading(false);
      }
    );

    return () => {
      mounted = false;
      authListener?.data?.subscription?.unsubscribe?.();
    };
  }, []);

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
    if (session?.user?.id) {
      void loadCloudData(session.user.id);
    } else {
      setCustomers([]);
      setSavedDocs([]);
    }
  }, [session]);

  async function loadCloudData(userId: string) {
    setCloudLoading(true);

    const [customersResult, docsResult] = await Promise.all([
      supabase
        .from("customers")
        .select("id,name,company,phone,email,address,notes,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("saved_docs")
        .select("id,type,title,customer_name,content,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);

    if (!customersResult.error) {
      const mappedCustomers: Customer[] = (customersResult.data || []).map((row: any) => ({
        id: row.id,
        name: row.name || "",
        company: row.company || "",
        phone: row.phone || "",
        email: row.email || "",
        address: row.address || "",
        notes: row.notes || "",
      }));
      setCustomers(mappedCustomers);
    }

    if (!docsResult.error) {
      const mappedDocs: SavedDoc[] = (docsResult.data || []).map((row: any) => ({
        id: row.id,
        type: row.type || "",
        title: row.title || "",
        customerName: row.customer_name || "",
        content: row.content || "",
        createdAt: row.created_at
          ? new Date(row.created_at).toLocaleString()
          : "",
      }));
      setSavedDocs(mappedDocs);
    }

    setCloudLoading(false);
  }

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

  async function handleSignUp() {
    setAuthMessage("");
    if (!authEmail || !authPassword) {
      setAuthMessage("Enter email and password.");
      return;
    }

    const result = await supabase.auth.signUp({
      email: authEmail,
      password: authPassword,
      options: {
        emailRedirectTo: "https://tradesman-ai-pro.vercel.app",
      },
    });

    if (result.error) {
      setAuthMessage(result.error.message);
      return;
    }

    setAuthMessage("Account created. Check your email if confirmation is required.");
  }

  async function handleSignIn() {
    setAuthMessage("");
    if (!authEmail || !authPassword) {
      setAuthMessage("Enter email and password.");
      return;
    }

    const result = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    });

    if (result.error) {
      setAuthMessage(result.error.message);
      return;
    }

    setAuthMessage("Signed in.");
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setAuthMessage("");
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
    let y = 18;
    const left = 14;
    const right = pageWidth - 14;

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

    const addTextBlock = (text: string) => {
      const lines = doc.splitTextToSize(text || "", 180);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(lines, left, y);
    };

    addHeader("Tradesman AI Document", new Date().toLocaleDateString());
    addTextBlock(output || "No output generated yet.");
    doc.save("TradesmanAI_Document.pdf");
  }

  async function saveCurrentOutput(type: string, title: string, customerName: string) {
    if (!output || output === "Your generated output will appear here.") {
      alert("Generate output first.");
      return;
    }

    if (!session?.user?.id) {
      alert("You must be signed in.");
      return;
    }

    const result = await supabase.from("saved_docs").insert({
      user_id: session.user.id,
      type,
      title: title || `${type} document`,
      customer_name: customerName || "",
      content: output,
    });

    if (result.error) {
      setOutput(`Save failed: ${result.error.message}`);
      return;
    }

    await loadCloudData(session.user.id);
    setOutput(`DOCUMENT SAVED

Title:
${title || `${type} document`}

Customer:
${customerName || "Not specified"}

Saved to cloud successfully.`);
  }

  function loadSavedDoc(doc: SavedDoc) {
    setOutput(doc.content);
    setTool("saved");
  }

  async function deleteSavedDoc(id: string) {
    if (!session?.user?.id) return;

    const result = await supabase.from("saved_docs").delete().eq("id", id);

    if (result.error) {
      setOutput(`Delete failed: ${result.error.message}`);
      return;
    }

    await loadCloudData(session.user.id);
  }

  async function saveCustomer() {
    if (!customerForm.name.trim()) {
      alert("Customer name is required.");
      return;
    }

    if (!session?.user?.id) {
      alert("You must be signed in.");
      return;
    }

    if (customerForm.id) {
      const result = await supabase
        .from("customers")
        .update({
          name: customerForm.name,
          company: customerForm.company,
          phone: customerForm.phone,
          email: customerForm.email,
          address: customerForm.address,
          notes: customerForm.notes,
        })
        .eq("id", customerForm.id);

      if (result.error) {
        setOutput(`Update failed: ${result.error.message}`);
        return;
      }
    } else {
      const result = await supabase.from("customers").insert({
        user_id: session.user.id,
        name: customerForm.name,
        company: customerForm.company,
        phone: customerForm.phone,
        email: customerForm.email,
        address: customerForm.address,
        notes: customerForm.notes,
      });

      if (result.error) {
        setOutput(`Save failed: ${result.error.message}`);
        return;
      }
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

    await loadCloudData(session.user.id);
    setOutput("Customer saved to cloud.");
  }

  function editCustomer(c: Customer) {
    setCustomerForm(c);
    setTool("customers");
  }

  async function deleteCustomer(id: string) {
    if (!session?.user?.id) return;

    const result = await supabase.from("customers").delete().eq("id", id);

    if (result.error) {
      setOutput(`Delete failed: ${result.error.message}`);
      return;
    }

    await loadCloudData(session.user.id);
  }

  function useCustomer(name: string) {
    setEstimate((prev) => ({ ...prev, customerName: name }));
    setScope((prev) => ({ ...prev, customerName: name }));
    setInvoice((prev) => ({ ...prev, customerName: name }));
    setContract((prev) => ({ ...prev, clientName: name }));
    setAiBuilder((prev) => ({ ...prev, customerName: name }));
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
        { description: "Equipment", quantity: 6, unitPrice: settings.equipmentRate },
        {
          description: "Material Delivery",
          quantity: 20,
          unitPrice: settings.materialPricePerTon,
        },
      ],
    }));

    setOutput("Company settings saved locally.");
  }

  function smartExtract(prompt: string, fallback: number) {
    const matches = prompt.match(/\d+(\.\d+)?/g);
    if (!matches || matches.length === 0) return fallback;
    return Number(matches[0]) || fallback;
  }

  function aiBuildEstimate() {
    if (plan !== "pro") {
      setOutput("AI Builder is a Pro feature. Upgrade to Pro to unlock it.");
      return;
    }

    const text = aiBuilder.prompt.toLowerCase();
    const length = text.includes("x")
      ? Number(text.split("x")[0].match(/\d+/)?.[0] || estimate.length)
      : smartExtract(text, estimate.length);

    const width = text.includes("x")
      ? Number(text.split("x")[1]?.match(/\d+/)?.[0] || estimate.width)
      : estimate.width;

    const depth =
      text.includes("inch") || text.includes("inches")
        ? Number(text.match(/(\d+)\s*(inch|inches)/)?.[1] || estimate.depthInches)
        : estimate.depthInches;

    const material = text.includes("concrete")
      ? "Concrete"
      : text.includes("asphalt")
      ? "Asphalt Millings"
      : text.includes("gravel")
      ? "Gravel"
      : text.includes("road base")
      ? "Road Base"
      : estimate.material;

    const laborHours =
      text.includes("demo") || text.includes("remove")
        ? 12
        : text.includes("pad")
        ? 8
        : text.includes("driveway")
        ? 10
        : 8;

    const equipmentHours =
      text.includes("demo") || text.includes("remove")
        ? 10
        : text.includes("driveway")
        ? 8
        : 6;

    const newEstimate = {
      ...estimate,
      customerName: aiBuilder.customerName,
      jobType: aiBuilder.projectType,
      length,
      width,
      depthInches: depth,
      material,
      laborHours,
      equipmentHours,
      notes: `AI-generated from prompt: ${aiBuilder.prompt}`,
    };

    setEstimate(newEstimate);
    setTool("estimate");

    const cubicFeet = newEstimate.length * newEstimate.width * (newEstimate.depthInches / 12);
    const cubicYards = cubicFeet / 27;
    const tons = cubicYards * 1.4;
    const laborCost = newEstimate.laborHours * newEstimate.laborRate;
    const equipmentCost = newEstimate.equipmentHours * newEstimate.equipmentRate;
    const materialCost = tons * newEstimate.materialPricePerTon;
    const directCost =
      laborCost +
      equipmentCost +
      materialCost +
      newEstimate.mobilization +
      newEstimate.dumpFees;
    const markupAmount = directCost * (newEstimate.markupPercent / 100);
    const total = directCost + markupAmount;

    setOutput(`AI ESTIMATE BUILDER

Customer:
${newEstimate.customerName || "Not specified"}

Prompt:
${aiBuilder.prompt}

AI Interpreted Job:
${newEstimate.jobType}

Dimensions:
${newEstimate.length} ft x ${newEstimate.width} ft x ${newEstimate.depthInches} in

Material:
${newEstimate.material}

Estimated Volume:
${cubicYards.toFixed(2)} cubic yards

Estimated Tonnage:
${tons.toFixed(2)} tons

Estimated Labor:
${newEstimate.laborHours} hours

Estimated Equipment:
${newEstimate.equipmentHours} hours

Estimated Total:
${currency(total)}

This estimate draft has also been pushed into the Estimate Generator form for refinement.`);
  }

  function aiBuildScope() {
    if (plan !== "pro") {
      setOutput("AI Builder is a Pro feature. Upgrade to Pro to unlock it.");
      return;
    }

    const projectName = aiBuilder.projectType || "Project";
    const description = `Provide labor, equipment, site preparation, grading, and material placement for ${projectName.toLowerCase()} as described by customer request. Work to include layout, material handling, grading, and finish work as required for normal completion of the described task.`;
    const materials = aiBuilder.prompt.toLowerCase().includes("concrete")
      ? "Concrete materials, subgrade prep, and associated labor/equipment as required."
      : aiBuilder.prompt.toLowerCase().includes("gravel") ||
        aiBuilder.prompt.toLowerCase().includes("road base")
      ? "Road base / gravel material, delivery, placement, grading, and compaction."
      : "Standard materials and equipment necessary to complete the described work.";

    const newScope = {
      ...scope,
      customerName: aiBuilder.customerName,
      projectName,
      jobDescription: description,
      materials,
      customerNotes: aiBuilder.prompt,
    };

    setScope(newScope);
    setTool("scope");

    setOutput(`AI SCOPE BUILDER

Customer:
${newScope.customerName || "Not specified"}

Project:
${newScope.projectName}

Original Prompt:
${aiBuilder.prompt}

Generated Work Description:
${newScope.jobDescription}

Generated Materials Section:
${newScope.materials}

This scope draft has also been pushed into the Scope Writer form for refinement.`);
  }

  function generateEstimate() {
    setOutput(`ESTIMATE SUMMARY

Company:
${settings.companyName}

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

TOTAL ESTIMATE:
${currency(estimateMath.total)}

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

Materials:
${scope.materials || "Not specified"}

Customer Notes:
${scope.customerNotes || "No notes entered."}

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

Customer:
${invoice.customerName || "Not specified"}

Job:
${invoice.jobName || "Not specified"}

${lineItems}

TOTAL DUE:
${currency(total)}

Notes:
${invoice.notes || "No notes entered."}`);
  }

  function generateContract() {
    setOutput(`${contract.contractTitle.toUpperCase()}

Client:
${contract.clientName || "Not specified"}

Project:
${contract.projectName || "Not specified"}

Contract Price:
${contract.contractPrice || "To be determined"}

SCOPE OF WORK
${contract.scopeOfWork || "No scope entered."}

PAYMENT TERMS
${contract.paymentTerms}

EXCLUSIONS
${contract.exclusions}

SIGNATURES
${contract.signatures}`);
  }

  function generateTroubleshoot() {
    if (plan !== "pro") {
      setOutput("Troubleshooting Assistant is a Pro feature.");
      return;
    }

    setOutput(`AI TROUBLESHOOTING ASSISTANT

Machine / Vehicle:
${trouble.machine || "Machine not specified"}

Symptom:
${trouble.symptom || "No symptom entered"}

Recent Work:
${trouble.recentWork || "No recent work entered"}

Severity:
${trouble.severity}

LIKELY CAUSE AREAS
1. Electrical power / fuse / relay / switch issue
2. Hydraulic restriction or control issue
3. Sensor or safety interlock issue
4. Mechanical wear or failed component`);
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

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#0f1724",
          color: "white",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!session) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f1724",
          color: "#edf2f7",
          fontFamily: "Inter, Arial, sans-serif",
          display: "grid",
          placeItems: "center",
          padding: 20,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 460,
            background: "#17202d",
            border: "1px solid #334155",
            borderRadius: 18,
            padding: 24,
          }}
        >
          <div style={{ fontSize: 34, fontWeight: 900, marginBottom: 8 }}>
            Tradesman AI
          </div>
          <div style={{ color: "#a8b3c7", marginBottom: 20 }}>
            Sign in or create your account.
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <button
              onClick={() => setAuthMode("signin")}
              style={{
                flex: 1,
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #334155",
                background: authMode === "signin" ? "#9b87f5" : "#1d2939",
                color: "white",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode("signup")}
              style={{
                flex: 1,
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #334155",
                background: authMode === "signup" ? "#9b87f5" : "#1d2939",
                color: "white",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Sign Up
            </button>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <input
              type="email"
              placeholder="Email"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              style={authInputStyle()}
            />
            <input
              type="password"
              placeholder="Password"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              style={authInputStyle()}
            />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            {authMode === "signin" ? (
              <button onClick={handleSignIn} style={authPrimaryBtn()}>
                Sign In
              </button>
            ) : (
              <button onClick={handleSignUp} style={authPrimaryBtn()}>
                Create Account
              </button>
            )}
          </div>

          <div style={{ color: "#a8b3c7", marginTop: 14, minHeight: 24 }}>
            {authMessage}
          </div>
        </div>
      </div>
    );
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
              Signed in as {session.user?.email || "user"}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              style={secondaryBtn(colors)}
            >
              Switch to {theme === "dark" ? "Light" : "Dark"} Theme
            </button>
            <button onClick={handleSignOut} style={dangerBtn(colors)}>
              Sign Out
            </button>
          </div>
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
            Basic gives you the core business tools. Pro adds AI Builder and troubleshooting.
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
                • Estimates
                <br />
                • Scopes
                <br />
                • Invoices
                <br />
                • Contracts
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
                • AI Quick Builder
                <br />
                • AI Troubleshooting
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

              <button style={toolBtnStyle(tool === "dashboard")} onClick={() => setTool("dashboard")}>Dashboard</button>
              <button style={toolBtnStyle(tool === "settings")} onClick={() => setTool("settings")}>Company Settings</button>
              <button style={toolBtnStyle(tool === "customers")} onClick={() => setTool("customers")}>Customers</button>
              <button style={toolBtnStyle(tool === "saved")} onClick={() => setTool("saved")}>Saved Jobs / Docs</button>
              <button style={toolBtnStyle(tool === "aiBuilder", plan !== "pro")} onClick={() => setTool("aiBuilder")}>AI Quick Builder (Pro)</button>
              <button style={toolBtnStyle(tool === "estimate")} onClick={() => setTool("estimate")}>Estimate Generator</button>
              <button style={toolBtnStyle(tool === "scope")} onClick={() => setTool("scope")}>Scope Writer</button>
              <button style={toolBtnStyle(tool === "invoice")} onClick={() => setTool("invoice")}>Invoice Builder</button>
              <button style={toolBtnStyle(tool === "contract")} onClick={() => setTool("contract")}>Contract Builder</button>
              <button style={toolBtnStyle(tool === "troubleshoot", plan !== "pro")} onClick={() => setTool("troubleshoot")}>Troubleshooting (Pro)</button>

              <div
                style={{
                  marginTop: 12,
                  color: colors.muted,
                  fontSize: 13,
                }}
              >
                Cloud sync: {cloudLoading ? "Loading..." : "Connected"}
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
                  <button onClick={() => void saveCustomer()} style={primaryBtn(colors)}>
                    {customerForm.id ? "Update Customer" : "Save Customer"}
                  </button>
                </div>

                <div style={{ display: "grid", gap: 12 }}>
                  {customers.length === 0 ? (
                    <div style={{ color: colors.muted }}>No customers yet.</div>
                  ) : (
                    customers.map((c) => (
                      <div key={c.id} style={{ background: colors.outputBg, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 14 }}>
                        <div style={{ fontWeight: 800 }}>{c.name}</div>
                        <div style={{ color: colors.muted, marginTop: 4 }}>
                          {c.company || "-"} | {c.phone || "-"} | {c.email || "-"}
                        </div>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                          <button onClick={() => useCustomer(c.name)} style={secondaryBtn(colors)}>Use in Forms</button>
                          <button onClick={() => editCustomer(c)} style={secondaryBtn(colors)}>Edit</button>
                          <button onClick={() => void deleteCustomer(c.id)} style={dangerBtn(colors)}>Delete</button>
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
                      <div key={d.id} style={{ background: colors.outputBg, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 14 }}>
                        <div style={{ fontWeight: 800 }}>{d.title}</div>
                        <div style={{ color: colors.muted, marginTop: 4 }}>
                          {d.type} | {d.customerName || "No customer"} | {d.createdAt}
                        </div>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                          <button onClick={() => loadSavedDoc(d)} style={secondaryBtn(colors)}>Open</button>
                          <button onClick={() => void deleteSavedDoc(d.id)} style={dangerBtn(colors)}>Delete</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            )}

            {tool === "aiBuilder" && (
              <Card title="AI Quick Builder (Pro)" colors={colors}>
                <Grid>
                  <Field label="Customer Name" value={aiBuilder.customerName} onChange={(v) => setAiBuilder({ ...aiBuilder, customerName: v })} colors={colors} />
                  <Field label="Project Type" value={aiBuilder.projectType} onChange={(v) => setAiBuilder({ ...aiBuilder, projectType: v })} colors={colors} />
                </Grid>
                <Area label="Describe the job in plain English" value={aiBuilder.prompt} onChange={(v) => setAiBuilder({ ...aiBuilder, prompt: v })} colors={colors} />
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button onClick={aiBuildEstimate} style={primaryBtn(colors)}>
                    AI Build Estimate
                  </button>
                  <button onClick={aiBuildScope} style={secondaryBtn(colors)}>
                    AI Build Scope
                  </button>
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
                </Grid>
                <Area label="Notes" value={estimate.notes} onChange={(v) => setEstimate({ ...estimate, notes: v })} colors={colors} />
              </Card>
            )}

            {tool === "scope" && (
              <Card title="Scope Writer" colors={colors}>
                <Grid>
                  <Field label="Customer Name" value={scope.customerName} onChange={(v) => setScope({ ...scope, customerName: v })} colors={colors} />
                  <Field label="Project Name" value={scope.projectName} onChange={(v) => setScope({ ...scope, projectName: v })} colors={colors} />
                </Grid>
                <Area label="Job Description" value={scope.jobDescription} onChange={(v) => setScope({ ...scope, jobDescription: v })} colors={colors} />
                <Area label="Materials" value={scope.materials} onChange={(v) => setScope({ ...scope, materials: v })} colors={colors} />
              </Card>
            )}

            {tool === "invoice" && (
              <Card title="Invoice Builder" colors={colors}>
                <Grid>
                  <Field label="Customer Name" value={invoice.customerName} onChange={(v) => setInvoice({ ...invoice, customerName: v })} colors={colors} />
                  <Field label="Job Name" value={invoice.jobName} onChange={(v) => setInvoice({ ...invoice, jobName: v })} colors={colors} />
                  <Field label="Invoice Number" value={invoice.invoiceNumber} onChange={(v) => setInvoice({ ...invoice, invoiceNumber: v })} colors={colors} />
                </Grid>
              </Card>
            )}

            {tool === "contract" && (
              <Card title="Contract Builder" colors={colors}>
                <Grid>
                  <Field label="Contract Title" value={contract.contractTitle} onChange={(v) => setContract({ ...contract, contractTitle: v })} colors={colors} />
                  <Field label="Client Name" value={contract.clientName} onChange={(v) => setContract({ ...contract, clientName: v })} colors={colors} />
                  <Field label="Project Name" value={contract.projectName} onChange={(v) => setContract({ ...contract, projectName: v })} colors={colors} />
                </Grid>
                <Area label="Scope of Work" value={contract.scopeOfWork} onChange={(v) => setContract({ ...contract, scopeOfWork: v })} colors={colors} />
              </Card>
            )}

            {tool === "troubleshoot" && (
              <Card title="Troubleshooting Assistant (Pro)" colors={colors}>
                <Field label="Machine / Vehicle" value={trouble.machine} onChange={(v) => setTrouble({ ...trouble, machine: v })} colors={colors} />
                <Area label="Main Symptom" value={trouble.symptom} onChange={(v) => setTrouble({ ...trouble, symptom: v })} colors={colors} />
                <Area label="Recent Work / Relevant History" value={trouble.recentWork} onChange={(v) => setTrouble({ ...trouble, recentWork: v })} colors={colors} />
              </Card>
            )}

            {tool !== "dashboard" && tool !== "customers" && tool !== "saved" && (
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
                {tool !== "aiBuilder" && (
                  <button onClick={generateFromActiveTool} style={primaryBtn(colors)}>
                    {tool === "settings" ? "Save Settings" : "Generate Output"}
                  </button>
                )}
                <button onClick={copyOutput} style={secondaryBtn(colors)}>
                  Copy
                </button>
                <button onClick={exportPDF} style={secondaryBtn(colors)}>
                  Export PDF
                </button>
                {tool === "estimate" && (
                  <button onClick={() => void saveCurrentOutput("estimate", `${estimate.jobType} Estimate`, estimate.customerName)} style={secondaryBtn(colors)}>
                    Save Estimate
                  </button>
                )}
                {tool === "scope" && (
                  <button onClick={() => void saveCurrentOutput("scope", scope.projectName || "Scope of Work", scope.customerName)} style={secondaryBtn(colors)}>
                    Save Scope
                  </button>
                )}
                {tool === "invoice" && (
                  <button onClick={() => void saveCurrentOutput("invoice", `Invoice ${invoice.invoiceNumber}`, invoice.customerName)} style={secondaryBtn(colors)}>
                    Save Invoice
                  </button>
                )}
                {tool === "contract" && (
                  <button onClick={() => void saveCurrentOutput("contract", contract.projectName || contract.contractTitle, contract.clientName)} style={secondaryBtn(colors)}>
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

function authInputStyle(): React.CSSProperties {
  return {
    width: "100%",
    boxSizing: "border-box",
    background: "#0f1724",
    color: "#edf2f7",
    border: "1px solid #334155",
    borderRadius: 10,
    padding: "12px 12px",
    outline: "none",
  };
}

function authPrimaryBtn(): React.CSSProperties {
  return {
    background: "#9b87f5",
    color: "white",
    border: "none",
    borderRadius: 12,
    padding: "13px 18px",
    fontWeight: 800,
    cursor: "pointer",
    width: "100%",
  };
}