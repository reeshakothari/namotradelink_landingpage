'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { getSiteContent, setSiteContent } from '@/lib/siteContent';

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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 12, padding: '28px 32px', minWidth: 340, maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, color: '#1a2a4a' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#999', lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const FInput = ({ label, value, onChange, type = 'text', placeholder, required, multiline, rows = 3 }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>}
    {multiline
      ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} required={required} style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
      : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
    }
  </div>
);

const FSelect = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>}
    <select value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', background: '#fff' }}>
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
    { label: 'Total Leads', value: leads.length, icon: '◈', color: '#3b82f6', sub: `${inbound.length} inbound · ${outbound.length} outbound` },
    { label: 'Customers', value: customers.length, icon: '◉', color: '#22c55e', sub: 'Active accounts' },
    { label: 'Pending Follow-up', value: pending.length, icon: '⏳', color: '#f59e0b', sub: 'Need attention' },
    { label: 'Converted', value: converted.length, icon: '✓', color: '#8b5cf6', sub: 'Closed deals' },
  ];
  return (
    <div>
      <h2 style={{ color: '#1a2a4a', marginBottom: 24, fontSize: 24 }}>Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderLeft: `4px solid ${s.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#1a2a4a', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{s.sub}</div>
              </div>
              <span style={{ fontSize: 28, color: s.color + '44' }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>
      {leads.length > 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 16px', color: '#1a2a4a', fontSize: 16 }}>Recent Leads</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '2px solid #f1f5f9' }}>
              {['Name', 'Phone', 'Type', 'Status', 'Date'].map(h => <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {leads.slice().reverse().slice(0, 6).map(l => (
                <tr key={l.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1a2a4a', fontSize: 14 }}>{l.name}</td>
                  <td style={{ padding: '10px 12px', color: '#64748b', fontSize: 14 }}>{l.phone}</td>
                  <td style={{ padding: '10px 12px' }}><Badge text={l.type} color={l.type} /></td>
                  <td style={{ padding: '10px 12px' }}>{(() => { const s = STATUS_STYLE[l.status] || STATUS_STYLE.new; return <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 99, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{s.label}</span>; })()}</td>
                  <td style={{ padding: '10px 12px', color: '#94a3b8', fontSize: 13 }}>{l.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, padding: 48, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>◈</div>
          <h3 style={{ color: '#1a2a4a', margin: '0 0 8px' }}>No leads yet</h3>
          <p style={{ color: '#64748b', margin: 0 }}>Go to the Leads tab to add your first lead.</p>
        </div>
      )}
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
        <h2 style={{ color: '#1a2a4a', margin: 0, fontSize: 24 }}>Lead Management</h2>
        <button onClick={openAdd} style={{ background: '#e87722', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>+ Add Lead</button>
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
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
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
        <h2 style={{ color: '#1a2a4a', margin: 0, fontSize: 24 }}>Customer List</h2>
        <button onClick={() => { setForm({ name: '', company: '', phone: '', city: '', products: '', notes: '' }); setEditId(null); setShowModal(true); }} style={{ background: '#e87722', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>+ Add Customer</button>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
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
        <h2 style={{ color: '#1a2a4a', margin: 0, fontSize: 24 }}>Product List</h2>
        <button onClick={addProduct} style={{ background: '#e87722', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>+ Add Product</button>
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
  const [hov, setHov] = useState(false);
  const base = { background: 'transparent', border: '1.5px dashed transparent', outline: 'none', padding: '2px 5px', borderRadius: 5, fontFamily: 'inherit', color, fontSize, fontWeight, width: '100%', resize: multiline ? 'vertical' : 'none', transition: 'all 0.15s', boxSizing: 'border-box', lineHeight: 'inherit', ...style };
  const hovered = { borderColor: 'rgba(232,119,34,0.65)', background: 'rgba(232,119,34,0.06)' };
  const props = { value, onChange: e => onChange(e.target.value), placeholder, onMouseEnter: () => setHov(true), onMouseLeave: () => setHov(false), style: { ...base, ...(hov ? hovered : {}) } };
  return multiline ? <textarea rows={rows} {...props} /> : <input {...props} />;
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
function SectionBanner({ label }) {
  return (
    <div style={{ background: '#fff7f0', borderTop: '2px solid #e87722', borderBottom: '1px solid #fde8d4', padding: '6px 40px', display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e87722', display: 'inline-block', flexShrink: 0 }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: '#e87722', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</span>
      <span style={{ fontSize: 11, color: '#f59e0b', marginLeft: 'auto' }}>✎ Click any text or image to edit</span>
    </div>
  );
}

/* ─── Theme Tab ─── */
const PRESETS = [
  { name: 'Steel Orange',   primary: '#e87722', primaryDark: '#c96310', secondary: '#1a2a4a', secondaryLight: '#243557' },
  { name: 'Royal Blue',     primary: '#2563eb', primaryDark: '#1d4ed8', secondary: '#0f172a', secondaryLight: '#1e293b' },
  { name: 'Forest Green',   primary: '#16a34a', primaryDark: '#15803d', secondary: '#14532d', secondaryLight: '#166534' },
  { name: 'Deep Purple',    primary: '#7c3aed', primaryDark: '#6d28d9', secondary: '#1e1b4b', secondaryLight: '#312e81' },
  { name: 'Crimson Red',    primary: '#dc2626', primaryDark: '#b91c1c', secondary: '#1c1917', secondaryLight: '#292524' },
  { name: 'Teal',           primary: '#0d9488', primaryDark: '#0f766e', secondary: '#134e4a', secondaryLight: '#115e59' },
  { name: 'Amber Gold',     primary: '#d97706', primaryDark: '#b45309', secondary: '#1c1917', secondaryLight: '#292524' },
  { name: 'Slate Dark',     primary: '#475569', primaryDark: '#334155', secondary: '#0f172a', secondaryLight: '#1e293b' },
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
        <h2 style={{ color: '#1a2a4a', margin: 0, fontSize: 24 }}>Company Profiles</h2>
        <button onClick={openAdd} style={{ background: '#e87722', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>+ Add Company</button>
      </div>
      <p style={{ color: '#64748b', fontSize: 13, marginBottom: 24 }}>Each company gets a unique URL to access their own portal.</p>

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

  const up = path => val => updateDraft(path, val);


  const updateListItem = (path, i, field, val) => {
    const arr = path.split('.').reduce((o, k) => o[k], draft);
    updateDraft(path, arr.map((it, j) => j === i ? { ...it, [field]: val } : it));
  };

  const catLabels = { flat: 'Flat Products', tubular: 'Tubular Products', structural: 'Structural Steel', roofing: 'Roofing & Sheets', accessories: 'Accessories & Others' };

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

      {/* ── Sticky Publish Bar ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: '#1a2a4a', padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 800, color: '#fff', fontSize: 15, letterSpacing: '0.05em' }}>EDIT WEBSITE</span>
          <span style={{ background: 'rgba(232,119,34,0.2)', color: '#e87722', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>Live Edit</span>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>Scroll to edit every section</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <PublishStatus saved={saved} />
          <a href="/" target="_blank" style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)' }}>↗ View Site</a>
          <button onClick={publish} disabled={saved === 'saving'} style={{ background: saved === 'saved' ? '#22c55e' : '#e87722', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 24px', fontWeight: 700, fontSize: 14, cursor: saved === 'saving' ? 'wait' : 'pointer', boxShadow: '0 2px 8px rgba(232,119,34,0.4)', transition: 'background 0.2s' }}>
            {saved === 'saving' ? 'Publishing…' : saved === 'saved' ? '✓ Published!' : 'Publish Changes'}
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════
           HERO SECTION
      ════════════════════════════════════════ */}
      <SectionBanner label="Hero Section" />
      <div style={{ background: 'linear-gradient(135deg, #1a2a4a 0%, #0f1d33 100%)', padding: '72px 40px 56px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(232,119,34,0.06)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 700 }}>
          <div style={{ marginBottom: 16 }}>
            <EF value={draft.hero.badge} onChange={up('hero.badge')} fontSize={12} fontWeight={700} color="#e87722" style={{ letterSpacing: '0.15em', textTransform: 'uppercase', display: 'inline-block', width: 'auto', background: 'rgba(232,119,34,0.12)', borderRadius: 20, padding: '4px 14px' }} />
          </div>
          <EF value={draft.hero.title} onChange={up('hero.title')} multiline fontSize={38} fontWeight={800} color="#fff" style={{ lineHeight: 1.15, marginBottom: 14, display: 'block' }} rows={2} />
          <EF value={draft.hero.subtitle} onChange={up('hero.subtitle')} fontSize={17} color="rgba(255,255,255,0.65)" style={{ marginBottom: 24, display: 'block' }} />
          <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
            <div style={{ background: '#e87722', borderRadius: 8, padding: '10px 20px', display: 'flex', gap: 8, alignItems: 'center' }}>
              <EF value={draft.hero.phone} onChange={up('hero.phone')} fontSize={14} fontWeight={700} color="#fff" style={{ width: 'auto' }} />
            </div>
            <div style={{ border: '2px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '10px 20px' }}>
              <EF value={draft.hero.ctaText} onChange={up('hero.ctaText')} fontSize={14} fontWeight={600} color="#fff" style={{ width: 'auto' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 40, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {draft.hero.stats.map((s, i) => (
              <div key={i}>
                <EF value={s.num} onChange={val => updateDraft('hero.stats', draft.hero.stats.map((st, j) => j === i ? { ...st, num: val } : st))} fontSize={26} fontWeight={800} color="#e87722" style={{ width: 80 }} />
                <EF value={s.label} onChange={val => updateDraft('hero.stats', draft.hero.stats.map((st, j) => j === i ? { ...st, label: val } : st))} fontSize={12} color="rgba(255,255,255,0.55)" style={{ width: 100 }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
           ABOUT SECTION
      ════════════════════════════════════════ */}
      <SectionBanner label="About Section" />
      <div style={{ background: '#fff', padding: '56px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, maxWidth: 1000, margin: '0 auto' }}>
          <div>
            <EF value={draft.about.sectionLabel} onChange={up('about.sectionLabel')} fontSize={12} fontWeight={700} color="#e87722" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, display: 'block' }} />
            <EF value={draft.about.heading} onChange={up('about.heading')} fontSize={26} fontWeight={700} color="#1a2a4a" style={{ marginBottom: 16, display: 'block', lineHeight: 1.3 }} multiline rows={2} />
            <EF value={draft.about.description} onChange={up('about.description')} multiline fontSize={14} color="#64748b" style={{ lineHeight: 1.7, marginBottom: 20, display: 'block' }} rows={4} />
            {draft.about.checklist.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'center' }}>
                <span style={{ color: '#e87722', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>✔</span>
                <EF value={item} onChange={val => updateDraft('about.checklist', draft.about.checklist.map((c, j) => j === i ? val : c))} fontSize={14} color="#334155" fontWeight={500} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fff7f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#e87722', fontSize: 16 }}>👁</span>
                </div>
                <span style={{ fontWeight: 700, color: '#1a2a4a', fontSize: 15 }}>Vision</span>
              </div>
              <EF value={draft.about.vision} onChange={up('about.vision')} multiline fontSize={13} color="#64748b" rows={3} style={{ lineHeight: 1.6 }} />
            </div>
            <div style={{ background: '#1a2a4a', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(232,119,34,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#e87722', fontSize: 16 }}>🎯</span>
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
      <SectionBanner label="Why Choose Us" />
      <div style={{ background: '#1a2a4a', padding: '56px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <EF value={draft.why.sectionLabel} onChange={up('why.sectionLabel')} fontSize={12} fontWeight={700} color="#e87722" style={{ textTransform: 'uppercase', letterSpacing: '0.12em', textAlign: 'center', marginBottom: 10, display: 'block' }} />
            <EF value={draft.why.heading} onChange={up('why.heading')} fontSize={26} fontWeight={700} color="#fff" style={{ textAlign: 'center', display: 'block', lineHeight: 1.3 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {draft.why.items.map((item, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 16px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(232,119,34,0.15)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#e87722', fontSize: 20 }}>⭐</span>
                </div>
                <EF value={item.title} onChange={val => updateListItem('why.items', i, 'title', val)} fontSize={13} fontWeight={600} color="#fff" style={{ textAlign: 'center', lineHeight: 1.4 }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
           CERTIFICATIONS
      ════════════════════════════════════════ */}
      <SectionBanner label="Certifications" />
      <div style={{ background: '#fff', padding: '56px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <EF value={draft.certifications.sectionLabel} onChange={up('certifications.sectionLabel')} fontSize={12} fontWeight={700} color="#e87722" style={{ textTransform: 'uppercase', letterSpacing: '0.12em', textAlign: 'center', display: 'block', marginBottom: 10 }} />
            <EF value={draft.certifications.heading} onChange={up('certifications.heading')} fontSize={26} fontWeight={700} color="#1a2a4a" style={{ textAlign: 'center', display: 'block' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {draft.certifications.items.map((c, i) => (
              <div key={i} style={{ background: '#f8fafc', borderRadius: 14, padding: 24, border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontSize: 52, fontWeight: 900, color: '#f1f5f9', position: 'absolute', top: 8, right: 16, lineHeight: 1, userSelect: 'none' }}>{c.num}</div>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: '#fff7f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, border: '1px solid #fde8d4' }}>
                  <span style={{ color: '#e87722', fontSize: 22 }}>🏅</span>
                </div>
                <EF value={c.title} onChange={val => updateListItem('certifications.items', i, 'title', val)} fontSize={14} fontWeight={600} color="#1a2a4a" style={{ lineHeight: 1.4 }} multiline rows={2} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
           SERVICE EXCELLENCE
      ════════════════════════════════════════ */}
      <SectionBanner label="Service Excellence" />
      <div style={{ background: '#f8fafc', padding: '56px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
          <div>
            <EF value={draft.services.sectionLabel} onChange={up('services.sectionLabel')} fontSize={12} fontWeight={700} color="#e87722" style={{ textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: 10 }} />
            <EF value={draft.services.heading} onChange={up('services.heading')} fontSize={26} fontWeight={700} color="#1a2a4a" style={{ display: 'block', marginBottom: 28, lineHeight: 1.3 }} multiline rows={2} />
            {draft.services.items.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 20, alignItems: 'flex-start' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#e87722', flexShrink: 0, marginTop: 6 }} />
                <div style={{ flex: 1 }}>
                  <EF value={s.title} onChange={val => updateListItem('services.items', i, 'title', val)} fontSize={15} fontWeight={700} color="#1a2a4a" />
                  <EF value={s.desc} onChange={val => updateListItem('services.items', i, 'desc', val)} multiline fontSize={13} color="#64748b" rows={2} style={{ lineHeight: 1.6, marginTop: 4 }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 220, height: 220, borderRadius: '50%', border: '3px dashed #e87722', opacity: 0.4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 150, height: 150, borderRadius: '50%', background: '#1a2a4a22' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
           PRODUCTS (with image editing!)
      ════════════════════════════════════════ */}
      <SectionBanner label="Products Section — Hover image to change URL" />
      <div style={{ background: '#fff', padding: '56px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <EF value={draft.products.sectionLabel} onChange={up('products.sectionLabel')} fontSize={12} fontWeight={700} color="#e87722" style={{ textTransform: 'uppercase', letterSpacing: '0.12em', textAlign: 'center', display: 'block', marginBottom: 10 }} />
            <EF value={draft.products.heading} onChange={up('products.heading')} fontSize={26} fontWeight={700} color="#1a2a4a" style={{ textAlign: 'center', display: 'block' }} />
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
      <SectionBanner label="Brands Section" />
      <div style={{ background: 'linear-gradient(135deg, #1a2a4a, #2a3c5a)', padding: '56px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Brands We Deal</p>
          <h2 style={{ color: '#fff', fontSize: 26, fontWeight: 700, marginBottom: 28, marginTop: 0 }}>Partnered with Industry's Best</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
            {draft.brands.map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'rgba(255,255,255,0.08)', borderRadius: 8 }}>
                <EF value={b} onChange={val => updateDraft('brands', draft.brands.map((br, j) => j === i ? val : br))} fontSize={12} fontWeight={700} color="#fff" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', minWidth: 80, textAlign: 'center', padding: '6px 10px' }} />
                <button onClick={() => updateDraft('brands', draft.brands.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 16, padding: '0 6px 0 0', lineHeight: 1 }}>×</button>
              </div>
            ))}
            <button onClick={() => updateDraft('brands', [...draft.brands, 'NEW BRAND'])} style={{ background: '#e87722', border: 'none', borderRadius: 8, color: '#fff', padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>+ Add</button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
           CASE STUDIES
      ════════════════════════════════════════ */}
      <SectionBanner label="Case Studies" />
      <div style={{ background: '#f8fafc', padding: '56px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <p style={{ color: '#e87722', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Case Studies</p>
            <h2 style={{ color: '#1a2a4a', fontSize: 26, fontWeight: 700, margin: 0 }}>Real Projects, Real Results</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {draft.caseStudies.map((c, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0', position: 'relative' }}>
                <span style={{ fontSize: 40, fontWeight: 900, color: '#f1f5f9', position: 'absolute', top: 10, right: 16, lineHeight: 1 }}>{c.num}</span>
                <EF value={c.title} onChange={val => updateListItem('caseStudies', i, 'title', val)} fontSize={16} fontWeight={700} color="#1a2a4a" style={{ marginBottom: 4 }} />
                <EF value={c.client} onChange={val => updateListItem('caseStudies', i, 'client', val)} fontSize={12} fontWeight={600} color="#e87722" style={{ marginBottom: 6 }} />
                <EF value={c.project} onChange={val => updateListItem('caseStudies', i, 'project', val)} fontSize={13} fontWeight={600} color="#334155" style={{ marginBottom: 6 }} />
                <EF value={c.desc} onChange={val => updateListItem('caseStudies', i, 'desc', val)} multiline fontSize={12} color="#94a3b8" rows={3} style={{ lineHeight: 1.6 }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
           CLIENTS
      ════════════════════════════════════════ */}
      <SectionBanner label="Clients Section" />
      <div style={{ background: '#1a2a4a', padding: '56px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#e87722', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Our Clients</p>
          <h2 style={{ color: '#fff', fontSize: 26, fontWeight: 700, marginBottom: 28, marginTop: 0 }}>Clients Through BNI</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
            {draft.clients.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
                <EF value={c} onChange={val => updateDraft('clients', draft.clients.map((cl, j) => j === i ? val : cl))} fontSize={13} fontWeight={600} color="#fff" style={{ padding: '6px 12px', minWidth: 120, textAlign: 'center' }} />
                <button onClick={() => updateDraft('clients', draft.clients.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 16, padding: '0 8px 0 0', lineHeight: 1 }}>×</button>
              </div>
            ))}
            <button onClick={() => updateDraft('clients', [...draft.clients, 'New Client'])} style={{ background: '#e87722', border: 'none', borderRadius: 8, color: '#fff', padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>+ Add</button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
           CONTACT
      ════════════════════════════════════════ */}
      <SectionBanner label="Contact Section" />
      <div style={{ background: '#0f1d33', padding: '56px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
          <div>
            <EF value={draft.contact.sectionLabel} onChange={up('contact.sectionLabel')} fontSize={12} fontWeight={700} color="#e87722" style={{ textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: 10 }} />
            <EF value={draft.contact.heading} onChange={up('contact.heading')} fontSize={22} fontWeight={700} color="#fff" style={{ display: 'block', marginBottom: 12, lineHeight: 1.3 }} multiline rows={2} />
            <EF value={draft.contact.subheading} onChange={up('contact.subheading')} multiline fontSize={14} color="rgba(255,255,255,0.6)" style={{ lineHeight: 1.7, marginBottom: 24, display: 'block' }} rows={3} />
            {[{ label: 'Phone', key: 'phone', icon: '📱' }, { label: 'Email', key: 'email', icon: '✉' }, { label: 'Business', key: 'businessType', icon: '🏭' }].map(({ label, key, icon }) => (
              <div key={key} style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'center', background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 14px' }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
                  <EF value={draft.contact[key]} onChange={up(`contact.${key}`)} fontSize={14} color="#fff" fontWeight={500} />
                </div>
              </div>
            ))}
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 4 }}>📍 Address</div>
              <EF value={draft.contact.address} onChange={up('contact.address')} multiline fontSize={13} color="#fff" rows={2} />
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 24, border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ color: '#fff', margin: '0 0 16px', fontSize: 16 }}>Contact Form Preview</h3>
            {['Your Name', 'Phone Number', 'Email Address'].map(ph => (
              <div key={ph} style={{ border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '10px 14px', marginBottom: 10, color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>{ph}</div>
            ))}
            <div style={{ border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '10px 14px', marginBottom: 10, color: 'rgba(255,255,255,0.3)', fontSize: 13, height: 70 }}>Message…</div>
            <div style={{ background: '#e87722', borderRadius: 8, padding: '12px 0', textAlign: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>Send Inquiry →</div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
           FOOTER
      ════════════════════════════════════════ */}
      <SectionBanner label="Footer" />
      <div style={{ background: '#0d1b30', padding: '40px 40px 20px' }}>
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
      <div style={{ background: '#0d1b30', padding: '28px 40px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14 }}>
        <PublishStatus saved={saved} dark />
        <button onClick={publish} disabled={saved === 'saving'} style={{ background: saved === 'saved' ? '#22c55e' : '#e87722', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 48px', fontWeight: 700, fontSize: 16, cursor: saved === 'saving' ? 'wait' : 'pointer', boxShadow: '0 4px 16px rgba(232,119,34,0.35)', transition: 'background 0.2s' }}>
          {saved === 'saving' ? 'Publishing…' : saved === 'saved' ? '✓ Published!' : 'Publish Changes'}
        </button>
        <a href="/" target="_blank" style={{ padding: '14px 20px', background: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)' }}>↗ View Site</a>
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
    { id: 'overview',   label: 'Overview',     emoji: '▦' },
    { id: 'leads',      label: 'Leads',        emoji: '◈', count: leads.length },
    { id: 'customers',  label: 'Customers',    emoji: '◉', count: customers.length },
    { id: 'companies',  label: 'Companies',    emoji: '🏢' },
    { id: 'products',   label: 'Products',     emoji: '⬡' },
    { id: 'theme',      label: 'Theme',        emoji: '🎨' },
    { id: 'website',    label: 'Edit Website', emoji: '✎' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif", background: '#f1f5f9' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: '#1a2a4a', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100, boxShadow: '4px 0 24px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '28px 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontWeight: 900, fontSize: 18, color: '#fff', letterSpacing: '0.08em' }}>NAMO</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 2 }}>Admin Panel</div>
        </div>
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', background: tab === item.id ? 'rgba(232,119,34,0.18)' : 'transparent', color: tab === item.id ? '#e87722' : 'rgba(255,255,255,0.65)' }}>
              <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.emoji}</span>
              <span style={{ fontWeight: tab === item.id ? 700 : 500, fontSize: 14, flex: 1 }}>{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span style={{ background: tab === item.id ? '#e87722' : 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: 99, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{item.count}</span>
              )}
            </button>
          ))}
        </nav>
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <a href="/" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 14, fontWeight: 500, border: '1px solid rgba(255,255,255,0.1)' }}>
            <span>↗</span> View Website
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: 220, flex: 1, padding: tab === 'website' ? 0 : '32px 36px', minHeight: '100vh', boxSizing: 'border-box' }}>
        {tab === 'overview' && <OverviewTab leads={leads} customers={customers} />}
        {tab === 'leads' && <LeadsTab leads={leads} saveLeads={saveLeads} />}
        {tab === 'customers' && <CustomersTab customers={customers} saveCustomers={saveCustomers} />}
        {tab === 'companies' && <CompaniesTab />}
        {tab === 'theme' && <ThemeTab draft={draft} updateDraft={updateDraft} publish={publishContent} saved={pubSaved} />}
        {tab === 'products' && <ProductsAdminTab draft={draft} updateDraft={updateDraft} />}
        {tab === 'website' && <EditWebsiteTab draft={draft} updateDraft={updateDraft} publish={publishContent} saved={pubSaved} />}
      </main>
    </div>
  );
}
