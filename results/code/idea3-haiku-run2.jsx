import React, { useState } from 'react';

export default function App() {
  const [screen, setScreen] = useState('feed');
  const [decisions, setDecisions] = useState([
    {
      id: 1,
      title: 'Migrate to microservices architecture',
      description: 'Move from monolithic to microservices',
      rationale: 'Improve scalability and deployment speed',
      alternatives: ['Keep monolith, optimize', 'Serverless approach'],
      stakeholders: ['Engineering', 'DevOps', 'Product'],
      tags: ['infrastructure', 'architecture'],
      owner: 'Alice Chen',
      date: '2024-01-15',
      updates: ['Phase 1 complete', 'Phase 2 in progress']
    },
    {
      id: 2,
      title: 'Adopt React for frontend',
      description: 'Switch from Vue to React',
      rationale: 'Larger community, better hiring pool',
      alternatives: ['Stay with Vue', 'Try Svelte'],
      stakeholders: ['Frontend Team', 'HR'],
      tags: ['technology', 'frontend'],
      owner: 'Bob Martinez',
      date: '2024-01-10',
      updates: []
    },
    {
      id: 3,
      title: 'Change pricing model to usage-based',
      description: 'Move from fixed to usage-based billing',
      rationale: 'Better align with customer value',
      alternatives: ['Keep fixed pricing', 'Hybrid model'],
      stakeholders: ['Finance', 'Sales', 'Product'],
      tags: ['business', 'pricing'],
      owner: 'Carol Singh',
      date: '2024-01-08',
      updates: ['Implementation complete']
    }
  ]);
  
  const [newDecision, setNewDecision] = useState({
    title: '',
    description: '',
    rationale: '',
    alternatives: '',
    stakeholders: '',
    tags: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');

  const colors = {
    primary: '#2563eb',
    bg: '#f8fafc',
    border: '#e2e8f0',
    text: '#1e293b',
    textLight: '#64748b',
    accent: '#0ea5e9'
  };

  const spacing = {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  };

  const handleNewDecision = () => {
    if (newDecision.title && newDecision.description) {
      const decision = {
        id: Math.max(...decisions.map(d => d.id), 0) + 1,
        ...newDecision,
        owner: 'You',
        alternatives: newDecision.alternatives.split(',').map(a => a.trim()),
        stakeholders: newDecision.stakeholders.split(',').map(s => s.trim()),
        tags: newDecision.tags.split(',').map(t => t.trim()),
        updates: []
      };
      setDecisions([decision, ...decisions]);
      setNewDecision({
        title: '',
        description: '',
        rationale: '',
        alternatives: '',
        stakeholders: '',
        tags: '',
        date: new Date().toISOString().split('T')[0]
      });
      setScreen('feed');
    }
  };

  const filteredDecisions = decisions.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !filterTag || d.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(decisions.flatMap(d => d.tags)));

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', backgroundColor: colors.bg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: `1px solid ${colors.border}`, padding: spacing.lg, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: colors.text }}>Decido</h1>
        <p style={{ margin: `${spacing.xs} 0 0 0`, fontSize: '14px', color: colors.textLight }}>Team decision log</p>
      </div>

      {/* Nav tabs */}
      <div style={{ display: 'flex', gap: spacing.md, padding: spacing.md, backgroundColor: 'white', borderBottom: `1px solid ${colors.border}`, overflowX: 'auto' }}>
        {['feed', 'new', 'search', 'settings'].map(tab => (
          <button
            key={tab}
            onClick={() => setScreen(tab)}
            style={{
              padding: `${spacing.sm} ${spacing.md}`,
              border: 'none',
              backgroundColor: screen === tab ? colors.primary : 'transparent',
              color: screen === tab ? 'white' : colors.textLight,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              borderRadius: '4px',
              transition: 'none'
            }}
          >
            {tab === 'feed' && 'Feed'}
            {tab === 'new' && 'New Decision'}
            {tab === 'search' && 'Search'}
            {tab === 'settings' && 'Settings'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: spacing.lg, maxWidth: '900px', margin: '0 auto' }}>
        {screen === 'feed' && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: colors.text, marginTop: 0 }}>Decision Feed</h2>
            {filteredDecisions.map(d => (
              <div
                key={d.id}
                onClick={() => { setSelectedDecision(d); setScreen('detail'); }}
                style={{
                  backgroundColor: 'white',
                  padding: spacing.md,
                  marginBottom: spacing.md,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: colors.text }}>{d.title}</h3>
                    <p style={{ margin: `${spacing.xs} 0`, fontSize: '14px', color: colors.textLight }}>{d.description}</p>
                    <div style={{ display: 'flex', gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap' }}>
                      {d.tags.map(tag => (
                        <span key={tag} style={{
                          backgroundColor: '#dbeafe',
                          color: colors.primary,
                          padding: `2px 8px`,
                          borderRadius: '3px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: colors.textLight }}>{d.owner}</p>
                    <p style={{ margin: `${spacing.xs} 0 0 0`, fontSize: '12px', color: colors.textLight }}>{d.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {screen === 'new' && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: colors.text, marginTop: 0 }}>Log a New Decision</h2>
            <div style={{ backgroundColor: 'white', padding: spacing.lg, borderRadius: '6px', border: `1px solid ${colors.border}` }}>
              {[
                { label: 'Decision Title', key: 'title' },
                { label: 'Description', key: 'description' },
                { label: 'Rationale', key: 'rationale' },
                { label: 'Alternatives (comma-separated)', key: 'alternatives' },
                { label: 'Stakeholders (comma-separated)', key: 'stakeholders' },
                { label: 'Tags (comma-separated)', key: 'tags' }
              ].map(field => (
                <div key={field.key} style={{ marginBottom: spacing.md }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.text, marginBottom: spacing.xs }}>
                    {field.label}
                  </label>
                  <input
                    type={field.key === 'date' ? 'date' : 'text'}
                    value={newDecision[field.key]}
                    onChange={e => setNewDecision({ ...newDecision, [field.key]: e.target.value })}
                    style={{
                      width: '100%',
                      padding: spacing.sm,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              ))}
              <div style={{ marginBottom: spacing.md }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.text, marginBottom: spacing.xs }}>
                  Decision Date
                </label>
                <input
                  type="date"
                  value={newDecision.date}
                  onChange={e => setNewDecision({ ...newDecision, date: e.target.value })}
                  style={{
                    width: '100%',
                    padding: spacing.sm,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <button
                onClick={handleNewDecision}
                style={{
                  backgroundColor: colors.primary,
                  color: 'white',
                  padding: `${spacing.sm} ${spacing.md}`,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Save Decision
              </button>
            </div>
          </div>
        )}

        {screen === 'search' && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: colors.text, marginTop: 0 }}>Search & Filter</h2>
            <div style={{ backgroundColor: 'white', padding: spacing.md, borderRadius: '6px', border: `1px solid ${colors.border}`, marginBottom: spacing.lg }}>
              <input
                type="text"
                placeholder="Search decisions..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: spacing.sm,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  marginBottom: spacing.md
                }}
              />
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.text, marginBottom: spacing.xs }}>
                Filter by Tag
              </label>
              <select
                value={filterTag}
                onChange={e => setFilterTag(e.target.value)}
                style={{
                  width: '100%',
                  padding: spacing.sm,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
            <div>
              {filteredDecisions.map(d => (
                <div
                  key={d.id}
                  onClick={() => { setSelectedDecision(d); setScreen('detail'); }}
                  style={{
                    backgroundColor: 'white',
                    padding: spacing.md,
                    marginBottom: spacing.md,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: colors.text }}>{d.title}</h3>
                  <p style={{ margin: `${spacing.xs} 0`, fontSize: '14px', color: colors.textLight }}>{d.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {screen === 'detail' && selectedDecision && (
          <div>
            <button
              onClick={() => setScreen('feed')}
              style={{
                backgroundColor: 'white',
                border: `1px solid ${colors.border}`,
                padding: `${spacing.xs} ${spacing.sm}`,
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                marginBottom: spacing.md
              }}
            >
              ← Back
            </button>
            <div style={{ backgroundColor: 'white', padding: spacing.lg, borderRadius: '6px', border: `1px solid ${colors.border}` }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: colors.text }}>{selectedDecision.title}</h2>
              <p style={{ margin: `${spacing.sm} 0`, fontSize: '14px', color: colors.textLight }}>
                By {selectedDecision.owner} on {selectedDecision.date}
              </p>
              
              <div style={{ marginTop: spacing.lg }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: colors.text, marginBottom: spacing.sm }}>Description</h3>
                <p style={{ margin: 0, fontSize: '14px', color: colors.text }}>{selectedDecision.description}</p>
              </div>

              <div style={{ marginTop: spacing.md }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: colors.text, marginBottom: spacing.sm }}>Rationale</h3>
                <p style={{ margin: 0, fontSize: '14px', color: colors.text }}>{selectedDecision.rationale}</p>
              </div>

              <div style={{ marginTop: spacing.md }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: colors.text, marginBottom: spacing.sm }}>Alternatives</h3>
                <ul style={{ margin: 0, paddingLeft: spacing.lg, fontSize: '14px', color: colors.text }}>
                  {selectedDecision.alternatives.map((alt, i) => (
                    <li key={i}>{alt}</li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: spacing.md }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: colors.text, marginBottom: spacing.sm }}>Stakeholders</h3>
                <p style={{ margin: 0, fontSize: '14px', color: colors.text }}>{selectedDecision.stakeholders.join(', ')}</p>
              </div>

              {selectedDecision.updates.length > 0 && (
                <div style={{ marginTop: spacing.md }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: colors.text, marginBottom: spacing.sm }}>Updates</h3>
                  <ul style={{ margin: 0, paddingLeft: spacing.lg, fontSize: '14px', color: colors.text }}>
                    {selectedDecision.updates.map((update, i) => (
                      <li key={i}>{update}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {screen === 'settings' && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: colors.text, marginTop: 0 }}>Team Settings</h2>
            <div style={{ backgroundColor: 'white', padding: spacing.lg, borderRadius: '6px', border: `1px solid ${colors.border}`, marginBottom: spacing.lg }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: colors.text, marginBottom: spacing.md }}>Team Members</h3>
              {['Alice Chen (Admin)', 'Bob Martinez (Member)', 'Carol Singh (Member)', 'David Lee (Member)'].map((member, i) => (
                <div key={i} style={{
                  padding: spacing.md,
                  borderBottom: i < 3 ? `1px solid ${colors.border}` : 'none',
                  fontSize: '14px',
                  color: colors.text
                }}>
                  {member}
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: 'white', padding: spacing.lg, borderRadius: '6px', border: `1px solid ${colors.border}` }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: colors.text, marginBottom: spacing.md }}>Available Tags</h3>
              <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
                {allTags.map(tag => (
                  <span key={tag} style={{
                    backgroundColor: '#dbeafe',
                    color: colors.primary,
                    padding: `${spacing.xs} ${spacing.sm}`,
                    borderRadius: '3px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
