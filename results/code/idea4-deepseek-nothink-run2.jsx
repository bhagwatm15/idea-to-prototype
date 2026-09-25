import React, { useState } from "react";

const C = {
  bg: "#F5FBF6",
  card: "#FFFFFF",
  green: "#2FA36B",
  greenLight: "#E3F4EA",
  lime: "#A8DC6E",
  text: "#1F3D2B",
  muted: "#6E8A78",
  border: "#D8EADF",
  orange: "#F2994A",
};
const sh = { maxWidth: 520, margin: "0 auto", padding: "0 16px 90px" };
const card = {
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 14,
  padding: 14,
  marginBottom: 10,
};
const btn = {
  background: C.green,
  color: "white",
  border: "none",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  fontFamily: "inherit",
};
const chip = {
  display: "inline-block",
  background: C.greenLight,
  color: C.green,
  borderRadius: 20,
  padding: "3px 10px",
  fontSize: 12,
  fontWeight: 600,
  marginRight: 6,
  marginTop: 6,
};
const h2 = { fontSize: 22, margin: "18px 0 10px", color: C.text };
const sub = { color: C.muted, fontSize: 13, marginTop: -6, marginBottom: 14 };

export default function App() {
  const [screen, setScreen] = useState("fridge");

  const tabs = [
    ["fridge", "🧊 Fridge"],
    ["plan", "📅 Plan"],
    ["list", "🛒 List"],
    ["settings", "⚙️ Settings"],
  ];

  return (
    <div style={{ fontFamily: "system-ui,-apple-system,'Segoe UI',sans-serif", background: C.bg, minHeight: "100vh", color: C.text }}>
      <div style={sh}>
        <div style={{ paddingTop: 20, paddingBottom: 4 }}>
          <div style={{ fontSize: 26, fontWeight: 800 }}>
            Fridge<span style={{ color: C.green }}>Week</span>
          </div>
          <div style={{ color: C.muted, fontSize: 13 }}>Cook what you have. Waste nothing.</div>
        </div>

        {screen === "fridge" && (
          <div>
            <h2 style={h2}>Fridge Inventory</h2>
            <div style={sub}>12 items tracked · updated 2 days ago</div>
            <button style={{ ...btn, width: "100%", marginBottom: 14 }}>📷 Scan barcode or receipt</button>
            {[
              { n: "Chicken thighs", q: "500 g", t: "Use soon" },
              { n: "Baby spinach", q: "200 g bag", t: "Use soon" },
              { n: "Greek yogurt", q: "1 tub", t: "Fresh" },
              { n: "Brown rice", q: "Half bag", t: "Pantry" },
              { n: "Cherry tomatoes", q: "1 punnet", t: "Fresh" },
            ].map((it) => (
              <div key={it.n} style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{it.n}</div>
                  <div style={{ color: C.muted, fontSize: 12 }}>{it.q}</div>
                </div>
                <span style={{ ...chip, marginTop: 0, background: it.t === "Use soon" ? "#FDEBD8" : C.greenLight, color: it.t === "Use soon" ? C.orange : C.green }}>{it.t}</span>
              </div>
            ))}
          </div>
        )}

        {screen === "plan" && (
          <div>
            <h2 style={h2}>Weekly Plan</h2>
            <div style={sub}>4 meals use what you have · 2 items to buy</div>
            {[
              { d: "Mon", m: "Spinach & Chicken Rice Bowl", s: "From your fridge" },
              { d: "Tue", m: "Tomato Yogurt Flatbread", s: "Borrows: flatbread + lemon" },
              { d: "Wed", m: "Chicken & Veg Stir-fry", s: "From your fridge" },
              { d: "Thu", m: "Greek Yogurt Overnight Oats", s: "From your fridge" },
              { d: "Fri", m: "Tomato Rice Pilaf", s: "From your fridge" },
            ].map((r) => (
              <div key={r.d} style={{ ...card, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: C.greenLight, color: C.green, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
                  {r.d}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{r.m}</div>
                  <div style={{ color: C.muted, fontSize: 12 }}>{r.s}</div>
                </div>
                <button onClick={() => setScreen("recipe")} style={{ ...btn, padding: "6px 10px", fontSize: 12, background: C.greenLight, color: C.green }}>Swap</button>
              </div>
            ))}
            <button onClick={() => setScreen("list")} style={{ ...btn, width: "100%", marginTop: 4 }}>Build shopping list →</button>
          </div>
        )}

        {screen === "recipe" && (
          <div>
            <h2 style={h2}>Spinach & Chicken Rice Bowl</h2>
            <div style={sub}>35 min · serves 2 · 540 kcal</div>
            <div style={card}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Ingredients</div>
              <div>· 300 g chicken thighs</div>
              <div>· 150 g baby spinach</div>
              <div>· 1 cup cooked brown rice</div>
              <div>· 1 tbsp olive oil, salt, pepper</div>
            </div>
            <div style={card}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Steps</div>
              <div>1. Season and pan-sear chicken 6 min per side.</div>
              <div>2. Wilt spinach in the same pan.</div>
              <div>3. Fold rice through, top with sliced chicken.</div>
            </div>
            <div style={card}>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>Substitutions</div>
              <span style={chip}>No spinach → kale</span>
              <span style={chip}>Brown rice → quinoa</span>
            </div>
            <button onClick={() => setScreen("plan")} style={{ ...btn, width: "100%" }}>✓ Mark as cooked</button>
          </div>
        )}

        {screen === "list" && (
          <div>
            <h2 style={h2}>Shopping List</h2>
            <div style={sub}>6 ingredients · 2 stores · ~£11.40</div>
            {[
              { n: "Flatbreads", q: "1 pack" },
              { n: "Lemon", q: "2" },
              { n: "Olive oil", q: "1 bottle" },
              { n: "Onion", q: "3" },
            ].map((i) => (
              <div key={i.n} style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{i.n}</div>
                  <div style={{ color: C.muted, fontSize: 12 }}>{i.q}</div>
                </div>
                <button style={{ ...btn, padding: "6px 10px", fontSize: 12, background: C.greenLight, color: C.green }}>Add</button>
              </div>
            ))}
            <button onClick={() => setScreen("settings")} style={{ ...btn, width: "100%", marginTop: 4 }}>Confirm & check off</button>
          </div>
        )}

        {screen === "settings" && (
          <div>
            <h2 style={h2}>Settings & Preferences</h2>
            <div style={sub}>Personalise your weekly plan</div>
            <div style={card}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Household size</div>
              <span style={chip}>2 people</span>
              <span style={chip}>+ Add child</span>
            </div>
            <div style={card}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Dietary restrictions</div>
              <span style={chip}>No shellfish</span>
              <span style={chip}>Lower sodium</span>
            </div>
            <div style={card}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Cooking preferences</div>
              <span style={chip}>Max 35 min</span>
              <span style={chip}>Batch cook</span>
            </div>
            <button onClick={() => setScreen("plan")} style={{ ...btn, width: "100%" }}>Save preferences</button>
          </div>
        )}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.card, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "center" }}>
        <div style={{ ...sh, padding: "10px 8px", display: "flex", gap: 6 }}>
          {tabs.map(([k, label]) => (
            <button key={k} onClick={() => setScreen(k)} style={{
              flex: 1,
              border: "none",
              background: screen === k ? C.greenLight : "transparent",
              color: screen === k ? C.green : C.muted,
              borderRadius: 10,
              padding: "8px 4px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}>{label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
