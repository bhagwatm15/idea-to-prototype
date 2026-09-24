import React, { useState } from "react";

const colors = {
  bg: "#F4FBF4",
  primary: "#2E7D32",
  primaryLight: "#E8F5E9",
  accent: "#FFA726",
  text: "#1B3A1E",
  border: "#C8E6C9",
  white: "#FFFFFF",
};

const styles = {
  app: { fontFamily: "'Segoe UI', sans-serif", background: colors.bg, minHeight: "100vh", color: colors.text, paddingBottom: 70, maxWidth: 480, margin: "0 auto" },
  header: { background: colors.primary, color: colors.white, padding: "18px 20px", fontSize: 22, fontWeight: 700 },
  section: { padding: 16 },
  card: { background: colors.white, border: `1px solid ${colors.border}`, borderRadius: 10, padding: 12, marginBottom: 10 },
  btn: { background: colors.primary, color: colors.white, border: "none", borderRadius: 8, padding: "8px 14px", fontWeight: 600, cursor: "pointer" },
  btnOutline: { background: colors.white, color: colors.primary, border: `2px solid ${colors.primary}`, borderRadius: 8, padding: "8px 14px", fontWeight: 600, cursor: "pointer" },
  input: { border: `1px solid ${colors.border}`, borderRadius: 8, padding: 8, fontSize: 14, width: "100%", boxSizing: "border-box" },
  nav: { position: "fixed", bottom: 0, left: 0, right: 0, maxWidth: 480, margin: "0 auto", display: "flex", background: colors.white, borderTop: `1px solid ${colors.border}` },
  navBtn: (active) => ({ flex: 1, padding: "10px 4px", textAlign: "center", background: active ? colors.primaryLight : colors.white, color: active ? colors.primary : "#777", fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer" }),
  chip: { display: "inline-block", background: colors.primaryLight, color: colors.primary, borderRadius: 20, padding: "3px 10px", fontSize: 12, marginRight: 6, marginBottom: 6 },
};

const recipes = {
  "Lemon Garlic Chicken & Rice": { ingredients: ["Chicken breast (2)", "Rice (1 cup)", "Lemon", "Garlic", "Broccoli"], steps: ["Sear chicken 5 min/side", "Simmer rice 18 min", "Steam broccoli", "Toss with lemon-garlic sauce"], sub: "Swap chicken for tofu for a vegetarian version." },
  "Veggie Stir-Fry with Tofu": { ingredients: ["Tofu (1 block)", "Bell peppers", "Soy sauce", "Carrots", "Rice noodles"], steps: ["Press & cube tofu", "Stir-fry veggies 4 min", "Add tofu & sauce", "Toss with noodles"], sub: "Use chickpeas instead of tofu if preferred." },
  "Baked Salmon & Asparagus": { ingredients: ["Salmon fillets (2)", "Asparagus", "Olive oil", "Lemon", "Garlic"], steps: ["Preheat oven 400°F", "Season salmon & asparagus", "Bake 14 min"], sub: "Swap salmon for trout or chicken thighs." },
  "Black Bean Tacos": { ingredients: ["Black beans (1 can)", "Tortillas", "Cheddar cheese", "Salsa", "Avocado"], steps: ["Warm beans with spices", "Fill tortillas", "Top with cheese & salsa"], sub: "Add grilled chicken for extra protein." },
  "Pasta Primavera": { ingredients: ["Penne pasta", "Zucchini", "Cherry tomatoes", "Parmesan", "Olive oil"], steps: ["Boil pasta 10 min", "Sauté veggies", "Toss together with parmesan"], sub: "Use gluten-free pasta if needed." },
};

const mealNames = Object.keys(recipes);

export default function App() {
  const [screen, setScreen] = useState("Fridge");
  const [fridge, setFridge] = useState([
    { id: 1, name: "Chicken breast", qty: "2 pcs" },
    { id: 2, name: "Rice", qty: "1 cup" },
    { id: 3, name: "Broccoli", qty: "1 head" },
    { id: 4, name: "Eggs", qty: "6" },
  ]);
  const [newItem, setNewItem] = useState("");
  const [plan, setPlan] = useState([
    { day: "Monday", meal: mealNames[0], cooked: false },
    { day: "Tuesday", meal: mealNames[1], cooked: false },
    { day: "Wednesday", meal: mealNames[2], cooked: false },
    { day: "Thursday", meal: mealNames[3], cooked: false },
    { day: "Friday", meal: mealNames[4], cooked: false },
    { day: "Saturday", meal: mealNames[0], cooked: false },
    { day: "Sunday", meal: mealNames[2], cooked: false },
  ]);
  const [selectedMeal, setSelectedMeal] = useState(mealNames[0]);
  const [shopping, setShopping] = useState([
    { name: "Salmon fillets", qty: "2", checked: false },
    { name: "Asparagus", qty: "1 bunch", checked: false },
    { name: "Tofu", qty: "1 block", checked: false },
    { name: "Cherry tomatoes", qty: "1 pint", checked: false },
  ]);
  const [prefs, setPrefs] = useState({ diet: "Vegetarian-friendly", household: 2, cookTime: "30 min or less" });

  const addFridgeItem = () => {
    if (!newItem.trim()) return;
    setFridge([...fridge, { id: Date.now(), name: newItem, qty: "1" }]);
    setNewItem("");
  };
  const removeFridgeItem = (id) => setFridge(fridge.filter((f) => f.id !== id));
  const swapMeal = (i) => {
    const next = [...plan];
    const idx = mealNames.indexOf(next[i].meal);
    next[i].meal = mealNames[(idx + 1) % mealNames.length];
    setPlan(next);
  };
  const toggleCooked = (i) => {
    const next = [...plan];
    next[i].cooked = !next[i].cooked;
    setPlan(next);
  };
  const toggleShop = (i) => {
    const next = [...shopping];
    next[i].checked = !next[i].checked;
    setShopping(next);
  };

  const tabs = ["Fridge", "Plan", "Recipe", "Shopping", "Settings"];

  return (
    <div style={styles.app}>
      <div style={styles.header}>🥬 FridgeWeek</div>
      <div style={styles.section}>
        {screen === "Fridge" && (
          <div>
            <h3>Fridge & Pantry Inventory</h3>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input style={styles.input} placeholder="Add item (e.g. Spinach)" value={newItem} onChange={(e) => setNewItem(e.target.value)} />
              <button style={styles.btn} onClick={addFridgeItem}>Add</button>
            </div>
            <button style={{ ...styles.btnOutline, marginBottom: 12 }} onClick={() => setFridge([...fridge, { id: Date.now(), name: "Bell Pepper (scanned)", qty: "3" }])}>📷 Scan Items</button>
            {fridge.map((item) => (
              <div key={item.id} style={{ ...styles.card, display: "flex", justifyContent: "space-between" }}>
                <span>{item.name} <span style={{ color: "#888" }}>({item.qty})</span></span>
                <button style={{ ...styles.btnOutline, padding: "2px 8px" }} onClick={() => removeFridgeItem(item.id)}>✕</button>
              </div>
            ))}
          </div>
        )}
        {screen === "Plan" && (
          <div>
            <h3>This Week's Meal Plan</h3>
            <p style={{ fontSize: 13, color: "#555" }}>2 items flagged — check Shopping List 🛒</p>
            {plan.map((p, i) => (
              <div key={p.day} style={styles.card}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                  <span>{p.day}</span>
                  <span>{p.cooked ? "✅ Cooked" : ""}</span>
                </div>
                <div onClick={() => { setSelectedMeal(p.meal); setScreen("Recipe"); }} style={{ color: colors.primary, cursor: "pointer", margin: "4px 0" }}>{p.meal}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={styles.btnOutline} onClick={() => swapMeal(i)}>🔄 Swap</button>
                  <button style={styles.btn} onClick={() => toggleCooked(i)}>{p.cooked ? "Undo" : "Mark Cooked"}</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {screen === "Recipe" && (
          <div>
            <h3>Recipe Detail</h3>
            <select style={styles.input} value={selectedMeal} onChange={(e) => setSelectedMeal(e.target.value)}>
              {mealNames.map((m) => <option key={m}>{m}</option>)}
            </select>
            <div style={{ ...styles.card, marginTop: 12 }}>
              <h4>{selectedMeal}</h4>
              <b>Ingredients</b>
              {recipes[selectedMeal].ingredients.map((i) => <div key={i} style={styles.chip}>{i}</div>)}
              <b style={{ display: "block", marginTop: 10 }}>Steps</b>
              <ol>{recipes[selectedMeal].steps.map((s, idx) => <li key={idx} style={{ marginBottom: 4 }}>{s}</li>)}</ol>
              <b>Substitution Tip</b>
              <p style={{ fontSize: 13, color: "#555" }}>{recipes[selectedMeal].sub}</p>
            </div>
          </div>
        )}
        {screen === "Shopping" && (
          <div>
            <h3>Shopping List</h3>
            <p style={{ fontSize: 13, color: "#555" }}>Consolidated from this week's plan</p>
            {shopping.map((s, i) => (
              <div key={s.name} style={{ ...styles.card, display: "flex", alignItems: "center", gap: 10 }}>
                <input type="checkbox" checked={s.checked} onChange={() => toggleShop(i)} />
                <span style={{ textDecoration: s.checked ? "line-through" : "none", flex: 1 }}>{s.name}</span>
                <span style={{ color: "#888" }}>{s.qty}</span>
              </div>
            ))}
          </div>
        )}
        {screen === "Settings" && (
          <div>
            <h3>Settings & Preferences</h3>
            <div style={styles.card}>
              <label>Dietary Restrictions</label>
              <select style={styles.input} value={prefs.diet} onChange={(e) => setPrefs({ ...prefs, diet: e.target.value })}>
                <option>None</option><option>Vegetarian-friendly</option><option>Gluten-free</option><option>Dairy-free</option>
              </select>
            </div>
            <div style={styles.card}>
              <label>Household Size</label>
              <input type="number" style={styles.input} value={prefs.household} onChange={(e) => setPrefs({ ...prefs, household: e.target.value })} />
            </div>
            <div style={styles.card}>
              <label>Cooking Time Preference</label>
              <select style={styles.input} value={prefs.cookTime} onChange={(e) => setPrefs({ ...prefs, cookTime: e.target.value })}>
                <option>15 min or less</option><option>30 min or less</option><option>No limit</option>
              </select>
            </div>
          </div>
        )}
      </div>
      <div style={styles.nav}>
        {tabs.map((t) => (
          <button key={t} style={styles.navBtn(screen === t)} onClick={() => setScreen(t)}>{t}</button>
        ))}
      </div>
    </div>
  );
}
