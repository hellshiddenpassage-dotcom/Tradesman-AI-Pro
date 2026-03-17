import React, { useEffect, useState } from "react";

const BASIC_LINK = "https://buy.stripe.com/6oU3cocrv2Cb7BW7U1d7q06";
const PRO_LINK = "https://buy.stripe.com/eVqdR21MRfoX3lGeipd7q07";
const TEAM_LINK = "https://buy.stripe.com/3cI9AM77b2Cb2hCcahd7q08";

function getLocal(key: string, fallback: any) {
  const val = localStorage.getItem(key);
  return val ? JSON.parse(val) : fallback;
}

function setLocal(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

export default function App() {
  const [job, setJob] = useState("");
  const [output, setOutput] = useState("");

  const [laborRate, setLaborRate] = useState<number>(
    getLocal("laborRate", 95)
  );
  const [markup, setMarkup] = useState<number>(
    getLocal("markup", 20)
  );

  const [uses, setUses] = useState<number>(
    getLocal("freeUses", 0)
  );

  const maxFree = 3;

  useEffect(() => {
    setLocal("laborRate", laborRate);
  }, [laborRate]);

  useEffect(() => {
    setLocal("markup", markup);
  }, [markup]);

  useEffect(() => {
    setLocal("freeUses", uses);
  }, [uses]);

  function detectJobType(text: string) {
    text = text.toLowerCase();
    if (text.includes("driveway")) return "Driveway";
    if (text.includes("gravel")) return "Gravel Work";
    if (text.includes("fence")) return "Fence";
    if (text.includes("concrete")) return "Concrete";
    if (text.includes("clear")) return "Land Clearing";
    return "General Work";
  }

  function generateEstimate() {
    if (uses >= maxFree) {
      setOutput("Free limit reached. Upgrade to continue.");
      return;
    }

    const type = detectJobType(job);

    let hours = 8;
    let materials = 500;
    let equipment = 300;

    if (type === "Driveway") {
      hours = 12;
      materials = 1200;
      equipment = 500;
    }

    if (type === "Gravel Work") {
      hours = 10;
      materials = 1000;
      equipment = 400;
    }

    if (type === "Fence") {
      hours = 14;
      materials = 1400;
      equipment = 200;
    }

    const laborCost = hours * laborRate;
    const subtotal = laborCost + materials + equipment;
    const markupAmount = subtotal * (markup / 100);
    const total = subtotal + markupAmount;

    const result = `
PROFESSIONAL ESTIMATE

Job: ${job}
Type: ${type}

Labor Hours: ${hours}
Labor Rate: $${laborRate}
Labor Cost: $${laborCost}

Materials: $${materials}
Equipment: $${equipment}

Subtotal: $${subtotal}
Markup: ${markup}% ($${Math.round(markupAmount)})

TOTAL: $${Math.round(total)}
`;

    setOutput(result);
    setUses(uses + 1);
  }

  return (
    <div style={{ padding: 30, maxWidth: 900, margin: "auto" }}>
      <h1>Tradesman AI</h1>

      <h2>Instant Estimate Tool</h2>

      <textarea
        value={job}
        onChange={(e) => setJob(e.target.value)}
        placeholder="Type job (example: gravel driveway 200x40)"
        style={{ width: "100%", height: 100 }}
      />

      <button onClick={generateEstimate}>
        Generate Estimate
      </button>

      <p>
        Free Uses Remaining: {Math.max(0, maxFree - uses)}
      </p>

      {uses >= maxFree && (
        <div>
          <h3>Upgrade Required</h3>
          <button onClick={() => window.open(BASIC_LINK)}>
            Basic $19
          </button>
          <button onClick={() => window.open(PRO_LINK)}>
            Pro $49
          </button>
          <button onClick={() => window.open(TEAM_LINK)}>
            Team $99
          </button>
        </div>
      )}

      <h2>Company Settings</h2>

      <label>Labor Rate</label>
      <input
        type="number"
        value={laborRate}
        onChange={(e) => setLaborRate(Number(e.target.value))}
      />

      <label>Markup %</label>
      <input
        type="number"
        value={markup}
        onChange={(e) => setMarkup(Number(e.target.value))}
      />

      <h2>Output</h2>
      <pre>{output}</pre>
    </div>
  );
}