import React, { useEffect, useMemo, useState } from "react";

const BASIC_STRIPE_LINK = "https://buy.stripe.com/eVqdR26372Cb7BW8Y5d7q03";
const PRO_STRIPE_LINK = "https://buy.stripe.com/dRmfZa3UZa4D7BWgqxd7q04";
const _TEAM_STRIPE_LINK = "#";

const SUPABASE_URL = "https://ljizlaabarhyzocfcsba.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqaXpsYWFiYXJoeXpvY2Zjc2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1ODcxNTIsImV4cCI6MjA4OTE2MzE1Mn0.eJstZOcLE_BALH1JMhju4zQonRxMQwk5DbEXpYUIKbw";

const supabase = (window as any).supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

type ThemeMode = "dark" | "light";
type Plan = "basic" | "pro" | "team";
type EstimateStatus = "draft" | "sent" | "approved" | "paid";
type InvoiceStatus = "unpaid" | "paid";
type Tool =
  | "dashboard"
  | "settings"
  | "customers"
  | "customerDetail"
  | "estimate"
  | "estimates"
  | "saved"
  | "aiBuilder"
  | "scope"
  | "invoice"
  | "invoices"
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

type EstimateRow = {
  id: string;
  customerId: string;
  customerName: string;
  jobDescription: string;
  aiPrice: number;
  aiLabor: number;
  aiMaterial: number;
  status: EstimateStatus;
  createdAt: string;
};

type InvoiceRow = {
  id: string;
  customerId: string;
  customerName: string;
  invoiceNumber: string;
  jobName: string;
  total: number;
  status: InvoiceStatus;
  createdAt: string;
};

