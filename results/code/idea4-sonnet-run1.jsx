import React, { useState } from "react";

export default function App() {
  const colors = {
    primary: "#3FA66C",
    primaryDark: "#2C7A4B",
    bg: "#FAF8F3",
    card: "#FFFFFF",
    text: "#26312B",
    sub: "#7A8580",
    accent: "#F2A354",
    border: "#E4E0D5",
  };
  const cardStyle = { background: colors.card, borderRadius: 12, padding: 16, marginBottom: 12, border: `1px solid ${colors.border}` };
  const btn = (bg, color = "#fff") => ({ background: bg, color, border: "none", borderRadius: 8, padding: "8px 14px", fontWeight: 600, cursor: "pointer", fontSize: 14 });
  const input = { padding: "8px 10px", borderRadius: 8, border: `1px solid ${colors.border}`, fontSize: 14, flex: 1 };
  const label = { fontSize: 13, color: colors.sub, marginBottom: 4, display: "block" };

  const [screen, setScreen] = useState("fridge");
  const [items, setItems] = useState([
    { name: "Eggs", qty: "6 ct" },
    { name: "Spinach", qty: "1 bag" },
    { name: "Chicken breast", qty: "1.5 lb" },
    { name: "Bell peppers", qty: "3" },
    { name: "Milk", qty: "half gal" },
  ]);
  const [newItem, setNewItem] = useState("");

  const [plan, setPlan] = useState([
    { day: "Monday", meal: "Lemon Garlic Chicken & Spinach", cooked: false },
    { day: "Tuesday", meal: "Veggie Stir-Fry with Rice", cooked: false },
    { day: "Wednesday", meal: "Spinach & Feta Omelette", cooked: false },
    { day: "Thursday", meal: "Chicken Fajita Bowls", cooked: false },
    { day: "Friday", meal: "Pasta Primavera", cooked: false },
    { day: "Saturday", meal: "Leftover Remix Bowl", cooked: false },
    { day: "Sunday", meal: "Sheet-Pan Salmon & Veggies", cooked: false },
  ]);
  const swaps = ["Black Bean Tacos", "Pesto Chickpea Pasta", "Sheet-Pan Sausage & Peppers"];

  const recipes = {
    "Lemon Garlic Chicken & Spinach": {
      time: "30 min",
      ingredients: ["Chicken breast (1.5 lb)", "Spinach (2 cups)", "Garlic (3 cloves)", "Lemon (1)", "Olive oil"],
      steps: ["Season and sear chicken 6 min per side.", "Add garlic, cook 1 min.", "Wilt in spinach and lemon juice.", "Rest 3 min, slice, serve."],
      subs: "No spinach? Use kale or chard instead.",
    },
    "Sheet-Pan Salmon & Veggies": {
      time: "25 min",
      ingredients: ["Salmon fillets (2)", "Bell peppers (2)", "Zucchini (1)", "Olive oil", "Paprika"],
      steps: ["Toss veggies in oil, roast 10 min at 425°F.", "Add salmon, roast 12 more min.", "Squeeze lemon and serve."],
      subs: "Swap salmon for cod or tofu.",
    },
  };
  const [recipeName, setRecipeName] = useState("Lemon Garlic Chicken & Spinach");
  const recipe = recipes[recipeName] || { time: "20 min", ingredients: ["Ingredients coming soon"], steps: ["Steps coming soon"], subs: "—" };

  const [shopping, setShopping] = useState([
    { name: "Salmon fillets", qty: "2", bought: false },
    { name: "Feta cheese", qty: "1 block", bought: false },
    { name: "Brown rice", qty: "2 cups", bought: false },
    { name: "Garlic", qty: "1 bulb", bought: false },
    { name: "Lemons", qty: "3", bought: false },
  ]);

  const [prefs, setPrefs] = useState({ vegetarian: false, glutenFree: false, dairyFree: false, household: 3, cookTime: "30 min or less" });

  const tabs = [
    ["fridge", "Fridge"],
    ["plan", "Weekly Plan"],
    ["recipe", "Recipe"],
    ["shopping", "Shopping"],
    ["settings", "Settings"],
  ];

  let content;
  if (screen === "fridge") {
    content = (
      <div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input style={input} placeholder="Add item, e.g. Broccoli" value={newItem} onChange={(e) => setNewItem(e.target.value)} />
          <button style={btn(colors.primary)} onClick={() => { if (newItem.trim()) { setItems([...items, { name: newItem, qty: "1" }]); setNewItem(""); } }}>Add</button>
          <button style={btn(colors.accent)} onClick={() => alert("Camera scan simulated — item added!")}>Scan</button>
        </div>
        {items.map((it, i) => (
          <div key={i} style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><strong>{it.name}</strong><div style={{ color: colors.sub, fontSize: 13 }}>{it.qty}</div></div>
            <button style={btn("#EEE", colors.text)} onClick={() => setItems(items.filter((_, idx) => idx !== i))}>Remove</button>
          </div>
        ))}
      </div>
    );
  } else if (screen === "plan") {
    content = (
      <div>
        <div style={{ ...cardStyle, background: "#EFF7EF" }}>7-day plan ready! Only <strong>5 items</strong> needed from the store.</div>
        {plan.map((p, i) => (
          <div key={i} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ color: colors.sub, fontSize: 12 }}>{p.day.toUpperCase()}</div>
                <div style={{ fontWeight: 700, cursor: "pointer" }} onClick={() => { setRecipeName(p.meal); setScreen("recipe"); }}>{p.meal}</div>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <button style={btn(colors.accent)} onClick={() => {
                  const alt = swaps[i % swaps.length];
                  setPlan(plan.map((x, idx) => (idx === i ? { ...x, meal: alt } : x)));
                }}>Swap</button>
                <label style={{ fontSize: 13 }}>
                  <input type="checkbox" checked={p.cooked} onChange={() => setPlan(plan.map((x, idx) => (idx === i ? { ...x, cooked: !x.cooked } : x)))} /> Cooked
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  } else if (screen === "recipe") {
    content = (
      <div>
        <select style={{ ...input, marginBottom: 12 }} value={recipeName} onChange={(e) => setRecipeName(e.target.value)}>
          {plan.map((p, i) => <option key={i}>{p.meal}</option>)}
        </select>
        <div style={cardStyle}>
          <h2 style={{ margin: "0 0 4px" }}>{recipeName}</h2>
          <div style={{ color: colors.sub, marginBottom: 12 }}>⏱ {recipe.time}</div>
          <strong>Ingredients</strong>
          <ul>{recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}</ul>
          <strong>Steps</strong>
          <ol>{recipe.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
          <div style={{ background: "#FFF3E4", padding: 10, borderRadius: 8, marginTop: 10 }}><strong>Substitution:</strong> {recipe.subs}</div>
        </div>
      </div>
    );
  } else if (screen === "shopping") {
    content = (
      <div>
        <div style={{ ...cardStyle, background: "#EFF7EF" }}>Consolidated from this week's plan — {shopping.length} items to buy.</div>
        {shopping.map((s, i) => (
          <div key={i} style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: s.bought ? 0.5 : 1 }}>
            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input type="checkbox" checked={s.bought} onChange={() => setShopping(shopping.map((x, idx) => (idx === i ? { ...x, bought: !x.bought } : x)))} />
              <span><strong>{s.name}</strong> <span style={{ color: colors.sub }}>({s.qty})</span></span>
            </label>
          </div>
        ))}
      </div>
    );
  } else {
    content = (
      <div>
        <div style={cardStyle}>
          <label style={label}>Dietary Restrictions</label>
          {["vegetarian", "glutenFree", "dairyFree"].map((k) => (
            <label key={k} style={{ marginRight: 16 }}>
              <input type="checkbox" checked={prefs[k]} onChange={() => setPrefs({ ...prefs, [k]: !prefs[k] })} /> {k === "glutenFree" ? "Gluten-Free" : k === "dairyFree" ? "Dairy-Free" : "Vegetarian"}
            </label>
          ))}
        </div>
        <div style={cardStyle}>
          <label style={label}>Household Size</label>
          <input style={input} type="number" value={prefs.household} onChange={(e) => setPrefs({ ...prefs, household: e.target.value })} />
        </div>
        <div style={cardStyle}>
          <label style={label}>Cooking Time Preference</label>
          <select style={input} value={prefs.cookTime} onChange={(e) => setPrefs({ ...prefs, cookTime: e.target.value })}>
            <option>15 min or less</option>
            <option>30 min or less</option>
            <option>No limit</option>
          </select>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Helvetica, Arial, sans-serif", background: colors.bg, minHeight: "100vh", color: colors.text }}>
      <div style={{ background: colors.primary, color: "#fff", padding: "18px 20px" }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>🥕 FridgeWeek</h1>
        <div style={{ fontSize: 13, opacity: 0.9 }}>Eat well from what you've already got.</div>
      </div>
      <div style={{ display: "flex", background: colors.card, borderBottom: `1px solid ${colors.border}`, overflowX: "auto" }}>
        {tabs.map(([key, lbl]) => (
          <div key={key} onClick={() => setScreen(key)} style={{ padding: "12px 16px", cursor: "pointer", fontSize: 14, fontWeight: screen === key ? 700 : 400, color: screen === key ? colors.primaryDark : colors.sub, borderBottom: screen === key ? `3px solid ${colors.primary}` : "3px solid transparent" }}>
            {lbl}
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: 20 }}>{content}</div>
    </div>
  );
}
