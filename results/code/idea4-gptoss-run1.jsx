import React, { useState } from 'react';

const App = () => {
  const colors = { primary: '#2E7D32', secondary: '#A5D6A7', bg: '#F1FAF0', text: '#333' };
  const spacing = { xs: 4, s: 8, m: 16, l: 24 };
  const btnStyle = {
    backgroundColor: colors.secondary,
    border: 'none',
    borderRadius: 4,
    padding: `${spacing.xs}px ${spacing.s}px`,
    margin: `${spacing.xs}px`,
    cursor: 'pointer'
  };
  const navStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    backgroundColor: colors.primary,
    color: '#fff',
    padding: spacing.s
  };
  const container = { padding: spacing.m, backgroundColor: colors.bg, minHeight: '100vh', fontFamily: 'Arial, sans-serif', color: colors.text };
  const screens = ['inventory', 'plan', 'recipe', 'shopping', 'settings'];
  const [screen, setScreen] = useState('inventory');
  const [selectedMeal, setSelectedMeal] = useState(null);

  const inventory = [
    { name: 'Eggs', qty: 12, unit: 'pcs' },
    { name: 'Spinach', qty: 200, unit: 'g' },
    { name: 'Cheddar', qty: 150, unit: 'g' }
  ];
  const plan = [
    { day: 'Mon', meal: 'Spinach & Cheddar Omelette' },
    { day: 'Tue', meal: 'Chicken Caesar Salad' },
    { day: 'Wed', meal: 'Veggie Stir‑Fry' },
    { day: 'Thu', meal: 'Pasta Primavera' },
    { day: 'Fri', meal: 'Grilled Salmon' },
    { day: 'Sat', meal: 'Taco Night' },
    { day: 'Sun', meal: 'Roast Beef & Potatoes' }
  ];
  const recipe = {
    title: 'Spinach & Cheddar Omelette',
    ingredients: ['2 Eggs', '30g Spinach', '20g Cheddar', '1 tbsp Olive Oil'],
    steps: ['Whisk eggs', 'Sauté spinach', 'Add eggs and cheese', 'Fold and serve']
  };
  const shopping = [
    { name: 'Chicken Breast', qty: 2, unit: 'pcs' },
    { name: 'Lettuce', qty: 1, unit: 'head' },
    { name: 'Taco Shells', qty: 8, unit: 'pcs' }
  ];
  const preferences = { diet: 'None', household: 2, cuisine: 'Mixed' };

  const renderNav = (
    <div style={navStyle}>
      {screens.map(s => (
        <button
          key={s}
          style={{ ...btnStyle, opacity: screen === s ? 0.7 : 1 }}
          onClick={() => setScreen(s)}
        >
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </button>
      ))}
    </div>
  );

  let content;
  if (screen === 'inventory') {
    content = (
      <div>
        <h2 style={{ marginBottom: spacing.m }}>Fridge & Pantry</h2>
        {inventory.map((item, i) => (
          <div key={i} style={{ marginBottom: spacing.xs }}>
            {item.name}: {item.qty}{item.unit}
          </div>
        ))}
        <button style={btnStyle}>+ Add Item</button>
      </div>
    );
  } else if (screen === 'plan') {
    content = (
      <div>
        <h2 style={{ marginBottom: spacing.m }}>7‑Day Meal Plan</h2>
        {plan.map((p, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing.xs }}>
            <span>{p.day}</span>
            <span>{p.meal}</span>
            <button
              style={btnStyle}
              onClick={() => {
                setSelectedMeal(p.meal);
                setScreen('recipe');
              }}
            >
              View
            </button>
          </div>
        ))}
        <button style={btnStyle}>Swap a Meal</button>
      </div>
    );
  } else if (screen === 'recipe') {
    content = (
      <div>
        <h2 style={{ marginBottom: spacing.m }}>{recipe.title}</h2>
        <h4>Ingredients</h4>
        <ul>
          {recipe.ingredients.map((ing, i) => (
            <li key={i}>{ing}</li>
          ))}
        </ul>
        <h4>Steps</h4>
        <ol>
          {recipe.steps.map((st, i) => (
            <li key={i}>{st}</li>
          ))}
        </ol>
        <button style={btnStyle} onClick={() => setScreen('plan')}>Back to Plan</button>
      </div>
    );
  } else if (screen === 'shopping') {
    content = (
      <div>
        <h2 style={{ marginBottom: spacing.m }}>Shopping List</h2>
        {shopping.map((s, i) => (
          <div key={i} style={{ marginBottom: spacing.xs }}>
            {s.name}: {s.qty}{s.unit}
          </div>
        ))}
        <button style={btnStyle}>Mark All Bought</button>
      </div>
    );
  } else if (screen === 'settings') {
    content = (
      <div>
        <h2 style={{ marginBottom: spacing.m }}>Preferences</h2>
        <div style={{ marginBottom: spacing.xs }}>Dietary: {preferences.diet}</div>
        <div style={{ marginBottom: spacing.xs }}>Household size: {preferences.household}</div>
        <div style={{ marginBottom: spacing.xs }}>Cuisine style: {preferences.cuisine}</div>
        <button style={btnStyle}>Edit Preferences</button>
      </div>
    );
  }

  return (
    <div style={container}>
      {renderNav}
      <div style={{ marginTop: spacing.l }}>{content}</div>
    </div>
  );
};

export default App;