type EstimateForm = {
  customerName: string;
  customerId: string;
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
  aiJobDescription: string;
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
  customerId: string;
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

const SETTINGS_KEY = "tradesman_ai_company_settings_v13";
const THEME_KEY = "tradesman_ai_theme_v13";

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

const demoCustomers: Customer[] = [
  {
    id: "demo-c1",
    name: "John Smith",
    company: "Smith Ranch",
    phone: "555-100-2000",
    email: "john@example.com",
    address: "123 County Rd",
    notes: "Repeat gravel / dirt-work customer",
  },
  {
    id: "demo-c2",
    name: "ABC Contracting",
    company: "ABC Contracting",
    phone: "555-888-1212",
    email: "office@abc.example",
    address: "45 Industrial Loop",
    notes: "Commercial customer",
  },
];

const demoEstimates: EstimateRow[] = [
  {
    id: "demo-e1",
    customerId: "demo-c1",
    customerName: "John Smith",
    jobDescription: "Shop pad prep and road base installation",
    aiPrice: 4200,
    aiLabor: 1800,
    aiMaterial: 2400,
    status: "approved",
    createdAt: "Demo Data",
  },
  {
    id: "demo-e2",
    customerId: "demo-c2",
    customerName: "ABC Contracting",
    jobDescription: "Brush clearing on 2 acres",
    aiPrice: 3100,
    aiLabor: 2700,
    aiMaterial: 400,
    status: "sent",
    createdAt: "Demo Data",
  },
];

const demoInvoices: InvoiceRow[] = [
  {
    id: "demo-i1",
    customerId: "demo-c1",
    customerName: "John Smith",
    invoiceNumber: "2001",
    jobName: "Shop Pad",
    total: 4200,
    status: "paid",
    createdAt: "Demo Data",
  },
  {
    id: "demo-i2",
    customerId: "demo-c2",
    customerName: "ABC Contracting",
    invoiceNumber: "2002",
    jobName: "Brush Clearing",
    total: 3100,
    status: "unpaid",
    createdAt: "Demo Data",
  },
];

const demoDocs: SavedDoc[] = [
  {
    id: "demo-d1",
    type: "scope",
    title: "Shop Pad Scope",
    customerName: "John Smith",
    createdAt: "Demo Data",
    content: "Demo scope of work for a shop pad project.",
  },
  {
    id: "demo-d2",
    type: "contract",
    title: "Brush Clearing Contract",
    customerName: "ABC Contracting",
    createdAt: "Demo Data",
    content: "Demo contract for brush clearing services.",
  },
];

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

function generateAIPrice(description: string) {
  const text = description.toLowerCase();

  let labor = 250;
  let materials = 100;

  if (text.includes("gravel") || text.includes("road base")) {
    labor += 350;
    materials += 500;
  }
  if (text.includes("driveway")) {
    labor += 450;
    materials += 650;
  }
  if (text.includes("pad") || text.includes("shop pad")) {
    labor += 500;
    materials += 800;
  }
  if (text.includes("fence")) {
    labor += 600;
    materials += 700;
  }
  if (text.includes("brush") || text.includes("clear")) {
    labor += 550;
    materials += 150;
  }
  if (text.includes("excavat") || text.includes("dig")) {
    labor += 700;
    materials += 200;
  }
  if (text.includes("demo") || text.includes("remove")) {
    labor += 650;
    materials += 200;
  }
  if (text.includes("concrete")) {
    labor += 700;
    materials += 900;
  }
  if (text.includes("alternator")) {
    labor += 180;
    materials += 260;
  }
  if (text.includes("repair")) {
    labor += 200;
    materials += 120;
  }

  const lengthBonus = Math.min(description.length * 3, 600);
  labor += Math.round(lengthBonus * 0.6);
  materials += Math.round(lengthBonus * 0.4);

  const total = labor + materials;
  return { labor, materials, total };
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [profilePlan, setProfilePlan] = useState<Plan>("basic");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [tool, setTool] = useState<Tool>("dashboard");
  const [output, setOutput] = useState("Your generated output will appear here.");

  const [settings, setSettings] = useState<CompanySettings>(getInitialSettings);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [savedDocs, setSavedDocs] = useState<SavedDoc[]>([]);
  const [estimates, setEstimates] = useState<EstimateRow[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

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
    customerId: "",
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
    aiJobDescription: "",
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
    customerId: "",
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
      async (_event: any, nextSession: any) => {
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
    if (demoMode) {
      setProfilePlan("pro");
      setCustomers(demoCustomers);
      setSavedDocs(demoDocs);
      setEstimates(demoEstimates);
      setInvoices(demoInvoices);
      setTool("dashboard");
      return;
    }

    if (session?.user?.id) {
      void bootUser(session.user);
    } else {
      setCustomers([]);
      setSavedDocs([]);
      setEstimates([]);
      setInvoices([]);
      setProfilePlan("basic");
    }
  }, [session, demoMode]);

  async function ensureProfile(user: any) {
    const existing = await supabase
      .from("profiles")
      .select("id, email, plan")
      .eq("id", user.id)
      .maybeSingle();

    if (existing.error) {
      setOutput(`Profile load failed: ${existing.error.message}`);
      return "basic" as Plan;
    }

    if (!existing.data) {
      const inserted = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email || "",
        plan: "basic",
      });

      if (inserted.error) {
        setOutput(`Profile create failed: ${inserted.error.message}`);
        return "basic" as Plan;
      }

      return "basic" as Plan;
    }

    const plan = existing.data.plan;
    if (plan === "team") return "team";
    if (plan === "pro") return "pro";
    return "basic";
  }

  async function bootUser(user: any) {
    setCloudLoading(true);
    const plan = await ensureProfile(user);
    setProfilePlan(plan);
    await loadCloudData(user.id);
    setCloudLoading(false);
  }

  async function loadCloudData(userId: string) {
    const [customersResult, docsResult, estimatesResult, invoicesResult] = await Promise.all([
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
      supabase
        .from("estimates")
        .select("id,customer_id,job_description,ai_price,ai_labor,ai_material,status,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("invoices")
        .select("id,customer_id,invoice_number,job_name,total,status,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);

    let customerNameMap = new Map<string, string>();

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
      mappedCustomers.forEach((c) => customerNameMap.set(c.id, c.name));
    }

    if (!docsResult.error) {
      const mappedDocs: SavedDoc[] = (docsResult.data || []).map((row: any) => ({
        id: row.id,
        type: row.type || "",
        title: row.title || "",
        customerName: row.customer_name || "",
        content: row.content || "",
        createdAt: row.created_at ? new Date(row.created_at).toLocaleString() : "",
      }));
      setSavedDocs(mappedDocs);
    }

    if (!estimatesResult.error) {
      const mappedEstimates: EstimateRow[] = (estimatesResult.data || []).map((row: any) => ({
        id: row.id,
        customerId: row.customer_id || "",
        customerName: customerNameMap.get(row.customer_id || "") || "No customer",
        jobDescription: row.job_description || "",
        aiPrice: Number(row.ai_price || 0),
        aiLabor: Number(row.ai_labor || 0),
        aiMaterial: Number(row.ai_material || 0),
        status: (row.status || "draft") as EstimateStatus,
        createdAt: row.created_at ? new Date(row.created_at).toLocaleString() : "",
      }));
      setEstimates(mappedEstimates);
    }

    if (!invoicesResult.error) {
      const mappedInvoices: InvoiceRow[] = (invoicesResult.data || []).map((row: any) => ({
        id: row.id,
        customerId: row.customer_id || "",
        customerName: customerNameMap.get(row.customer_id || "") || "No customer",
        invoiceNumber: row.invoice_number || "",
        jobName: row.job_name || "",
        total: Number(row.total || 0),
        status: (row.status || "unpaid") as InvoiceStatus,
        createdAt: row.created_at ? new Date(row.created_at).toLocaleString() : "",
      }));
      setInvoices(mappedInvoices);
    }
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
        success: "#067647",
        warning: "#b54708",
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
      warning: "#f59e0b",
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

  const aiPricing = useMemo(() => {
    return generateAIPrice(estimate.aiJobDescription || estimate.notes || estimate.jobType);
  }, [estimate.aiJobDescription, estimate.notes, estimate.jobType]);

  const dashboardStats = useMemo(() => {
    const approvedJobs = estimates.filter((e) => e.status === "approved").length;
    const paidJobs = estimates.filter((e) => e.status === "paid").length;
    const pendingJobs = estimates.filter(
      (e) => e.status === "draft" || e.status === "sent"
    ).length;
    const approvedValue = estimates
      .filter((e) => e.status === "approved" || e.status === "paid")
      .reduce((sum, e) => sum + e.aiPrice, 0);
    const paidValue = invoices
      .filter((i) => i.status === "paid")
      .reduce((sum, i) => sum + i.total, 0);

    return {
      approvedJobs,
      paidJobs,
      pendingJobs,
      approvedValue,
      paidValue,
    };
  }, [estimates, invoices]);

  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  const selectedCustomerEstimates = useMemo(() => {
    return estimates.filter((e) => e.customerId === selectedCustomerId);
  }, [estimates, selectedCustomerId]);

  const selectedCustomerInvoices = useMemo(() => {
    return invoices.filter((i) => i.customerId === selectedCustomerId);
  }, [invoices, selectedCustomerId]);

  const selectedCustomerDocs = useMemo(() => {
    return savedDocs.filter((d) => d.customerName === selectedCustomer?.name);
  }, [savedDocs, selectedCustomer]);

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

  function isPro() {
    return profilePlan === "pro" || profilePlan === "team" || demoMode;
  }

  function isTeam() {
    return profilePlan === "team";
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
    if (demoMode) {
      setOutput("Demo mode is read-only. Create an account to save documents.");
      return;
    }

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
    setOutput("Document saved to cloud.");
  }

  async function saveEstimateToCloud() {
    if (demoMode) {
      setOutput("Demo mode is read-only. Create an account to save estimates.");
      return;
    }

    if (!session?.user?.id) {
      alert("You must be signed in.");
      return;
    }

    const jobDescription =
      estimate.aiJobDescription ||
      estimate.notes ||
      `${estimate.jobType} at ${estimate.siteAddress || "job site"}`;

    const pricing = generateAIPrice(jobDescription);

    const result = await supabase.from("estimates").insert({
      user_id: session.user.id,
      customer_id: estimate.customerId || null,
      job_description: jobDescription,
      ai_price: pricing.total,
      ai_labor: pricing.labor,
      ai_material: pricing.materials,
      status: "draft",
    });

    if (result.error) {
      setOutput(`Estimate save failed: ${result.error.message}`);
      return;
    }

    await loadCloudData(session.user.id);
    setOutput(`ESTIMATE SAVED

Customer:
${estimate.customerName || "No customer selected"}

Job:
${jobDescription}

AI Labor:
${currency(pricing.labor)}

AI Materials:
${currency(pricing.materials)}

AI Total:
${currency(pricing.total)}

Status:
draft`);
  }

  async function updateEstimateStatus(id: string, status: EstimateStatus) {
    if (demoMode) {
      setOutput("Demo mode is read-only.");
      return;
    }
    if (!session?.user?.id) return;

    const result = await supabase.from("estimates").update({ status }).eq("id", id);

    if (result.error) {
      setOutput(`Status update failed: ${result.error.message}`);
      return;
    }

    await loadCloudData(session.user.id);
    setOutput(`Estimate status updated to ${status}.`);
  }

  function loadEstimateRow(row: EstimateRow) {
    setEstimate((prev) => ({
      ...prev,
      customerName: row.customerName,
      customerId: row.customerId,
      aiJobDescription: row.jobDescription,
      notes: row.jobDescription,
    }));
    setTool("estimate");
    setOutput(`LOADED ESTIMATE

Customer:
${row.customerName}

Job:
${row.jobDescription}

AI Labor:
${currency(row.aiLabor)}

AI Materials:
${currency(row.aiMaterial)}

AI Total:
${currency(row.aiPrice)}

Status:
${row.status}

Created:
${row.createdAt}`);
  }

  async function deleteEstimateRow(id: string) {
    if (demoMode) {
      setOutput("Demo mode is read-only.");
      return;
    }
    if (!session?.user?.id) return;

    const result = await supabase.from("estimates").delete().eq("id", id);

    if (result.error) {
      setOutput(`Delete failed: ${result.error.message}`);
      return;
    }

    await loadCloudData(session.user.id);
  }

  async function saveInvoiceToCloud() {
    if (demoMode) {
      setOutput("Demo mode is read-only. Create an account to save invoices.");
      return;
    }

    if (!session?.user?.id) {
      alert("You must be signed in.");
      return;
    }

    const subtotal = invoice.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const tax = subtotal * (invoice.taxPercent / 100);
    const total = subtotal + tax;

    const result = await supabase.from("invoices").insert({
      user_id: session.user.id,
      customer_id: invoice.customerId || null,
      invoice_number: invoice.invoiceNumber,
      job_name: invoice.jobName || "Invoice",
      total,
      status: "unpaid",
    });

    if (result.error) {
      setOutput(`Invoice save failed: ${result.error.message}`);
      return;
    }

    await loadCloudData(session.user.id);
    setOutput(`INVOICE SAVED

Customer:
${invoice.customerName || "No customer selected"}

Invoice #:
${invoice.invoiceNumber}

Job:
${invoice.jobName || "Invoice"}

Total:
${currency(total)}

Status:
unpaid`);
  }

  async function updateInvoiceStatus(id: string, status: InvoiceStatus) {
    if (demoMode) {
      setOutput("Demo mode is read-only.");
      return;
    }
    if (!session?.user?.id) return;

    const result = await supabase.from("invoices").update({ status }).eq("id", id);

    if (result.error) {
      setOutput(`Invoice status update failed: ${result.error.message}`);
      return;
    }

    await loadCloudData(session.user.id);
    setOutput(`Invoice status updated to ${status}.`);
  }

  async function deleteInvoiceRow(id: string) {
    if (demoMode) {
      setOutput("Demo mode is read-only.");
      return;
    }
    if (!session?.user?.id) return;

    const result = await supabase.from("invoices").delete().eq("id", id);

    if (result.error) {
      setOutput(`Delete failed: ${result.error.message}`);
      return;
    }

    await loadCloudData(session.user.id);
  }

  function loadSavedDoc(doc: SavedDoc) {
    setOutput(doc.content);
    setTool("saved");
  }

  async function deleteSavedDoc(id: string) {
    if (demoMode) {
      setOutput("Demo mode is read-only.");
      return;
    }
    if (!session?.user?.id) return;

    const result = await supabase.from("saved_docs").delete().eq("id", id);

    if (result.error) {
      setOutput(`Delete failed: ${result.error.message}`);
      return;
    }

    await loadCloudData(session.user.id);
  }

  async function saveCustomer() {
    if (demoMode) {
      setOutput("Demo mode is read-only. Create an account to save customers.");
      return;
    }

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
    if (demoMode) {
      setOutput("Demo mode is read-only.");
      return;
    }
    if (!session?.user?.id) return;

    const result = await supabase.from("customers").delete().eq("id", id);

    if (result.error) {
      setOutput(`Delete failed: ${result.error.message}`);
      return;
    }

    await loadCloudData(session.user.id);
  }

  function openCustomerDetail(customer: Customer) {
    setSelectedCustomerId(customer.id);
    setTool("customerDetail");
  }

  function useCustomer(customer: Customer) {
    setEstimate((prev) => ({
      ...prev,
      customerName: customer.name,
      customerId: customer.id,
    }));
    setScope((prev) => ({ ...prev, customerName: customer.name }));
    setInvoice((prev) => ({
      ...prev,
      customerName: customer.name,
      customerId: customer.id,
    }));
    setContract((prev) => ({ ...prev, clientName: customer.name }));
    setAiBuilder((prev) => ({ ...prev, customerName: customer.name }));
    setOutput(`Selected customer: ${customer.name}`);
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
    setOutput("Company settings saved locally.");
  }

  function smartExtract(prompt: string, fallback: number) {
    const matches = prompt.match(/\d+(\.\d+)?/g);
    if (!matches || matches.length === 0) return fallback;
    return Number(matches[0]) || fallback;
  }

  function aiBuildEstimate() {
    if (!isPro()) {
      setOutput("AI Builder is a Pro or Team feature. Upgrade to unlock it.");
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

    const customer = customers.find((c) => c.name === aiBuilder.customerName);

    setEstimate((prev) => ({
      ...prev,
      customerName: aiBuilder.customerName,
      customerId: customer?.id || "",
      jobType: aiBuilder.projectType,
      length,
      width,
      depthInches: depth,
      material,
      notes: `AI-generated from prompt: ${aiBuilder.prompt}`,
      aiJobDescription: aiBuilder.prompt,
    }));

    setTool("estimate");

    const pricing = generateAIPrice(aiBuilder.prompt);

    setOutput(`AI ESTIMATE DRAFT BUILT

Customer:
${aiBuilder.customerName || "Not specified"}

Prompt:
${aiBuilder.prompt}

AI Labor:
${currency(pricing.labor)}

AI Materials:
${currency(pricing.materials)}

AI Total:
${currency(pricing.total)}

Estimate form updated for refinement.`);
  }

  function aiBuildScope() {
    if (!isPro()) {
      setOutput("AI Builder is a Pro or Team feature. Upgrade to unlock it.");
      return;
    }

    const projectName = aiBuilder.projectType || "Project";
    const description = `Provide labor, equipment, site preparation, grading, and material placement for ${projectName.toLowerCase()} as described by customer request.`;

    setScope((prev) => ({
      ...prev,
      customerName: aiBuilder.customerName,
      projectName,
      jobDescription: description,
      materials:
        "Standard materials and equipment necessary to complete the described work.",
      customerNotes: aiBuilder.prompt,
    }));

    setTool("scope");
    setOutput("AI scope draft built and pushed into the Scope Writer.");
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

Calculated Total:
${currency(estimateMath.total)}

AI PRICE SNAPSHOT
Labor:
${currency(aiPricing.labor)}

Materials:
${currency(aiPricing.materials)}

AI Suggested Total:
${currency(aiPricing.total)}

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

    setOutput(`INVOICE / QUOTE

Customer:
${invoice.customerName || "Not specified"}

Job:
${invoice.jobName || "Not specified"}

Invoice #:
${invoice.invoiceNumber}

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
    if (!isPro()) {
      setOutput("Troubleshooting Assistant is a Pro or Team feature.");
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

  function startDemo() {
    setDemoMode(true);
    setTool("dashboard");
    setOutput("Demo mode loaded.");
  }

  function exitDemo() {
    setDemoMode(false);
    setOutput("Exited demo mode.");
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

  if (!session && !demoMode) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f1724",
          color: "#edf2f7",
          fontFamily: "Inter, Arial, sans-serif",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 0.8fr",
              gap: 24,
              alignItems: "stretch",
            }}
          >
            <div
              style={{
                background: "linear-gradient(180deg, #17202d, #111827)",
                border: "1px solid #334155",
                borderRadius: 22,
                padding: 28,
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: "#241f3c",
                  color: "#c4b5fd",
                  fontWeight: 800,
                  marginBottom: 18,
                }}
              >
                AI Business Software for Contractors
              </div>

              <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.05, marginBottom: 16 }}>
                Build estimates, track jobs, and manage customers faster.
              </div>

              <div style={{ color: "#a8b3c7", fontSize: 18, lineHeight: 1.6, marginBottom: 24 }}>
                Tradesman AI helps contractors, mechanics, and service businesses run estimates,
                invoices, customers, and workflow in one place.
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
                <button onClick={startDemo} style={landingPrimaryBtn()}>
                  Try Demo
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById("auth-box");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  style={landingSecondaryBtn()}
                >
                  Start Free Trial
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 14,
                }}
              >
                <LandingStat title="Save Time" text="Generate estimates, invoices, scopes, and contracts in minutes." />
                <LandingStat title="Manage Work" text="Track customers, jobs, estimate history, and invoice history." />
                <LandingStat title="Grow Revenue" text="Use AI pricing and workflow tools to quote faster and close more jobs." />
              </div>
            </div>

            <div
              id="auth-box"
              style={{
                background: "#17202d",
                border: "1px solid #334155",
                borderRadius: 22,
                padding: 24,
              }}
            >
              <div style={{ fontSize: 34, fontWeight: 900, marginBottom: 8 }}>Tradesman AI</div>
              <div style={{ color: "#a8b3c7", marginBottom: 16 }}>
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

              <div
                style={{
                  marginTop: 22,
                  padding: 16,
                  border: "1px solid #334155",
                  borderRadius: 14,
                  background: "#111827",
                }}
              >
                <div style={{ fontWeight: 800, marginBottom: 10 }}>Pricing</div>
                <div style={{ color: "#a8b3c7", lineHeight: 1.7 }}>
                  <strong>Basic — $19/mo</strong>
                  <br />
                  CRM, estimates, invoices, dashboard, PDF export
                  <br />
                  <br />
                  <strong>Pro — $49/mo</strong>
                  <br />
                  Everything in Basic + AI Builder, AI pricing, troubleshooting
                  <br />
                  <br />
                  <strong>Team — $99/mo</strong>
                  <br />
                  Everything in Pro + team workflow foundation
                </div>
              </div>
            </div>
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
      <div style={{ maxWidth: 1260, margin: "0 auto" }}>
        {demoMode && (
          <div
            style={{
              background: colors.warning,
              color: "white",
              borderRadius: 14,
              padding: 14,
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div>
              <strong>Demo Mode</strong> — This is a read-only preview for marketing and conversions.
            </div>
            <button onClick={exitDemo} style={whiteBtn()}>
              Exit Demo
            </button>
          </div>
        )}

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
              {demoMode
                ? "Demo Preview • Plan: pro"
                : `Signed in as ${session.user?.email || "user"} • Plan: ${profilePlan}`}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              style={secondaryBtn(colors)}
            >
              Switch to {theme === "dark" ? "Light" : "Dark"} Theme
            </button>
            {!demoMode && (
              <button onClick={handleSignOut} style={dangerBtn(colors)}>
                Sign Out
              </button>
            )}
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
          <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>
            Choose Your Plan
          </div>
          <div style={{ color: colors.muted, marginBottom: 16 }}>
            Better monetization structure with clearer value separation.
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            <PricingCard
              title="Basic"
              price="$19/mo"
              active={profilePlan === "basic"}
              colors={colors}
              features={[
                "Customers CRM",
                "Estimate history",
                "Invoice history",
                "Dashboard",
                "PDF export",
              ]}
              buttonLabel="Start Basic"
              buttonAction={() => window.open(BASIC_STRIPE_LINK, "_blank")}
            />
            <PricingCard
              title="Pro"
              price="$49/mo"
              active={profilePlan === "pro"}
              colors={colors}
              features={[
                "Everything in Basic",
                "AI Quick Builder",
                "AI pricing",
                "Troubleshooting AI",
                "Better workflow speed",
              ]}
              buttonLabel="Upgrade to Pro"
              buttonAction={() => window.open(PRO_STRIPE_LINK, "_blank")}
            />
            <PricingCard
              title="Team"
              price="$99/mo"
              active={profilePlan === "team"}
              colors={colors}
              features={[
                "Everything in Pro",
                "Team-ready plan",
                "Shared workflow foundation",
                "Multi-user path",
                "Business-level positioning",
              ]}
              buttonLabel="Team Coming Soon"
              buttonAction={() => setOutput("Team billing will be wired in Round B.")}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>
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
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>
                Tools
              </div>

              <button style={toolBtnStyle(tool === "dashboard")} onClick={() => setTool("dashboard")}>Dashboard</button>
              <button style={toolBtnStyle(tool === "settings")} onClick={() => setTool("settings")}>Company Settings</button>
              <button style={toolBtnStyle(tool === "customers")} onClick={() => setTool("customers")}>Customers</button>
              <button style={toolBtnStyle(tool === "customerDetail")} onClick={() => setTool("customerDetail")}>Customer Timeline</button>
              <button style={toolBtnStyle(tool === "estimate")} onClick={() => setTool("estimate")}>Estimate Generator</button>
              <button style={toolBtnStyle(tool === "estimates")} onClick={() => setTool("estimates")}>Estimate History</button>
              <button style={toolBtnStyle(tool === "invoice")} onClick={() => setTool("invoice")}>Invoice Builder</button>
              <button style={toolBtnStyle(tool === "invoices")} onClick={() => setTool("invoices")}>Invoice History</button>
              <button style={toolBtnStyle(tool === "saved")} onClick={() => setTool("saved")}>Saved Docs</button>
              <button style={toolBtnStyle(tool === "aiBuilder", !isPro())} onClick={() => setTool("aiBuilder")}>AI Quick Builder (Pro+)</button>
              <button style={toolBtnStyle(tool === "scope")} onClick={() => setTool("scope")}>Scope Writer</button>
              <button style={toolBtnStyle(tool === "contract")} onClick={() => setTool("contract")}>Contract Builder</button>
              <button style={toolBtnStyle(tool === "troubleshoot", !isPro())} onClick={() => setTool("troubleshoot")}>Troubleshooting (Pro+)</button>

              <div style={{ marginTop: 12, color: colors.muted, fontSize: 13 }}>
                {demoMode ? "Demo preview active" : `Cloud sync: ${cloudLoading ? "Loading..." : "Connected"}`}
              </div>
            </div>
          </div>

          <div>
            {tool === "dashboard" && (
              <Card title="Contractor Dashboard" colors={colors}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 12,
                    marginBottom: 18,
                  }}
                >
                  <Metric label="Plan" value={profilePlan} colors={colors} />
                  <Metric label="Customers" value={String(customers.length)} colors={colors} />
                  <Metric label="Estimates" value={String(estimates.length)} colors={colors} />
                  <Metric label="Invoices" value={String(invoices.length)} colors={colors} />
                  <Metric label="Pending Jobs" value={String(dashboardStats.pendingJobs)} colors={colors} />
                  <Metric label="Approved Jobs" value={String(dashboardStats.approvedJobs)} colors={colors} />
                  <Metric label="Paid Jobs" value={String(dashboardStats.paidJobs)} colors={colors} />
                  <Metric label="Approved Value" value={currency(dashboardStats.approvedValue)} colors={colors} />
                  <Metric label="Paid Revenue" value={currency(dashboardStats.paidValue)} colors={colors} />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      background: colors.outputBg,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 12,
                      padding: 14,
                    }}
                  >
                    <div style={{ fontWeight: 800, marginBottom: 10 }}>Recent Estimates</div>
                    {estimates.slice(0, 5).map((e) => (
                      <div key={e.id} style={{ marginBottom: 10 }}>
                        <div>{e.customerName}</div>
                        <div style={{ color: colors.muted, fontSize: 13 }}>
                          {e.status} • {currency(e.aiPrice)}
                        </div>
                      </div>
                    ))}
                    {estimates.length === 0 && <div style={{ color: colors.muted }}>No estimates yet.</div>}
                  </div>

                  <div
                    style={{
                      background: colors.outputBg,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 12,
                      padding: 14,
                    }}
                  >
                    <div style={{ fontWeight: 800, marginBottom: 10 }}>Recent Invoices</div>
                    {invoices.slice(0, 5).map((i) => (
                      <div key={i.id} style={{ marginBottom: 10 }}>
                        <div>{i.customerName}</div>
                        <div style={{ color: colors.muted, fontSize: 13 }}>
                          {i.status} • {currency(i.total)}
                        </div>
                      </div>
                    ))}
                    {invoices.length === 0 && <div style={{ color: colors.muted }}>No invoices yet.</div>}
                  </div>
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
              <Card title="Customers (CRM)" colors={colors}>
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
                        <div style={{ color: colors.muted, marginTop: 6 }}>{c.address || ""}</div>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                          <button onClick={() => useCustomer(c)} style={secondaryBtn(colors)}>Use</button>
                          <button onClick={() => openCustomerDetail(c)} style={secondaryBtn(colors)}>Open Timeline</button>
                          <button onClick={() => editCustomer(c)} style={secondaryBtn(colors)}>Edit</button>
                          <button onClick={() => void deleteCustomer(c.id)} style={dangerBtn(colors)}>Delete</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            )}

            {tool === "customerDetail" && (
              <Card title="Customer Detail + Job Timeline" colors={colors}>
                <div style={{ marginBottom: 16 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      marginBottom: 6,
                      fontWeight: 700,
                      color: colors.muted,
                    }}
                  >
                    Choose Customer
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    style={inputStyle(colors)}
                  >
                    <option value="">Select a customer</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {!selectedCustomer ? (
                  <div style={{ color: colors.muted }}>Select a customer to view their timeline.</div>
                ) : (
                  <>
                    <div
                      style={{
                        background: colors.outputBg,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 18,
                      }}
                    >
                      <div style={{ fontSize: 22, fontWeight: 900 }}>{selectedCustomer.name}</div>
                      <div style={{ color: colors.muted, marginTop: 6 }}>
                        {selectedCustomer.company || "No company"} • {selectedCustomer.phone || "No phone"} • {selectedCustomer.email || "No email"}
                      </div>
                      <div style={{ color: colors.muted, marginTop: 6 }}>
                        {selectedCustomer.address || "No address"}
                      </div>
                      <div style={{ marginTop: 10 }}>{selectedCustomer.notes || "No notes."}</div>

                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                        <button onClick={() => useCustomer(selectedCustomer)} style={secondaryBtn(colors)}>Use Customer</button>
                        <button onClick={() => editCustomer(selectedCustomer)} style={secondaryBtn(colors)}>Edit Customer</button>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 16,
                      }}
                    >
                      <TimelinePanel
                        title="Estimates"
                        colors={colors}
                        emptyText="No estimates for this customer."
                      >
                        {selectedCustomerEstimates.map((e) => (
                          <TimelineItem
                            key={e.id}
                            title={e.jobDescription}
                            meta={`${e.status} • ${currency(e.aiPrice)} • ${e.createdAt}`}
                          />
                        ))}
                      </TimelinePanel>

                      <TimelinePanel
                        title="Invoices"
                        colors={colors}
                        emptyText="No invoices for this customer."
                      >
                        {selectedCustomerInvoices.map((i) => (
                          <TimelineItem
                            key={i.id}
                            title={`${i.invoiceNumber || "Invoice"} — ${i.jobName}`}
                            meta={`${i.status} • ${currency(i.total)} • ${i.createdAt}`}
                          />
                        ))}
                      </TimelinePanel>

                      <TimelinePanel
                        title="Documents"
                        colors={colors}
                        emptyText="No documents for this customer."
                      >
                        {selectedCustomerDocs.map((d) => (
                          <TimelineItem
                            key={d.id}
                            title={d.title}
                            meta={`${d.type} • ${d.createdAt}`}
                          />
                        ))}
                      </TimelinePanel>

                      <TimelinePanel
                        title="Customer Summary"
                        colors={colors}
                        emptyText=""
                      >
                        <div style={{ lineHeight: 1.8 }}>
                          <div>Estimates: {selectedCustomerEstimates.length}</div>
                          <div>Invoices: {selectedCustomerInvoices.length}</div>
                          <div>Docs: {selectedCustomerDocs.length}</div>
                          <div>
                            Approved / Paid Estimate Value:{" "}
                            {currency(
                              selectedCustomerEstimates
                                .filter((e) => e.status === "approved" || e.status === "paid")
                                .reduce((sum, e) => sum + e.aiPrice, 0)
                            )}
                          </div>
                          <div>
                            Paid Invoice Value:{" "}
                            {currency(
                              selectedCustomerInvoices
                                .filter((i) => i.status === "paid")
                                .reduce((sum, i) => sum + i.total, 0)
                            )}
                          </div>
                        </div>
                      </TimelinePanel>
                    </div>
                  </>
                )}
              </Card>
            )}

            {tool === "estimate" && (
              <Card title="Estimate Generator + AI Pricing" colors={colors}>
                <Grid>
                  <Field label="Customer Name" value={estimate.customerName} onChange={(v) => setEstimate({ ...estimate, customerName: v })} colors={colors} />
                  <Field label="Site Address" value={estimate.siteAddress} onChange={(v) => setEstimate({ ...estimate, siteAddress: v })} colors={colors} />
                  <Field label="Job Type" value={estimate.jobType} onChange={(v) => setEstimate({ ...estimate, jobType: v })} colors={colors} />
                  <Field label="Material" value={estimate.material} onChange={(v) => setEstimate({ ...estimate, material: v })} colors={colors} />
                  <Field label="Length (ft)" type="number" value={String(estimate.length)} onChange={(v) => setEstimate({ ...estimate, length: Number(v) || 0 })} colors={colors} />
                  <Field label="Width (ft)" type="number" value={String(estimate.width)} onChange={(v) => setEstimate({ ...estimate, width: Number(v) || 0 })} colors={colors} />
                  <Field label="Depth (in)" type="number" value={String(estimate.depthInches)} onChange={(v) => setEstimate({ ...estimate, depthInches: Number(v) || 0 })} colors={colors} />
                </Grid>

                <Area label="AI Job Description (used for AI pricing)" value={estimate.aiJobDescription} onChange={(v) => setEstimate({ ...estimate, aiJobDescription: v })} colors={colors} />
                <Area label="Notes" value={estimate.notes} onChange={(v) => setEstimate({ ...estimate, notes: v })} colors={colors} />

                <div
                  style={{
                    background: colors.outputBg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 16,
                  }}
                >
                  <div style={{ fontWeight: 800, marginBottom: 10 }}>AI Price Snapshot</div>
                  <div>Labor: {currency(aiPricing.labor)}</div>
                  <div>Materials: {currency(aiPricing.materials)}</div>
                  <div style={{ fontWeight: 800, marginTop: 6 }}>AI Total: {currency(aiPricing.total)}</div>
                </div>
              </Card>
            )}

            {tool === "estimates" && (
              <Card title="Estimate History + Job Status" colors={colors}>
                <div style={{ display: "grid", gap: 12 }}>
                  {estimates.length === 0 ? (
                    <div style={{ color: colors.muted }}>No saved estimates yet.</div>
                  ) : (
                    estimates.map((row) => (
                      <div
                        key={row.id}
                        style={{
                          background: colors.outputBg,
                          border: `1px solid ${colors.border}`,
                          borderRadius: 12,
                          padding: 14,
                        }}
                      >
                        <div style={{ fontWeight: 800 }}>{row.customerName}</div>
                        <div style={{ color: colors.muted, marginTop: 4 }}>{row.createdAt}</div>
                        <div style={{ marginTop: 8 }}>{row.jobDescription}</div>
                        <div style={{ marginTop: 8 }}>
                          Labor: {currency(row.aiLabor)} | Materials: {currency(row.aiMaterial)} | Total:{" "}
                          <strong>{currency(row.aiPrice)}</strong>
                        </div>
                        <div style={{ marginTop: 8, fontWeight: 700 }}>Status: {row.status}</div>

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                          <button onClick={() => loadEstimateRow(row)} style={secondaryBtn(colors)}>Load</button>
                          <button onClick={() => void updateEstimateStatus(row.id, "sent")} style={secondaryBtn(colors)}>Mark Sent</button>
                          <button onClick={() => void updateEstimateStatus(row.id, "approved")} style={secondaryBtn(colors)}>Mark Approved</button>
                          <button onClick={() => void updateEstimateStatus(row.id, "paid")} style={secondaryBtn(colors)}>Mark Paid</button>
                          <button onClick={() => void deleteEstimateRow(row.id)} style={dangerBtn(colors)}>Delete</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            )}

            {tool === "invoice" && (
              <Card title="Invoice Builder" colors={colors}>
                <Grid>
                  <Field label="Customer Name" value={invoice.customerName} onChange={(v) => setInvoice({ ...invoice, customerName: v })} colors={colors} />
                  <Field label="Job Name" value={invoice.jobName} onChange={(v) => setInvoice({ ...invoice, jobName: v })} colors={colors} />
                  <Field label="Invoice Number" value={invoice.invoiceNumber} onChange={(v) => setInvoice({ ...invoice, invoiceNumber: v })} colors={colors} />
                </Grid>

                <div
                  style={{
                    background: colors.outputBg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 16,
                  }}
                >
                  <div style={{ fontWeight: 800, marginBottom: 10 }}>Invoice Preview</div>
                  <div>
                    Total:{" "}
                    {currency(
                      invoice.items.reduce(
                        (sum, item) => sum + item.quantity * item.unitPrice,
                        0
                      ) *
                        (1 + invoice.taxPercent / 100)
                    )}
                  </div>
                </div>
              </Card>
            )}

            {tool === "invoices" && (
              <Card title="Invoice History" colors={colors}>
                <div style={{ display: "grid", gap: 12 }}>
                  {invoices.length === 0 ? (
                    <div style={{ color: colors.muted }}>No saved invoices yet.</div>
                  ) : (
                    invoices.map((row) => (
                      <div
                        key={row.id}
                        style={{
                          background: colors.outputBg,
                          border: `1px solid ${colors.border}`,
                          borderRadius: 12,
                          padding: 14,
                        }}
                      >
                        <div style={{ fontWeight: 800 }}>
                          {row.invoiceNumber || "Invoice"} — {row.customerName}
                        </div>
                        <div style={{ color: colors.muted, marginTop: 4 }}>{row.createdAt}</div>
                        <div style={{ marginTop: 8 }}>{row.jobName}</div>
                        <div style={{ marginTop: 8 }}>
                          Total: <strong>{currency(row.total)}</strong>
                        </div>
                        <div style={{ marginTop: 8, fontWeight: 700 }}>Status: {row.status}</div>

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                          <button onClick={() => void updateInvoiceStatus(row.id, "paid")} style={secondaryBtn(colors)}>Mark Paid</button>
                          <button onClick={() => void updateInvoiceStatus(row.id, "unpaid")} style={secondaryBtn(colors)}>Mark Unpaid</button>
                          <button onClick={() => void deleteInvoiceRow(row.id)} style={dangerBtn(colors)}>Delete</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            )}

            {tool === "saved" && (
              <Card title="Saved Docs" colors={colors}>
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
              <Card title="AI Quick Builder (Pro / Team)" colors={colors}>
                <Grid>
                  <Field label="Customer Name" value={aiBuilder.customerName} onChange={(v) => setAiBuilder({ ...aiBuilder, customerName: v })} colors={colors} />
                  <Field label="Project Type" value={aiBuilder.projectType} onChange={(v) => setAiBuilder({ ...aiBuilder, projectType: v })} colors={colors} />
                </Grid>
                <Area label="Describe the job in plain English" value={aiBuilder.prompt} onChange={(v) => setAiBuilder({ ...aiBuilder, prompt: v })} colors={colors} />
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button onClick={aiBuildEstimate} style={primaryBtn(colors)}>AI Build Estimate</button>
                  <button onClick={aiBuildScope} style={secondaryBtn(colors)}>AI Build Scope</button>
                </div>
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
              <Card title="Troubleshooting Assistant (Pro / Team)" colors={colors}>
                <Field label="Machine / Vehicle" value={trouble.machine} onChange={(v) => setTrouble({ ...trouble, machine: v })} colors={colors} />
                <Area label="Main Symptom" value={trouble.symptom} onChange={(v) => setTrouble({ ...trouble, symptom: v })} colors={colors} />
                <Area label="Recent Work / Relevant History" value={trouble.recentWork} onChange={(v) => setTrouble({ ...trouble, recentWork: v })} colors={colors} />
              </Card>
            )}

            {tool !== "dashboard" &&
              tool !== "customers" &&
              tool !== "saved" &&
              tool !== "estimates" &&
              tool !== "invoices" &&
              tool !== "customerDetail" && (
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
                  {tool !== "aiBuilder" && (
                    <button onClick={generateFromActiveTool} style={primaryBtn(colors)}>
                      {tool === "settings" ? "Save Settings" : "Generate Output"}
                    </button>
                  )}
                  <button onClick={copyOutput} style={secondaryBtn(colors)}>Copy</button>
                  <button onClick={exportPDF} style={secondaryBtn(colors)}>Export PDF</button>

                  {tool === "estimate" && (
                    <>
                      <button onClick={() => void saveEstimateToCloud()} style={secondaryBtn(colors)}>
                        Save Estimate
                      </button>
                      <button
                        onClick={() =>
                          void saveCurrentOutput(
                            "estimate",
                            `${estimate.jobType} Estimate`,
                            estimate.customerName
                          )
                        }
                        style={secondaryBtn(colors)}
                      >
                        Save Estimate Doc
                      </button>
                    </>
                  )}

                  {tool === "invoice" && (
                    <>
                      <button onClick={() => void saveInvoiceToCloud()} style={secondaryBtn(colors)}>
                        Save Invoice
                      </button>
                      <button
                        onClick={() =>
                          void saveCurrentOutput(
                            "invoice",
                            `Invoice ${invoice.invoiceNumber}`,
                            invoice.customerName
                          )
                        }
                        style={secondaryBtn(colors)}
                      >
                        Save Invoice Doc
                      </button>
                    </>
                  )}

                  {tool === "scope" && (
                    <button
                      onClick={() =>
                        void saveCurrentOutput("scope", scope.projectName || "Scope of Work", scope.customerName)
                      }
                      style={secondaryBtn(colors)}
                    >
                      Save Scope
                    </button>
                  )}

                  {tool === "contract" && (
                    <button
                      onClick={() =>
                        void saveCurrentOutput(
                          "contract",
                          contract.projectName || contract.contractTitle,
                          contract.clientName
                        )
                      }
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
                  <button onClick={copyOutput} style={secondaryBtn(colors)}>Copy</button>
                  <button onClick={exportPDF} style={secondaryBtn(colors)}>Export PDF</button>
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

function PricingCard({
  title,
  price,
  active,
  colors,
  features,
  buttonLabel,
  buttonAction,
}: {
  title: string;
  price: string;
  active: boolean;
  colors: any;
  features: string[];
  buttonLabel: string;
  buttonAction: () => void;
}) {
  return (
    <div
      style={{
        border: `1px solid ${active ? colors.accent : colors.border}`,
        borderRadius: 14,
        padding: 18,
        background: active ? colors.accentSoft : colors.outputBg,
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 30, fontWeight: 900, marginBottom: 12 }}>{price}</div>
      <div style={{ lineHeight: 1.7, marginBottom: 16 }}>
        {features.map((f) => (
          <div key={f}>• {f}</div>
        ))}
      </div>
      <button onClick={buttonAction} style={primaryBtn(colors)}>
        {buttonLabel}
      </button>
    </div>
  );
}

function LandingStat({ title, text }: { title: string; text: string }) {
  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #334155",
        borderRadius: 16,
        padding: 16,
      }}
    >
      <div style={{ fontWeight: 900, marginBottom: 8 }}>{title}</div>
      <div style={{ color: "#a8b3c7", lineHeight: 1.6 }}>{text}</div>
    </div>
  );
}

function TimelinePanel({
  title,
  colors,
  children,
  emptyText,
}: {
  title: string;
  colors: any;
  children: React.ReactNode;
  emptyText: string;
}) {
  const hasChildren = React.Children.count(children) > 0;
  return (
    <div
      style={{
        background: colors.outputBg,
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        padding: 14,
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 10 }}>{title}</div>
      {hasChildren ? children : <div style={{ color: colors.muted }}>{emptyText}</div>}
    </div>
  );
}

function TimelineItem({ title, meta }: { title: string; meta: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div>{title}</div>
      <div style={{ color: "#98a2b3", fontSize: 13 }}>{meta}</div>
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

function landingPrimaryBtn(): React.CSSProperties {
  return {
    background: "#9b87f5",
    color: "white",
    border: "none",
    borderRadius: 14,
    padding: "14px 20px",
    fontWeight: 900,
    cursor: "pointer",
  };
}

function landingSecondaryBtn(): React.CSSProperties {
  return {
    background: "transparent",
    color: "white",
    border: "1px solid #475467",
    borderRadius: 14,
    padding: "14px 20px",
    fontWeight: 800,
    cursor: "pointer",
  };
}

function whiteBtn(): React.CSSProperties {
  return {
    background: "white",
    color: "#111827",
    border: "none",
    borderRadius: 10,
    padding: "10px 14px",
    fontWeight: 800,
    cursor: "pointer",
  };
}