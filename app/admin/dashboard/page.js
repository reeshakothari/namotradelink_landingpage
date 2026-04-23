'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { getSiteContent, setSiteContent } from '@/lib/siteContent';
import { LayoutDashboard, Users, UserCheck, Building2, Package, Palette, Pencil, ExternalLink, AlertTriangle, Layers } from 'lucide-react';

/* ─── localStorage helpers ─── */
const LEADS_KEY = 'ntl_leads';
const CUSTOMERS_KEY = 'ntl_customers';
const stored = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch { return fallback; }
};

/* ─── Shared mini components ─── */
const Badge = ({ text, color }) => {
  const colors = { new: '#3b82f6', contacted: '#f59e0b', converted: '#22c55e', closed: '#6b7280', inbound: '#8b5cf6', outbound: '#e87722' };
  const c = colors[color] || '#6b7280';
  return <span style={{ background: c + '22', color: c, border: `1px solid ${c}44`, borderRadius: 99, padding: '2px 10px', fontSize: 11, fontWeight: 600, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{text}</span>;
};

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16, backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div style={{ background: '#141e2e', borderRadius: 18, padding: '26px 30px', minWidth: 360, maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', border: '1px solid #1e2d42' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#e2e8f0' }}>{title}</h3>
          <button onClick={onClose} style={{ background: '#1e2d42', border: 'none', borderRadius: 8, width: 32, height: 32, fontSize: 18, cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const inputBase = { width: '100%', padding: '9px 12px', border: '1.5px solid #1e2d42', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.15s', color: '#e2e8f0', background: '#0e1a2b' };
const FInput = ({ label, value, onChange, type = 'text', placeholder, required, multiline, rows = 3 }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>}
    {multiline
      ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} required={required}
          style={{ ...inputBase, resize: 'vertical' }}
          onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#1e2d42'} />
      : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
          style={inputBase}
          onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#1e2d42'} />
    }
  </div>
);

const FSelect = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>}
    <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inputBase, cursor: 'pointer' }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

/* ─── Overview Tab ─── */
function OverviewTab({ leads, customers }) {
  const inbound = leads.filter(l => l.type === 'inbound');
  const outbound = leads.filter(l => l.type === 'outbound');
  const pending = leads.filter(l => l.status === 'new' || l.status === 'contacted');
  const converted = leads.filter(l => l.status === 'converted');

  const stats = [
    { label: 'Total Leads', value: leads.length, icon: '◈', color: '#3b82f6', bg: 'linear-gradient(135deg, rgba(59,130,246,0.14) 0%, rgba(59,130,246,0.07) 100%)', sub: `${inbound.length} inbound · ${outbound.length} outbound` },
    { label: 'Customers', value: customers.length, icon: '◉', color: '#22c55e', bg: 'linear-gradient(135deg, rgba(34,197,94,0.14) 0%, rgba(34,197,94,0.07) 100%)', sub: 'Active accounts' },
    { label: 'Pending Follow-up', value: pending.length, icon: '⏳', color: '#f59e0b', bg: 'linear-gradient(135deg, rgba(245,158,11,0.14) 0%, rgba(245,158,11,0.07) 100%)', sub: 'Need attention' },
    { label: 'Converted', value: converted.length, icon: '✓', color: '#8b5cf6', bg: 'linear-gradient(135deg, rgba(139,92,246,0.14) 0%, rgba(139,92,246,0.07) 100%)', sub: 'Closed deals' },
  ];

  const stageData = [
    { label: 'New', count: leads.filter(l => l.status === 'new').length, color: '#3b82f6' },
    { label: 'Contacted', count: leads.filter(l => l.status === 'contacted').length, color: '#f59e0b' },
    { label: 'Converted', count: leads.filter(l => l.status === 'converted').length, color: '#22c55e' },
    { label: 'Closed', count: leads.filter(l => l.status === 'closed').length, color: '#94a3b8' },
  ];
  const maxStage = Math.max(...stageData.map(s => s.count), 1);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Overview</h1>
        <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 13 }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 16, padding: '20px 22px', border: `1px solid ${s.color}25` }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${s.color}50`, marginBottom: 14 }}>
              <span style={{ color: '#fff', fontSize: 15 }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: 34, fontWeight: 800, color: '#f1f5f9', lineHeight: 1, letterSpacing: '-0.02em' }}>{s.value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1', marginTop: 5 }}>{s.label}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: leads.length > 0 ? '1fr 300px' : '1fr', gap: 16, alignItems: 'start' }}>
        {leads.length > 0 ? (
          <div style={{ background: '#141e2e', borderRadius: 16, border: '1px solid #1e2d42', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #1e2d42' }}>
              <h3 style={{ margin: 0, color: '#e2e8f0', fontSize: 15, fontWeight: 700 }}>Recent Leads</h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#0d1726' }}>
                {['Name', 'Phone', 'Type', 'Status', 'Date'].map(h => <th key={h} style={{ textAlign: 'left', padding: '9px 16px', fontSize: 11, color: '#4a5a6b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {leads.slice().reverse().slice(0, 6).map(l => (
                  <tr key={l.id} style={{ borderTop: '1px solid #1a2538' }}>
                    <td style={{ padding: '11px 16px', fontWeight: 600, color: '#e2e8f0', fontSize: 14 }}>{l.name}</td>
                    <td style={{ padding: '11px 16px', color: '#94a3b8', fontSize: 13 }}>{l.phone}</td>
                    <td style={{ padding: '11px 16px' }}><Badge text={l.type} color={l.type} /></td>
                    <td style={{ padding: '11px 16px' }}>{(() => { const s = STATUS_STYLE[l.status] || STATUS_STYLE.new; return <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 99, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{s.label}</span>; })()}</td>
                    <td style={{ padding: '11px 16px', color: '#64748b', fontSize: 12 }}>{l.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ background: '#141e2e', borderRadius: 16, padding: 48, textAlign: 'center', border: '1px solid #1e2d42' }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: '#1e2d42', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 24 }}>◈</div>
            <h3 style={{ color: '#e2e8f0', margin: '0 0 6px', fontSize: 16 }}>No leads yet</h3>
            <p style={{ color: '#64748b', margin: 0, fontSize: 13 }}>Go to the Leads tab to add your first lead.</p>
          </div>
        )}

        {leads.length > 0 && (
          <div style={{ background: '#141e2e', borderRadius: 16, padding: '20px 22px', border: '1px solid #1e2d42' }}>
            <h3 style={{ margin: '0 0 18px', color: '#e2e8f0', fontSize: 15, fontWeight: 700 }}>Lead Pipeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {stageData.map(s => (
                <div key={s.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{s.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.count}</span>
                  </div>
                  <div style={{ height: 7, background: '#1e2d42', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(s.count / maxStage) * 100}%`, background: s.color, borderRadius: 99, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #1e2d42', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Conversion rate</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#22c55e' }}>{leads.length > 0 ? Math.round((converted.length / leads.length) * 100) : 0}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Status colour config ─── */
const STATUS_STYLE = {
  new:       { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', label: 'New' },
  contacted: { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'Contacted' },
  converted: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Converted' },
  closed:    { bg: '#f8fafc', color: '#64748b', border: '#cbd5e1', label: 'Closed' },
};

const StatusSelect = ({ value, onChange }) => {
  const s = STATUS_STYLE[value] || STATUS_STYLE.new;
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          background: s.bg, color: s.color, border: `1.5px solid ${s.border}`,
          borderRadius: 99, padding: '4px 24px 4px 10px', fontSize: 12, fontWeight: 700,
          cursor: 'pointer', outline: 'none', appearance: 'none', WebkitAppearance: 'none',
        }}
      >
        {Object.entries(STATUS_STYLE).map(([val, { label }]) => (
          <option key={val} value={val}>{label}</option>
        ))}
      </select>
      <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 10, color: s.color }}>▾</span>
    </div>
  );
};

