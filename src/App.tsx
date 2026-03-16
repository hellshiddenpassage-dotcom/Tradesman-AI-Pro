import { useState } from "react";

export default function App() {

  const BASIC_STRIPE_LINK = "https://buy.stripe.com/basic_plan_link";
  const PRO_STRIPE_LINK = "https://buy.stripe.com/pro_plan_link";

  const [customers, setCustomers] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState("");

  const addCustomer = () => {
    if (!customerName) return;

    setCustomers([
      ...customers,
      {
        name: customerName,
        created: new Date().toLocaleDateString()
      }
    ]);

    setCustomerName("");
  };

  return (
    <div
      style={{
        fontFamily: "Arial",
        maxWidth: "1000px",
        margin: "auto",
        padding: "40px"
      }}
    >
      <h1>Tradesman AI</h1>

      <p>
        AI tools for contractors, mechanics, and trades professionals.
      </p>

      {/* CUSTOMER MANAGER */}

      <h2>Add Customer</h2>

      <input
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        placeholder="Customer Name"
        style={{
          padding: "10px",
          marginRight: "10px"
        }}
      />

      <button onClick={addCustomer}>
        Add
      </button>

      <h2 style={{ marginTop: "40px" }}>Customers</h2>

      {customers.map((c, i) => (
        <div
          key={i}
          style={{
            padding: "10px",
            borderBottom: "1px solid #ddd"
          }}
        >
          <strong>{c.name}</strong>

          <div style={{ fontSize: "12px", color: "#777" }}>
            Added {c.created}
          </div>
        </div>
      ))}

      {/* PRICING */}

      <h2 style={{ marginTop: "60px" }}>Pricing</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "20px",
          marginTop: "20px"
        }}
      >

        {/* BASIC */}

        <div
          style={{
            border: "1px solid #ddd",
            padding: "20px",
            borderRadius: "10px"
          }}
        >
          <h3>Basic</h3>

          <h2>$19/mo</h2>

          <ul>
            <li>Customer manager</li>
            <li>Job notes</li>
            <li>Basic AI tools</li>
            <li>Up to 25 customers</li>
          </ul>

          <button
            onClick={() => window.open(BASIC_STRIPE_LINK)}
            style={{
              marginTop: "10px",
              padding: "10px",
              width: "100%"
            }}
          >
            Subscribe
          </button>
        </div>

        {/* PRO */}

        <div
          style={{
            border: "2px solid #7c3aed",
            padding: "20px",
            borderRadius: "10px"
          }}
        >
          <h3>Pro</h3>

          <h2>$49/mo</h2>

          <ul>
            <li>Unlimited customers</li>
            <li>Estimate generator</li>
            <li>AI troubleshooting</li>
            <li>Document storage</li>
          </ul>

          <button
            onClick={() => window.open(PRO_STRIPE_LINK)}
            style={{
              marginTop: "10px",
              padding: "10px",
              width: "100%",
              background: "#7c3aed",
              color: "white",
              border: "none"
            }}
          >
            Upgrade
          </button>
        </div>

        {/* TEAM */}

        <div
          style={{
            border: "1px solid #ddd",
            padding: "20px",
            borderRadius: "10px"
          }}
        >
          <h3>Team</h3>

          <h2>$99/mo</h2>

          <ul>
            <li>Everything in Pro</li>
            <li>Multiple users</li>
            <li>Team dashboard</li>
            <li>Priority support</li>
          </ul>

          <button
            onClick={() => alert("Team plan coming soon")}
            style={{
              marginTop: "10px",
              padding: "10px",
              width: "100%"
            }}
          >
            Coming Soon
          </button>
        </div>

      </div>

    </div>
  );
}