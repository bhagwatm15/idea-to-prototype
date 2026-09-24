import React, { useState } from 'react';

const App = () => {
  const [screen, setScreen] = useState('feed');
  const [decisions, setDecisions] = useState([
    {
      id: 1,
      title: 'Migrate to cloud infrastructure',
      description: 'Move from on-premise servers to AWS',
      date: '2024-01-15',
      owner: 'Sarah Chen',
      tags: ['infrastructure', 'technical'],
      rationale: 'Cost reduction and scalability',
      alternatives: ['Google Cloud', 'Azure', 'Hybrid approach'],
      stakeholders: 'DevOps, Finance, Security',
      status: 'active',
    },
    {
      id: 2,
      title: 'Adopt agile sprint methodology',
      description: 'Transition from waterfall to 2-week sprints',
      date: '2024-01-10',
      owner: 'Marcus Thompson',
      tags: ['process', 'team'],
      rationale: 'Faster feedback cycles and team alignment',
      alternatives: ['Kanban', 'Scrumban'],
      stakeholders: 'Engineering, Product, Management',
      status: 'active',
    },
    {
      id: 3,
      title: 'Implement database sharding',
      description: 'Distribute database across multiple nodes',
      date: '2023-12-28',
      owner: 'David Kumar',
      tags: ['database', 'performance'],
      rationale: 'Improve query performance for 10M+ users',
      alternatives: ['Read replicas only', 'NoSQL migration'],
      stakeholders: 'Backend team, Analytics',
      status: 'active',
    },
  ]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rationale: '',
    alternatives: '',
    stakeholders: '',
    tags: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');

  const colors = {
    primary: '#0f766e',
    secondary: '#f3f4f6',
    border: '#e5e7eb',
    text: '#1f2937',
    textLight: '#6b7280',
    white: '#ffffff',
  };

  const baseStyles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      color: colors.text,
    },
    header: {
      marginBottom: '32px',
      borderBottom: `1px solid ${colors.border}`,
      paddingBottom: '16px',
    },
    title: {
      fontSize: '28px',
      fontWeight: '600',
      margin: '0 0 8px 0',
      color: colors.primary,
    },
    subtitle: {
      fontSize: '14px',
      color: colors.textLight,
      margin: '0',
    },
    nav: {
      display: 'flex',
      gap: '12px',
      marginBottom: '24px',
      borderBottom: `1px solid ${colors.border}`,
      paddingBottom: '12px',
    },
    navBtn: {
      padding: '8px 16px',
      border: 'none',
      background: 'none',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      color: colors.textLight,
      borderBottom: '2px solid transparent',
    },
    navBtnActive: {
      color: colors.primary,
      borderBottomColor: colors.primary,
    },
    button: {
      padding: '10px 16px',
      background: colors.primary,
      color: colors.white,
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
    },
    input: {
      padding: '8px 12px',
      border: `1px solid ${colors.border}`,
      borderRadius: '4px',
      fontSize: '14px',
      fontFamily: 'inherit',
    },
    card: {
      background: colors.white,
      border: `1px solid ${colors.border}`,
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      cursor: 'pointer',
    },
    form: {
      display: 'grid',
      gap: '16px',
      maxWidth: '600px',
    },
    label: {
      fontSize: '13px',
      fontWeight: '600',
      color: colors.text,
      marginBottom: '4px',
      display: 'block',
    },
    filterBar: {
      display: 'flex',
      gap: '12px',
      marginBottom: '24px',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
  };

  const handleAddDecision = () => {
    if (formData.title.trim()) {
      const newDecision = {
        id: Math.max(...decisions.map(d => d.id), 0) + 1,
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        owner: 'Current User',
        status: 'active',
      };
      setDecisions([newDecision, ...decisions]);
      setFormData({
        title: '',
        description: '',
        rationale: '',
        alternatives: '',
        stakeholders: '',
        tags: '',
        date: new Date().toISOString().split('T')[0],
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

  const allTags = [...new Set(decisions.flatMap(d => d.tags))];

  const renderFeed = () => (
    <div>
      <div style={baseStyles.header}>
        <h1 style={baseStyles.title}>Decision Log</h1>
        <p style={baseStyles.subtitle}>Searchable record of team decisions and rationale</p>
      </div>
      <div style={baseStyles.filterBar}>
        <input
          type="text"
          placeholder="Search decisions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ ...baseStyles.input, flex: 1, minWidth: '200px' }}
        />
        <select
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          style={baseStyles.input}
        >
          <option value="">All tags</option>
          {allTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
        <button style={baseStyles.button} onClick={() => setScreen('new')}>+ New Decision</button>
      </div>
      <div>
        {filteredDecisions.map(d => (
          <div
            key={d.id}
            style={baseStyles.card}
            onClick={() => {
              setSelectedDecision(d);
              setScreen('detail');
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>{d.title}</h3>
              <div style={{ fontSize: '12px', color: colors.textLight }}>{d.date}</div>
            </div>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: colors.textLight }}>{d.description}</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {d.tags.map(tag => (
                <span
                  key={tag}
                  style={{
                    fontSize: '12px',
                    background: colors.secondary,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    color: colors.primary,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <div style={{ fontSize: '12px', color: colors.textLight, marginTop: '8px' }}>by {d.owner}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNewDecision = () => (
    <div>
      <div style={baseStyles.header}>
        <h1 style={baseStyles.title}>Log New Decision</h1>
      </div>
      <div style={baseStyles.form}>
        <div>
          <label style={baseStyles.label}>Decision Title</label>
          <input
            type="text"
            placeholder="e.g., Migrate to microservices architecture"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            style={{ ...baseStyles.input, width: '100%', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={baseStyles.label}>Description</label>
          <input
            type="text"
            placeholder="Brief context of the decision"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            style={{ ...baseStyles.input, width: '100%', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={baseStyles.label}>Rationale</label>
          <input
            type="text"
            placeholder="Why this decision was made"
            value={formData.rationale}
            onChange={(e) => setFormData({ ...formData, rationale: e.target.value })}
            style={{ ...baseStyles.input, width: '100%', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={baseStyles.label}>Alternatives Considered</label>
          <input
            type="text"
            placeholder="Comma-separated list"
            value={formData.alternatives}
            onChange={(e) => setFormData({ ...formData, alternatives: e.target.value })}
            style={{ ...baseStyles.input, width: '100%', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={baseStyles.label}>Key Stakeholders</label>
          <input
            type="text"
            placeholder="Teams or people involved"
            value={formData.stakeholders}
            onChange={(e) => setFormData({ ...formData, stakeholders: e.target.value })}
            style={{ ...baseStyles.input, width: '100%', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={baseStyles.label}>Tags</label>
          <input
            type="text"
            placeholder="Comma-separated, e.g., infrastructure, technical"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            style={{ ...baseStyles.input, width: '100%', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={baseStyles.label}>Decision Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            style={{ ...baseStyles.input, width: '100%', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={baseStyles.button} onClick={handleAddDecision}>Save Decision</button>
          <button
            style={{ ...baseStyles.button, background: colors.textLight }}
            onClick={() => setScreen('feed')}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const renderDetail = () => selectedDecision && (
    <div>
      <div style={baseStyles.header}>
        <h1 style={baseStyles.title}>{selectedDecision.title}</h1>
        <p style={baseStyles.subtitle}>{selectedDecision.date} • {selectedDecision.owner}</p>
      </div>
      <div style={{ maxWidth: '600px' }}>
        <div style={{ ...baseStyles.card, cursor: 'auto' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: colors.primary }}>Description</h3>
          <p style={{ margin: '0 0 16px 0', color: colors.textLight }}>{selectedDecision.description}</p>

          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: colors.primary }}>Rationale</h3>
          <p style={{ margin: '0 0 16px 0', color: colors.textLight }}>{selectedDecision.rationale}</p>

          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: colors.primary }}>Alternatives Considered</h3>
          <p style={{ margin: '0 0 16px 0', color: colors.textLight }}>{selectedDecision.alternatives.join(', ')}</p>

          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: colors.primary }}>Stakeholders</h3>
          <p style={{ margin: '0 0 16px 0', color: colors.textLight }}>{selectedDecision.stakeholders}</p>

          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: colors.primary }}>Tags</h3>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {selectedDecision.tags.map(tag => (
              <span
                key={tag}
                style={{
                  fontSize: '12px',
                  background: colors.secondary,
                  padding: '4px 8px',
                  borderRadius: '4px',
                  color: colors.primary,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <button
          style={{ ...baseStyles.button, marginTop: '16px' }}
          onClick={() => setScreen('feed')}
        >
          Back to Feed
        </button>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div>
      <div style={baseStyles.header}>
        <h1 style={baseStyles.title}>Team Settings</h1>
      </div>
      <div style={{ maxWidth: '600px' }}>
        <div style={baseStyles.card}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>Team Members</h3>
          {['Sarah Chen', 'Marcus Thompson', 'David Kumar', 'Emma Rodriguez'].map(name => (
            <div key={name} style={{ padding: '8px 0', borderBottom: `1px solid ${colors.border}`, fontSize: '14px' }}>
              {name}
            </div>
          ))}
        </div>
        <div style={{ ...baseStyles.card, marginTop: '16px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>Available Tags</h3>
          {allTags.map(tag => (
            <div key={tag} style={{ padding: '8px 0', borderBottom: `1px solid ${colors.border}`, fontSize: '14px' }}>
              {tag}
            </div>
          ))}
        </div>
        <button
          style={{ ...baseStyles.button, marginTop: '24px' }}
          onClick={() => setScreen('feed')}
        >
          Back
        </button>
      </div>
    </div>
  );

  return (
    <div style={baseStyles.container}>
      <div style={baseStyles.nav}>
        {['feed', 'new', 'detail', 'settings'].map(screenName => (
          <button
            key={screenName}
            style={{
              ...baseStyles.navBtn,
              ...(screen === screenName ? baseStyles.navBtnActive : {}),
            }}
            onClick={() => {
              if (screenName === 'detail' && !selectedDecision) return;
              setScreen(screenName);
            }}
          >
            {screenName === 'feed' && 'Feed'}
            {screenName === 'new' && 'New Decision'}
            {screenName === 'detail' && 'Details'}
            {screenName === 'settings' && 'Settings'}
          </button>
        ))}
      </div>

      {screen === 'feed' && renderFeed()}
      {screen === 'new' && renderNewDecision()}
      {screen === 'detail' && renderDetail()}
      {screen === 'settings' && renderSettings()}
    </div>
  );
};

export default App;