/* ─── Leads Tab ─── */
function LeadsTab({ leads, saveLeads }) {
  const [subTab, setSubTab] = useState('inbound');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', company: '', requirement: '', notes: '', status: 'new', type: 'inbound' });
  const [editId, setEditId] = useState(null);
  const [sortBy, setSortBy] = useState('date_desc');
  const filtered = leads.filter(l => l.type === subTab);
  const ORDER = ['new', 'contacted', 'converted', 'closed'];
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name_asc')  return (a.name || '').localeCompare(b.name || '');
    if (sortBy === 'name_desc') return (b.name || '').localeCompare(a.name || '');
    if (sortBy === 'status')    return ORDER.indexOf(a.status) - ORDER.indexOf(b.status);
    if (sortBy === 'date_asc')  return (a.created_at || a.date || '').localeCompare(b.created_at || b.date || '');
    // date_desc (default)
    return (b.created_at || b.date || '').localeCompare(a.created_at || a.date || '');
  });
  const f = k => v => setForm(p => ({ ...p, [k]: v }));
  const submit = async e => {
    e.preventDefault();
    if (editId) {
      await fetch('/api/leads', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editId, ...form }) });
      saveLeads(leads.map(l => l.id === editId ? { ...l, ...form } : l));
    } else {
      const res = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, date: new Date().toLocaleDateString('en-IN') }) });
      const newLead = await res.json();
      saveLeads([...leads, newLead]);
    }
    setShowModal(false); setEditId(null);
    setForm({ name: '', phone: '', company: '', requirement: '', notes: '', status: 'new', type: subTab });
  };
  const openAdd = () => { setForm({ name: '', phone: '', company: '', requirement: '', notes: '', status: 'new', type: subTab }); setEditId(null); setShowModal(true); };
  const openEdit = l => { setForm({ name: l.name, phone: l.phone, company: l.company || '', requirement: l.requirement || '', notes: l.notes || '', status: l.status, type: l.type }); setEditId(l.id); setShowModal(true); };
  const del = async id => {
    if (window.confirm('Delete this lead?')) {
      await fetch(`/api/leads?id=${id}`, { method: 'DELETE' });
      saveLeads(leads.filter(l => l.id !== id));
    }
  };
  const updateStatus = async (id, status) => {
    await fetch('/api/leads', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    saveLeads(leads.map(l => l.id === id ? { ...l, status } : l));
  };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Lead Management</h1>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 13 }}>Track and manage all your inbound and outbound leads</p>
        </div>
        <button onClick={openAdd} style={{ background: '#e87722', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 8px rgba(232,119,34,0.3)' }}>+ Add Lead</button>
      </div>
      <div style={{ display: 'flex', gap: 2, background: '#f1f5f9', borderRadius: 10, padding: 4, marginBottom: 24, width: 'fit-content' }}>
        {[{ id: 'inbound', label: '↙ Inbound' }, { id: 'outbound', label: '↗ Outbound' }].map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, background: subTab === t.id ? '#fff' : 'transparent', color: subTab === t.id ? '#1a2a4a' : '#64748b', boxShadow: subTab === t.id ? '0 1px 4px rgba(0,0,0,0.12)' : 'none' }}>
            {t.label} ({leads.filter(l => l.type === t.id).length})
          </button>
        ))}
      </div>
      <p style={{ color: '#64748b', fontSize: 13, marginBottom: 12, marginTop: -12 }}>{subTab === 'inbound' ? 'Leads coming in from your contact form, referrals, or inquiries.' : 'Prospects you are actively reaching out to.'}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sort:</span>
        {[
          { value: 'date_desc', label: 'Newest' },
          { value: 'date_asc',  label: 'Oldest' },
          { value: 'status',    label: 'Status' },
          { value: 'name_asc',  label: 'Name A–Z' },
        ].map(opt => (
          <button key={opt.value} onClick={() => setSortBy(opt.value)} style={{
            padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: sortBy === opt.value ? '#1a2a4a' : '#fff',
            color:      sortBy === opt.value ? '#fff'    : '#64748b',
            border:     `1px solid ${sortBy === opt.value ? '#1a2a4a' : '#e2e8f0'}`,
          }}>{opt.label}</button>
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        {sorted.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>◈</div>
            <div>No {subTab} leads yet. Click <strong style={{ color: '#e87722' }}>+ Add Lead</strong> to get started.</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              {['Name', 'Phone', 'Company', 'Requirement', 'Status', 'Date', 'Actions'].map(h => <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {sorted.map(l => (
                <tr key={l.id} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => e.currentTarget.style.background = '#fafbff'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1a2a4a', fontSize: 14 }}>{l.name}</td>
                  <td style={{ padding: '12px 16px', color: '#334155', fontSize: 14 }}>{l.phone}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 14 }}>{l.company || '—'}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 13, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.requirement || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <StatusSelect value={l.status} onChange={status => updateStatus(l.id, status)} />
                  </td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: 13, whiteSpace: 'nowrap' }}>{l.date}</td>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    <button onClick={() => openEdit(l)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 13, color: '#334155', marginRight: 6 }}>Edit</button>
                    <button onClick={() => del(l.id)} style={{ background: '#fef2f2', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 13, color: '#dc2626' }}>Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Lead' : `Add ${subTab === 'inbound' ? 'Inbound' : 'Outbound'} Lead`}>
        <form onSubmit={submit}>
          <FInput label="Full Name" value={form.name} onChange={f('name')} placeholder="Rajesh Kumar" required />
          <FInput label="Phone" value={form.phone} onChange={f('phone')} placeholder="+91 XXXXX XXXXX" required />
          <FInput label="Company" value={form.company} onChange={f('company')} placeholder="Company name" />
          <FInput label="Requirement" value={form.requirement} onChange={f('requirement')} placeholder="TMT Bars, Plates, etc." />
          <FInput label="Notes" value={form.notes} onChange={f('notes')} placeholder="Additional notes..." multiline rows={2} />
          <FSelect label="Status" value={form.status} onChange={f('status')} options={[{ value: 'new', label: 'New' }, { value: 'contacted', label: 'Contacted' }, { value: 'converted', label: 'Converted' }, { value: 'closed', label: 'Closed' }]} />
          <FSelect label="Type" value={form.type} onChange={f('type')} options={[{ value: 'inbound', label: 'Inbound (came to us)' }, { value: 'outbound', label: 'Outbound (we reached out)' }]} />
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <button type="submit" style={{ flex: 1, background: '#e87722', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>{editId ? 'Save Changes' : 'Add Lead'}</button>
            <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: 8, padding: '11px 0', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ─── Customers Tab ─── */
function CustomersTab({ customers, saveCustomers }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', company: '', phone: '', city: '', products: '', notes: '' });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const f = k => v => setForm(p => ({ ...p, [k]: v }));
  const submit = e => {
    e.preventDefault();
    if (editId) { saveCustomers(customers.map(c => c.id === editId ? { ...c, ...form } : c)); }
    else { saveCustomers([...customers, { ...form, id: Date.now(), since: new Date().toLocaleDateString('en-IN') }]); }
    setShowModal(false); setEditId(null);
    setForm({ name: '', company: '', phone: '', city: '', products: '', notes: '' });
  };
  const openEdit = c => { setForm({ name: c.name, company: c.company || '', phone: c.phone, city: c.city || '', products: c.products || '', notes: c.notes || '' }); setEditId(c.id); setShowModal(true); };
  const del = id => { if (window.confirm('Delete this customer?')) saveCustomers(customers.filter(c => c.id !== id)); };
  const filtered = customers.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.company?.toLowerCase().includes(search.toLowerCase()) || c.city?.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Customer List</h1>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 13 }}>Manage your existing customer relationships</p>
        </div>
        <button onClick={() => { setForm({ name: '', company: '', phone: '', city: '', products: '', notes: '' }); setEditId(null); setShowModal(true); }} style={{ background: '#e87722', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 8px rgba(232,119,34,0.3)' }}>+ Add Customer</button>
      </div>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." style={{ border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '8px 14px', fontSize: 14, width: 260, outline: 'none' }} />
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>◉</div>
            <div>{customers.length === 0 ? 'No customers yet. Add your first customer!' : 'No results found.'}</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              {['Name', 'Company', 'Phone', 'City', 'Products', 'Since', 'Actions'].map(h => <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => e.currentTarget.style.background = '#fafbff'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1a2a4a', fontSize: 14 }}>{c.name}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 14 }}>{c.company || '—'}</td>
                  <td style={{ padding: '12px 16px', color: '#334155', fontSize: 14 }}>{c.phone}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 14 }}>{c.city || '—'}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 13, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.products || '—'}</td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: 13 }}>{c.since}</td>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    <button onClick={() => openEdit(c)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 13, color: '#334155', marginRight: 6 }}>Edit</button>
                    <button onClick={() => del(c.id)} style={{ background: '#fef2f2', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 13, color: '#dc2626' }}>Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Customer' : 'Add Customer'}>
        <form onSubmit={submit}>
          <FInput label="Full Name" value={form.name} onChange={f('name')} placeholder="Customer name" required />
          <FInput label="Company" value={form.company} onChange={f('company')} placeholder="Company / Firm name" />
          <FInput label="Phone" value={form.phone} onChange={f('phone')} placeholder="+91 XXXXX XXXXX" required />
          <FInput label="City" value={form.city} onChange={f('city')} placeholder="Pune, Mumbai, etc." />
          <FInput label="Products Interested" value={form.products} onChange={f('products')} placeholder="TMT Bars, MS Pipes, etc." />
          <FInput label="Notes" value={form.notes} onChange={f('notes')} placeholder="Notes..." multiline rows={2} />
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <button type="submit" style={{ flex: 1, background: '#e87722', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>{editId ? 'Save Changes' : 'Add Customer'}</button>
            <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: 8, padding: '11px 0', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ─── Products Admin Tab ─── */
function ProductsAdminTab({ draft, updateDraft }) {
  const [activeTab, setActiveTab] = useState('flat');
  const categories = ['flat', 'tubular', 'structural', 'roofing', 'accessories'];
  const catLabels = { flat: 'Flat Products', tubular: 'Tubular Products', structural: 'Structural Steel', roofing: 'Roofing & Sheets', accessories: 'Accessories & Others' };
  const addProduct = () => updateDraft(`products.${activeTab}`, [...(draft.products[activeTab] || []), { title: 'New Product', desc: 'Product description.', img: 'https://picsum.photos/seed/newproduct/480/280' }]);
  const removeProduct = i => { if (!window.confirm('Remove product?')) return; updateDraft(`products.${activeTab}`, draft.products[activeTab].filter((_, j) => j !== i)); };
  const updateProduct = (i, field, val) => updateDraft(`products.${activeTab}`, draft.products[activeTab].map((p, j) => j === i ? { ...p, [field]: val } : p));
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Product List</h1>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 13 }}>Edit product cards shown on the website</p>
        </div>
        <button onClick={addProduct} style={{ background: '#e87722', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 8px rgba(232,119,34,0.3)' }}>+ Add Product</button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {categories.map(c => (
          <button key={c} onClick={() => setActiveTab(c)} style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid', cursor: 'pointer', fontWeight: 600, fontSize: 13, borderColor: activeTab === c ? '#e87722' : '#e2e8f0', background: activeTab === c ? '#fff7f0' : '#fff', color: activeTab === c ? '#e87722' : '#64748b' }}>
            {catLabels[c]} ({(draft.products[c] || []).length})
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {(draft.products[activeTab] || []).map((p, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>
            <div style={{ position: 'relative' }}>
              <ImageUpload src={p.img} onChange={val => updateProduct(i, 'img', val)} height={140} />
              <button onClick={() => removeProduct(i)} style={{ position: 'absolute', top: 8, right: 8, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 600, zIndex: 5 }}>Remove</button>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ marginBottom: 8, background: '#f8fafc', borderRadius: 6, padding: '6px 10px', border: '1px solid #e2e8f0' }}>
                <p style={{ margin: 0, fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Image — hover to upload or change</p>
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 3 }}>Name</label>
                <input value={p.title} onChange={e => updateProduct(i, 'title', e.target.value)} style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', fontSize: 14, fontWeight: 600, color: '#1a2a4a', boxSizing: 'border-box', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 3 }}>Description</label>
                <textarea value={p.desc} onChange={e => updateProduct(i, 'desc', e.target.value)} rows={2} style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', fontSize: 12, color: '#64748b', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Editable Field ─── */
function EF({ value, onChange, multiline, fontSize = 15, fontWeight = 400, color = 'inherit', style = {}, placeholder, rows = 3 }) {
  const [focused, setFocused] = useState(false);
  const [hov, setHov] = useState(false);
  const { display, ...restStyle } = style;
  const base = {
    background: 'transparent',
    border: 'none',
    borderBottom: '1.5px solid transparent',
    outline: 'none',
    padding: '1px 0 3px',
    borderRadius: 0,
    fontFamily: 'inherit', color, fontSize, fontWeight,
    width: '100%', resize: 'none',
    transition: 'border-color 0.15s, background 0.15s',
    boxSizing: 'border-box', lineHeight: 'inherit',
    ...restStyle,
  };
  const hovStyle = hov && !focused ? { borderBottomColor: 'rgba(232,119,34,0.5)', background: 'rgba(232,119,34,0.04)' } : {};
  const focusStyle = focused ? { borderBottomColor: '#e87722', background: 'rgba(232,119,34,0.06)' } : {};
  const props = {
    value, onChange: e => onChange(e.target.value), placeholder,
    onMouseEnter: () => setHov(true), onMouseLeave: () => setHov(false),
    onFocus: () => setFocused(true), onBlur: () => setFocused(false),
    style: { ...base, ...hovStyle, ...focusStyle },
  };
  return (
    <div style={{ position: 'relative', display: display || 'block' }}>
      {multiline ? <textarea rows={rows} {...props} /> : <input {...props} />}
      {(hov || focused) && (
        <span style={{ position: 'absolute', top: 2, right: 2, fontSize: 9, color: focused ? '#e87722' : 'rgba(232,119,34,0.5)', pointerEvents: 'none', fontWeight: 700, background: 'rgba(255,255,255,0.85)', borderRadius: 3, padding: '1px 5px', lineHeight: 1.5, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{focused ? 'editing' : '✎ edit'}</span>
      )}
    </div>
  );
}

/* ─── Publish status message ─── */
function PublishStatus({ saved, dark }) {
  const c = dark ? 'rgba(255,255,255,0.6)' : '#64748b';
  if (!saved || saved === null) return null;
  const map = {
    saving: { color: '#f59e0b', text: 'Publishing…' },
    saved:  { color: '#22c55e', text: '✓ Live — changes are visible to everyone' },
    no_kv:  { color: '#f59e0b', text: '⚠ Database not connected yet — see instructions below' },
    error:  { color: '#ef4444', text: '✗ Publish failed — see error in browser console' },
  };
  const m = map[saved];
  if (!m) return null;
  return <span style={{ fontSize: 13, fontWeight: 600, color: m.color }}>{m.text}</span>;
}

/* ─── Image Upload Component ─── */
function ImageUpload({ src, onChange, height = 150 }) {
  const fileRef = useRef(null);
  const [hov, setHov] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [urlVal, setUrlVal] = useState('');

  // sync url input value when src changes externally
  useEffect(() => { setUrlVal(src || ''); }, [src]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // reset so same file can be re-selected
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = (ev) => {
      onChange(ev.target.result);
      setHov(false);
      setShowUrl(false);
    };
    reader.readAsDataURL(file);
  };

  const handleMouseLeave = () => {
    if (!showUrl) setHov(false);
  };

  return (
    <div
      style={{ position: 'relative', height, overflow: 'hidden', background: '#e2e8f0', flexShrink: 0 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'opacity 0.2s', opacity: hov ? 0.25 : 1 }}
      />

      {/* Overlay */}
      {hov && (
        <div
          style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, background: 'rgba(26,42,74,0.88)' }}
          onMouseLeave={() => { setHov(false); setShowUrl(false); }}
        >
          {!showUrl ? (
            <>
              <button
                onClick={() => fileRef.current?.click()}
                style={{ background: '#e87722', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, width: '85%', justifyContent: 'center' }}
              >
                📁 Upload from Device
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowUrl(true); }}
                style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8, padding: '7px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, width: '85%', justifyContent: 'center' }}
              >
                🔗 Use Image URL
              </button>
            </>
          ) : (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600, textAlign: 'center' }}>Paste image URL</div>
              <input
                autoFocus
                value={urlVal}
                onChange={e => setUrlVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { onChange(urlVal); setHov(false); setShowUrl(false); } if (e.key === 'Escape') { setShowUrl(false); } }}
                placeholder="https://example.com/image.jpg"
                style={{ width: '100%', border: '1.5px solid #e87722', borderRadius: 7, padding: '7px 10px', fontSize: 11, background: 'rgba(255,255,255,0.1)', color: '#fff', boxSizing: 'border-box', outline: 'none', textAlign: 'center' }}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { onChange(urlVal); setHov(false); setShowUrl(false); }} style={{ flex: 1, background: '#e87722', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 0', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Apply</button>
                <button onClick={() => setShowUrl(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.12)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 0', cursor: 'pointer', fontSize: 12 }}>Back</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  );
}

/* ─── Section Label Banner ─── */
function SectionBanner({ label, id }) {
  return (
    <div id={id} style={{ background: '#f8f9fb', borderTop: '1px solid #eef0f3', borderBottom: '1px solid #eef0f3', padding: '6px 48px', display: 'flex', alignItems: 'center', gap: 10, scrollMarginTop: 104, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ width: 3, height: 12, borderRadius: 2, background: '#f97316', flexShrink: 0 }} />
      <span style={{ fontSize: 10, fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.18em' }}>{label}</span>
      <span style={{ marginLeft: 'auto', fontSize: 10, color: '#c8d0da', letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#c8d0da' }} />
        Hover any text or image to edit
      </span>
    </div>
  );
}

/* ─── Steel Brand Palettes (from brand proposal) ─── */
const STEEL_PALETTES = [
  {
    id: 'steel-midnight',
    name: 'Steel & Midnight',
    tagline: 'Strength, Authority & Precision',
    badge: 'INDUSTRIAL POWER',
    bestFor: 'Infrastructure, construction & government contracts',
    keywords: ['Authority', 'Trust', 'Precision', 'Corporate'],
    primary: '#4A6FA5', primaryDark: '#2D5585', secondary: '#1B2A3B', secondaryLight: '#243550',
    swatches: [
      { hex: '#1B2A3B', name: 'Midnight Navy', role: 'Primary / Brand' },
      { hex: '#4A6FA5', name: 'Steel Blue', role: 'Secondary / Accent' },
      { hex: '#8AAECF', name: 'Cold Chrome', role: 'Tertiary / Support' },
      { hex: '#D4D8DE', name: 'Polished Steel', role: 'Neutral / Background' },
      { hex: '#F5F7FA', name: 'Forge White', role: 'Base / Canvas' },
    ],
  },
  {
    id: 'molten-forge',
    name: 'Molten & Forge',
    tagline: 'Heat, Energy & Raw Industrial Power',
    badge: 'INDUSTRIAL HERITAGE',
    bestFor: 'Trade fairs, bold brand identity & marketing materials',
    keywords: ['Energy', 'Bold', 'Heritage', 'Powerful'],
    primary: '#B84B1A', primaryDark: '#8B3612', secondary: '#1A1A1A', secondaryLight: '#2A2A2A',
    swatches: [
      { hex: '#1A1A1A', name: 'Smelter Black', role: 'Primary / Brand' },
      { hex: '#B84B1A', name: 'Molten Iron', role: 'Secondary / Accent' },
      { hex: '#E87C35', name: 'Forge Glow', role: 'Tertiary / Support' },
      { hex: '#9E9EA0', name: 'Cast Grey', role: 'Neutral / Background' },
      { hex: '#F2F0ED', name: 'Ash White', role: 'Base / Canvas' },
    ],
  },
  {
    id: 'graphite-green',
    name: 'Graphite & Green',
    tagline: 'Reliability, Sustainability & Forward Progress',
    badge: 'SUSTAINABLE STRENGTH',
    bestFor: 'ESG-focused clients, green steel & sustainability reports',
    keywords: ['Sustainable', 'Future', 'Reliable', 'Green'],
    primary: '#3A7D5A', primaryDark: '#2B5E43', secondary: '#2C3E35', secondaryLight: '#3A4F43',
    swatches: [
      { hex: '#2C3E35', name: 'Deep Graphite', role: 'Primary / Brand' },
      { hex: '#3A7D5A', name: 'Industrial Green', role: 'Secondary / Accent' },
      { hex: '#72B08A', name: 'Eco Steel', role: 'Tertiary / Support' },
      { hex: '#A8B0AB', name: 'Raw Metal', role: 'Neutral / Background' },
      { hex: '#EDF2EF', name: 'Clean Air', role: 'Base / Canvas' },
    ],
  },
  {
    id: 'monochrome',
    name: 'Monochrome Steel',
    tagline: 'Precision, Innovation & Minimal Confidence',
    badge: 'MODERN PRECISION',
    bestFor: 'Advanced manufacturing, aerospace steel & tech clients',
    keywords: ['Premium', 'Innovation', 'Modern', 'Precise'],
    primary: '#5B4FCF', primaryDark: '#4638A8', secondary: '#0D0D0D', secondaryLight: '#1F1F1F',
    swatches: [
      { hex: '#0D0D0D', name: 'Carbon Black', role: 'Primary / Brand' },
      { hex: '#3B3B3B', name: 'Dark Steel', role: 'Secondary / Accent' },
      { hex: '#7A7A7A', name: 'Brushed Metal', role: 'Tertiary / Support' },
      { hex: '#C0C0C0', name: 'Silver Grade', role: 'Neutral / Background' },
      { hex: '#5B4FCF', name: 'Tech Accent', role: 'Base / Canvas' },
    ],
  },
];

const FONTS = [
  { value: 'Inter', label: 'Inter — Modern & Clean' },
  { value: 'Roboto', label: 'Roboto — Versatile & Professional' },
  { value: 'Poppins', label: 'Poppins — Geometric & Friendly' },
  { value: 'Montserrat', label: 'Montserrat — Bold & Contemporary' },
  { value: 'Open Sans', label: 'Open Sans — Readable & Neutral' },
  { value: 'Raleway', label: 'Raleway — Elegant & Refined' },
  { value: 'Oswald', label: 'Oswald — Strong & Impactful' },
  { value: 'Barlow', label: 'Barlow — Industrial & Modern' },
  { value: 'Lato', label: 'Lato — Professional & Clear' },
  { value: 'Nunito', label: 'Nunito — Rounded & Approachable' },
];

/* ─── Theme Tab ─── */
const PRESETS = [
  { name: 'Steel & Midnight', primary: '#4A6FA5', primaryDark: '#2D5585', secondary: '#1B2A3B', secondaryLight: '#243550' },
  { name: 'Molten & Forge',   primary: '#B84B1A', primaryDark: '#8B3612', secondary: '#1A1A1A', secondaryLight: '#2A2A2A' },
  { name: 'Graphite & Green', primary: '#3A7D5A', primaryDark: '#2B5E43', secondary: '#2C3E35', secondaryLight: '#3A4F43' },
  { name: 'Monochrome Steel', primary: '#5B4FCF', primaryDark: '#4638A8', secondary: '#0D0D0D', secondaryLight: '#1F1F1F' },
  { name: 'Steel Orange',     primary: '#e87722', primaryDark: '#c96310', secondary: '#1a2a4a', secondaryLight: '#243557' },
  { name: 'Royal Blue',       primary: '#2563eb', primaryDark: '#1d4ed8', secondary: '#0f172a', secondaryLight: '#1e293b' },
  { name: 'Forest Green',     primary: '#16a34a', primaryDark: '#15803d', secondary: '#14532d', secondaryLight: '#166534' },
  { name: 'Deep Purple',      primary: '#7c3aed', primaryDark: '#6d28d9', secondary: '#1e1b4b', secondaryLight: '#312e81' },
];

function ThemeTab({ draft, updateDraft, publish, saved }) {
  const theme = draft?.theme || PRESETS[0];

  function applyPreset(preset) {
    updateDraft('theme.primary', preset.primary);
    updateDraft('theme.primaryDark', preset.primaryDark);
    updateDraft('theme.secondary', preset.secondary);
    updateDraft('theme.secondaryLight', preset.secondaryLight);
    // Live preview immediately
    document.documentElement.style.setProperty('--orange', preset.primary);
    document.documentElement.style.setProperty('--orange-dark', preset.primaryDark);
    document.documentElement.style.setProperty('--navy', preset.secondary);
    document.documentElement.style.setProperty('--navy-light', preset.secondaryLight);
  }

  function handleColor(key, cssVar, value) {
    updateDraft(`theme.${key}`, value);
    document.documentElement.style.setProperty(cssVar, value);
  }

  const isActive = (p) => p.primary === theme.primary && p.secondary === theme.secondary;

  return (
    <div>
      <h2 style={{ color: '#1a2a4a', margin: '0 0 6px', fontSize: 24 }}>Theme & Colours</h2>
      <p style={{ color: '#64748b', fontSize: 13, marginBottom: 32 }}>Changes apply instantly for preview. Click <strong>Publish Changes</strong> in the Edit Website tab to go live.</p>

      {/* Preset themes */}
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a2a4a', marginBottom: 16 }}>Preset Themes</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12, marginBottom: 40 }}>
        {PRESETS.map(p => (
          <button key={p.name} onClick={() => applyPreset(p)} style={{
            border: isActive(p) ? `3px solid ${p.primary}` : '2px solid #e2e8f0',
            borderRadius: 14, overflow: 'hidden', cursor: 'pointer', background: '#fff',
            boxShadow: isActive(p) ? `0 4px 16px ${p.primary}44` : '0 1px 4px rgba(0,0,0,0.06)',
            transition: 'all 0.15s', padding: 0,
          }}>
            {/* Colour swatch */}
            <div style={{ display: 'flex', height: 56 }}>
              <div style={{ flex: 1, background: p.secondary }} />
              <div style={{ flex: 1, background: p.primary }} />
            </div>
            <div style={{ padding: '10px 12px', textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#1a2a4a' }}>{p.name}</div>
              {isActive(p) && <div style={{ fontSize: 11, color: p.primary, fontWeight: 600, marginTop: 2 }}>✓ Active</div>}
            </div>
          </button>
        ))}
      </div>

      {/* Custom pickers */}
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a2a4a', marginBottom: 16 }}>Custom Colours</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Accent / Primary', key: 'primary', cssVar: '--orange', desc: 'Buttons, highlights, badges' },
          { label: 'Accent Dark', key: 'primaryDark', cssVar: '--orange-dark', desc: 'Button hover state' },
          { label: 'Dark / Secondary', key: 'secondary', cssVar: '--navy', desc: 'Navbar, headings, footer' },
          { label: 'Secondary Light', key: 'secondaryLight', cssVar: '--navy-light', desc: 'Sidebar, dark backgrounds' },
        ].map(({ label, key, cssVar, desc }) => (
          <div key={key} style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#1a2a4a', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>{desc}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="color"
                value={theme[key] || '#000000'}
                onChange={e => handleColor(key, cssVar, e.target.value)}
                style={{ width: 44, height: 44, border: '2px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', padding: 2, background: 'none' }}
              />
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#334155' }}>{theme[key] || '#000000'}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>Click to change</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live preview strip */}
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a2a4a', marginBottom: 16 }}>Live Preview</h3>
      <div style={{ borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ background: theme.secondary, padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: theme.primary }} />
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: '0.08em' }}>NAMO STEEL</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {['About', 'Products', 'Contact'].map(l => <span key={l} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{l}</span>)}
            <span style={{ background: theme.primary, color: '#fff', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700 }}>Contact Us</span>
          </div>
        </div>
        <div style={{ background: '#f8fafc', padding: '28px 24px', display: 'flex', gap: 16, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-block', background: `${theme.primary}20`, color: theme.primary, borderRadius: 99, padding: '4px 14px', fontSize: 11, fontWeight: 700, marginBottom: 8 }}>SINCE 1995</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: theme.secondary, lineHeight: 1.2, marginBottom: 12 }}>Steel Solutions for<br /><span style={{ color: theme.primary }}>Solid Foundations.</span></div>
            <button style={{ background: theme.primary, color: '#fff', border: 'none', borderRadius: 24, padding: '10px 24px', fontWeight: 700, fontSize: 13, cursor: 'default' }}>Explore Products →</button>
          </div>
        </div>
      </div>

      {/* Publish bar */}
      <div style={{ marginTop: 32, background: '#1a2a4a', borderRadius: 14, padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>Publish Theme</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Makes your chosen colours live for all visitors instantly.</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <PublishStatus saved={saved} dark />
          <button
            onClick={publish}
            disabled={saved === 'saving'}
            style={{ background: saved === 'saved' ? '#22c55e' : theme.primary, color: '#fff', border: 'none', borderRadius: 10, padding: '12px 32px', fontWeight: 700, fontSize: 14, cursor: saved === 'saving' ? 'wait' : 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s' }}
          >
            {saved === 'saving' ? 'Publishing…' : saved === 'saved' ? '✓ Live!' : 'Publish Theme →'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Branding Tab ─── */
function BrandingTab({ draft, updateDraft, publish, saved }) {
  const theme = draft?.theme || {};
  const branding = draft?.branding || {};
  const selectedPaletteId = branding.selectedPalette || 'steel-midnight';

  function applyPalette(palette) {
    updateDraft('branding.selectedPalette', palette.id);
    updateDraft('theme.primary', palette.primary);
    updateDraft('theme.primaryDark', palette.primaryDark);
    updateDraft('theme.secondary', palette.secondary);
    updateDraft('theme.secondaryLight', palette.secondaryLight);
    document.documentElement.style.setProperty('--orange', palette.primary);
    document.documentElement.style.setProperty('--orange-dark', palette.primaryDark);
    document.documentElement.style.setProperty('--navy', palette.secondary);
    document.documentElement.style.setProperty('--navy-light', palette.secondaryLight);
  }

  function handleColor(key, cssVar, value) {
    updateDraft(`theme.${key}`, value);
    document.documentElement.style.setProperty(cssVar, value);
  }

  function handleFont(key, value) {
    updateDraft(`branding.${key}`, value);
    if (value && value !== 'Inter') {
      const id = `gfont-${value.replace(/\s+/g, '-')}`;
      if (!document.getElementById(id)) {
        const link = document.createElement('link');
        link.id = id; link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(value)}:wght@400;500;600;700;900&display=swap`;
        document.head.appendChild(link);
      }
    }
    const prop = key === 'headingFont' ? '--font-heading' : '--font-body';
    document.documentElement.style.setProperty(prop, `'${value}', system-ui, sans-serif`);
  }

  const activePalette = STEEL_PALETTES.find(p => p.id === selectedPaletteId) || STEEL_PALETTES[0];

  return (
    <div>
      <h2 style={{ color: '#1a2a4a', margin: '0 0 6px', fontSize: 24 }}>Brand Identity</h2>
      <p style={{ color: '#64748b', fontSize: 13, marginBottom: 36 }}>Manage your brand's visual identity — colour palette, typography, and logo. Publish to go live.</p>

      {/* ── LOGO ── */}
      <section style={{ marginBottom: 44 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a2a4a', marginBottom: 4, marginTop: 0 }}>Logo</h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16, marginTop: 0 }}>Upload a logo via URL or use a text-based logo displayed in the navbar and footer.</p>
        <div style={{ background: '#fff', borderRadius: 14, padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Logo Image URL (optional)</label>
            <input
              type="url"
              value={branding.logoUrl || ''}
              onChange={e => updateDraft('branding.logoUrl', e.target.value)}
              placeholder="https://example.com/logo.png"
              style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', marginBottom: 14 }}
            />
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Brand Name (text fallback)</label>
            <input
              type="text"
              value={branding.logoText || draft?.footer?.brandName || 'NAMO STEEL'}
              onChange={e => updateDraft('branding.logoText', e.target.value)}
              placeholder="NAMO STEEL"
              style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Navbar Preview</div>
            <div style={{ background: theme.secondary || '#1B2A3B', borderRadius: 10, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
              {branding.logoUrl
                ? <img src={branding.logoUrl} alt="Logo" style={{ height: 30, objectFit: 'contain' }} />
                : <>
                    <div style={{ width: 26, height: 26, borderRadius: 6, background: theme.primary || '#4A6FA5', flexShrink: 0 }} />
                    <span style={{ color: '#fff', fontWeight: 900, fontSize: 14, letterSpacing: '0.08em' }}>{branding.logoText || draft?.footer?.brandName || 'NAMO STEEL'}</span>
                  </>
              }
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
                {['About', 'Products', 'Contact'].map(l => <span key={l} style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>{l}</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TYPOGRAPHY ── */}
      <section style={{ marginBottom: 44 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a2a4a', marginBottom: 4, marginTop: 0 }}>Typography</h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16, marginTop: 0 }}>Select fonts for headings and body text. Fonts load from Google Fonts automatically.</p>
        <div style={{ background: '#fff', borderRadius: 14, padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            {[
              { key: 'headingFont', label: 'Heading Font', desc: 'Titles and section headers' },
              { key: 'bodyFont', label: 'Body Font', desc: 'Paragraphs and descriptions' },
            ].map(({ key, label, desc }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>{desc}</div>
                <select
                  value={branding[key] || 'Inter'}
                  onChange={e => handleFont(key, e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', background: '#fff', cursor: 'pointer' }}
                >
                  {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div style={{ background: '#f8fafc', borderRadius: 10, padding: '20px 24px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Font Preview</div>
            <div style={{ fontFamily: `'${branding.headingFont || 'Inter'}', system-ui, sans-serif`, fontSize: 20, fontWeight: 700, color: theme.secondary || '#1B2A3B', marginBottom: 6 }}>Steel Solutions for Solid Foundations</div>
            <div style={{ fontFamily: `'${branding.bodyFont || 'Inter'}', system-ui, sans-serif`, fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>Trusted dealers in construction and industrial steel products, serving the industry for over 30 years. Known for quality, reliability, and competitive pricing.</div>
          </div>
        </div>
      </section>

      {/* ── COLOUR PALETTES ── */}
      <section style={{ marginBottom: 44 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a2a4a', marginBottom: 4, marginTop: 0 }}>Brand Colour Palette</h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20, marginTop: 0 }}>Four curated palettes for your steel brand identity. Select one, then fine-tune individual colours below.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, marginBottom: 28 }}>
          {STEEL_PALETTES.map(palette => {
            const isSelected = selectedPaletteId === palette.id;
            return (
              <div key={palette.id} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: isSelected ? `3px solid ${palette.primary}` : '2px solid #e2e8f0', boxShadow: isSelected ? `0 6px 24px ${palette.primary}33` : '0 1px 6px rgba(0,0,0,0.06)', transition: 'all 0.2s' }}>
                <div style={{ background: palette.secondary, padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: palette.primary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{palette.badge}</span>
                  {isSelected && <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: palette.primary, borderRadius: 99, padding: '2px 8px' }}>✓ Active</span>}
                </div>
                <div style={{ display: 'flex', height: 60 }}>
                  {palette.swatches.map((s, i) => <div key={i} style={{ flex: 1, background: s.hex }} title={`${s.name}: ${s.hex}`} />)}
                </div>
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#1a2a4a', marginBottom: 2 }}>{palette.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>{palette.tagline}</div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
                    {palette.keywords.map(k => <span key={k} style={{ background: `${palette.primary}18`, color: palette.primary, fontSize: 10, fontWeight: 600, borderRadius: 99, padding: '2px 8px', border: `1px solid ${palette.primary}30` }}>{k}</span>)}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                    {palette.swatches.map((s, i) => (
                      <div key={i} style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: s.hex, margin: '0 auto 3px', border: '1.5px solid rgba(0,0,0,0.1)' }} />
                        <div style={{ fontSize: 8, color: '#94a3b8', lineHeight: 1.2, fontFamily: 'monospace' }}>{s.hex}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12, borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
                    Best for: <span style={{ color: '#64748b', fontWeight: 500 }}>{palette.bestFor}</span>
                  </div>
                  <button
                    onClick={() => applyPalette(palette)}
                    style={{ width: '100%', background: isSelected ? palette.primary : '#f8fafc', color: isSelected ? '#fff' : '#64748b', border: `2px solid ${isSelected ? palette.primary : '#e2e8f0'}`, borderRadius: 8, padding: '10px', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' }}
                  >
                    {isSelected ? '✓ Selected' : 'Select This Palette'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fine-tune colours */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: `2px solid ${activePalette.primary}22` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: activePalette.primary, flexShrink: 0 }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1a2a4a' }}>Fine-tune: {activePalette.name}</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>— adjust individual colours below</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {[
              { label: 'Accent / Buttons', key: 'primary', cssVar: '--orange', desc: 'Buttons, badges, highlights' },
              { label: 'Accent Dark (Hover)', key: 'primaryDark', cssVar: '--orange-dark', desc: 'Button hover & active states' },
              { label: 'Dark Background', key: 'secondary', cssVar: '--navy', desc: 'Navbar, headings, footer' },
              { label: 'Mid Dark', key: 'secondaryLight', cssVar: '--navy-light', desc: 'Sidebar, dark card sections' },
            ].map(({ label, key, cssVar, desc }) => (
              <div key={key} style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: '#1a2a4a', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10 }}>{desc}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="color" value={theme[key] || '#000000'} onChange={e => handleColor(key, cssVar, e.target.value)} style={{ width: 40, height: 40, border: '2px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', padding: 2, background: 'none' }} />
                  <div>
                    <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#334155' }}>{theme[key] || '#000000'}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>Click to change</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Publish bar */}
      <div style={{ background: '#1a2a4a', borderRadius: 14, padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>Publish Brand Identity</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Makes your chosen palette, fonts, and logo live for all visitors instantly.</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <PublishStatus saved={saved} dark />
          <button
            onClick={publish}
            disabled={saved === 'saving'}
            style={{ background: saved === 'saved' ? '#22c55e' : (theme.primary || '#4A6FA5'), color: '#fff', border: 'none', borderRadius: 10, padding: '12px 32px', fontWeight: 700, fontSize: 14, cursor: saved === 'saving' ? 'wait' : 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s' }}
          >
            {saved === 'saving' ? 'Publishing…' : saved === 'saved' ? '✓ Live!' : 'Publish Brand →'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Companies Tab ─── */
function CompaniesTab() {
  const [companies, setCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', email: '', password: '', industry: '' });
  const [slugError, setSlugError] = useState('');

  useEffect(() => {
    fetch('/api/companies').then(r => r.json()).then(data => { if (Array.isArray(data)) setCompanies(data); });
  }, []);

  const f = k => v => {
    setForm(p => ({ ...p, [k]: v }));
    if (k === 'name' && !editId) setForm(p => ({ ...p, [k]: v, slug: v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }));
  };

  const submit = async e => {
    e.preventDefault();
    setSlugError('');
    if (editId) {
      await fetch('/api/companies', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editId, ...form }) });
      setCompanies(prev => prev.map(c => c.id === editId ? { ...c, ...form } : c));
    } else {
      const res = await fetch('/api/companies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.error === 'SLUG_TAKEN') { setSlugError('This company ID is already taken. Choose another.'); return; }
      if (data.id) setCompanies(prev => [data, ...prev]);
    }
    setShowModal(false); setEditId(null);
    setForm({ name: '', slug: '', email: '', password: '', industry: '' });
  };

  const openAdd = () => { setForm({ name: '', slug: '', email: '', password: '', industry: '' }); setEditId(null); setSlugError(''); setShowModal(true); };
  const openEdit = c => { setForm({ name: c.name, slug: c.slug, email: c.email || '', password: '', industry: c.industry || '' }); setEditId(c.id); setSlugError(''); setShowModal(true); };
  const del = async id => {
    if (window.confirm('Delete this company? They will lose access.')) {
      await fetch(`/api/companies?id=${id}`, { method: 'DELETE' });
      setCompanies(prev => prev.filter(c => c.id !== id));
    }
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Company Profiles</h1>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 13 }}>Each company gets a unique URL to access their own portal.</p>
        </div>
        <button onClick={openAdd} style={{ background: '#e87722', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 8px rgba(232,119,34,0.3)' }}>+ Add Company</button>
      </div>
      <div style={{ marginBottom: 24 }} />

      {companies.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, padding: 48, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', color: '#94a3b8' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏢</div>
          <div>No companies yet. Click <strong style={{ color: '#e87722' }}>+ Add Company</strong> to onboard one.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {companies.map(c => (
            <div key={c.id} style={{ background: '#fff', borderRadius: 14, padding: '22px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: '#e87722', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1a2a4a', fontSize: 15 }}>{c.name}</div>
                    {c.industry && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{c.industry}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => openEdit(c)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer', color: '#334155' }}>Edit</button>
                  <button onClick={() => del(c.id)} style={{ background: '#fef2f2', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer', color: '#dc2626' }}>Del</button>
                </div>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Portal URL</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#e87722', fontWeight: 600 }}>{origin}/{c.slug}</span>
                  <button onClick={() => navigator.clipboard.writeText(`${origin}/${c.slug}`)}
                    style={{ background: '#e87722', color: '#fff', border: 'none', borderRadius: 5, padding: '3px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    Copy
                  </button>
                </div>
              </div>

              {c.email && <div style={{ fontSize: 13, color: '#64748b' }}>✉ {c.email}</div>}
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Company' : 'Add Company'}>
        <form onSubmit={submit}>
          <FInput label="Company Name" value={form.name} onChange={f('name')} placeholder="Omkar Industries" required />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Company ID (URL slug)</label>
            <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${slugError ? '#fca5a5' : '#e2e8f0'}`, borderRadius: 8, overflow: 'hidden' }}>
              <span style={{ padding: '8px 10px', background: '#f8fafc', fontSize: 14, color: '#94a3b8', borderRight: '1px solid #e2e8f0' }}>site.com/</span>
              <input value={form.slug} onChange={e => { setForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })); setSlugError(''); }}
                placeholder="omkar-industries" required
                style={{ flex: 1, padding: '8px 12px', border: 'none', fontSize: 14, outline: 'none', fontFamily: 'monospace' }} />
            </div>
            {slugError && <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>{slugError}</div>}
          </div>
          <FInput label="Email" value={form.email} onChange={f('email')} placeholder="contact@company.com" />
          <FInput label="Industry" value={form.industry} onChange={f('industry')} placeholder="Steel Fabrication, Construction…" />
          <FInput label={editId ? 'New Password (leave blank to keep)' : 'Password'} value={form.password} onChange={f('password')} placeholder="Set access password" required={!editId} />
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <button type="submit" style={{ flex: 1, background: '#e87722', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>{editId ? 'Save Changes' : 'Create Company'}</button>
            <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: 8, padding: '11px 0', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ─── Edit Website Tab ─── */
function EditWebsiteTab({ draft, updateDraft, publish, saved }) {
  const [productTab, setProductTab] = useState('flat');
  const [activeSection, setActiveSection] = useState('ew-hero');
  const [showBar, setShowBar] = useState(false);
  const up = path => val => updateDraft(path, val);
  const orange = draft?.theme?.primary || '#f97316';
  const navy   = draft?.theme?.secondary || '#0d1b2e';
  const offWh  = '#f9f7f2';

  const scrollToSection = (id) => {
    setActiveSection(id);
    setShowBar(true);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    setTimeout(() => setShowBar(false), 1000);
  };


  const updateListItem = (path, i, field, val) => {
    const arr = path.split('.').reduce((o, k) => o[k], draft);
    updateDraft(path, arr.map((it, j) => j === i ? { ...it, [field]: val } : it));
  };

  const catLabels = { flat: 'Flat Products', tubular: 'Tubular Products', structural: 'Structural Steel', roofing: 'Roofing & Sheets', accessories: 'Accessories & Others' };

  const SL = ({ value, onChange, dark }) => (
    <div style={{ marginBottom: 14 }}>
      <EF value={value} onChange={onChange} style={{ display: 'inline-block', background: dark ? 'rgba(255,255,255,0.12)' : `${orange}1f`, color: orange, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '6px 16px', borderRadius: 100, width: 'auto' }} />
    </div>
  );

  return (
    <div style={{ margin: '-32px -36px', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* DB setup notice */}
      {saved === 'no_kv' && (
        <div style={{ background: '#fefce8', borderBottom: '2px solid #fbbf24', padding: '14px 32px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 22 }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700, color: '#92400e', marginBottom: 6, fontSize: 15 }}>One-time Supabase setup needed (1 min)</div>
            <div style={{ fontSize: 13, color: '#78350f', lineHeight: 1.8 }}>
              <b>1.</b> Go to <b>supabase.com → your project → Project Settings → Integrations → Vercel</b><br/>
              <b>2.</b> Click <b>Connect Project</b> and select your Vercel project<br/>
              <b>3.</b> Vercel auto-adds the <b>POSTGRES_URL</b> env var. The project will redeploy automatically.<br/>
              <b>4.</b> Come back and click <b>Publish Changes</b> — it will work permanently from here.
            </div>
          </div>
        </div>
      )}

      {/* ── Loading Bar ── */}
      {showBar && (
        <div style={{ position: 'fixed', top: 0, left: 220, right: 0, height: 3, zIndex: 200, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg, #f97316, #fb923c)', animation: 'ns-bar 0.9s ease-out forwards', borderRadius: '0 2px 2px 0' }} />
        </div>
      )}

      {/* ── Sticky Top Bar ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: '#0d1b2e', height: 52, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e2d42', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 400 }}>Admin</span>
          <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 14 }}>/</span>
          <span style={{ fontWeight: 800, color: '#fff', fontSize: 14, fontFamily: "'Barlow Condensed', system-ui, sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase' }}>EDIT WEBSITE</span>
          <span style={{ background: '#22c55e', color: '#fff', borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: '#fff', opacity: 0.85 }} />
            LIVE
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <PublishStatus saved={saved} dark />
          <a href="/" target="_blank" rel="noopener" style={{ padding: '7px 14px', background: 'transparent', color: 'rgba(255,255,255,0.55)', borderRadius: 7, fontSize: 12, fontWeight: 500, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'}
          >
            <ExternalLink size={12} /> Preview
          </a>
          <button onClick={publish} disabled={saved === 'saving'} style={{ background: saved === 'saved' ? '#22c55e' : '#f97316', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, fontSize: 13, cursor: saved === 'saving' ? 'wait' : 'pointer', transition: 'background 0.2s', animation: !saved || saved === null ? 'ns-pulse 2.5s ease-in-out infinite' : 'none', boxShadow: !saved || saved === null ? '0 0 0 0 rgba(249,115,22,0.4)' : 'none' }}>
            {saved === 'saving' ? 'Publishing…' : saved === 'saved' ? '✓ Published!' : 'Publish Changes'}
          </button>
        </div>
      </div>

      {/* ── Section Tab Nav ── */}
      <div style={{ position: 'sticky', top: 52, zIndex: 49, background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '0 20px', display: 'flex', gap: 0, overflowX: 'auto' }}>
        {[
          { id: 'ew-hero', label: 'Hero' },
          { id: 'ew-about', label: 'About' },
          { id: 'ew-why', label: 'Why Us' },
          { id: 'ew-certs', label: 'Certifications' },
          { id: 'ew-services', label: 'Services' },
          { id: 'ew-products', label: 'Products' },
          { id: 'ew-brands', label: 'Brands' },
          { id: 'ew-cases', label: 'Case Studies' },
          { id: 'ew-clients', label: 'Clients' },
          { id: 'ew-contact', label: 'Contact' },
          { id: 'ew-footer', label: 'Footer' },
        ].map(s => {
          const isActive = activeSection === s.id;
          return (
            <button key={s.id} onClick={() => scrollToSection(s.id)}
              style={{ position: 'relative', padding: '12px 14px', background: 'none', border: 'none', borderBottom: `2.5px solid ${isActive ? '#f97316' : 'transparent'}`, cursor: 'pointer', fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? '#f97316' : '#94a3b8', whiteSpace: 'nowrap', letterSpacing: '0.02em', transition: 'color 0.15s, border-color 0.2s', fontFamily: "'DM Sans', system-ui, sans-serif" }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = '#475569'; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = '#94a3b8'; } }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* ════════════════════════════════════════
           HERO SECTION
      ════════════════════════════════════════ */}
      <SectionBanner label="Hero Section" id="ew-hero" />
      <div style={{ background: `linear-gradient(135deg, ${navy} 0%, #0a1628 60%, #122038 100%)`, padding: '80px 48px 64px', position: 'relative', overflow: 'hidden', backgroundImage: `linear-gradient(135deg, ${navy} 0%, #0a1628 60%, #122038 100%), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.018'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: -100, right: -60, width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${orange}12 0%, transparent 65%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: '35%', width: 350, height: 350, borderRadius: '50%', background: `radial-gradient(circle, ${orange}07 0%, transparent 70%)`, pointerEvents: 'none' }} />
        {/* Diagonal steel accent */}
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '42%', background: 'linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.012) 50%, rgba(255,255,255,0.025) 100%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 720, position: 'relative' }}>
          {/* Badge */}
          <div style={{ marginBottom: 22 }}>
            <EF value={draft.hero.badge} onChange={up('hero.badge')} fontSize={11} fontWeight={700} color={orange} style={{ letterSpacing: '0.2em', textTransform: 'uppercase', display: 'inline-block', width: 'auto', background: `${orange}18`, borderRadius: 100, padding: '5px 18px', border: `1.5px solid ${orange}35` }} />
          </div>

          {/* Title */}
          <EF value={draft.hero.title} onChange={up('hero.title')} multiline fontSize={52} fontWeight={900} color="#fff" style={{ lineHeight: 1.05, marginBottom: 18, display: 'block', letterSpacing: '-0.025em', fontFamily: "'Barlow Condensed', system-ui, sans-serif" }} rows={2} />

          {/* Subtitle */}
          <EF value={draft.hero.subtitle} onChange={up('hero.subtitle')} fontSize={18} color="rgba(255,255,255,0.55)" style={{ marginBottom: 36, display: 'block', lineHeight: 1.55, maxWidth: 520, fontFamily: "'DM Sans', system-ui, sans-serif" }} />

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 48, flexWrap: 'wrap' }}>
            <div style={{ background: `linear-gradient(135deg, ${orange}, #ea580c)`, borderRadius: 10, padding: '13px 24px', display: 'flex', gap: 9, alignItems: 'center', boxShadow: `0 8px 24px ${orange}45, 0 2px 8px ${orange}30`, cursor: 'default' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" opacity="0.9"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a9 9 0 0 1-.57-.01c-.198 0-.52.074-.792.372C7.525 10.32 6.5 11.04 6.5 12.5c0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>
              <EF value={draft.hero.phone} onChange={up('hero.phone')} fontSize={15} fontWeight={700} color="#fff" style={{ width: 'auto' }} />
            </div>
            <div style={{ border: '1.5px solid rgba(255,255,255,0.22)', borderRadius: 10, padding: '13px 24px', backdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.05)', cursor: 'default' }}>
              <EF value={draft.hero.ctaText} onChange={up('hero.ctaText')} fontSize={15} fontWeight={600} color="rgba(255,255,255,0.9)" style={{ width: 'auto' }} />
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 0, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {draft.hero.stats.map((s, i) => (
              <div key={i} style={{ flex: 1, paddingRight: 24, borderRight: i < draft.hero.stats.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none', marginRight: i < draft.hero.stats.length - 1 ? 24 : 0, animation: `ns-count 0.5s ease forwards`, animationDelay: `${i * 0.1}s`, opacity: 0 }}>
                <EF value={s.num} onChange={val => updateDraft('hero.stats', draft.hero.stats.map((st, j) => j === i ? { ...st, num: val } : st))} fontSize={32} fontWeight={900} color={orange} style={{ width: 90, letterSpacing: '-0.02em', fontFamily: "'Barlow Condensed', system-ui, sans-serif" }} />
                <EF value={s.label} onChange={val => updateDraft('hero.stats', draft.hero.stats.map((st, j) => j === i ? { ...st, label: val } : st))} fontSize={12} color="rgba(255,255,255,0.45)" style={{ width: 120, marginTop: 2, letterSpacing: '0.02em' }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
           ABOUT SECTION
      ════════════════════════════════════════ */}
      <SectionBanner label="About Section" id="ew-about" />
      <div style={{ background: offWh, padding: '56px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, maxWidth: 1000, margin: '0 auto' }}>
          <div>
            <SL value={draft.about.sectionLabel} onChange={up('about.sectionLabel')} />
            <EF value={draft.about.heading} onChange={up('about.heading')} fontSize={28} fontWeight={800} color={navy} style={{ marginBottom: 16, display: 'block', lineHeight: 1.25, letterSpacing: '-0.01em' }} multiline rows={2} />
            <EF value={draft.about.description} onChange={up('about.description')} multiline fontSize={15} color="#64748b" style={{ lineHeight: 1.75, marginBottom: 24, display: 'block' }} rows={4} />
            {draft.about.checklist.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: orange, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <EF value={item} onChange={val => updateDraft('about.checklist', draft.about.checklist.map((c, j) => j === i ? val : c))} fontSize={14} color="#334155" fontWeight={500} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: '22px 24px', borderLeft: `4px solid ${orange}`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${orange}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></svg>
                </div>
                <span style={{ fontWeight: 700, color: navy, fontSize: 15 }}>Our Vision</span>
              </div>
              <EF value={draft.about.vision} onChange={up('about.vision')} multiline fontSize={14} color="#64748b" rows={3} style={{ lineHeight: 1.65 }} />
            </div>
            <div style={{ background: navy, borderRadius: 14, padding: '22px 24px', boxShadow: '0 2px 12px rgba(26,42,74,0.15)' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(232,119,34,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: orange, fontSize: 16 }}>🎯</span>
                </div>
                <span style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>Mission</span>
              </div>
              <EF value={draft.about.mission} onChange={up('about.mission')} multiline fontSize={13} color="rgba(255,255,255,0.75)" rows={3} style={{ lineHeight: 1.6 }} />
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
           WHY CHOOSE US
      ════════════════════════════════════════ */}
      <SectionBanner label="Why Choose Us" id="ew-why" />
      <div style={{ background: '#fff', padding: '56px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}><SL value={draft.why.sectionLabel} onChange={up('why.sectionLabel')} /></div>
            <EF value={draft.why.heading} onChange={up('why.heading')} fontSize={28} fontWeight={800} color={navy} style={{ textAlign: 'center', display: 'block', lineHeight: 1.25, letterSpacing: '-0.01em' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {draft.why.items.map((item, i) => (
              <div key={i} style={{ background: offWh, borderRadius: 14, padding: '24px 20px', border: '1px solid #ede8df', textAlign: 'center', transition: 'box-shadow 0.2s' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${orange}18`, margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${orange}30` }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <EF value={item.title} onChange={val => updateListItem('why.items', i, 'title', val)} fontSize={14} fontWeight={700} color={navy} style={{ textAlign: 'center', lineHeight: 1.4 }} />
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
                  <button onClick={() => updateDraft('why.items', draft.why.items.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 11, opacity: 0.5, padding: 0 }}>remove</button>
                </div>
              </div>
            ))}
            <div style={{ borderRadius: 14, border: `2px dashed ${orange}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120, cursor: 'pointer', background: `${orange}05` }}
              onClick={() => updateDraft('why.items', [...draft.why.items, { title: 'New reason to choose us' }])}>
              <span style={{ color: orange, fontWeight: 700, fontSize: 13 }}>+ Add Item</span>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
           CERTIFICATIONS
      ════════════════════════════════════════ */}
      <SectionBanner label="Certifications" id="ew-certs" />
      <div style={{ background: navy, padding: '56px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <div style={{ background: 'rgba(255,255,255,0.12)', color: orange, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '6px 16px', borderRadius: 100 }}>
                <EF value={draft.certifications.sectionLabel} onChange={up('certifications.sectionLabel')} fontSize={11} fontWeight={700} color={orange} style={{ letterSpacing: '0.12em', textTransform: 'uppercase', width: 'auto', display: 'inline-block' }} />
              </div>
            </div>
            <EF value={draft.certifications.heading} onChange={up('certifications.heading')} fontSize={28} fontWeight={800} color="#fff" style={{ textAlign: 'center', display: 'block', letterSpacing: '-0.01em' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {draft.certifications.items.map((c, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: '28px 24px', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(8px)' }}>
                <div style={{ fontSize: 56, fontWeight: 900, color: 'rgba(255,255,255,0.07)', position: 'absolute', top: 6, right: 14, lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>{c.num}</div>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: `${orange}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, border: `1px solid ${orange}30` }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                </div>
                <EF value={c.title} onChange={val => updateListItem('certifications.items', i, 'title', val)} fontSize={14} fontWeight={600} color="#fff" style={{ lineHeight: 1.5 }} multiline rows={2} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
           SERVICE EXCELLENCE
      ════════════════════════════════════════ */}
      <SectionBanner label="Service Excellence" id="ew-services" />
      <div style={{ background: offWh, padding: '56px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56 }}>
          <div>
            <SL value={draft.services.sectionLabel} onChange={up('services.sectionLabel')} />
            <EF value={draft.services.heading} onChange={up('services.heading')} fontSize={28} fontWeight={800} color={navy} style={{ display: 'block', marginBottom: 28, lineHeight: 1.25, letterSpacing: '-0.01em' }} multiline rows={2} />
            {draft.services.items.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 22, alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${orange}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${orange}25` }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <EF value={s.title} onChange={val => updateListItem('services.items', i, 'title', val)} fontSize={15} fontWeight={700} color={navy} />
                  <EF value={s.desc} onChange={val => updateListItem('services.items', i, 'desc', val)} multiline fontSize={13} color="#64748b" rows={2} style={{ lineHeight: 1.65, marginTop: 4 }} />
                </div>
                <button onClick={() => updateDraft('services.items', draft.services.items.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 14, opacity: 0.4, flexShrink: 0, paddingTop: 2 }}>×</button>
              </div>
            ))}
            <button onClick={() => updateDraft('services.items', [...draft.services.items, { title: 'New Service', desc: 'Service description.' }])}
              style={{ marginTop: 4, background: 'none', border: `1.5px dashed ${orange}60`, borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: orange }}>
              + Add Service
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: 260, height: 260 }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `linear-gradient(135deg, ${navy} 0%, ${navy}cc 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 20px 60px ${navy}40` }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 48, fontWeight: 900, color: orange, lineHeight: 1 }}>30+</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 6, fontWeight: 600 }}>Years of Excellence</div>
                </div>
              </div>
              <div style={{ position: 'absolute', inset: -12, borderRadius: '50%', border: `2px dashed ${orange}40`, animation: 'none' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
           PRODUCTS (with image editing!)
      ════════════════════════════════════════ */}
      <SectionBanner label="Products Section — Hover image to change URL" id="ew-products" />
      <div style={{ background: '#fff', padding: '56px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}><SL value={draft.products.sectionLabel} onChange={up('products.sectionLabel')} /></div>
            <EF value={draft.products.heading} onChange={up('products.heading')} fontSize={28} fontWeight={800} color={navy} style={{ textAlign: 'center', display: 'block', letterSpacing: '-0.01em' }} />
          </div>

          {/* Category tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
            {Object.keys(catLabels).map(cat => (
              <button key={cat} onClick={() => setProductTab(cat)} style={{ padding: '8px 16px', borderRadius: 8, border: '2px solid', cursor: 'pointer', fontWeight: 600, fontSize: 13, borderColor: productTab === cat ? '#e87722' : '#e2e8f0', background: productTab === cat ? '#e87722' : '#fff', color: productTab === cat ? '#fff' : '#64748b', transition: 'all 0.15s' }}>
                {catLabels[cat]}
              </button>
            ))}
          </div>

          {/* Product cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {(draft.products[productTab] || []).map((item, i) => (
              <div key={i} style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9' }}>
                <ImageUpload
                  src={item.img}
                  onChange={val => updateListItem(`products.${productTab}`, i, 'img', val)}
                  height={150}
                />
                <div style={{ padding: '12px 14px', background: '#fff' }}>
                  <EF value={item.title} onChange={val => updateListItem(`products.${productTab}`, i, 'title', val)} fontSize={14} fontWeight={700} color="#1a2a4a" />
                  <EF value={item.desc} onChange={val => updateListItem(`products.${productTab}`, i, 'desc', val)} multiline fontSize={12} color="#64748b" rows={2} style={{ lineHeight: 1.5, marginTop: 4 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Add product button */}
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button onClick={() => updateDraft(`products.${productTab}`, [...(draft.products[productTab] || []), { title: 'New Product', desc: 'Product description.', img: `https://picsum.photos/seed/new-${Date.now()}/480/280` }])}
              style={{ background: '#f1f5f9', border: '2px dashed #e2e8f0', borderRadius: 10, padding: '10px 24px', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#64748b' }}>
              + Add Product to {catLabels[productTab]}
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
           BRANDS
      ════════════════════════════════════════ */}
      <SectionBanner label="Brands Section" id="ew-brands" />
      <div style={{ background: offWh, padding: '56px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}><SL value="Brands We Deal" onChange={() => {}} /></div>
          <h2 style={{ color: navy, fontSize: 28, fontWeight: 800, marginBottom: 36, marginTop: 0, letterSpacing: '-0.01em' }}>Partnered with Industry&apos;s Best</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
            {draft.brands.map((b, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '16px 12px', border: '1px solid #ede8df', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative' }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: offWh, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ede8df' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={navy} strokeWidth="1.75" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
                <EF value={b} onChange={val => updateDraft('brands', draft.brands.map((br, j) => j === i ? val : br))} fontSize={12} fontWeight={700} color={navy} style={{ textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }} />
                <button onClick={() => updateDraft('brands', draft.brands.filter((_, j) => j !== i))} style={{ position: 'absolute', top: 6, right: 6, background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 14, opacity: 0.4, lineHeight: 1, padding: 0 }}>×</button>
              </div>
            ))}
            <div onClick={() => updateDraft('brands', [...draft.brands, 'NEW BRAND'])}
              style={{ background: 'none', border: `2px dashed ${orange}50`, borderRadius: 12, padding: '16px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 90 }}>
              <span style={{ color: orange, fontWeight: 700, fontSize: 13 }}>+ Add Brand</span>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
           CASE STUDIES
      ════════════════════════════════════════ */}
      <SectionBanner label="Case Studies" id="ew-cases" />
      <div style={{ background: '#fff', padding: '56px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}><SL value={draft.caseStudies?.[0] ? 'Case Studies' : 'Case Studies'} onChange={() => {}} /></div>
            <h2 style={{ color: navy, fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>Real Projects, Real Results</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20 }}>
            {draft.caseStudies.map((c, i) => (
              <div key={i} style={{ background: offWh, borderRadius: 16, padding: '24px 22px', border: '1px solid #ede8df', position: 'relative', overflow: 'hidden' }}>
                <span style={{ fontSize: 52, fontWeight: 900, color: `${navy}0d`, position: 'absolute', top: 6, right: 14, lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>{c.num}</span>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${orange}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, border: `1px solid ${orange}25` }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <EF value={c.title} onChange={val => updateListItem('caseStudies', i, 'title', val)} fontSize={16} fontWeight={700} color={navy} style={{ marginBottom: 4, lineHeight: 1.3 }} />
                <EF value={c.client} onChange={val => updateListItem('caseStudies', i, 'client', val)} fontSize={12} fontWeight={600} color={orange} style={{ marginBottom: 6 }} />
                <EF value={c.project} onChange={val => updateListItem('caseStudies', i, 'project', val)} fontSize={13} fontWeight={600} color="#334155" style={{ marginBottom: 8 }} />
                <EF value={c.desc} onChange={val => updateListItem('caseStudies', i, 'desc', val)} multiline fontSize={13} color="#64748b" rows={3} style={{ lineHeight: 1.65 }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
           CLIENTS
      ════════════════════════════════════════ */}
      <SectionBanner label="Clients Section" id="ew-clients" />
      <div style={{ background: navy, padding: '56px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 100, padding: '6px 16px' }}>
              <span style={{ color: orange, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Our Clients</span>
            </div>
          </div>
          <h2 style={{ color: '#fff', fontSize: 28, fontWeight: 800, marginBottom: 32, marginTop: 0, letterSpacing: '-0.01em' }}>Trusted by Industry Leaders</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
            {draft.clients.map((c, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: `${orange}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                </div>
                <EF value={c} onChange={val => updateDraft('clients', draft.clients.map((cl, j) => j === i ? val : cl))} fontSize={13} fontWeight={600} color="#fff" style={{ flex: 1 }} />
                <button onClick={() => updateDraft('clients', draft.clients.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
              </div>
            ))}
            <div onClick={() => updateDraft('clients', [...draft.clients, 'New Client'])}
              style={{ background: 'none', border: '2px dashed rgba(255,255,255,0.2)', borderRadius: 10, padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: 13 }}>+ Add Client</span>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
           CONTACT
      ════════════════════════════════════════ */}
      <SectionBanner label="Contact Section" id="ew-contact" />
      <div style={{ background: offWh, padding: '56px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56 }}>
          <div>
            <SL value={draft.contact.sectionLabel} onChange={up('contact.sectionLabel')} />
            <EF value={draft.contact.heading} onChange={up('contact.heading')} fontSize={28} fontWeight={800} color={navy} style={{ display: 'block', marginBottom: 14, lineHeight: 1.25, letterSpacing: '-0.01em' }} multiline rows={2} />
            <EF value={draft.contact.subheading} onChange={up('contact.subheading')} multiline fontSize={15} color="#64748b" style={{ lineHeight: 1.75, marginBottom: 28, display: 'block' }} rows={3} />
            {[
              { label: 'Phone', key: 'phone', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="17" r="1"/></svg> },
              { label: 'Email', key: 'email', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
              { label: 'Business', key: 'businessType', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/></svg> },
            ].map(({ label, key, icon }) => (
              <div key={key} style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'center', background: '#fff', borderRadius: 12, padding: '12px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #ede8df' }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: `${orange}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: orange, flexShrink: 0 }}>{icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
                  <EF value={draft.contact[key]} onChange={up(`contact.${key}`)} fontSize={14} color={navy} fontWeight={600} />
                </div>
              </div>
            ))}
            <div style={{ background: '#fff', borderRadius: 12, padding: '12px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #ede8df', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: `${orange}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: orange, flexShrink: 0, marginTop: 2 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Office Address</div>
                <EF value={draft.contact.address} onChange={up('contact.address')} multiline fontSize={13} color={navy} rows={2} style={{ lineHeight: 1.6 }} />
              </div>
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: 16, padding: '28px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #ede8df' }}>
            <h3 style={{ color: navy, margin: '0 0 20px', fontSize: 17, fontWeight: 800 }}>Send Us a Message</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              {['Your Name', 'Phone Number'].map(ph => (
                <div key={ph} style={{ border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', color: '#cbd5e1', fontSize: 13, background: '#f8fafc' }}>{ph}</div>
              ))}
            </div>
            {['Email Address'].map(ph => (
              <div key={ph} style={{ border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', marginBottom: 10, color: '#cbd5e1', fontSize: 13, background: '#f8fafc' }}>{ph}</div>
            ))}
            <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', marginBottom: 10, color: '#cbd5e1', fontSize: 13, height: 64, background: '#f8fafc' }}>Message…</div>
            <div style={{ background: orange, borderRadius: 9, padding: '13px 0', textAlign: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>Send Inquiry →</div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
           FOOTER
      ════════════════════════════════════════ */}
      <SectionBanner label="Footer" id="ew-footer" />
      <div style={{ background: navy, padding: '40px 40px 20px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 32, marginBottom: 28 }}>
            <div>
              <EF value={draft.footer.brandName} onChange={up('footer.brandName')} fontSize={17} fontWeight={900} color="#fff" style={{ letterSpacing: '0.1em', display: 'block', marginBottom: 10 }} />
              <EF value={draft.footer.tagline} onChange={up('footer.tagline')} multiline fontSize={13} color="rgba(255,255,255,0.55)" rows={3} style={{ lineHeight: 1.6 }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 14, marginBottom: 12 }}>Quick Links</div>
              {['About', 'Products', 'Brands', 'Contact'].map(l => <div key={l} style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 6 }}>{l}</div>)}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 14, marginBottom: 12 }}>Products</div>
              {['Flat Products', 'Tubular', 'Structural', 'Roofing'].map(l => <div key={l} style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 6 }}>{l}</div>)}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 14, marginBottom: 12 }}>Contact</div>
              <EF value={draft.footer.presentedPhone} onChange={up('footer.presentedPhone')} fontSize={13} color="rgba(255,255,255,0.65)" style={{ marginBottom: 6, display: 'block' }} />
              <EF value={draft.footer.presentedEmail} onChange={up('footer.presentedEmail')} fontSize={13} color="rgba(255,255,255,0.65)" style={{ marginBottom: 6, display: 'block' }} />
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 8 }}>Presented by:</div>
              <EF value={draft.footer.presentedBy} onChange={up('footer.presentedBy')} fontSize={14} fontWeight={600} color="#fff" />
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
            <EF value={draft.footer.copyright} onChange={up('footer.copyright')} fontSize={12} color="rgba(255,255,255,0.35)" style={{ textAlign: 'center', display: 'block' }} />
          </div>
        </div>
      </div>

      {/* Bottom publish bar */}
      <div style={{ background: '#0d1b2e', padding: '24px 48px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, borderTop: '1px solid #1e2d42', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <PublishStatus saved={saved} dark />
        <button onClick={publish} disabled={saved === 'saving'} style={{ background: saved === 'saved' ? '#22c55e' : 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 44px', fontWeight: 700, fontSize: 14, cursor: saved === 'saving' ? 'wait' : 'pointer', transition: 'background 0.2s', animation: !saved || saved === null ? 'ns-pulse 2.5s ease-in-out infinite' : 'none', boxShadow: '0 6px 20px rgba(249,115,22,0.35)' }}>
          {saved === 'saving' ? 'Publishing…' : saved === 'saved' ? '✓ Published!' : 'Publish Changes'}
        </button>
        <a href="/" target="_blank" rel="noopener" style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', borderRadius: 10, fontSize: 13, fontWeight: 500, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <ExternalLink size={13} /> View Site
        </a>
      </div>
    </div>
  );
}

/* ─── Main Admin Dashboard ─── */
export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [leads, setLeadsState] = useState([]);
  const [customers, setCustomersState] = useState([]);
  const [draft, setDraft] = useState(null);
  const [pubSaved, setPubSaved] = useState(false);

  useEffect(() => {
    fetch('/api/leads')
      .then(r => r.json())
      .then(data => setLeadsState(Array.isArray(data) ? data : []))
      .catch(() => setLeadsState(stored(LEADS_KEY, [])));
    setCustomersState(stored(CUSTOMERS_KEY, []));
    setDraft(getSiteContent());
  }, []);

  const saveLeads = useCallback((l) => { setLeadsState(l); }, []);
  const saveCustomers = useCallback((c) => { setCustomersState(c); localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(c)); }, []);

  const publishContent = useCallback(async () => {
    setPubSaved('saving');
    // Update local preview immediately
    setSiteContent(draft);
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (data.ok) {
        setPubSaved('saved');
      } else if (data.error === 'DB_NOT_CONFIGURED') {
        setPubSaved('no_kv');
      } else {
        console.error('Publish error:', data.error);
        setPubSaved('error');
      }
    } catch {
      setPubSaved('error');
    }
    setTimeout(() => setPubSaved(null), 4000);
  }, [draft]);

  const updateDraft = useCallback((path, value) => {
    setDraft(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        if (obj[keys[i]] === undefined) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  }, []);

  if (!draft) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', fontFamily: 'system-ui, sans-serif', color: '#64748b', fontSize: 16 }}>Loading admin panel…</div>;
  }

  const navItems = [
    { id: 'overview',  label: 'Overview',     icon: <LayoutDashboard size={15} /> },
    { id: 'leads',     label: 'Leads',        icon: <Users size={15} />,       count: leads.length },
    { id: 'customers', label: 'Customers',    icon: <UserCheck size={15} />,   count: customers.length },
    { id: 'companies', label: 'Companies',    icon: <Building2 size={15} /> },
    { id: 'products',  label: 'Products',     icon: <Package size={15} /> },
    { id: 'branding',  label: 'Branding',     icon: <Layers size={15} /> },
    { id: 'theme',     label: 'Theme',        icon: <Palette size={15} /> },
    { id: 'website',   label: 'Edit Website', icon: <Pencil size={15} /> },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes ns-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(249,115,22,0.45); }
          55% { box-shadow: 0 0 0 9px rgba(249,115,22,0); }
        }
        @keyframes ns-wobble {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          20% { transform: translateX(-4px) rotate(-3deg); }
          40% { transform: translateX(4px) rotate(3deg); }
          60% { transform: translateX(-2px) rotate(-1.5deg); }
          80% { transform: translateX(2px) rotate(1.5deg); }
        }
        @keyframes ns-bar {
          0%   { width: 0%; opacity: 1; }
          60%  { width: 82%; }
          85%  { width: 96%; }
          100% { width: 100%; opacity: 0; }
        }
        @keyframes ns-count {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ns-sidebar-btn:hover:not([data-active="true"]) {
          background: rgba(255,255,255,0.045) !important;
          color: rgba(255,255,255,0.8) !important;
        }
        .ns-viewsite:hover { border-color: rgba(255,255,255,0.28) !important; color: rgba(255,255,255,0.75) !important; }
        .ns-issue:hover { animation: ns-wobble 0.45s ease forwards; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}>

        {/* ═══════════════ SIDEBAR ═══════════════ */}
        <aside style={{ width: 220, background: '#0d1b2e', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100, borderRight: '1px solid #1e2d42' }}>

          {/* Logo */}
          <div style={{ padding: '18px 14px 16px', borderBottom: '1px solid #1e2d42', display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #f97316, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 19, color: '#fff', fontFamily: "'Barlow Condensed', system-ui, sans-serif", flexShrink: 0, boxShadow: '0 3px 10px rgba(249,115,22,0.45)' }}>N</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13.5, color: '#fff', letterSpacing: '0.13em', fontFamily: "'Barlow Condensed', system-ui, sans-serif" }}>NAMO STEEL</div>
              <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.22em', marginTop: 2 }}>ADMIN PANEL</div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
            {navItems.map((item, idx) => {
              const isActive = tab === item.id;
              const isWebsite = item.id === 'website';
              return (
                <div key={item.id}>
                  {idx === 5 && <div style={{ height: 1, background: '#1e2d42', margin: '8px 4px 10px' }} />}
                  <button
                    className="ns-sidebar-btn"
                    data-active={String(isActive)}
                    onClick={() => setTab(item.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                      width: '100%', border: 'none', borderRadius: 8, cursor: 'pointer',
                      textAlign: 'left', marginBottom: 2,
                      background: isActive && isWebsite ? 'linear-gradient(135deg, #f97316, #ea580c)'
                                : isActive ? 'rgba(249,115,22,0.1)'
                                : 'transparent',
                      color: isActive && isWebsite ? '#fff'
                            : isActive ? '#f97316'
                            : 'rgba(255,255,255,0.42)',
                      borderLeft: !isWebsite ? `2.5px solid ${isActive ? '#f97316' : 'transparent'}` : '2.5px solid transparent',
                      transition: 'all 0.15s',
                      boxShadow: isActive && isWebsite ? '0 4px 14px rgba(249,115,22,0.35)' : 'none',
                    }}
                  >
                    <span style={{ width: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, flex: 1, letterSpacing: '0.01em' }}>{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span style={{ background: isActive && !isWebsite ? '#f97316' : 'rgba(255,255,255,0.09)', color: isActive && !isWebsite ? '#fff' : 'rgba(255,255,255,0.4)', borderRadius: 99, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{item.count}</span>
                    )}
                  </button>
                </div>
              );
            })}
          </nav>

          {/* Bottom */}
          <div style={{ padding: '10px 8px 16px', borderTop: '1px solid #1e2d42' }}>
            {/* Issues Badge */}
            <div className="ns-issue" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 8, padding: '9px 12px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', transition: 'all 0.15s' }}>
              <AlertTriangle size={13} color="#ef4444" />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', flex: 1 }}>18 Issues</span>
              <span style={{ fontSize: 13, color: 'rgba(239,68,68,0.6)', fontWeight: 700 }}>✕</span>
            </div>

            <a href="/" target="_blank" rel="noopener" className="ns-viewsite" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 8, color: 'rgba(255,255,255,0.38)', textDecoration: 'none', fontSize: 13, fontWeight: 500, border: '1px solid rgba(255,255,255,0.07)', transition: 'all 0.15s', marginBottom: 8 }}>
              <ExternalLink size={13} />
              <span>View Website</span>
            </a>
            <div style={{ fontSize: 10, color: '#334155', textAlign: 'center', letterSpacing: '0.08em', fontWeight: 600 }}>v2</div>
          </div>
        </aside>

        {/* ═══════════════ MAIN CONTENT ═══════════════ */}
        <main style={{ marginLeft: 220, flex: 1, minHeight: '100vh', padding: tab === 'website' ? 0 : '32px 36px', boxSizing: 'border-box', background: tab === 'website' ? '#f0f2f5' : '#f5f7fa', minWidth: 0 }}>
          {tab === 'overview'  && <OverviewTab leads={leads} customers={customers} />}
          {tab === 'leads'     && <LeadsTab leads={leads} saveLeads={saveLeads} />}
          {tab === 'customers' && <CustomersTab customers={customers} saveCustomers={saveCustomers} />}
          {tab === 'companies' && <CompaniesTab />}
          {tab === 'branding'  && <BrandingTab draft={draft} updateDraft={updateDraft} publish={publishContent} saved={pubSaved} />}
          {tab === 'theme'     && <ThemeTab draft={draft} updateDraft={updateDraft} publish={publishContent} saved={pubSaved} />}
          {tab === 'products'  && <ProductsAdminTab draft={draft} updateDraft={updateDraft} />}
          {tab === 'website'   && <EditWebsiteTab draft={draft} updateDraft={updateDraft} publish={publishContent} saved={pubSaved} />}
        </main>
      </div>
    </>
  );
}
