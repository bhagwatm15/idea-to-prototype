import React, { useState } from "react";

const App = () => {
  // ---------- shared styles ----------
  const palette = {
    bg: "#f5fff7",
    primary: "#2e8b57",
    accent: "#a3d9a5",
    text: "#2b2b2b",
    muted: "#6b6b6b",
  };
  const spacing = { xs: 4, sm: 8, md: 12, lg: 16 };
  const base = {
    container: { fontFamily: "Arial, sans-serif", color: palette.text, background: palette.bg, minHeight: "100vh", padding: spacing.lg },
    header: { fontSize: 24, marginBottom: spacing.md, color: palette.primary },
    subHeader: { fontSize: 18, marginTop: spacing.md, marginBottom: spacing.sm, color: palette.primary },
    button: { background: palette.primary, color: "#fff", border: "none", borderRadius: 4, padding: `${spacing.sm}px ${spacing.md}px`, cursor: "pointer", marginRight: spacing.sm },
    input: { padding: spacing.sm, border: `1px solid ${palette.muted}`, borderRadius: 4, marginRight: spacing.sm },
    listItem: { padding: `${spacing.xs}px 0`, borderBottom: `1px solid ${palette.accent}` },
    navBar: { position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: `1px solid ${palette.accent}`, display: "flex", justifyContent: "space-around", padding: spacing.sm },
    navBtn: (active) => ({
      background: "none",
      border: "none",
      color: active ? palette.primary : palette.muted,
      fontWeight: active ? "bold" : "normal",
      cursor: "pointer",
    }),
  };

  // ---------- state ----------
  const [screen, setScreen] = useState("Inventory");
  const [inventory, setInventory] = useState(["Milk 1L", "Eggs 12", "Spinach 200g"]);
  const [newItem, setNewItem] = useState("");
  const [plan, setPlan] = useState([
    { day: "Mon", meal: "Veggie Omelette" },
    { day: "Tue", meal: "Chicken Stir‑Fry" },
    { day: "Wed", meal: "Quinoa Salad" },
    { day: "Thu", meal: "Salmon & Asparagus" },
    { day: "Fri", meal: "Pasta Primavera" },
    { day: "Sat", meal: "Taco Night" },
    { day: "Sun", meal: "Roast Veggie Bowl" },
  ]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [shopping, setShopping] = useState(["Chicken Breast 500g", "Tomatoes 4", "Parmesan 100g"]);
  const [settings, setSettings] = useState({ diet: "None", size: 2, pref: "Quick" });

  // ---------- handlers ----------
  const addItem = () => {
    if (newItem.trim()) {
      setInventory([...inventory, newItem.trim()]);
      setNewItem("");
    }
  };
  const openRecipe = (meal) => setSelectedRecipe(meal);
  const closeRecipe = () => setSelectedRecipe(null);
  const updateSetting = (key, value) => setSettings({ ...settings, [key]: value });

  // ---------- render ----------
  let content;
  if (screen === "Inventory") {
    content = (
      <div>
        <div style={base.header}>Fridge & Pantry</div>
        <div>
          {inventory.map((i, idx) => (
            <div key={idx} style={base.listItem}>{i}</div>
          ))}
        </div>
        <div style={{ marginTop: spacing.md }}>
          <input
            style={base.input}
            placeholder="Add item (e.g. Yogurt 500g)"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
          />
          <button style={base.button} onClick={addItem}>Add</button>
        </div>
      </div>
    );
  } else if (screen === "Plan") {
    content = (
      <div>
        <div style={base.header}>7‑Day Meal Plan</div>
        {plan.map((p, idx) => (
          <div key={idx} style={base.listItem}>
            <strong>{p.day}:</strong> {p.meal}
            <button style={base.button} onClick={() => openRecipe(p.meal)}>Details</button>
          </div>
        ))}
      </div>
    );
  } else if (screen === "Recipe" && selectedRecipe) {
    content = (
      <div>
        <div style={base.header}>Recipe: {selectedRecipe}</div>
        <div style={base.subHeader}>Ingredients</div>
        <ul style={{ marginLeft: spacing.lg }}>
          <li>2 pcs {selectedRecipe.includes("Salmon") ? "Salmon fillet" : "Eggs"}</li>
          <li>1 cup {selectedRecipe.includes("Salmon") ? "Quinoa" : "Spinach"} </li>
          <li>Salt & pepper</li>
        </ul>
        <div style={base.subHeader}>Steps</div>
        <ol style={{ marginLeft: spacing.lg }}>
          <li>Prep ingredients.</li>
          <li>Cook according to method.</li>
          <li>Serve warm.</li>
        </ol>
        <div style={base.subHeader}>Substitutions</div>
        <p style={{ color: palette.muted, marginLeft: spacing.lg }}>
          Swap {selectedRecipe.includes("Salmon") ? "Quinoa" : "Eggs"} for tofu for a vegetarian option.
        </p>
        <button style={base.button} onClick={closeRecipe}>Back to Plan</button>
      </div>
    );
  } else if (screen === "Shopping") {
    content = (
      <div>
        <div style={base.header}>Shopping List</div>
        {shopping.map((s, idx) => (
          <div key={idx} style={base.listItem}>{s}</div>
        ))}
      </div>
    );
  } else if (screen === "Settings") {
    content = (
      <div>
        <div style={base.header}>Preferences</div>
        <div style={{ marginTop: spacing.sm }}>
          <label>Dietary restriction: </label>
          <select
            style={base.input}
            value={settings.diet}
            onChange={(e) => updateSetting("diet", e.target.value)}
          >
            <option>None</option>
            <option>Vegetarian</option>
            <option>Vegan</option>
            <option>Gluten‑Free</option>
          </select>
        </div>
        <div style={{ marginTop: spacing.sm }}>
          <label>Household size: </label>
          <input
            type="number"
            style={base.input}
            min={1}
            value={settings.size}
            onChange={(e) => updateSetting("size", +e.target.value)}
          />
        </div>
        <div style={{ marginTop: spacing.sm }}>
          <label>Cooking preference: </label>
          <select
            style={base.input}
            value={settings.pref}
            onChange={(e) => updateSetting("pref", e.target.value)}
          >
            <option>Quick</option>
            <option>Meal‑Prep</option>
            <option>Gourmet</option>
          </select>
        </div>
      </div>
    );
  }

  // If recipe detail opened from Plan, override screen name
  const displayedScreen = screen === "Plan" && selectedRecipe ? "Recipe" : screen;

  return (
    <div style={base.container}>
      {content}
      <div style={base.navBar}>
        {["Inventory", "Plan", "Shopping", "Settings"].map((tab) => (
          <button
            key={tab}
            style={base.navBtn(displayedScreen === tab)}
            onClick={() => {
              setScreen(tab);
              if (tab !== "Plan") setSelectedRecipe(null);
            }}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;
