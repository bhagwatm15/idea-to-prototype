import React, { useState } from "react";

export default function App() {
  const [screen, setScreen] = useState("fridge");
  const [plan, setPlan] = useState([
    { day: "Mon", meal: "Spinach & Feta Omelette", uses: "eggs, spinach, feta", missing: [] },
    { day: "Tue", meal: "Chicken Stir Fry", uses: "chicken, peppers, rice", missing: ["soy sauce"] },
    { day: "Wed", meal: "Tomato Basil Pasta", uses: "pasta, tomatoes, basil", missing: ["parmesan"] },
    { day: "Thu", meal: "Black Bean Tacos", uses: "beans, tortillas, onion", missing: [] },
    { day: "Fri", meal: "Salmon & Roasted Veg", uses: "salmon, zucchini, carrots", missing: ["lemon"] },
    { day: "Sat", meal: "Veggie Fried Rice", uses: "rice, peas, eggs", missing: [] },
    { day: "Sun", meal: "Lentil Soup", uses: "lentils, carrots, celery", missing: ["vegetable broth"] },
  ]);
  const [fridge, setFridge] = useState([
    { name: "Eggs", qty: "8" },
    { name: "Spinach", qty: "1 bag" },
    { name: "Chicken breast", qty: "2" },
    { name: "Tomatoes", qty: "5" },
    { name: "Rice", qty: "1 kg" },
  ]);
  const [checked, setChecked] = useState([]);
  const [cooked, setCooked] = useState([]);
  const [diet, setDiet] = useState("Vegetarian-friendly");

  const colors = { bg: "#f6fbf7", card: "#ffffff", primary: "#2e9e5b", accent: "#f59e0b", text: "#1f3d2b", muted: "#6b7f72", border: "#e0ece3" };
  const card = { background: colors.card, borderRadius: 14, padding: 16, marginBottom: 12, border: `1px solid ${colors.border}` };
  const btn = { background: colors.primary, color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 15, fontWeight: 600, cursor: "pointer" };
  const btnAlt = { ...btn, background: "#e8f5ee", color: colors.primary };
  const h1 = { fontSize: 22, fontWeight: 700, color: colors.text, margin: "0 0 12px" };
  const h2 = { fontSize: 16, fontWeight: 600, color: colors.text, margin: "0 0 6px" };
  const p = { fontSize: 14, color: colors.muted, margin: "2px 0" };
  const input = { width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 14, boxSizing: "border-box", marginBottom: 10 };

  const missing = plan.filter(m => !cooked.includes(m.day)).flatMap(m => m.missing);
  const uniqMissing = [...new Set(missing)];

  const addFridge = () => {
    const name = prompt("Item name?");
    if (name) setFridge([...fridge, { name, qty: "1" }]);
  };

  const swapMeal = (i) => {
    const options = ["Sheet Pan Veggies", "Quinoa Bowl", "Egg Fried Rice", "Grilled Cheese & Soup"];
    const next = options[Math.floor(Math.random() * options.length)];
    const copy = [...plan];
    copy[i] = { ...copy[i], meal: next };
    setPlan(copy);
  };

  const toggleCook = (day) => setCooked(cooked.includes(day) ? cooked.filter(d => d !== day) : [...cooked, day]);

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif", background: colors.bg, minHeight: "100vh", paddingBottom: 70 }}>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: 16 }}>
        <h1 style={{ ...h1, fontSize: 24 }}>🥬 FridgeWeek</h1>

        {screen === "fridge" && (
          <div>
            <h2 style={h1}>Fridge Inventory</h2>
            <div style={card}>
              <p style={p}>Scan a receipt or add items manually.</p>
              <button style={{ ...btn, width: "100%", marginTop: 8 }} onClick={addFridge}>📷 Scan / Add Item</button>
            </div>
            {fridge.map((item, i) => (
              <div key={i} style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><b style={{ color: colors.text }}>{item.name}</b><p style={p}>Qty: {item.qty}</p></div>
                <button style={btnAlt} onClick={() => setFridge(fridge.filter((_, j) => j !== i))}>Edit</button>
              </div>
            ))}
            <button style={{ ...btn, width: "100%" }} onClick={() => setScreen("plan")}>Generate Weekly Plan →</button>
          </div>
        )}

        {screen === "plan" && (
          <div>
            <h2 style={h1}>This Week's Plan</h2>
            {plan.map((m, i) => (
              <div key={i} style={{ ...card, background: cooked.includes(m.day) ? "#e8f5ee" : colors.card }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <b style={{ color: colors.primary }}>{m.day}</b>
                  {m.missing.length > 0 && <span style={{ fontSize: 12, color: colors.accent }}>⚠ {m.missing.length} to buy</span>}
                </div>
                <h2 style={h2}>{m.meal}</h2>
                <p style={p}>Uses: {m.uses}</p>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button style={{ ...btnAlt, flex: 1 }} onClick={() => setScreen("recipe")}>View</button>
                  <button style={{ ...btnAlt, flex: 1 }} onClick={() => swapMeal(i)}>Swap</button>
                  <button style={{ ...btn, flex: 1 }} onClick={() => toggleCook(m.day)}>{cooked.includes(m.day) ? "Cooked ✓" : "Cook"}</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {screen === "recipe" && (
          <div>
            <button style={{ ...btnAlt, marginBottom: 12 }} onClick={() => setScreen("plan")}>← Back to Plan</button>
            <h2 style={h1}>Chicken Stir Fry</h2>
            <div style={card}>
              <h2 style={h2}>Ingredients</h2>
              <p style={p}>• 2 chicken breasts</p>
              <p style={p}>• 1 red pepper, sliced</p>
              <p style={p}>• 1 cup jasmine rice</p>
              <p style={p}>• 2 tbsp soy sauce <i>(missing)</i></p>
            </div>
            <div style={card}>
              <h2 style={h2}>Steps</h2>
              <p style={p}>1. Cook rice according to package.</p>
              <p style={p}>2. Sauté chicken until golden, ~6 min.</p>
              <p style={p}>3. Add peppers and soy sauce; toss 3 min.</p>
            </div>
            <div style={card}>
              <h2 style={h2}>Substitutions</h2>
              <p style={p}>Soy sauce → tamari or coconut aminos</p>
              <p style={p}>Chicken → tofu or tempeh</p>
            </div>
          </div>
        )}

        {screen === "list" && (
          <div>
            <h2 style={h1}>Shopping List</h2>
            <div style={card}><p style={p}>{uniqMissing.length} items • ~$14 est.</p></div>
            {uniqMissing.length === 0 && <div style={card}><p style={p}>Nothing missing — you're all set!</p></div>}
            {uniqMissing.map((item, i) => {
              const on = checked.includes(item);
              return (
                <div key={i} style={{ ...card, display: "flex", alignItems: "center", gap: 12, textDecoration: on ? "line-through" : "none", opacity: on ? 0.6 : 1 }}>
                  <input type="checkbox" checked={on} onChange={() => setChecked(on ? checked.filter(x => x !== item) : [...checked, item])} style={{ width: 20, height: 20 }} />
                  <b style={{ color: colors.text }}>{item}</b>
                </div>
              );
            })}
          </div>
        )}

        {screen === "settings" && (
          <div>
            <h2 style={h1}>Settings & Preferences</h2>
            <div style={card}>
              <h2 style={h2}>Dietary preference</h2>
              <select value={diet} onChange={e => setDiet(e.target.value)} style={input}>
                <option>Vegetarian-friendly</option>
                <option>Vegan</option>
                <option>Gluten-free</option>
                <option>No restrictions</option>
              </select>
            </div>
            <div style={card}>
              <h2 style={h2}>Household size</h2>
              <input style={input} defaultValue="2 adults, 1 child" />
            </div>
            <div style={card}>
              <h2 style={h2}>Cooking preferences</h2>
              <p style={p}>✓ Max 30 min per meal</p>
              <p style={p}>✓ Prefer one-pan recipes</p>
              <p style={p}>✓ Minimize food waste</p>
            </div>
            <button style={{ ...btn, width: "100%" }}>Save Preferences</button>
          </div>
        )}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: colors.card, borderTop: `1px solid ${colors.border}`, display: "flex", maxWidth: 520, margin: "0 auto" }}>
        {[["fridge", "🧊", "Fridge"], ["plan", "📅", "Plan"], ["recipe", "🍳", "Recipe"], ["list", "🛒", "List"], ["settings", "⚙️", "Settings"]].map(([key, icon, label]) => (
          <button key={key} onClick={() => setScreen(key)} style={{ flex: 1, background: "none", border: "none", padding: "10px 4px", cursor: "pointer", color: screen === key ? colors.primary : colors.muted, fontSize: 11, fontWeight: screen === key ? 700 : 500 }}>
            <div style={{ fontSize: 18 }}>{icon}</div>{label}
          </button>
        ))}
      </div>
    </div>
  );
}
