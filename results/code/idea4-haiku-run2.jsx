import React, { useState } from 'react';

export default function App() {
  const [screen, setScreen] = useState('inventory');
  const [fridge, setFridge] = useState([
    { id: 1, name: 'Chicken Breast', expiry: '2025-02-05' },
    { id: 2, name: 'Broccoli', expiry: '2025-02-03' },
    { id: 3, name: 'Pasta', expiry: '2025-06-01' },
    { id: 4, name: 'Olive Oil', expiry: '2025-08-15' },
  ]);
  const [newItem, setNewItem] = useState('');
  const [mealPlan, setMealPlan] = useState([
    { day: 'Monday', meal: 'Grilled Chicken & Broccoli', completed: false },
    { day: 'Tuesday', meal: 'Pasta Carbonara', completed: false },
    { day: 'Wednesday', meal: 'Chicken Stir-Fry', completed: false },
    { day: 'Thursday', meal: 'Baked Salmon with Asparagus', completed: false },
    { day: 'Friday', meal: 'Vegetable Fried Rice', completed: false },
    { day: 'Saturday', meal: 'Beef Tacos', completed: false },
    { day: 'Sunday', meal: 'Roast Chicken & Potatoes', completed: false },
  ]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [dietary, setDietary] = useState('');
  const [household, setHousehold] = useState('2');

  const colors = {
    primary: '#10B981',
    secondary: '#F3F4F6',
    text: '#1F2937',
    light: '#FFFFFF',
    border: '#E5E7EB',
  };

  const sharedButton = {
    padding: '10px 16px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  };

  const recipes = {
    'Grilled Chicken & Broccoli': {
      ingredients: ['Chicken Breast (300g)', 'Broccoli (200g)', 'Garlic (3 cloves)', 'Olive Oil (2 tbsp)', 'Salt & Pepper'],
      steps: ['Season chicken and broccoli', 'Heat oil in pan', 'Grill chicken 6-7 min each side', 'Add broccoli last 4 minutes', 'Serve hot'],
    },
    'Pasta Carbonara': {
      ingredients: ['Pasta (400g)', 'Eggs (3)', 'Bacon (150g)', 'Parmesan (100g)', 'Black Pepper'],
      steps: ['Cook pasta until al dente', 'Fry bacon until crispy', 'Mix eggs with grated cheese', 'Toss hot pasta with bacon', 'Add egg mixture off heat, stir quickly'],
    },
    'Chicken Stir-Fry': {
      ingredients: ['Chicken Breast (300g)', 'Mixed Vegetables (400g)', 'Soy Sauce (3 tbsp)', 'Ginger (1 tbsp)', 'Garlic (2 cloves)'],
      steps: ['Cube chicken and vegetables', 'Heat oil in wok', 'Stir-fry chicken until cooked', 'Add vegetables and sauce', 'Serve over rice'],
    },
  };

  const shoppingList = [
    { item: 'Salmon Fillet', qty: '500g' },
    { item: 'Asparagus', qty: '300g' },
    { item: 'Beef Mince', qty: '500g' },
    { item: 'Taco Shells', qty: '12 shells' },
    { item: 'Potatoes', qty: '1kg' },
  ];

  const handleAddItem = () => {
    if (newItem.trim()) {
      setFridge([...fridge, { id: Date.now(), name: newItem, expiry: '2025-02-20' }]);
      setNewItem('');
    }
  };

  const handleRemoveItem = (id) => {
    setFridge(fridge.filter(item => item.id !== id));
  };

  const toggleMeal = (index) => {
    const updated = [...mealPlan];
    updated[index].completed = !updated[index].completed;
    setMealPlan(updated);
  };

  const navStyle = {
    display: 'flex',
    gap: '8px',
    borderBottom: `2px solid ${colors.border}`,
    marginBottom: '24px',
    padding: '0 0 8px 0',
  };

  const navButtonStyle = (active) => ({
    ...sharedButton,
    padding: '12px 16px',
    background: active ? colors.primary : 'transparent',
    color: active ? colors.light : colors.text,
    fontSize: '13px',
  });

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px', fontFamily: 'system-ui, -apple-system, sans-serif', background: colors.light, minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: colors.primary, fontSize: '28px', margin: '0 0 8px 0', fontWeight: '700' }}>FridgeWeek</h1>
        <p style={{ color: '#6B7280', margin: '0', fontSize: '14px' }}>Fresh meals from what you have</p>
      </div>

      <div style={navStyle}>
        {['inventory', 'plan', 'shopping', 'settings'].map(tab => (
          <button key={tab} onClick={() => { setScreen(tab); setSelectedRecipe(null); }} style={navButtonStyle(screen === tab)}>
            {tab === 'inventory' && '🧊 Inventory'}
            {tab === 'plan' && '📅 Plan'}
            {tab === 'shopping' && '🛒 Shopping'}
            {tab === 'settings' && '⚙️ Settings'}
          </button>
        ))}
      </div>

      {screen === 'inventory' && (
        <div>
          <h2 style={{ color: colors.text, fontSize: '18px', marginBottom: '16px' }}>Your Fridge & Pantry</h2>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Add item..." style={{ flex: 1, padding: '10px', border: `1px solid ${colors.border}`, borderRadius: '6px', fontSize: '14px' }} />
            <button onClick={handleAddItem} style={{ ...sharedButton, background: colors.primary, color: colors.light }}>Add</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {fridge.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: colors.secondary, borderRadius: '6px', fontSize: '14px' }}>
                <div>
                  <div style={{ fontWeight: '600', color: colors.text }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Expires {item.expiry}</div>
                </div>
                <button onClick={() => handleRemoveItem(item.id)} style={{ ...sharedButton, background: '#EF4444', color: colors.light, padding: '6px 12px', fontSize: '12px' }}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {screen === 'plan' && !selectedRecipe && (
        <div>
          <h2 style={{ color: colors.text, fontSize: '18px', marginBottom: '16px' }}>7-Day Meal Plan</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {mealPlan.map((day, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: colors.secondary, borderRadius: '6px', cursor: 'pointer' }} onClick={() => setSelectedRecipe(day.meal)}>
                <input type="checkbox" checked={day.completed} onChange={() => toggleMeal(i)} style={{ cursor: 'pointer', width: '18px', height: '18px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: colors.text, textDecoration: day.completed ? 'line-through' : 'none' }}>{day.day}</div>
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>{day.meal}</div>
                </div>
                <span style={{ fontSize: '18px' }}>→</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {screen === 'plan' && selectedRecipe && (
        <div>
          <button onClick={() => setSelectedRecipe(null)} style={{ ...sharedButton, background: colors.secondary, color: colors.text, marginBottom: '16px' }}>← Back</button>
          <h2 style={{ color: colors.text, fontSize: '18px', marginBottom: '16px' }}>{selectedRecipe}</h2>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: colors.text, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Ingredients:</h3>
            <ul style={{ margin: '0', paddingLeft: '20px', color: '#6B7280', fontSize: '13px' }}>
              {recipes[selectedRecipe]?.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
            </ul>
          </div>
          <div>
            <h3 style={{ color: colors.text, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Instructions:</h3>
            <ol style={{ margin: '0', paddingLeft: '20px', color: '#6B7280', fontSize: '13px' }}>
              {recipes[selectedRecipe]?.steps.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </div>
        </div>
      )}

      {screen === 'shopping' && (
        <div>
          <h2 style={{ color: colors.text, fontSize: '18px', marginBottom: '16px' }}>Shopping List</h2>
          <p style={{ color: '#6B7280', fontSize: '13px', marginBottom: '16px' }}>Items to buy for this week's meals:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {shoppingList.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: colors.secondary, borderRadius: '6px' }}>
                <input type="checkbox" style={{ cursor: 'pointer', width: '18px', height: '18px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: colors.text }}>{item.item}</div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{item.qty}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {screen === 'settings' && (
        <div>
          <h2 style={{ color: colors.text, fontSize: '18px', marginBottom: '16px' }}>Preferences</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', color: colors.text, marginBottom: '6px', fontSize: '14px' }}>Dietary Restrictions</label>
              <select value={dietary} onChange={(e) => setDietary(e.target.value)} style={{ width: '100%', padding: '10px', border: `1px solid ${colors.border}`, borderRadius: '6px', fontSize: '14px' }}>
                <option value="">None</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="glutenfree">Gluten-free</option>
                <option value="dairyfree">Dairy-free</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', color: colors.text, marginBottom: '6px', fontSize: '14px' }}>Household Size</label>
              <select value={household} onChange={(e) => setHousehold(e.target.value)} style={{ width: '100%', padding: '10px', border: `1px solid ${colors.border}`, borderRadius: '6px', fontSize: '14px' }}>
                <option value="1">1 Person</option>
                <option value="2">2 People</option>
                <option value="4">4 People</option>
                <option value="6">6+ People</option>
              </select>
            </div>
            <button style={{ ...sharedButton, background: colors.primary, color: colors.light }}>Save Preferences</button>
          </div>
        </div>
      )}
    </div>
  );
}
