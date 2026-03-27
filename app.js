// ============================================================
// AGROVET BUSINESS MANAGEMENT SYSTEM
// Frontend fully connected to Flask backend
// API: https://jmkali.alwaysdata.net/
// ============================================================

const { useState, useEffect, useCallback } = React;

// ── Mobile detection hook ──
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

const API_BASE = 'https://jmkali.alwaysdata.net';

// ── API helper ────────────────────────────────────────────────
async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',   // send session cookie cross-origin
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// ── Formatting helpers ────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 2 }).format(n || 0);
const today = () => new Date().toISOString().split('T')[0];

// ── Inline SVG icons ──────────────────────────────────────────
const Icon = ({ name, size = 18 }) => {
  const icons = {
    dashboard: <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>,
    inventory: <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>,
    sales:     <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>,
    reports:   <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>,
    expenses:  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>,
    alert:     <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>,
    plus:      <path d="M12 4v16m8-8H4"/>,
    edit:      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>,
    trash:     <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>,
    check:     <path d="M5 13l4 4L19 7"/>,
    x:         <path d="M6 18L18 6M6 6l12 12"/>,
    printer:   <path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>,
    restock:   <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>,
    users:     <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>,
    search:    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>,
    warning:   <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>,
    receipt:   <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>,
    spinner:   <><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0110 10" strokeLinecap="round"/></>,
    logout:    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

// ── Spinner ───────────────────────────────────────────────────
const Spinner = ({ size = 20, color = '#4caf50' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
       strokeWidth="2" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
    <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/>
    <path d="M12 2a10 10 0 0110 10"/>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </svg>
);

// ============================================================
// LOGIN SCREEN
// ============================================================
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleLogin = async () => {
    if (!username || !password) { setError('Enter username and password'); return; }
    setLoading(true); setError('');
    try {
      const data = await api('/api/auth/login', {
        method: 'POST',
        body: { username, password },
      });
      onLogin(data.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === 'Enter') handleLogin(); };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#e8f5e9,#f1f8e9)',
                  display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Lato',sans-serif" }}>
      <div style={{ background:'#fff', borderRadius:16, boxShadow:'0 20px 60px rgba(0,0,0,0.12)',
                    padding:40, width:380, maxWidth:'95vw' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:40, marginBottom:8 }}>🌱</div>
          <h1 style={{ fontSize:22, fontWeight:800, color:'#1a3a2a', margin:0 }}>Agrovet Manager</h1>
          <p style={{ color:'#888', fontSize:13, margin:'6px 0 0' }}>Sign in to your account</p>
        </div>

        {error && (
          <div style={{ background:'#ffebee', color:'#c62828', padding:'10px 14px',
                        borderRadius:8, fontSize:13, marginBottom:16, display:'flex', gap:8, alignItems:'center' }}>
            <Icon name="warning" size={15}/> {error}
          </div>
        )}

        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:12, fontWeight:600, color:'#444', display:'block', marginBottom:5 }}>Username</label>
          <input value={username} onChange={e=>setUsername(e.target.value)} onKeyDown={handleKey}
                 placeholder="admin" autoFocus
                 style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1.5px solid #ddd',
                          fontSize:14, boxSizing:'border-box', outline:'none' }}/>
        </div>
        <div style={{ marginBottom:22 }}>
          <label style={{ fontSize:12, fontWeight:600, color:'#444', display:'block', marginBottom:5 }}>Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={handleKey}
                 placeholder="••••••••"
                 style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1.5px solid #ddd',
                          fontSize:14, boxSizing:'border-box', outline:'none' }}/>
        </div>
        <button onClick={handleLogin} disabled={loading}
                style={{ width:'100%', padding:'12px', background: loading ? '#a5d6a7' : '#4caf50',
                         color:'#fff', border:'none', borderRadius:10, cursor: loading ? 'not-allowed' : 'pointer',
                         fontSize:15, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          {loading ? <><Spinner size={18} color="#fff"/> Signing in…</> : 'Sign In'}
        </button>

        <div style={{ marginTop:18, background:'#f9f9f9', borderRadius:8, padding:'10px 14px', fontSize:12, color:'#888' }}>
          <strong>Demo accounts:</strong><br/>
          Admin: <code>admin</code> / <code>admin123</code><br/>
          Staff: <code>jane_attendant</code> / <code>jane123</code>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP  (requires login)
// ============================================================
function AgrovetApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab,   setActiveTab]   = useState('dashboard');
  const [inventory,   setInventory]   = useState([]);
  const [sales,       setSales]       = useState([]);
  const [expenses,    setExpenses]    = useState([]);
  const [restockExpenses, setRestockExpenses] = useState([]);
  const [users,       setUsers]       = useState([]);
  const [debts,       setDebts]       = useState([]);
  const [settings,    setSettings]    = useState({ debt_alert_days: '3' });
  const [categories,  setCategories]  = useState([]);
  const [businessInfo] = useState({ name: 'Macys Agrofeeds', location: 'Machakos, Kenya' });
  const [notification, setNotification] = useState(null);
  const [modal,  setModal]  = useState(null);
  const [loading, setLoading] = useState(false);

  // ── Notification helper ──────────────────────────────────
  const showNotif = useCallback((msg, type='success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  // ── Check existing session on mount ──────────────────────
  useEffect(() => {
    api('/api/auth/me')
      .then(d => { setCurrentUser(d.user); loadAll(); })
      .catch(() => {})
      .finally(() => setAuthChecked(true));
  }, []);

  // ── Load all data from backend ────────────────────────────
  const loadAll = async () => {
    setLoading(true);
    try {
      const [inv, sal, exp, usr, cats] = await Promise.all([
        api('/api/items'),
        api('/api/sales'),
        api('/api/expenses'),
        api('/api/users').catch(() => ({ users: [] })),
        api('/api/categories'),
      ]);
      setInventory(inv.items || []);
      setSales(sal.sales || []);
      // Split expenses by type
      const allExp = exp.expenses || [];
      setExpenses(allExp.filter(e => e.expense_type === 'personal' || !e.expense_type));
      setRestockExpenses(allExp.filter(e => e.expense_type === 'restock'));
      setUsers(usr.users || []);
      setCategories((cats.categories || []).map(c => c.name));
      const [dbt, sett] = await Promise.all([api('/api/debts'), api('/api/settings')]);
      setDebts(dbt.debts || []);
      setSettings(prev => ({ ...prev, ...sett }));
    } catch (e) {
      showNotif('Failed to load data: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (user) => { setCurrentUser(user); loadAll(); };

  const handleLogout = async () => {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setCurrentUser(null);
    setInventory([]); setSales([]); setExpenses([]); setRestockExpenses([]); setUsers([]);
  };

  // ── Inventory actions ─────────────────────────────────────
  const addInventoryItem = async (item) => {
    const data = await api('/api/items', { method:'POST', body: item });
    setInventory(prev => [...prev, data.item]);
    showNotif('Item added to inventory.');
  };

  const updateInventoryItem = async (updated) => {
    const data = await api(`/api/items/${updated.id}`, { method:'PUT', body: updated });
    setInventory(prev => prev.map(i => i.id === updated.id ? data.item : i));
    showNotif('Item updated.');
  };

  const deleteInventoryItem = async (itemId) => {
    await api(`/api/items/${itemId}`, { method:'DELETE' });
    setInventory(prev => prev.filter(i => i.id !== itemId));
    showNotif('Item deleted.');
  };

  const restock = async (itemId, qty) => {
    const data = await api(`/api/items/${itemId}/restock`, { method:'POST', body:{ quantity: qty } });
    setInventory(prev => prev.map(i => i.id === itemId ? data.item : i));
    showNotif(data.message);
  };

  const adjustStock = async (itemId, qty, reason) => {
    const data = await api(`/api/items/${itemId}/adjust`, { method:'POST', body:{ quantity: qty, reason } });
    setInventory(prev => prev.map(i => i.id === itemId ? data.item : i));
    showNotif(data.message);
  };

  // ── Sales actions ─────────────────────────────────────────
  const addDebt = async (data) => {
    const result = await api('/api/debts', { method:'POST', body: data });
    setDebts(prev => [...prev, result.debt]);
    showNotif('Debt recorded.');
  };
  const clearDebt = async (id) => {
    const result = await api(`/api/debts/${id}/clear`, { method:'POST' });
    setDebts(prev => prev.map(d => d.id===id ? result.debt : d));
    showNotif('Debt marked as cleared.');
  };
  const deleteDebt = async (id) => {
    await api(`/api/debts/${id}`, { method:'DELETE' });
    setDebts(prev => prev.filter(d => d.id!==id));
    showNotif('Debt deleted.');
  };
  const saveSettings = async (newSettings) => {
    await api('/api/settings', { method:'POST', body: newSettings });
    setSettings(prev => ({ ...prev, ...newSettings }));
    showNotif('Settings saved.');
  };

  const deleteSalesByDate = async (date) => {
    const data = await api(`/api/sales/by-date/${date}`, { method: 'DELETE' });
    setSales(prev => prev.filter(s => s.date !== date));
    showNotif(data.message, 'success');
  };

  const deleteSale = async (saleId) => {
    await api(`/api/sales/${saleId}`, { method: 'DELETE' });
    setSales(prev => prev.filter(s => s.id !== saleId));
    const inv = await api('/api/items');
    setInventory(inv.items || []);
    showNotif('Sale deleted and stock restored.');
  };

  const addSale = async (saleData) => {
    const data = await api('/api/sales', { method:'POST', body: saleData });
    setSales(prev => [data.sale, ...prev]);
    // Refresh inventory quantities after sale
    const inv = await api('/api/items');
    setInventory(inv.items || []);
    showNotif('Sale recorded successfully!');
    return data;
  };

  // ── Expense actions ───────────────────────────────────────
  const addExpense = async (exp) => {
    const data = await api('/api/expenses', { method:'POST', body: exp });
    if (data.expense.expense_type === 'restock') {
      setRestockExpenses(prev => [data.expense, ...prev]);
    } else {
      setExpenses(prev => [data.expense, ...prev]);
    }
    showNotif('Expense added.');
  };

  const deleteExpense = async (id, expense_type) => {
    await api(`/api/expenses/${id}`, { method:'DELETE' });
    if (expense_type === 'restock') {
      setRestockExpenses(prev => prev.filter(e => e.id !== id));
    } else {
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
    showNotif('Expense deleted.');
  };

  // ── Derived values ────────────────────────────────────────
  const lowStockItems        = inventory.filter(i => i.quantity <= i.min_stock_level);
  const outOfStock           = inventory.filter(i => i.quantity === 0);
  const totalRevenue         = sales.reduce((a,s) => a + parseFloat(s.total_amount||0), 0);
  const totalProfit          = sales.reduce((a,s) => a + parseFloat(s.total_profit||0), 0);
  const totalPersonalExpenses = expenses.reduce((a,e) => a + parseFloat(e.amount||0), 0);
  const totalRestockExpenses  = restockExpenses.reduce((a,e) => a + parseFloat(e.amount||0), 0);
  const totalExpenses        = totalPersonalExpenses + totalRestockExpenses;
  const netProfit            = totalProfit - totalPersonalExpenses;   // restock does NOT reduce net profit
  const revenueAfterRestock  = totalRevenue - totalRestockExpenses;
  const isAdmin              = currentUser?.role === 'admin';
  const isMobile             = useIsMobile();

  // ── Show login if not authenticated ──────────────────────
  if (!authChecked) {
    return (
      <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#e8f5e9,#f1f8e9)',
                    display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Spinner size={40}/>
      </div>
    );
  }
  if (!currentUser) return <LoginScreen onLogin={handleLogin}/>;

  const tabs = [
    { id:'dashboard', label:'Dashboard', icon:'dashboard' },
    { id:'inventory', label:'Inventory', icon:'inventory' },
    { id:'sales',     label:'Sales',     icon:'sales'     },
    { id:'expenses',  label:'Expenses',  icon:'expenses'  },
    { id:'reports',   label:'Reports',   icon:'reports'   },
    ...(isAdmin ? [{ id:'users', label:'Users', icon:'users' }] : []),
  ];

  const renderPage = () => {
    if (loading) return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300, gap:12, color:'#888' }}>
        <Spinner size={28}/> Loading data…
      </div>
    );
    switch (activeTab) {
      case 'dashboard': return <Dashboard inventory={inventory} sales={sales} expenses={expenses}
        lowStockItems={lowStockItems} outOfStock={outOfStock} totalRevenue={totalRevenue}
        totalProfit={totalProfit} netProfit={netProfit} revenueAfterRestock={revenueAfterRestock}
        totalRestockExpenses={totalRestockExpenses} businessInfo={businessInfo} setActiveTab={setActiveTab}
        debts={debts} onAddDebt={addDebt} onClearDebt={clearDebt} onDeleteDebt={deleteDebt}
        settings={settings} onSaveSettings={saveSettings}
        currentUser={currentUser} setModal={setModal} showNotif={showNotif}/>;
      case 'inventory': return <InventoryPage inventory={inventory} categories={categories} isAdmin={isAdmin}
        onUpdate={updateInventoryItem} onAdd={addInventoryItem} onDelete={deleteInventoryItem}
        onRestock={restock} onAdjust={adjustStock} showNotif={showNotif} setModal={setModal}/>;
      case 'sales':    return <SalesPage inventory={inventory} sales={sales} onAddSale={addSale}
        onDeleteByDate={deleteSalesByDate} onDeleteSale={deleteSale} currentUser={currentUser} setModal={setModal} showNotif={showNotif}/>;
      case 'expenses': return <ExpensesPage expenses={expenses} restockExpenses={restockExpenses}
        onAdd={addExpense} onDelete={deleteExpense}
        isAdmin={isAdmin} netProfit={netProfit} totalProfit={totalProfit}
        totalRevenue={totalRevenue} revenueAfterRestock={revenueAfterRestock}
        totalPersonalExpenses={totalPersonalExpenses} totalRestockExpenses={totalRestockExpenses}
        totalExpenses={totalExpenses}/>;
      case 'reports':  return <ReportsPage businessInfo={businessInfo}/>;
      case 'users':    return <UsersPage users={users} setUsers={setUsers} showNotif={showNotif} currentUser={currentUser} setModal={setModal}/>;
      default: return null;
    }
  };

  return (
    <div style={{ display:'flex', flexDirection: isMobile ? 'column' : 'row', minHeight:'100vh', background:'#f0f4f0', fontFamily:"'Lato','Segoe UI',sans-serif" }}>
      {/* ── Sidebar ── */}
      <aside id="mobile-nav" style={{
        background:'linear-gradient(180deg,#1a3a2a,#0d2118)', color:'#fff',
        display:'flex', zIndex:100, transition:'all 0.25s ease',
        ...(isMobile ? {
          position:'fixed', bottom:0, left:0, right:0,
          width:'100%', height:60,
          flexDirection:'row', alignItems:'stretch',
        } : {
          width:220, flexDirection:'column',
          position:'fixed', height:'100vh',
        })
      }}>
        <div style={{ padding:'24px 20px 16px', borderBottom:'1px solid rgba(255,255,255,0.1)', display: isMobile ? 'none' : 'block' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:8, background:'#4caf50',
                          display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🌱</div>
            <div>
              <div style={{ fontWeight:700, fontSize:13, color:'#fff', lineHeight:1.2 }}>Macy's Agrofeeds</div>
              <div style={{ fontSize:10, color:'#81c784' }}>Machakos, Kenya</div>
            </div>
          </div>
        </div>

        <nav style={{ flex:1, padding: isMobile ? '0' : '12px 0', display:'flex', flexDirection: isMobile ? 'row' : 'column', alignItems: isMobile ? 'stretch' : 'flex-start', overflowX: isMobile ? 'auto' : 'visible' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
                    style={{
                      flex: isMobile ? 1 : 'unset',
                      width: isMobile ? 'auto' : '100%',
                      display:'flex',
                      alignItems:'center',
                      justifyContent: isMobile ? 'center' : 'flex-start',
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: isMobile ? 2 : 12,
                      padding: isMobile ? '6px 4px' : '11px 20px',
                      background: activeTab===t.id ? 'rgba(76,175,80,0.25)' : 'transparent',
                      color: activeTab===t.id ? '#81c784' : 'rgba(255,255,255,0.7)',
                      border:'none', cursor:'pointer',
                      fontSize: isMobile ? 9 : 13.5,
                      fontWeight: activeTab===t.id ? 700 : 400,
                      borderLeft: isMobile ? 'none' : (activeTab===t.id ? '3px solid #4caf50' : '3px solid transparent'),
                      borderTop: isMobile ? (activeTab===t.id ? '3px solid #4caf50' : '3px solid transparent') : 'none',
                      minWidth: isMobile ? 50 : 'unset',
                      position: 'relative',
                    }}>
              {t.id==='inventory' && lowStockItems.length>0 && (
                <span style={{
                  position:'absolute',
                  top: isMobile ? 4 : 8,
                  right: isMobile ? '50%' : 14,
                  transform: isMobile ? 'translateX(18px)' : 'none',
                  background:'#ef5350', color:'#fff',
                  borderRadius:10, fontSize:9, padding:'1px 5px', fontWeight:700,
                  lineHeight:'14px', minWidth:14, textAlign:'center',
                  pointerEvents:'none',
                }}>
                  {lowStockItems.length}
                </span>
              )}
              <Icon name={t.icon} size={16}/>
              {t.label}
            </button>
          ))}
        </nav>

        <div style={{ padding:'16px 20px', borderTop:'1px solid rgba(255,255,255,0.1)', display: isMobile ? 'none' : 'block' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'#4caf50',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:13, fontWeight:700 }}>{currentUser.name[0]}</div>
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:'#fff' }}>{currentUser.name}</div>
              <div style={{ fontSize:10, color:'#81c784', textTransform:'capitalize' }}>{currentUser.role}</div>
            </div>
          </div>
          <button onClick={handleLogout}
                  style={{ width:'100%', padding:'7px', background:'rgba(255,255,255,0.08)',
                           color:'rgba(255,255,255,0.7)', border:'none', borderRadius:8,
                           cursor:'pointer', fontSize:12, display:'flex', alignItems:'center',
                           justifyContent:'center', gap:6 }}>
            <Icon name="logout" size={13}/> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main id="main-content" style={{ flex:1, marginLeft: isMobile ? 0 : 220, marginBottom: isMobile ? 60 : 0, minHeight: isMobile ? 'unset' : '100vh', transition:'all 0.25s ease' }}>
        {/* Topbar */}
        <div id="topbar" style={{ background:'#fff', padding: isMobile ? '10px 14px' : '14px 28px', display:'flex', alignItems:'center',
                      justifyContent:'space-between', borderBottom:'1px solid #e8f0e8',
                      position:'sticky', top:0, zIndex:50 }}>
          <div style={{ fontSize:18, fontWeight:700, color:'#1a3a2a' }}>
            {tabs.find(t => t.id===activeTab)?.label}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            {outOfStock.length>0 &&
              <div style={{ background:'#ffebee', color:'#c62828', padding:'4px 12px', borderRadius:20,
                            fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
                <Icon name="warning" size={13}/> {outOfStock.length} Out of Stock
              </div>}
            <button onClick={loadAll} title="Refresh data"
                    style={{ background:'#f5f5f5', border:'none', borderRadius:8, padding:'6px 10px',
                             cursor:'pointer', color:'#666', fontSize:12, display:'flex', alignItems:'center', gap:5 }}>
              🔄 Refresh
            </button>
            <div style={{ fontSize:12, color:'#666' }}>
              {new Date().toLocaleDateString('en-KE', { weekday:'short', year:'numeric', month:'short', day:'numeric' })}
            </div>
          </div>
        </div>

        {/* Toast notification */}
        {notification && (
          <div style={{ position:'fixed', top:20, right:20, zIndex:9999,
                        background: notification.type==='success' ? '#1a3a2a' : '#c62828',
                        color:'#fff', padding:'12px 20px', borderRadius:10, fontSize:13,
                        fontWeight:500, boxShadow:'0 4px 20px rgba(0,0,0,0.2)',
                        display:'flex', alignItems:'center', gap:8 }}>
            <Icon name={notification.type==='success' ? 'check' : 'warning'} size={15}/>
            {notification.msg}
          </div>
        )}

        {/* Modal overlay */}
        {modal && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:500,
                        display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ background:'#fff', borderRadius:14, padding:28, minWidth:360,
                          maxWidth:540, width:'90vw', maxHeight:'85vh', overflowY:'auto', position:'relative' }}>
              <button onClick={() => setModal(null)}
                      style={{ position:'absolute', top:14, right:14, background:'none', border:'none',
                               cursor:'pointer', color:'#666' }}>
                <Icon name="x" size={20}/>
              </button>
              {modal}
            </div>
          </div>
        )}

        <div style={{ padding: isMobile ? '14px' : '24px 28px' }}>{renderPage()}</div>
      </main>
    </div>
  );
}

// ============================================================
// DEBTS CARD
// ============================================================
function DebtsCard({ debts, inventory, onAdd, onClear, onDelete, currentUser, setModal,
                     showNotif, isMobile, alertDays, onSaveSettings }) {
  const [showForm,     setShowForm]     = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [editingDays,  setEditingDays]  = useState(false);
  const [draftDays,    setDraftDays]    = useState(String(alertDays));
  const [form, setForm] = useState({
    person_name:'', total_cost:'', date_added:today(), notes:''
  });

  const overdueDays  = alertDays;
  const warnDays     = Math.max(1, alertDays - 1);
  const totalOwed    = debts.filter(d=>!d.cleared).reduce((a,d)=>a+parseFloat(d.total_cost||0), 0);
  const overdueCount = debts.filter(d=>!d.cleared && d.days_outstanding>=overdueDays).length;

  const rowBg = (d) => {
    if (d.cleared) return '#f9f9f9';
    if (d.days_outstanding >= overdueDays) return '#ffebee';
    if (d.days_outstanding >= warnDays)    return '#fff8e1';
    return '#fff';
  };
  const rowText = (d) => {
    if (d.cleared) return '#aaa';
    if (d.days_outstanding >= overdueDays) return '#c62828';
    if (d.days_outstanding >= warnDays)    return '#e65100';
    return '#333';
  };
  const statusLabel = (d) => {
    if (d.cleared) return { label:'Cleared', bg:'#e8f5e9', color:'#2e7d32' };
    if (d.days_outstanding >= overdueDays) return { label:'Overdue', bg:'#ffebee', color:'#c62828' };
    if (d.days_outstanding >= warnDays)    return { label:'Due Soon', bg:'#fff8e1', color:'#e65100' };
    return { label:'Active', bg:'#e3f2fd', color:'#1565c0' };
  };

  const resetForm = () => {
    setForm({ person_name:'', total_cost:'', date_added:today(), notes:'' });
  };

  const handleSave = async () => {
    if (!form.person_name.trim()) { showNotif('Enter person name', 'error'); return; }
    if (!form.total_cost || parseFloat(form.total_cost)<=0) { showNotif('Enter a valid total cost', 'error'); return; }
    setSaving(true);
    try {
      await onAdd({
        person_name: form.person_name.trim(),
        total_cost:  parseFloat(form.total_cost),
        date_added:  form.date_added,
        notes:       form.notes,
      });
      resetForm(); setShowForm(false);
    } catch(e){ showNotif(e.message,'error'); }
    finally { setSaving(false); }
  };

  const saveDays = async () => {
    const val = parseInt(draftDays);
    if (isNaN(val)||val<1) { showNotif('Enter a valid number of days', 'error'); return; }
    await onSaveSettings({ debt_alert_days: String(val) });
    setEditingDays(false);
  };

  return (
    <div style={{ marginTop:20, background:'#fff', borderRadius:12, padding: isMobile?'14px 12px':20,
                  boxShadow:'0 1px 8px rgba(0,0,0,0.06)',
                  border: overdueCount>0 ? '1px solid #ffcdd2' : '1px solid #f0f0f0' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:8 }}>
        <div>
          <h3 style={{ margin:0, fontSize: isMobile?14:15, fontWeight:700, color:'#1a3a2a',
                       display:'flex', alignItems:'center', gap:6 }}>
            💳 Debts
            {overdueCount>0 && (
              <span style={{ background:'#ef5350', color:'#fff', borderRadius:10,
                             fontSize:10, padding:'2px 7px', fontWeight:700 }}>
                {overdueCount} overdue
              </span>
            )}
          </h3>
          {totalOwed>0 && <div style={{ fontSize:11, color:'#c62828', fontWeight:600, marginTop:2 }}>Total owed: {fmt(totalOwed)}</div>}
          {/* Alert period setting */}
          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
            <span style={{ fontSize:11, color:'#888' }}>Alert after:</span>
            {editingDays ? (
              <>
                <input type="number" min="1" max="30" value={draftDays}
                       onChange={e=>setDraftDays(e.target.value)}
                       style={{ width:46, padding:'2px 6px', borderRadius:6, border:'1.5px solid #4caf50',
                                fontSize:12, textAlign:'center' }}/>
                <span style={{ fontSize:11, color:'#888' }}>days</span>
                <button onClick={saveDays}
                        style={{ padding:'2px 8px', background:'#1a3a2a', color:'#fff', border:'none',
                                 borderRadius:6, cursor:'pointer', fontSize:11, fontWeight:700 }}>Save</button>
                <button onClick={()=>{ setEditingDays(false); setDraftDays(String(alertDays)); }}
                        style={{ padding:'2px 8px', background:'none', color:'#888', border:'1px solid #ddd',
                                 borderRadius:6, cursor:'pointer', fontSize:11 }}>Cancel</button>
              </>
            ) : (
              <>
                <span style={{ fontSize:12, fontWeight:700, color:'#1a3a2a' }}>{alertDays} days</span>
                {currentUser?.role==='admin' && (
                  <button onClick={()=>{ setEditingDays(true); setDraftDays(String(alertDays)); }}
                          style={{ padding:'1px 7px', background:'#f5f5f5', color:'#555', border:'1px solid #ddd',
                                   borderRadius:6, cursor:'pointer', fontSize:11 }}>✏ Edit</button>
                )}
              </>
            )}
          </div>
        </div>
        <button onClick={()=>{ setShowForm(!showForm); if(showForm) resetForm(); }}
                style={{ padding: isMobile?'6px 12px':'8px 16px', background:'#1a3a2a', color:'#fff',
                         border:'none', borderRadius:10, cursor:'pointer', fontSize: isMobile?12:13,
                         fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
          <Icon name="plus" size={13}/> Add Debt
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{ background:'#f9f9f9', borderRadius:10, padding: isMobile?12:16,
                      marginBottom:14, border:'1px solid #e0e0e0' }}>
          <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'1fr 1fr', gap:10, marginBottom:10 }}>
            <div>
              <label style={{ fontSize:11, fontWeight:600, color:'#555', display:'block', marginBottom:3 }}>Person Name *</label>
              <input type="text" value={form.person_name} placeholder="e.g. John Kamau"
                     onChange={e=>setForm(p=>({...p,person_name:e.target.value}))}
                     style={{ width:'100%', padding:'9px 12px', borderRadius:8,
                              border:'1.5px solid #ddd', fontSize:13, boxSizing:'border-box' }}/>
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:600, color:'#555', display:'block', marginBottom:3 }}>Total Cost (KES) *</label>
              <input type="number" step="0.01" min="0.01" value={form.total_cost} placeholder="0.00"
                     onChange={e=>setForm(p=>({...p,total_cost:e.target.value}))}
                     style={{ width:'100%', padding:'9px 12px', borderRadius:8,
                              border:'1.5px solid #ddd', fontSize:13, boxSizing:'border-box' }}/>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'1fr 1fr', gap:10, marginBottom:10 }}>
            <div>
              <label style={{ fontSize:11, fontWeight:600, color:'#555', display:'block', marginBottom:3 }}>Date</label>
              <input type="date" value={form.date_added}
                     onChange={e=>setForm(p=>({...p,date_added:e.target.value}))}
                     style={{ width:'100%', padding:'9px 12px', borderRadius:8,
                              border:'1.5px solid #ddd', fontSize:13, boxSizing:'border-box' }}/>
            </div>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:11, fontWeight:600, color:'#555', display:'block', marginBottom:3 }}>Notes (optional)</label>
            <input type="text" value={form.notes} placeholder="e.g. will pay Friday"
                   onChange={e=>setForm(p=>({...p,notes:e.target.value}))}
                   style={{ width:'100%', padding:'9px 12px', borderRadius:8,
                            border:'1.5px solid #ddd', fontSize:13, boxSizing:'border-box' }}/>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={()=>{ setShowForm(false); resetForm(); }}
                    style={{ padding:'7px 16px', border:'1.5px solid #ddd', borderRadius:8,
                             background:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}>Cancel</button>
            <button disabled={saving} onClick={handleSave}
                    style={{ padding:'7px 20px', background: saving?'#81c784':'#1a3a2a', color:'#fff',
                             border:'none', borderRadius:8, cursor: saving?'not-allowed':'pointer',
                             fontSize:13, fontWeight:700 }}>
              {saving ? 'Saving…' : 'Save Debt'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {debts.length===0
        ? <div style={{ color:'#aaa', fontSize:13, padding:'12px 0' }}>No debts recorded.</div>
        : <div style={{ overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize: isMobile?11:13,
                            minWidth: isMobile?520:'auto' }}>
              <thead>
                <tr style={{ background:'#f5f5f5' }}>
                  {['Person','Total','Date','Days','Status',''].map(h=>(
                    <th key={h} style={{ padding: isMobile?'7px 8px':'9px 12px', textAlign:'left',
                                         fontWeight:700, color:'#444', fontSize: isMobile?10:12, whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {debts.map(d => {
                  const st = statusLabel(d);
                  return (
                    <tr key={d.id} style={{ borderBottom:'1px solid #f0f0f0', background: rowBg(d) }}>
                      <td style={{ padding: isMobile?'8px':'10px 12px', fontWeight:600, color: rowText(d) }}>{d.person_name}</td>
                      <td style={{ padding: isMobile?'8px':'10px 12px', fontWeight:700, color: d.cleared?'#aaa':'#1a3a2a' }}>{fmt(d.total_cost)}</td>
                      <td style={{ padding: isMobile?'8px':'10px 12px', color:'#888', whiteSpace:'nowrap' }}>{d.date_added}</td>
                      <td style={{ padding: isMobile?'8px':'10px 12px', fontWeight:700, color: rowText(d) }}>
                        {d.cleared ? '✓' : `${d.days_outstanding}d`}
                      </td>
                      <td style={{ padding: isMobile?'8px':'10px 12px', whiteSpace:'nowrap' }}>
                        <span style={{ background:st.bg, color:st.color, borderRadius:8,
                                       padding:'2px 8px', fontSize:11, fontWeight:700 }}>{st.label}</span>
                      </td>
                      <td style={{ padding: isMobile?'8px':'10px 12px' }}>
                        <div style={{ display:'flex', gap:4 }}>
                          {!d.cleared && (
                            <button onClick={()=>setModal(
                              <div>
                                <h3 style={{ margin:'0 0 12px', color:'#1a3a2a' }}>Mark as Cleared?</h3>
                                <p style={{ color:'#666', fontSize:13, margin:'0 0 18px' }}>
                                  Mark debt from <strong>{d.person_name}</strong> ({fmt(d.total_cost)}) as cleared?
                                </p>
                                <div style={{ display:'flex', gap:10 }}>
                                  <button onClick={()=>setModal(null)}
                                          style={{ flex:1, padding:'9px', border:'1.5px solid #ddd', borderRadius:8,
                                                   background:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}>Cancel</button>
                                  <button onClick={async()=>{ await onClear(d.id); setModal(null); }}
                                          style={{ flex:1, padding:'9px', background:'#2e7d32', color:'#fff',
                                                   border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:700 }}>✓ Clear</button>
                                </div>
                              </div>
                            )} style={{ padding:'4px 10px', background:'#e8f5e9', color:'#2e7d32',
                                        border:'none', borderRadius:6, cursor:'pointer', fontSize:11, fontWeight:600 }}>
                              Clear
                            </button>
                          )}
                          {currentUser?.role==='admin' && (
                            <button onClick={()=>setModal(
                              <div>
                                <h3 style={{ margin:'0 0 12px', color:'#c62828' }}>Delete Debt?</h3>
                                <p style={{ color:'#666', fontSize:13, margin:'0 0 18px' }}>
                                  Permanently delete debt from <strong>{d.person_name}</strong>?
                                </p>
                                <div style={{ display:'flex', gap:10 }}>
                                  <button onClick={()=>setModal(null)}
                                          style={{ flex:1, padding:'9px', border:'1.5px solid #ddd', borderRadius:8,
                                                   background:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}>Cancel</button>
                                  <button onClick={async()=>{ await onDelete(d.id); setModal(null); }}
                                          style={{ flex:1, padding:'9px', background:'#c62828', color:'#fff',
                                                   border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:700 }}>🗑 Delete</button>
                                </div>
                              </div>
                            )} style={{ padding:'4px 8px', background:'#ffebee', color:'#c62828',
                                        border:'none', borderRadius:6, cursor:'pointer', fontSize:11, fontWeight:600 }}>
                              🗑
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
      }
    </div>
  );
}

// ============================================================
// DASHBOARD
// ============================================================
function Dashboard({ inventory, sales, expenses, lowStockItems, outOfStock, debts, onAddDebt, onClearDebt, onDeleteDebt, settings, onSaveSettings, currentUser, setModal, showNotif,
                     totalRevenue, totalProfit, netProfit, revenueAfterRestock, totalRestockExpenses, businessInfo, setActiveTab }) {
  const isMobile = useIsMobile();                    
  const todaySales   = sales.filter(s => s.date === today());
  const todayRevenue = todaySales.reduce((a,s) => a + parseFloat(s.total_amount||0), 0);
  const todayProfit  = todaySales.reduce((a,s) => a + parseFloat(s.total_profit||0), 0);
  const totalItems   = inventory.reduce((a,i) => a + parseFloat(i.quantity||0), 0);
  const totalExp     = expenses.reduce((a,e) => a + parseFloat(e.amount||0), 0);

  const itemSoldMap = {};
  sales.forEach(s => (s.items||[]).forEach(si => {
    itemSoldMap[si.name] = (itemSoldMap[si.name]||0) + parseFloat(si.quantity||0);
  }));
  const topItems = Object.entries(itemSoldMap).sort((a,b)=>b[1]-a[1]).slice(0,5);

  const StatCard = ({ label, value, icon, color, sub }) => (
    <div style={{ background:'#fff', borderRadius:12, padding:'20px 22px',
                  boxShadow:'0 1px 8px rgba(0,0,0,0.06)', borderLeft:`4px solid ${color}` }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:12, color:'#888', fontWeight:600, marginBottom:6 }}>{label}</div>
          <div style={{ fontSize:22, fontWeight:800, color:'#1a3a2a' }}>{value}</div>
          {sub && <div style={{ fontSize:11, color:'#aaa', marginTop:3 }}>{sub}</div>}
        </div>
        <div style={{ width:40, height:40, borderRadius:10, background:color+'22',
                      display:'flex', alignItems:'center', justifyContent:'center', color }}>
          <Icon name={icon} size={20}/>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth:'100%', overflowX:'hidden' }}>
      <div style={{ display:'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit,minmax(200px,1fr))', gap: window.innerWidth < 768 ? 10 : 16, marginBottom: window.innerWidth < 768 ? 14 : 24 }}>
        <StatCard label="Total Revenue" value={fmt(totalRevenue)} icon="sales" color="#1565c0" sub="All recorded sales"/>
        <StatCard label="Revenue After Restock" value={fmt(revenueAfterRestock)} icon="restock" color="#00838f"
                  sub={`Restock costs: ${fmt(totalRestockExpenses)}`}/>
        <StatCard label="Gross Profit" value={fmt(totalProfit)} icon="reports" color="#2e7d32"
                  sub={`Margin: ${totalRevenue ? ((totalProfit/totalRevenue)*100).toFixed(1) : 0}%`}/>
        <StatCard label="Net Profit (After Expenses)" value={fmt(netProfit)} icon="expenses"
                  color={netProfit>=0?'#558b2f':'#c62828'} sub={`Expenses: ${fmt(totalExp)}`}/>
        <StatCard label="Today's Revenue" value={fmt(todayRevenue)} icon="sales" color="#e65100"
                  sub={`Profit today: ${fmt(todayProfit)}`}/>
        <StatCard label="Total Stock Units" value={totalItems.toLocaleString()} icon="inventory"
                  color="#6a1b9a" sub={`${inventory.length} products`}/>
        <StatCard label="Low Stock Alerts" value={lowStockItems.length} icon="alert" color="#c62828"
                  sub={`${outOfStock.length} out of stock`}/>
      </div>

      {isMobile && (
        <div style={{ background:'#fff', borderRadius:12, padding:'14px 16px', marginBottom:12,
                      boxShadow:'0 1px 8px rgba(0,0,0,0.06)', borderLeft:'4px solid #1565c0' }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#1a3a2a', marginBottom:6 }}>Formula</div>
          <div style={{ fontFamily:'monospace', fontSize:12, color:'#333', lineHeight:1.9 }}>
            net = gross − expenses<br/>
            {fmt(totalProfit)} − {fmt(totalExp)} =<br/>
            <strong style={{ color: netProfit>=0?'#2e7d32':'#c62828', fontSize:14 }}>{fmt(netProfit)}</strong>
          </div>
        </div>
      )}
      {isMobile ? (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ background:'#fff', borderRadius:12, padding:'18px 16px', boxShadow:'0 1px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin:'0 0 14px', fontSize:15, fontWeight:800, color:'#1a3a2a' }}>📊 Financial Overview</h3>
            <div style={{ background:'#f9f9f9', borderRadius:10, padding:'14px 16px', fontFamily:'monospace',
                          fontSize:12, color:'#333', marginBottom:14, lineHeight:2.1 }}>
              <div style={{ color:'#2e7d32', fontWeight:700, marginBottom:2 }}>Profit Formulas:</div>
              <div>profit_per_unit = selling_price − cost_price</div>
              <div>total_profit = profit_per_unit × quantity_sold</div>
              <div>net_profit = total_profit − total_expenses</div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
              {[['Gross Revenue',fmt(totalRevenue),'#e8f5e9','#1a3a2a'],
                ['Gross Profit', fmt(totalProfit), '#e3f2fd','#1565c0'],
                ['Net Profit',   fmt(netProfit),   netProfit>=0?'#f1f8e9':'#ffebee', netProfit>=0?'#558b2f':'#c62828']
              ].map(([l,v,bg,col]) => (
                <div key={l} style={{ background:bg, borderRadius:8, padding:'10px 8px' }}>
                  <div style={{ fontSize:9, color:'#666', marginBottom:4, lineHeight:1.3 }}>{l}</div>
                  <div style={{ fontWeight:800, fontSize:13, color:col }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background:'#fff', borderRadius:12, padding:'18px 16px', boxShadow:'0 1px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin:'0 0 14px', fontSize:15, fontWeight:800, color:'#1a3a2a' }}>🏆 Top Selling Items</h3>
            {topItems.length === 0
              ? <div style={{ color:'#aaa', fontSize:13 }}>No sales data yet.</div>
              : topItems.map(([name,qty],i) => (
                <div key={name} style={{ display:'flex', alignItems:'center', gap:12,
                                         padding:'9px 0', borderBottom: i<topItems.length-1 ? '1px solid #f5f5f5' : 'none' }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', flexShrink:0,
                                background:['#4caf50','#2196f3','#ff9800','#9c27b0','#f44336'][i],
                                color:'#fff', fontSize:13, fontWeight:700,
                                display:'flex', alignItems:'center', justifyContent:'center' }}>{i+1}</div>
                  <div style={{ flex:1, fontSize:13, color:'#333', fontWeight:500 }}>{name}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#4caf50' }}>{qty} sold</div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20 }}>
          <div style={{ background:'#fff', borderRadius:12, padding:22, boxShadow:'0 1px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin:'0 0 16px', fontSize:14, fontWeight:700, color:'#1a3a2a' }}>📊 Financial Overview</h3>
            <div style={{ background:'#f9f9f9', borderRadius:10, padding:16, fontFamily:'monospace',
                          fontSize:13, color:'#333', marginBottom:16, lineHeight:2 }}>
              <div style={{ color:'#2e7d32', fontWeight:600 }}>Profit Formulas:</div>
              <div>profit_per_unit = selling_price − cost_price</div>
              <div>total_profit = profit_per_unit × quantity_sold</div>
              <div>net_profit = total_profit − total_expenses</div>
            </div>
            <div style={{ display:'flex', gap:12 }}>
              {[['Gross Revenue',fmt(totalRevenue),'#e8f5e9','#1a3a2a'],
                ['Gross Profit', fmt(totalProfit), '#e3f2fd','#1565c0'],
                ['Net Profit',   fmt(netProfit),   netProfit>=0?'#f1f8e9':'#ffebee', netProfit>=0?'#558b2f':'#c62828']
              ].map(([l,v,bg,col]) => (
                <div key={l} style={{ flex:1, background:bg, borderRadius:8, padding:'12px 16px' }}>
                  <div style={{ fontSize:11, color:'#666' }}>{l}</div>
                  <div style={{ fontWeight:700, fontSize:16, color:col }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background:'#fff', borderRadius:12, padding:22, boxShadow:'0 1px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin:'0 0 14px', fontSize:14, fontWeight:700, color:'#1a3a2a' }}>🏆 Top Selling Items</h3>
            {topItems.length === 0
              ? <div style={{ color:'#aaa', fontSize:13 }}>No sales data yet.</div>
              : topItems.map(([name,qty],i) => (
                <div key={name} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <div style={{ width:22, height:22, borderRadius:'50%',
                                background:['#4caf50','#2196f3','#ff9800','#9c27b0','#f44336'][i],
                                color:'#fff', fontSize:11, fontWeight:700,
                                display:'flex', alignItems:'center', justifyContent:'center' }}>{i+1}</div>
                  <div style={{ flex:1, fontSize:12, color:'#333' }}>{name}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:'#4caf50' }}>{qty} sold</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {lowStockItems.length>0 && (
        <div style={{ marginTop:20, background:'#fff', borderRadius:12, padding:20,
                      boxShadow:'0 1px 8px rgba(0,0,0,0.06)', border:'1px solid #ffccbc' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:'#bf360c',
                         display:'flex', alignItems:'center', gap:6 }}>
              <Icon name="alert" size={16}/> Stock Alerts ({lowStockItems.length})
            </h3>
            <button onClick={() => setActiveTab('inventory')}
                    style={{ fontSize:12, color:'#4caf50', background:'none', border:'none',
                             cursor:'pointer', fontWeight:600 }}>View Inventory →</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit,minmax(200px,1fr))', gap: isMobile ? 10 : 16, marginBottom: isMobile ? 14 : 24 }}>
            {lowStockItems.map(item => (
              <div key={item.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                                          background: item.quantity===0?'#ffebee':'#fff8e1',
                                          padding:'10px 14px', borderRadius:8 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#333' }}>{item.name}</div>
                  <div style={{ fontSize:11, color:'#888' }}>{item.category}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:12, fontWeight:700, color: item.quantity===0?'#c62828':'#e65100' }}>
                    {item.quantity===0 ? 'OUT OF STOCK' : `${item.quantity} left`}
                  </div>
                  <div style={{ fontSize:10, color:'#aaa' }}>Min: {item.min_stock_level}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <DebtsCard debts={debts} inventory={inventory} onAdd={onAddDebt} onClear={onClearDebt}
                 onDelete={onDeleteDebt} currentUser={currentUser} setModal={setModal}
                 showNotif={showNotif} isMobile={isMobile}
                 alertDays={parseInt(settings.debt_alert_days||'3')}
                 onSaveSettings={onSaveSettings}/>

      <div style={{ marginTop:20, background:'#fff', borderRadius:12, padding:20, boxShadow:'0 1px 8px rgba(0,0,0,0.06)' }}>
        <h3 style={{ margin:'0 0 14px', fontSize:14, fontWeight:700, color:'#1a3a2a' }}>Recent Sales</h3>
        {sales.length === 0
          ? <div style={{ color:'#aaa', fontSize:13 }}>No sales recorded yet.</div>
            : <div style={{ overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, minWidth:380 }}>
                <thead>
                  <tr style={{ background:'#f5f5f5' }}>
                    {['Date','Items','Revenue','Profit'].map(h =>
                      <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontWeight:600, color:'#555', fontSize:12, whiteSpace:'nowrap' }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[...sales].slice(0,5).map(s => (
                    <tr key={s.id} style={{ borderBottom:'1px solid #f0f0f0' }}>
                      <td style={{ padding:'10px 8px', color:'#666', whiteSpace:'nowrap', fontSize:12 }}>{s.date}</td>
                      <td style={{ padding:'10px 8px', color:'#333', fontSize:11, maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {(s.items||[]).map(i=>i.name).join(', ').substring(0,40)}
                      </td>
                      <td style={{ padding:'10px 8px', fontWeight:600, color:'#1565c0', whiteSpace:'nowrap', fontSize:12 }}>{fmt(s.total_amount)}</td>
                      <td style={{ padding:'10px 8px', fontWeight:600, color:'#2e7d32', whiteSpace:'nowrap', fontSize:12 }}>{fmt(s.total_profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>}
          
      </div>
    </div>
  );
}

// ============================================================
// INVENTORY PAGE
// ============================================================
const InpF = ({ label, field, type='text', obj, setObj }) => (
    <div style={{ marginBottom:12 }}>
      <label style={{ fontSize:12, fontWeight:600, color:'#444', display:'block', marginBottom:4 }}>{label}</label>
      <input type={type} value={obj[field]||''} onChange={e=>setObj(p=>({...p,[field]:e.target.value}))}
             style={{ width:'100%', padding:'8px 11px', borderRadius:7, border:'1.5px solid #ddd',
                      fontSize:13, boxSizing:'border-box' }}/>
    </div>
  );

function InventoryPage({ inventory, categories, isAdmin, onUpdate, onAdd, onDelete,
                         onRestock, onAdjust, showNotif, setModal }) {
  const [search,      setSearch]      = useState('');
  const [filterCat,   setFilterCat]   = useState('All');
  const [filterStatus,setFilterStatus]= useState('All');
  const [editItem,    setEditItem]    = useState(null);
  const [showAdd,     setShowAdd]     = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [newItem, setNewItem] = useState({
    name:'', category: categories[0]||'', cost_price:'', selling_price:'',
    quantity:'', min_stock_level:'', supplier_name:'', supplier_contact:''
  });

  const filtered = inventory.filter(i => {
    const ms = i.name.toLowerCase().includes(search.toLowerCase()) ||
               i.category.toLowerCase().includes(search.toLowerCase());
    const mc = filterCat==='All' || i.category===filterCat;
    const mst = filterStatus==='All' ||
               (filterStatus==='Low'  && i.quantity<=i.min_stock_level && i.quantity>0) ||
               (filterStatus==='Out'  && i.quantity===0) ||
               (filterStatus==='OK'   && i.quantity>i.min_stock_level);
    return ms && mc && mst;
  });

  const badge = (item) => {
    if (item.quantity===0) return { label:'OUT OF STOCK', bg:'#ffebee', color:'#c62828' };
    if (item.quantity<=item.min_stock_level) return { label:'LOW STOCK', bg:'#fff8e1', color:'#e65100' };
    return { label:'IN STOCK', bg:'#e8f5e9', color:'#2e7d32' };
  };

  const openRestock = (item) => {
    let qtyVal = '';
    setModal(
      <div>
        <h3 style={{ margin:'0 0 16px', color:'#1a3a2a' }}>Restock: {item.name}</h3>
        <div style={{ marginBottom:8, fontSize:13, color:'#666' }}>Current qty: <strong>{item.quantity}</strong></div>
        <label style={{ fontSize:12, fontWeight:600, color:'#444', display:'block', marginBottom:5 }}>Quantity to Add</label>
        <input id="restock-qty" type="number" min="1" placeholder="e.g. 20"
               style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1.5px solid #ddd',
                        fontSize:14, boxSizing:'border-box' }}/>
        <button onClick={async () => {
          const v = parseInt(document.getElementById('restock-qty').value);
          if (v>0) { await onRestock(item.id, v); setModal(null); }
        }} style={{ width:'100%', marginTop:16, padding:'11px', background:'#4caf50', color:'#fff',
                   border:'none', borderRadius:10, cursor:'pointer', fontSize:14, fontWeight:700 }}>
          ✓ Confirm Restock
        </button>
      </div>
    );
  };

  const openAdjust = (item) => {
    setModal(
      <div>
        <h3 style={{ margin:'0 0 16px', color:'#1a3a2a' }}>Adjust Stock: {item.name}</h3>
        <div style={{ marginBottom:8, fontSize:13, color:'#666' }}>Current qty: <strong>{item.quantity}</strong></div>
        <label style={{ fontSize:12, fontWeight:600, color:'#444', display:'block', marginBottom:5 }}>Qty to Remove</label>
        <input id="adj-qty" type="number" min="1" max={item.quantity}
               style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1.5px solid #ddd',
                        fontSize:14, boxSizing:'border-box' }}/>
        <label style={{ fontSize:12, fontWeight:600, color:'#444', display:'block', marginTop:10, marginBottom:5 }}>Reason</label>
        <select id="adj-reason" style={{ width:'100%', padding:'9px 12px', borderRadius:8,
                                          border:'1.5px solid #ddd', fontSize:13 }}>
          <option>Damaged</option><option>Expired</option><option>Lost</option>
          <option>Theft</option><option>Other</option>
        </select>
        <button onClick={async () => {
          const q = parseInt(document.getElementById('adj-qty').value);
          const r = document.getElementById('adj-reason').value;
          if (q>0) { await onAdjust(item.id, q, r); setModal(null); }
        }} style={{ width:'100%', marginTop:16, padding:'11px', background:'#ef5350', color:'#fff',
                   border:'none', borderRadius:10, cursor:'pointer', fontSize:14, fontWeight:700 }}>
          Confirm Adjustment
        </button>
      </div>
    );
  };

  const openDelete = (item) => {
    setModal(
      <div>
        <div style={{ textAlign:'center', marginBottom:18 }}>
          <div style={{ width:52, height:52, borderRadius:'50%', background:'#ffebee',
                        display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
            <Icon name="trash" size={24}/>
          </div>
          <h3 style={{ margin:'0 0 8px', color:'#1a3a2a' }}>Delete Item?</h3>
          <p style={{ margin:0, color:'#666', fontSize:13, lineHeight:1.5 }}>
            Permanently delete <strong>"{item.name}"</strong>? This cannot be undone.
          </p>
        </div>
        <div style={{ background:'#fff8e1', borderRadius:8, padding:'10px 14px',
                      marginBottom:18, fontSize:12, color:'#795548' }}>
          ⚠ Items with sales history cannot be deleted — reduce quantity to 0 instead.
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => setModal(null)}
                  style={{ flex:1, padding:'10px', border:'1.5px solid #ddd', borderRadius:10,
                           background:'#fff', cursor:'pointer', fontSize:14, fontWeight:600 }}>Cancel</button>
          <button onClick={async () => { try { await onDelete(item.id); setModal(null); }
                                         catch(e){ showNotif(e.message,'error'); setModal(null); } }}
                  style={{ flex:1, padding:'10px', background:'#c62828', color:'#fff', border:'none',
                           borderRadius:10, cursor:'pointer', fontSize:14, fontWeight:700 }}>
            🗑 Delete
          </button>
        </div>
      </div>
    );
  };


  return (
    <div>
      {/* Toolbar */}
      <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:'#fff', padding:'8px 14px',
                      borderRadius:10, border:'1px solid #e0e0e0', flex:1, minWidth:200 }}>
          <Icon name="search" size={15}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search items…"
                 style={{ border:'none', outline:'none', fontSize:13, width:'100%' }}/>
        </div>
        <select value={filterCat} onChange={e=>setFilterCat(e.target.value)}
                style={{ padding:'8px 12px', borderRadius:10, border:'1px solid #e0e0e0', fontSize:13, background:'#fff' }}>
          <option value="All">All Categories</option>
          {categories.map(c=><option key={c}>{c}</option>)}
        </select>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
                style={{ padding:'8px 12px', borderRadius:10, border:'1px solid #e0e0e0', fontSize:13, background:'#fff' }}>
          <option value="All">All Status</option>
          <option value="OK">In Stock</option>
          <option value="Low">Low Stock</option>
          <option value="Out">Out of Stock</option>
        </select>
        {isAdmin && <button onClick={()=>setShowAdd(true)}
                            style={{ padding:'8px 16px', background:'#4caf50', color:'#fff', border:'none',
                                     borderRadius:10, cursor:'pointer', fontSize:13, fontWeight:600,
                                     display:'flex', alignItems:'center', gap:6 }}>
          <Icon name="plus" size={14}/> Add Item
        </button>}
      </div>

      {/* Stats */}
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        {[['Total Items',   inventory.length,                                                               '#1565c0'],
          ['In Stock',      inventory.filter(i=>i.quantity>i.min_stock_level).length,                      '#2e7d32'],
          ['Low Stock',     inventory.filter(i=>i.quantity<=i.min_stock_level&&i.quantity>0).length,       '#e65100'],
          ['Out of Stock',  inventory.filter(i=>i.quantity===0).length,                                    '#c62828'],
        ].map(([l,v,c])=>(
          <div key={l} style={{ background:'#fff', borderRadius:10, padding:'12px 18px',
                                boxShadow:'0 1px 6px rgba(0,0,0,0.05)', border:`2px solid ${c}20` }}>
            <div style={{ fontSize:11, color:'#888', fontWeight:600 }}>{l}</div>
            <div style={{ fontSize:20, fontWeight:800, color:c }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Add Item Form */}
      {showAdd && isAdmin && (
        <div style={{ background:'#fff', borderRadius:12, padding:22, marginBottom:18,
                      boxShadow:'0 1px 8px rgba(0,0,0,0.08)', border:'1px solid #c8e6c9' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:'#1a3a2a' }}>Add New Item</h3>
            <button onClick={()=>setShowAdd(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#999' }}>
              <Icon name="x" size={18}/>
            </button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12 }}>
            <InpF label="Item Name *" field="name" obj={newItem} setObj={setNewItem}/>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:'#444', display:'block', marginBottom:4 }}>Category</label>
              <select value={newItem.category} onChange={e=>setNewItem(p=>({...p,category:e.target.value}))}
                      style={{ width:'100%', padding:'8px 11px', borderRadius:7, border:'1.5px solid #ddd', fontSize:13 }}>
                {categories.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <InpF label="Buying Price (KES)"    field="cost_price"      type="number" obj={newItem} setObj={setNewItem}/>
            <InpF label="Selling Price (KES)" field="selling_price"   type="number" obj={newItem} setObj={setNewItem}/>
            <InpF label="Quantity"            field="quantity"        type="number" obj={newItem} setObj={setNewItem}/>
            <InpF label="Min Stock Level"     field="min_stock_level" type="number" obj={newItem} setObj={setNewItem}/>
            <InpF label="Supplier Name"       field="supplier_name"  obj={newItem} setObj={setNewItem}/>
            <InpF label="Supplier Contact"    field="supplier_contact" obj={newItem} setObj={setNewItem}/>
          </div>
          {newItem.cost_price && newItem.selling_price && (
            <div style={{ background:'#e8f5e9', borderRadius:8, padding:'10px 14px', marginTop:8,
                          fontSize:13, color:'#2e7d32', fontWeight:600 }}>
              Profit/unit: {fmt(parseFloat(newItem.selling_price)-parseFloat(newItem.cost_price))}
            </div>
          )}
          <button disabled={saving} onClick={async () => {
            if (!newItem.name) return showNotif('Item name is required','error');
            setSaving(true);
            try {
              await onAdd({...newItem,
                cost_price:     parseFloat(newItem.cost_price),
                selling_price:  parseFloat(newItem.selling_price),
                quantity:        parseInt(newItem.quantity),
                min_stock_level: parseInt(newItem.min_stock_level),
              });
              setNewItem({ name:'', category:categories[0]||'', cost_price:'', selling_price:'',
                           quantity:'', min_stock_level:'', supplier_name:'', supplier_contact:'' });
              setShowAdd(false);
            } catch(e){ showNotif(e.message,'error'); }
            finally { setSaving(false); }
          }} style={{ marginTop:14, padding:'10px 24px',
                     background: saving?'#a5d6a7':'#4caf50', color:'#fff', border:'none',
                     borderRadius:10, cursor: saving?'not-allowed':'pointer', fontSize:14, fontWeight:700 }}>
            {saving ? 'Saving…' : '✓ Add Item'}
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{ background:'#fff', borderRadius:12, boxShadow:'0 1px 8px rgba(0,0,0,0.06)', overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr style={{ background:'#f5f7f5' }}>
              {['Item Name','Category','Cost','Sell Price','Profit/Unit','Qty','Min','Status','Actions'].map(h=>(
                <th key={h} style={{ padding:'11px 14px', textAlign:'left', fontWeight:700, color:'#444',
                                     fontSize:12, borderBottom:'1px solid #eee', whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item,idx) => {
              const st = badge(item);
              const profit = parseFloat(item.selling_price||0) - parseFloat(item.cost_price||0);
              const margin = parseFloat(item.selling_price||0)>0 ? ((profit/parseFloat(item.selling_price))*100).toFixed(1) : 0;
              return editItem?.id===item.id ? (
                <tr key={item.id} style={{ background:'#f0f7f0' }}>
                  <td colSpan={9} style={{ padding:14 }}>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:10 }}>
                      {[['name','Name'],['cost_price','Buying Price'],['selling_price','Sell Price'],
                        ['quantity','Quantity'],['min_stock_level','Min Level'],['supplier_name','Supplier']
                      ].map(([f,l])=>(
                        <div key={f}>
                          <label style={{ fontSize:11, fontWeight:600, color:'#666', display:'block', marginBottom:3 }}>{l}</label>
                          <input value={editItem[f]||''} onChange={e=>setEditItem(p=>({...p,[f]:e.target.value}))}
                                 style={{ width:'100%', padding:'6px 10px', borderRadius:6,
                                          border:'1.5px solid #4caf50', fontSize:12, boxSizing:'border-box' }}/>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop:10, display:'flex', gap:8 }}>
                      <button onClick={async () => {
                        try {
                          await onUpdate({...editItem,
                            cost_price:     parseFloat(editItem.cost_price),
                            selling_price:  parseFloat(editItem.selling_price),
                            quantity:        parseInt(editItem.quantity),
                            min_stock_level: parseInt(editItem.min_stock_level),
                          });
                          setEditItem(null);
                        } catch(e){ showNotif(e.message,'error'); }
                      }} style={{ padding:'7px 16px', background:'#4caf50', color:'#fff',
                                  border:'none', borderRadius:8, cursor:'pointer', fontSize:12, fontWeight:600 }}>Save</button>
                      <button onClick={()=>setEditItem(null)}
                              style={{ padding:'7px 16px', background:'#f5f5f5', color:'#555',
                                       border:'none', borderRadius:8, cursor:'pointer', fontSize:12 }}>Cancel</button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={item.id} style={{ borderBottom:'1px solid #f5f5f5',
                                           background: idx%2===0?'#fff':'#fcfcfc' }}>
                  <td style={{ padding:'11px 14px' }}>
                    <div style={{ fontWeight:600, color:'#222' }}>{item.name}</div>
                    {item.supplier_name && <div style={{ fontSize:11, color:'#aaa' }}>{item.supplier_name}</div>}
                  </td>
                  <td style={{ padding:'11px 14px' }}>
                    <span style={{ background:'#e8f5e9', color:'#2e7d32', padding:'2px 8px',
                                   borderRadius:12, fontSize:11, fontWeight:600 }}>{item.category}</span>
                  </td>
                  <td style={{ padding:'11px 14px', color:'#666' }}>{fmt(item.cost_price)}</td>
                  <td style={{ padding:'11px 14px', fontWeight:600, color:'#333' }}>{fmt(item.selling_price)}</td>
                  <td style={{ padding:'11px 14px' }}>
                    <span style={{ color:profit>=0?'#2e7d32':'#c62828', fontWeight:700 }}>{fmt(profit)}</span>
                    <span style={{ fontSize:10, color:'#aaa', marginLeft:4 }}>{margin}%</span>
                  </td>
                  <td style={{ padding:'11px 14px', fontWeight:700,
                               color: item.quantity===0?'#c62828':item.quantity<=item.min_stock_level?'#e65100':'#333' }}>
                    {item.quantity}
                  </td>
                  <td style={{ padding:'11px 14px', color:'#888', fontSize:12 }}>{item.min_stock_level}</td>
                  <td style={{ padding:'11px 14px' }}>
                    <span style={{ background:st.bg, color:st.color, padding:'3px 8px',
                                   borderRadius:10, fontSize:10, fontWeight:700 }}>{st.label}</span>
                  </td>
                  <td style={{ padding:'11px 14px' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={()=>openRestock(item)} title="Restock"
                              style={{ padding:'5px 8px', background:'#e3f2fd', color:'#1565c0',
                                       border:'none', borderRadius:6, cursor:'pointer' }}>
                        <Icon name="restock" size={13}/>
                      </button>
                      {isAdmin && <>
                        <button onClick={()=>setEditItem({...item})} title="Edit"
                                style={{ padding:'5px 8px', background:'#f3e5f5', color:'#6a1b9a',
                                         border:'none', borderRadius:6, cursor:'pointer' }}>
                          <Icon name="edit" size={13}/>
                        </button>
                        <button onClick={()=>openAdjust(item)} title="Adjust stock"
                                style={{ padding:'5px 8px', background:'#fff8e1', color:'#e65100',
                                         border:'none', borderRadius:6, cursor:'pointer' }}>
                          <Icon name="warning" size={13}/>
                        </button>
                        <button onClick={()=>openDelete(item)} title="Delete"
                                style={{ padding:'5px 8px', background:'#ffebee', color:'#c62828',
                                         border:'none', borderRadius:6, cursor:'pointer' }}>
                          <Icon name="trash" size={13}/>
                        </button>
                      </>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length===0 && <div style={{ padding:40, textAlign:'center', color:'#aaa', fontSize:13 }}>No items match your search.</div>}
      </div>

      {/* Value summary */}
      <div style={{ marginTop:16, display:'flex', gap:12, flexWrap:'wrap' }}>
        {[['Stock Value (Cost)',   inventory.reduce((a,i)=>a+parseFloat(i.cost_price||0)*parseFloat(i.quantity||0),0),     '#666'],
          ['Stock Value (Retail)', inventory.reduce((a,i)=>a+parseFloat(i.selling_price||0)*parseFloat(i.quantity||0),0),  '#1565c0'],
          ['Potential Profit',     inventory.reduce((a,i)=>a+(parseFloat(i.selling_price||0)-parseFloat(i.cost_price||0))*parseFloat(i.quantity||0),0), '#2e7d32'],
        ].map(([l,v,c])=>(
          <div key={l} style={{ background:'#fff', borderRadius:10, padding:'12px 18px',
                                boxShadow:'0 1px 6px rgba(0,0,0,0.05)', fontSize:13 }}>
            <div style={{ color:'#888', fontSize:11 }}>{l}</div>
            <div style={{ fontWeight:800, fontSize:16, color:c }}>{fmt(v)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// SALES PAGE
// ============================================================
function SalesPage({ inventory, sales, onAddSale, onDeleteByDate, onDeleteSale, currentUser, setModal, showNotif }) {
  const isMobile = useIsMobile();
  const [cartItems,   setCartItems]   = useState([]);
  const [searchItem,  setSearchItem]  = useState('');
  const [viewReceipt, setViewReceipt] = useState(null);
  const [dateFilter,  setDateFilter]  = useState(today());
  const [completing,  setCompleting]  = useState(false);

  const available = inventory.filter(i =>
    parseFloat(i.quantity||0)>0 && i.name.toLowerCase().includes(searchItem.toLowerCase())
  );

  const addToCart = (item) => {
    setCartItems(prev => {
      const ex = prev.find(c=>c.item_id===item.id);
      if (ex) return prev.map(c=>c.item_id===item.id ? {...c,quantity:c.quantity+1} : c);
      return [...prev, { item_id:item.id, name:item.name, quantity:1,
                         price:parseFloat(item.selling_price||0), cost:parseFloat(item.cost_price||0), max_qty:parseFloat(item.quantity||0) }];
    });
    setSearchItem('');
  };

  const updateQty = (itemId, qty) => {
    const item = cartItems.find(c=>c.item_id===itemId);
    const parsed = parseFloat(qty);
    if (isNaN(parsed) || parsed <= 0 || parsed > item.max_qty) return;
    const rounded = Math.round(parsed * 100) / 100;
    setCartItems(prev=>prev.map(c=>c.item_id===itemId?{...c,quantity:rounded}:c));
  };

  const cartTotal  = cartItems.reduce((a,c)=>a+c.price*c.quantity, 0);
  const cartProfit = cartItems.reduce((a,c)=>a+(c.price-c.cost)*c.quantity, 0);

  const submitSale = async () => {
    if (!cartItems.length) return;
    setCompleting(true);
    try {
      const data = await onAddSale({
        items: cartItems.map(c=>({ item_id:c.item_id, quantity:c.quantity }))
      });
      setViewReceipt(data.receipt);
      setCartItems([]);
    } catch(e) {
      alert('Sale failed: ' + e.message);
    } finally {
      setCompleting(false);
    }
  };

  const filteredSales = sales.filter(s => !dateFilter || s.date===dateFilter);

  // ── Receipt view ──────────────────────────────────────────────
  // Mobile: styled card matching reference image (dark header, scalloped edge, clean body)
  // Desktop: original compact monospace layout, unchanged
  // Print: only .receipt-printable is visible when printing
  if (viewReceipt) return (
    <>
      {/* ── Print stylesheet injected inline so no separate CSS file is needed ── */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .receipt-printable, .receipt-printable * { visibility: visible !important; }
          .receipt-printable {
            position: fixed !important;
            inset: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          /* Hide buttons when printing */
          .receipt-no-print { display: none !important; }
        }

        /* ── Scalloped / zigzag bottom edge on the dark header ── */
        .receipt-header-scallop {
          position: relative;
          background: #1a3a2a;
          padding: 28px 20px 36px;
          text-align: center;
          border-radius: 14px 14px 0 0;
        }
        .receipt-header-scallop::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 20px;
          background: radial-gradient(circle at 10px -1px, transparent 12px, #fff 13px);
          background-size: 20px 20px;
          background-repeat: repeat-x;
        }

        /* ── Mobile-only receipt card styles ── */
        @media (max-width: 768px) {
          .receipt-card-mobile {
            background: #fff;
            border-radius: 14px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.18);
            overflow: hidden;
            font-family: 'Segoe UI', sans-serif;
          }
          .receipt-meta-mobile {
            padding: 18px 20px 10px;
            text-align: center;
            font-size: 13px;
            color: #333;
            line-height: 1.7;
          }
          .receipt-body-mobile {
            padding: 6px 18px 14px;
          }
          .receipt-thankyou-mobile {
            background: #e8f5e9;
            padding: 11px 16px;
            text-align: center;
            font-size: 13px;
            font-weight: 600;
            color: #2e7d32;
            letter-spacing: 0.3px;
          }
        }

        /* ── Desktop: keep original monospace look ── */
        @media (min-width: 769px) {
          .receipt-card-desktop {
            background: #fff;
            border-radius: 12px;
            padding: 20px 14px;
            box-shadow: 0 2px 20px rgba(0,0,0,0.1);
            font-family: monospace;
            font-size: 12px;
          }
        }
      `}</style>

      {/* ── Outer wrapper ── */}
      <div className="receipt-printable" style={{ maxWidth: isMobile ? '100%' : 480, margin:'0 auto' }}>

        {/* ════════════════════════════════
            MOBILE LAYOUT
            ════════════════════════════════ */}
        {isMobile && (
          <div className="receipt-card-mobile">

            {/* Dark green header with sprout icon */}
            <div className="receipt-header-scallop">
              {/* Sprout icon — inline SVG matching reference */}
              <div style={{ marginBottom:8 }}>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="18" cy="18" r="18" fill="#2e7d32"/>
                  <path d="M18 26V16" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M18 20 C18 20 13 18 13 13 C13 13 18 13 18 20Z" fill="#fff"/>
                  <path d="M18 18 C18 18 23 16 23 11 C23 11 18 11 18 18Z" fill="#a5d6a7"/>
                </svg>
              </div>
              <div style={{ color:'#fff', fontSize:18, fontWeight:800, letterSpacing:'1px', marginBottom:2 }}>
                MACY'S AGROFEEDS
              </div>
              <div style={{ color:'#81c784', fontSize:12, fontWeight:400 }}>
                Machakos, Kenya
              </div>
            </div>

            {/* Meta: date, receipt number, cashier */}
            <div className="receipt-meta-mobile">
              <div>Date: {viewReceipt.date} &nbsp; {viewReceipt.time}</div>
              <div>Receipt: {viewReceipt.receipt_number}</div>
              <div>Cashier: {viewReceipt.cashier || currentUser.name}</div>
            </div>

            {/* Items table */}
            <div className="receipt-body-mobile">
              <div style={{ borderTop:'1px dashed #ccc', marginBottom:10 }}/>
              <table style={{ width:'100%', borderCollapse:'collapse', tableLayout:'auto' }}>
                <colgroup>
                  <col style={{ width:'62%' }}/>
                  <col style={{ width:'38%' }}/>
                </colgroup>
                <thead>
                  <tr>
                    <th style={{ textAlign:'left', fontSize:11, fontWeight:700, color:'#555',
                                 letterSpacing:'0.8px', paddingBottom:8 }}>ITEM</th>
                    <th style={{ textAlign:'right', fontSize:11, fontWeight:700, color:'#555',
                                 letterSpacing:'0.8px', paddingBottom:8 }}>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {(viewReceipt.items||[]).map((it,i)=>(
                    <tr key={i} style={{ borderBottom:'1px solid #f0f0f0' }}>
                      <td style={{ padding:'10px 6px 10px 0', verticalAlign:'top' }}>
                        {/* Item name — bold, dark */}
                        <div style={{ fontWeight:700, color:'#111', fontSize:13, wordBreak:'break-word' }}>
                          {it.name}
                        </div>
                        {/* Qty × unit price — muted, smaller */}
                        <div style={{ fontSize:11, color:'#888', marginTop:3 }}>
                          {it.quantity} &times; {fmt(it.unit_price)}
                        </div>
                      </td>
                      <td style={{ textAlign:'right', verticalAlign:'top', fontWeight:700,
                                   fontSize:13, paddingTop:10, color:'#111', wordBreak:'break-word' }}>
                        {fmt(it.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Grand total row */}
              <div style={{ borderTop:'1.5px dashed #bbb', marginTop:10, paddingTop:12,
                            display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontWeight:800, fontSize:15, color:'#111', letterSpacing:'0.5px' }}>TOTAL</span>
                <span style={{ fontWeight:800, fontSize:18, color:'#111' }}>{fmt(viewReceipt.total)}</span>
              </div>
            </div>

            {/* Thank-you footer with diamond decorators */}
            <div className="receipt-thankyou-mobile">
              ✦ Thank you for shopping! ✦
            </div>

            {/* ── Buttons — NOT modified, exact same handlers & styles as original ── */}
            <div className="receipt-no-print" style={{ display:'flex', gap:8, padding:'14px 18px' }}>
              <button onClick={()=>window.print()}
                      style={{ flex:1, padding:'9px', background:'#1a3a2a', color:'#fff', border:'none',
                               borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600 }}>🖨 Print</button>
              <button onClick={()=>setViewReceipt(null)}
                      style={{ flex:1, padding:'9px', background:'#f5f5f5', color:'#555', border:'none',
                               borderRadius:8, cursor:'pointer', fontSize:13 }}>Close</button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════
            DESKTOP LAYOUT — unchanged
            ════════════════════════════════ */}
        {!isMobile && (
          <div className="receipt-card-desktop">
            <div style={{ textAlign:'center', marginBottom:14 }}>
              <div style={{ fontSize:15, fontWeight:800 }}>🌱 MACY'S AGROFEEDS</div>
              <div style={{ color:'#666', fontSize:11 }}>Machakos, Kenya</div>
              <div style={{ borderTop:'1px dashed #ccc', margin:'8px 0' }}/>
              <div style={{ fontSize:11 }}>Date: {viewReceipt.date}  {viewReceipt.time}</div>
              <div style={{ fontSize:11 }}>Receipt: {viewReceipt.receipt_number}</div>
              <div style={{ fontSize:11 }}>Cashier: {viewReceipt.cashier || currentUser.name}</div>
              <div style={{ borderTop:'1px dashed #ccc', margin:'8px 0' }}/>
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse', tableLayout:'fixed' }}>
              <colgroup>
                <col style={{ width:'68%' }}/>
                <col style={{ width:'32%' }}/>
              </colgroup>
              <thead><tr style={{ borderBottom:'1px dashed #aaa' }}>
                <th style={{ textAlign:'left', padding:'4px 4px 4px 0', fontSize:10, letterSpacing:'0.5px' }}>ITEM</th>
                <th style={{ textAlign:'right', padding:'4px 0', fontSize:10, letterSpacing:'0.5px' }}>TOTAL</th>
              </tr></thead>
              <tbody>
                {(viewReceipt.items||[]).map((it,i)=>(
                  <tr key={i} style={{ borderBottom:'1px dotted #ddd' }}>
                    <td style={{ padding:'5px 4px 5px 0', verticalAlign:'top' }}>
                      <div style={{ fontWeight:600, color:'#111', fontSize:11, wordBreak:'break-word' }}>{it.name}</div>
                      <div style={{ fontSize:10, color:'#888', marginTop:1 }}>
                        {it.quantity} &times; {fmt(it.unit_price)}
                      </div>
                    </td>
                    <td style={{ textAlign:'right', verticalAlign:'top', fontWeight:600, fontSize:11, paddingTop:5, wordBreak:'break-word' }}>
                      {fmt(it.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ borderTop:'1px dashed #ccc', marginTop:10, paddingTop:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:15 }}>
                <span>TOTAL</span><span>{fmt(viewReceipt.total)}</span>
              </div>
            </div>
            <div style={{ borderTop:'1px dashed #ccc', marginTop:10, paddingTop:8,
                          textAlign:'center', color:'#666', fontSize:11 }}>Thank you for shopping!</div>
            {/* ── Buttons — NOT modified ── */}
            <div className="receipt-no-print" style={{ display:'flex', gap:8, marginTop:16 }}>
              <button onClick={()=>window.print()}
                      style={{ flex:1, padding:'9px', background:'#1a3a2a', color:'#fff', border:'none',
                               borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600 }}>🖨 Print</button>
              <button onClick={()=>setViewReceipt(null)}
                      style={{ flex:1, padding:'9px', background:'#f5f5f5', color:'#555', border:'none',
                               borderRadius:8, cursor:'pointer', fontSize:13 }}>Close</button>
            </div>
          </div>
        )}

      </div>
    </>
  );

  return (
    <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 340px', gap: isMobile ? 12 : 20, alignItems:'start' }}>
      <div>
        {dateFilter && (() => {
          const ds = sales.filter(s => s.date === dateFilter);
          const dr = ds.reduce((a,s) => a + parseFloat(s.total_amount||0), 0);
          const dp = ds.reduce((a,s) => a + parseFloat(s.total_profit||0), 0);
          return (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap: isMobile ? 8 : 12, marginBottom: isMobile ? 10 : 14 }}>
              {[["That Day's Revenue", fmt(dr), '#e3f2fd', '#1565c0'],
                ["That Day's Profit",  fmt(dp), '#e8f5e9', '#2e7d32'],
                ["That Day's Sales",   ds.length, '#f3e5f5', '#6a1b9a']
              ].map(([l,v,bg,cc]) => (
                <div key={l} style={{ background:bg, borderRadius:12, padding: isMobile ? '12px 10px' : '14px 16px',
                                      boxShadow:'0 1px 6px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: isMobile ? 10 : 11, color:'#666', lineHeight:1.3, marginBottom:4 }}>{l}</div>
                  <div style={{ fontWeight:800, color:cc, fontSize: isMobile ? 15 : 18 }}>{v}</div>
                </div>
              ))}
            </div>
          );
        })()}
        <div style={{ background:'#fff', borderRadius:12, padding:20,
                      boxShadow:'0 1px 8px rgba(0,0,0,0.06)',
                      maxHeight: isMobile ? 500 : 'none', overflowY: isMobile ? 'auto' : 'visible' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:'#1a3a2a' }}>Sales History</h3>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <input type="date" value={dateFilter} onChange={e=>setDateFilter(e.target.value)}
                     style={{ padding:'6px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:12 }}/>
              {dateFilter && currentUser?.role==='admin' && (
                <button onClick={() => setModal(
                  <div>
                    <h3 style={{ margin:'0 0 12px', color:'#1a3a2a' }}>Delete Sales for {dateFilter}?</h3>
                    <p style={{ color:'#666', fontSize:13, margin:'0 0 18px' }}>
                      This will permanently delete all sales recorded on <strong>{dateFilter}</strong>. This cannot be undone.
                    </p>
                    <div style={{ display:'flex', gap:10 }}>
                      <button onClick={()=>setModal(null)}
                              style={{ flex:1, padding:'9px', border:'1.5px solid #ddd', borderRadius:8,
                                       background:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}>
                        Cancel
                      </button>
                      <button onClick={async()=>{
                        try { await onDeleteByDate(dateFilter); setModal(null); setDateFilter(''); }
                        catch(e){ showNotif(e.message,'error'); setModal(null); }
                      }} style={{ flex:1, padding:'9px', background:'#c62828', color:'#fff',
                                  border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:700 }}>
                        🗑 Delete All
                      </button>
                    </div>
                  </div>
                )} style={{ padding:'6px 12px', background:'#ffebee', color:'#c62828',
                            border:'1px solid #ffcdd2', borderRadius:8, cursor:'pointer',
                            fontSize:12, fontWeight:600, whiteSpace:'nowrap' }}>
                  🗑 Delete Day
                </button>
              )}
            </div>
          </div>
          {(() => {
            const ts = sales.filter(s=>s.date===today());
            const tr = ts.reduce((a,s)=>a+parseFloat(s.total_amount||0),0);
            const tp = ts.reduce((a,s)=>a+parseFloat(s.total_profit||0),0);
            return ts.length>0 ? (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:14 }}>
                {[["Today's Revenue",fmt(tr),'#e3f2fd','#1565c0'],
                  ["Today's Profit", fmt(tp),'#e8f5e9','#2e7d32'],
                  ["Today's Sales",  ts.length,'#f3e5f5','#6a1b9a']
                ].map(([l,v,bg,cc])=>(
                  <div key={l} style={{ background:bg, borderRadius:10, padding:'10px 8px' }}>
                    <div style={{ fontSize:10, color:'#666', lineHeight:1.3, marginBottom:4 }}>{l}</div>
                    <div style={{ fontWeight:800, color:cc, fontSize: isMobile ? 14 : 16 }}>{v}</div>
                  </div>
                ))}
              </div>
            ) : null;
          })()}
          {isMobile ? (
            <div>
              <div style={{ background:'#f5f5f5', padding:'7px 4px', marginBottom:2, borderRadius:6 }}>
                <span style={{ fontSize:11, fontWeight:700, color:'#444' }}>Date</span>
              </div>
              {filteredSales.length===0
                ? <div style={{ padding:'20px 0', textAlign:'center', color:'#aaa', fontSize:13 }}>No sales found.</div>
                : filteredSales.map(s=>(
                  <div key={s.id} style={{ padding:'10px 4px', borderBottom:'1px solid #f0f0f0' }}>
                    <div style={{ fontSize:11, color:'#888', marginBottom:3 }}>{s.date}</div>
                    <div style={{ fontSize:12, color:'#333', marginBottom:6 }}>
                      {(s.items||[]).map(i=>`${i.name} ×${i.quantity}`).join(', ')}
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <span style={{ fontWeight:700, color:'#1565c0', fontSize:13, marginRight:10 }}>{fmt(s.total_amount)}</span>
                        <span style={{ fontWeight:700, color:'#2e7d32', fontSize:13 }}>{fmt(s.total_profit)}</span>
                      </div>
                      <div style={{ display:'flex', gap:6 }}>
                        <button onClick={async()=>{ const d=await api(`/api/sales/${s.id}/receipt`); setViewReceipt(d.receipt); }}
                                style={{ padding:'3px 10px', background:'#e8f5e9', color:'#2e7d32',
                                         border:'none', borderRadius:6, cursor:'pointer', fontSize:11, fontWeight:600 }}>
                          Receipt
                        </button>
                        {currentUser?.role==='admin' && (
                          <button onClick={()=>setModal(
                            <div>
                              <h3 style={{ margin:'0 0 10px', color:'#c62828' }}>Delete this sale?</h3>
                              <p style={{ color:'#666', fontSize:13, margin:'0 0 16px' }}>
                                {s.date} — {fmt(s.total_amount)}<br/>
                                Stock will be restored automatically.
                              </p>
                              <div style={{ display:'flex', gap:10 }}>
                                <button onClick={()=>setModal(null)}
                                        style={{ flex:1, padding:'8px', border:'1.5px solid #ddd', borderRadius:8,
                                                 background:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}>Cancel</button>
                                <button onClick={async()=>{ await onDeleteSale(s.id); setModal(null); }}
                                        style={{ flex:1, padding:'8px', background:'#c62828', color:'#fff',
                                                 border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:700 }}>Delete</button>
                              </div>
                            </div>
                          )} style={{ padding:'3px 8px', background:'#ffebee', color:'#c62828',
                                      border:'none', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:700 }}>
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead><tr style={{ background:'#f5f5f5' }}>
                  {['Date','Items','Amount','Profit',''].map(h=>
                    <th key={h} style={{ padding:'9px 12px', textAlign:'left', fontWeight:700, color:'#444', fontSize:12 }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {filteredSales.map(s=>(
                    <tr key={s.id} style={{ borderBottom:'1px solid #f5f5f5' }}>
                      <td style={{ padding:'10px 12px', color:'#666' }}>{s.date}</td>
                      <td style={{ padding:'10px 12px', fontSize:11 }}>
                        {(s.items||[]).map(i=>(
                          <span key={i.item_id||i.id} style={{ display:'inline-block', background:'#f0f0f0',
                                borderRadius:4, padding:'1px 6px', marginRight:4, marginBottom:2, fontSize:11 }}>
                            {i.name} ×{i.quantity}
                          </span>
                        ))}
                      </td>
                      <td style={{ padding:'10px 12px', fontWeight:700, color:'#1565c0' }}>{fmt(s.total_amount)}</td>
                      <td style={{ padding:'10px 12px', fontWeight:700, color:'#2e7d32' }}>{fmt(s.total_profit)}</td>
                      <td style={{ padding:'10px 12px' }}>
                        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                          <button onClick={async()=>{ const d=await api(`/api/sales/${s.id}/receipt`); setViewReceipt(d.receipt); }}
                                  style={{ padding:'4px 10px', background:'#e8f5e9', color:'#2e7d32',
                                           border:'none', borderRadius:6, cursor:'pointer', fontSize:11, fontWeight:600 }}>
                            Receipt
                          </button>
                          {currentUser?.role==='admin' && (
                            <button onClick={()=>setModal(
                              <div>
                                <h3 style={{ margin:'0 0 10px', color:'#c62828' }}>Delete this sale?</h3>
                                <p style={{ color:'#666', fontSize:13, margin:'0 0 16px' }}>
                                  {s.date} — {fmt(s.total_amount)}<br/>
                                  Stock will be restored automatically.
                                </p>
                                <div style={{ display:'flex', gap:10 }}>
                                  <button onClick={()=>setModal(null)}
                                          style={{ flex:1, padding:'8px', border:'1.5px solid #ddd', borderRadius:8,
                                                   background:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}>Cancel</button>
                                  <button onClick={async()=>{ await onDeleteSale(s.id); setModal(null); }}
                                          style={{ flex:1, padding:'8px', background:'#c62828', color:'#fff',
                                                   border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:700 }}>Delete</button>
                                </div>
                              </div>
                            )} style={{ padding:'4px 8px', background:'#ffebee', color:'#c62828',
                                        border:'none', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:700 }}>
                              ✕
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredSales.length===0 && <div style={{ padding:24, textAlign:'center', color:'#aaa', fontSize:13 }}>No sales found.</div>}
            </div>
          )}
        </div>
      </div>

      {/* Cart */}
      <div>
        <div style={{ background:'#fff', borderRadius:12, padding: isMobile ? 14 : 20,
                      boxShadow:'0 1px 8px rgba(0,0,0,0.06)', position: isMobile ? 'static' : 'sticky',
                      top:80, width:'100%', boxSizing:'border-box', overflowX:'hidden' }}>
          <h3 style={{ margin:'0 0 14px', fontSize:15, fontWeight:700, color:'#1a3a2a' }}>🛒 New Sale</h3>
          <div style={{ position:'relative', marginBottom:14 }}>
            <input value={searchItem} onChange={e=>setSearchItem(e.target.value)}
                   placeholder="Search product…"
                   style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1.5px solid #ddd',
                            fontSize:13, boxSizing:'border-box' }}/>
            {searchItem && (
              <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'#fff',
                            borderRadius:8, boxShadow:'0 4px 20px rgba(0,0,0,0.12)', zIndex:100,
                            maxHeight:220, overflowY:'auto', border:'1px solid #eee' }}>
                {available.length===0
                  ? <div style={{ padding:12, color:'#aaa', fontSize:12 }}>No items found</div>
                  : available.map(i=>(
                    <div key={i.id} onClick={()=>addToCart(i)}
                         style={{ padding:'10px 14px', cursor:'pointer', borderBottom:'1px solid #f5f5f5', fontSize:13 }}
                         onMouseEnter={e=>e.currentTarget.style.background='#f5f5f5'}
                         onMouseLeave={e=>e.currentTarget.style.background=''}>
                      <div style={{ fontWeight:600, color:'#222' }}>{i.name}</div>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#888' }}>
                        <span>{i.category}</span>
                        <span style={{ color:'#2e7d32', fontWeight:600 }}>{fmt(i.selling_price)} | {i.quantity} left</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {cartItems.length===0
            ? <div style={{ padding:'28px 0', textAlign:'center', color:'#bbb', fontSize:13 }}>Search and add items to cart</div>
            : <div>
                {cartItems.map(c=>(
                  <div key={c.item_id} style={{ display:'flex', alignItems:'center', gap:8,
                                                padding:'8px 0', borderBottom:'1px solid #f5f5f5' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:'#222' }}>{c.name}</div>
                      <div style={{ fontSize:11, color:'#888' }}>{fmt(c.price)} each</div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <button onClick={()=>updateQty(c.item_id, Math.round((c.quantity-0.25)*100)/100)}
                              style={{ width:24, height:24, borderRadius:6, border:'1px solid #ddd',
                                       background:'#f5f5f5', cursor:'pointer', fontSize:14,
                                       display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                      <input type="number" value={c.quantity}
                        onChange={e=>updateQty(c.item_id, e.target.value)}
                        step="0.25" min="0.25"
                        style={{ width:52, textAlign:'center', padding:'3px 0', border:'1px solid #ddd', borderRadius:6, fontSize:13 }}/>
                      <button onClick={()=>updateQty(c.item_id, Math.round((c.quantity+0.25)*100)/100)}
                              style={{ width:24, height:24, borderRadius:6, border:'1px solid #ddd',
                                       background:'#f5f5f5', cursor:'pointer', fontSize:14,
                                       display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
                    </div>
                    <div style={{ fontSize:12, fontWeight:700, color:'#333', minWidth:70, textAlign:'right' }}>
                      {fmt(c.price*c.quantity)}
                    </div>
                    <button onClick={()=>setCartItems(prev=>prev.filter(x=>x.item_id!==c.item_id))}
                            style={{ background:'none', border:'none', cursor:'pointer', color:'#ef5350', padding:2 }}>
                      <Icon name="x" size={14}/>
                    </button>
                  </div>
                ))}
                <div style={{ marginTop:14, paddingTop:14, borderTop:'2px solid #f0f0f0' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#666', marginBottom:4 }}>
                    <span>Revenue</span><span style={{ fontWeight:700 }}>{fmt(cartTotal)}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#2e7d32', marginBottom:14 }}>
                    <span>Profit</span><span style={{ fontWeight:700 }}>{fmt(cartProfit)}</span>
                  </div>
                  <button onClick={submitSale} disabled={completing}
                          style={{ width:'100%', padding:'12px', background: completing?'#4a6a4a':'#1a3a2a',
                                   color:'#fff', border:'none', borderRadius:10,
                                   cursor: completing?'not-allowed':'pointer',
                                   fontSize:14, fontWeight:700, display:'flex', alignItems:'center',
                                   justifyContent:'center', gap:8 }}>
                    {completing ? <><Spinner size={16} color="#fff"/> Processing…</> : `✓ Complete Sale — ${fmt(cartTotal)}`}
                  </button>
                </div>
              </div>}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// EXPENSES PAGE
// ============================================================
function ExpensesPage({ expenses, restockExpenses, onAdd, onDelete, isAdmin,
                        netProfit, totalProfit, totalRevenue, revenueAfterRestock,
                        totalPersonalExpenses, totalRestockExpenses, totalExpenses }) {
  const isMobile = useIsMobile();

  // ── Shared form state: one form per table ──
  const emptyForm = { date: today(), description: '', amount: '' };
  const [personalForm,     setPersonalForm]     = useState(emptyForm);
  const [restockForm,      setRestockForm]       = useState(emptyForm);
  const [showPersonalForm, setShowPersonalForm]  = useState(false);
  const [showRestockForm,  setShowRestockForm]   = useState(false);
  const [savingPersonal,   setSavingPersonal]    = useState(false);
  const [savingRestock,    setSavingRestock]     = useState(false);

  // Monthly breakdown for personal expenses
  const monthlyPersonal = {};
  expenses.forEach(e => {
    const m = e.date.substring(0,7);
    monthlyPersonal[m] = (monthlyPersonal[m]||0) + parseFloat(e.amount||0);
  });

  // ── Reusable expense table ──────────────────────────────
  const ExpenseTable = ({ rows, expenseType }) => (
    <>
      {isMobile ? (
        <div style={{ padding:'0 10px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'76px 1fr 80px 28px',
                        gap:4, padding:'8px 0', borderBottom:'2px solid #eee' }}>
            {['Date','Description','Amount',''].map(h=>(
              <div key={h} style={{ fontSize:11, fontWeight:700, color:'#444' }}>{h}</div>
            ))}
          </div>
          {rows.length===0
            ? <div style={{ padding:'16px 0', color:'#aaa', fontSize:13 }}>No entries yet.</div>
            : rows.map(e=>(
              <div key={e.id} style={{ display:'grid', gridTemplateColumns:'76px 1fr 80px 28px',
                                       gap:4, padding:'9px 0', borderBottom:'1px solid #f5f5f5', alignItems:'center' }}>
                <div style={{ fontSize:11, color:'#666' }}>{e.date.substring(5)}</div>
                <div style={{ fontSize:11, color:'#333', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.description}</div>
                <div style={{ fontSize:12, fontWeight:700, color:'#c62828' }}>{fmt(e.amount)}</div>
                <div>{isAdmin && <button onClick={()=>onDelete(e.id, expenseType)}
                                         style={{ background:'none', border:'none', cursor:'pointer', color:'#ef5350', padding:0 }}>
                  <Icon name="trash" size={13}/>
                </button>}</div>
              </div>
            ))
          }
          <div style={{ display:'grid', gridTemplateColumns:'76px 1fr 80px 28px',
                        gap:4, padding:'9px 0', borderTop:'2px solid #eee' }}>
            <div style={{ fontSize:12, fontWeight:700, gridColumn:'1/3' }}>TOTAL</div>
            <div style={{ fontSize:13, fontWeight:800, color:'#c62828' }}>
              {fmt(rows.reduce((a,e)=>a+parseFloat(e.amount||0),0))}
            </div>
            <div/>
          </div>
        </div>
      ) : (
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead><tr style={{ background:'#f5f5f5' }}>
              {['Date','Description','Amount',''].map(h=>
                <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontWeight:700, color:'#444', fontSize:12 }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {rows.length===0
                ? <tr><td colSpan={4} style={{ padding:'16px 14px', color:'#aaa', fontSize:13 }}>No entries yet.</td></tr>
                : rows.map(e=>(
                  <tr key={e.id} style={{ borderBottom:'1px solid #f5f5f5' }}>
                    <td style={{ padding:'11px 14px', color:'#666' }}>{e.date}</td>
                    <td style={{ padding:'11px 14px', color:'#333' }}>{e.description}</td>
                    <td style={{ padding:'11px 14px', fontWeight:700, color:'#c62828' }}>{fmt(e.amount)}</td>
                    <td style={{ padding:'11px 14px' }}>
                      {isAdmin && <button onClick={()=>onDelete(e.id, expenseType)}
                                          style={{ background:'none', border:'none', cursor:'pointer', color:'#ef5350' }}>
                        <Icon name="trash" size={14}/>
                      </button>}
                    </td>
                  </tr>
                ))
              }
            </tbody>
            <tfoot><tr style={{ background:'#f9f9f9', borderTop:'2px solid #eee' }}>
              <td colSpan={2} style={{ padding:'11px 14px', fontWeight:700, fontSize:13 }}>TOTAL</td>
              <td style={{ padding:'11px 14px', fontWeight:800, color:'#c62828', fontSize:15 }}>
                {fmt(rows.reduce((a,e)=>a+parseFloat(e.amount||0),0))}
              </td>
              <td/>
            </tr></tfoot>
          </table>
        </div>
      )}
    </>
  );

  // ── Add-expense form (shared layout, parameterised) ──────
  const AddForm = ({ form, setForm, saving, onSubmit, onCancel }) => (
    <div style={{ background:'#fff', borderRadius:12, padding:20, marginBottom:16,
                  boxShadow:'0 1px 8px rgba(0,0,0,0.06)', border:'1px solid #ffccbc' }}>
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr 1fr', gap:12 }}>
        {[['Date','date','date'],['Description','description','text'],['Amount (KES)','amount','number']].map(([l,f,t])=>(
          <div key={f}>
            <label style={{ fontSize:12, fontWeight:600, color:'#444', display:'block', marginBottom:4 }}>{l}</label>
            <input type={t} value={form[f]} onChange={ev=>setForm(p=>({...p,[f]:ev.target.value}))}
                   placeholder={f==='amount'?'0.00':''}
                   style={{ width:'100%', padding:'8px 11px', borderRadius:7,
                            border:'1.5px solid #ddd', fontSize:13, boxSizing:'border-box' }}/>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:8, marginTop:12 }}>
        <button onClick={onCancel}
                style={{ padding:'9px 16px', border:'1.5px solid #ddd', borderRadius:8,
                         background:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}>Cancel</button>
        <button disabled={saving} onClick={onSubmit}
                style={{ padding:'9px 20px', background: saving?'#a5d6a7':'#4caf50',
                         color:'#fff', border:'none', borderRadius:8,
                         cursor: saving?'not-allowed':'pointer', fontSize:13, fontWeight:700 }}>
          {saving?'Saving…':'Save Expense'}
        </button>
      </div>
    </div>
  );

  const handleAddPersonal = async () => {
    if (!personalForm.description || !personalForm.amount) return;
    setSavingPersonal(true);
    try {
      await onAdd({ ...personalForm, amount: parseFloat(personalForm.amount), expense_type: 'personal' });
      setPersonalForm(emptyForm);
      setShowPersonalForm(false);
    } catch(e){ alert(e.message); }
    finally { setSavingPersonal(false); }
  };

  const handleAddRestock = async () => {
    if (!restockForm.description || !restockForm.amount) return;
    setSavingRestock(true);
    try {
      await onAdd({ ...restockForm, amount: parseFloat(restockForm.amount), expense_type: 'restock' });
      setRestockForm(emptyForm);
      setShowRestockForm(false);
    } catch(e){ alert(e.message); }
    finally { setSavingRestock(false); }
  };

  return (
    <div>
      {/* ── 5 Summary Cards ─────────────────────────────────── */}
      <div style={{ display:'grid',
                    gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(auto-fit,minmax(180px,1fr))',
                    gap: isMobile ? 8 : 16, marginBottom: isMobile ? 12 : 22, flexWrap:'wrap' }}>
        {[
          ['Total Expenses',        fmt(totalExpenses),        '#c62828', 'Personal + Restock'],
          ['Gross Profit',          fmt(totalProfit),          '#2e7d32', 'Before expenses'],
          ['Net Profit',            fmt(netProfit),            netProfit>=0?'#558b2f':'#c62828', 'Gross − Personal expenses'],
          ['Total Revenue',         fmt(totalRevenue),         '#1565c0', 'All recorded sales'],
          ['Revenue After Restock', fmt(revenueAfterRestock),  '#00838f', `Revenue − ${fmt(totalRestockExpenses)} restock`],
        ].map(([l,v,col,s])=>(
          <div key={l} style={{ background:'#fff', borderRadius:12,
                                padding: isMobile ? '10px 10px' : '18px 22px',
                                boxShadow:'0 1px 8px rgba(0,0,0,0.06)', borderLeft:`4px solid ${col}` }}>
            <div style={{ fontSize: isMobile ? 9 : 11, color:'#888', fontWeight:600 }}>{l}</div>
            <div style={{ fontSize: isMobile ? 13 : 20, fontWeight:800, color:col, margin:'4px 0 2px' }}>{v}</div>
            <div style={{ fontSize: isMobile ? 9 : 11, color:'#aaa' }}>{s}</div>
          </div>
        ))}
      </div>

      {/* ── Formula card (desktop only) ───────────────────── */}
      {!isMobile && (
        <div style={{ background:'#fff', borderRadius:12, padding:'14px 20px', marginBottom:20,
                      boxShadow:'0 1px 8px rgba(0,0,0,0.06)', borderLeft:'4px solid #1565c0' }}>
          <div style={{ fontSize:12, color:'#888', fontWeight:600, marginBottom:6 }}>Formulas</div>
          <div style={{ fontFamily:'monospace', fontSize:12, color:'#333', lineHeight:2 }}>
            <span style={{ color:'#00838f', fontWeight:700 }}>Revenue After Restock</span> = {fmt(totalRevenue)} − {fmt(totalRestockExpenses)} = <strong style={{ color:'#00838f' }}>{fmt(revenueAfterRestock)}</strong>
            {'  ·  '}
            <span style={{ color:'#558b2f', fontWeight:700 }}>Net Profit</span> = {fmt(totalProfit)} − {fmt(totalPersonalExpenses)} = <strong style={{ color: netProfit>=0?'#2e7d32':'#c62828' }}>{fmt(netProfit)}</strong>
          </div>
        </div>
      )}

      {/* ── Two-column tables layout ──────────────────────── */}
      <div style={{ display:'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: isMobile ? 14 : 20 }}>

        {/* ── Personal Expenses Table ── */}
        <div style={{ background:'#fff', borderRadius:12, boxShadow:'0 1px 8px rgba(0,0,0,0.06)', overflow:'hidden' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                        padding: isMobile ? '12px 14px' : '16px 20px',
                        borderBottom:'1px solid #f0f0f0' }}>
            <div>
              <h3 style={{ margin:0, fontSize: isMobile ? 13 : 15, fontWeight:700, color:'#1a3a2a' }}>
                👤 Personal Expenses
              </h3>
              <div style={{ fontSize:11, color:'#888', marginTop:2 }}>
                Total: <strong style={{ color:'#c62828' }}>{fmt(totalPersonalExpenses)}</strong>
              </div>
            </div>
            {isAdmin && (
              <button onClick={()=>{ setShowPersonalForm(!showPersonalForm); setPersonalForm(emptyForm); }}
                      style={{ padding: isMobile ? '6px 12px' : '8px 14px', background:'#4caf50', color:'#fff',
                               border:'none', borderRadius:10, cursor:'pointer',
                               fontSize: isMobile ? 11 : 13, fontWeight:600,
                               display:'flex', alignItems:'center', gap:5 }}>
                <Icon name="plus" size={13}/> Add
              </button>
            )}
          </div>
          {showPersonalForm && isAdmin && (
            <div style={{ padding: isMobile ? '12px 14px' : '16px 20px', borderBottom:'1px solid #f0f0f0' }}>
              <AddForm form={personalForm} setForm={setPersonalForm}
                       saving={savingPersonal} onSubmit={handleAddPersonal}
                       onCancel={()=>{ setShowPersonalForm(false); setPersonalForm(emptyForm); }}/>
            </div>
          )}
          <ExpenseTable rows={expenses} expenseType="personal"/>
        </div>

        {/* ── Restock Expenses Table ── */}
        <div style={{ background:'#fff', borderRadius:12, boxShadow:'0 1px 8px rgba(0,0,0,0.06)', overflow:'hidden' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                        padding: isMobile ? '12px 14px' : '16px 20px',
                        borderBottom:'1px solid #f0f0f0' }}>
            <div>
              <h3 style={{ margin:0, fontSize: isMobile ? 13 : 15, fontWeight:700, color:'#1a3a2a' }}>
                📦 Restock Expenses
              </h3>
              <div style={{ fontSize:11, color:'#888', marginTop:2 }}>
                Total: <strong style={{ color:'#c62828' }}>{fmt(totalRestockExpenses)}</strong>
              </div>
            </div>
            {isAdmin && (
              <button onClick={()=>{ setShowRestockForm(!showRestockForm); setRestockForm(emptyForm); }}
                      style={{ padding: isMobile ? '6px 12px' : '8px 14px', background:'#00838f', color:'#fff',
                               border:'none', borderRadius:10, cursor:'pointer',
                               fontSize: isMobile ? 11 : 13, fontWeight:600,
                               display:'flex', alignItems:'center', gap:5 }}>
                <Icon name="plus" size={13}/> Add
              </button>
            )}
          </div>
          {showRestockForm && isAdmin && (
            <div style={{ padding: isMobile ? '12px 14px' : '16px 20px', borderBottom:'1px solid #f0f0f0' }}>
              <AddForm form={restockForm} setForm={setRestockForm}
                       saving={savingRestock} onSubmit={handleAddRestock}
                       onCancel={()=>{ setShowRestockForm(false); setRestockForm(emptyForm); }}/>
            </div>
          )}
          <ExpenseTable rows={restockExpenses} expenseType="restock"/>
        </div>
      </div>

      {/* ── Monthly Breakdown (personal only, below tables) ── */}
      <div style={{ background:'#fff', borderRadius:12, padding: isMobile ? '12px 14px' : 20,
                    boxShadow:'0 1px 8px rgba(0,0,0,0.06)', marginTop: isMobile ? 14 : 20 }}>
        <h3 style={{ margin:'0 0 10px', fontSize: isMobile ? 13 : 14, fontWeight:700, color:'#1a3a2a' }}>Monthly Breakdown (Personal)</h3>
        {Object.entries(monthlyPersonal).sort((a,b)=>b[0].localeCompare(a[0])).map(([m,amt])=>(
          <div key={m} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                                 padding: isMobile ? '7px 0' : '10px 0', borderBottom:'1px solid #f5f5f5' }}>
            <div style={{ fontSize: isMobile ? 11 : 13, color:'#555' }}>
              {new Date(m+'-01').toLocaleDateString('en-KE',{month:'long',year:'numeric'})}
            </div>
            <div style={{ fontWeight:700, color:'#c62828' }}>{fmt(amt)}</div>
          </div>
        ))}
        {Object.keys(monthlyPersonal).length===0 && <div style={{ color:'#aaa', fontSize:13 }}>No personal expenses yet.</div>}
      </div>
    </div>
  );
}

// ============================================================
// REPORTS PAGE  (fetches directly from API)
// ============================================================
function ReportsPage({ businessInfo }) {
  const [month,   setMonth]   = useState(new Date().toISOString().substring(0,7));
  const [report,  setReport]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const fetchReport = async () => {
    setLoading(true); setError('');
    try {
      const data = await api(`/api/reports/monthly?month=${month}`);
      setReport(data);
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, [month]);

  const fs = report?.financial_summary;
  const im = report?.inventory_movement;
  const sl = report?.stock_loss_detection;

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:22 }}>
        <div>
          <label style={{ fontSize:12, fontWeight:600, color:'#444', display:'block', marginBottom:4 }}>Report Period</label>
          <input type="month" value={month} onChange={e=>setMonth(e.target.value)}
                 style={{ padding:'8px 12px', borderRadius:8, border:'1.5px solid #ddd', fontSize:14 }}/>
        </div>
        <button onClick={()=>window.print()}
                style={{ marginTop:18, padding:'9px 18px', background:'#1a3a2a', color:'#fff', border:'none',
                         borderRadius:10, cursor:'pointer', fontSize:13, fontWeight:600 }}>🖨 Print</button>
      </div>

      {loading && <div style={{ display:'flex', alignItems:'center', gap:10, color:'#888', padding:20 }}><Spinner/> Loading report…</div>}
      {error   && <div style={{ background:'#ffebee', color:'#c62828', padding:'12px 16px', borderRadius:8, fontSize:13 }}>{error}</div>}

      {fs && (
        <div style={{ background:'#fff', borderRadius:12, padding:22, marginBottom:18, boxShadow:'0 1px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin:'0 0 16px', fontSize:15, fontWeight:800, color:'#1a3a2a' }}>
            📈 Financial Summary — {new Date(month+'-01').toLocaleDateString('en-KE',{month:'long',year:'numeric'})}
          </h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:14, marginBottom:18 }}>
            {[['Revenue',                fmt(fs.total_revenue),            '#1565c0'],
              ['Revenue After Restock',  fmt(fs.revenue_after_restock),    '#00838f'],
              ['Gross Profit',           fmt(fs.total_profit),             '#2e7d32'],
              ['Personal Expenses',      fmt(fs.total_personal_expenses),  '#e65100'],
              ['Restock Expenses',       fmt(fs.total_restock_expenses),   '#c62828'],
              ['Net Profit',             fmt(fs.net_profit),               fs.net_profit>=0?'#558b2f':'#c62828'],
              ['Items Sold',             fs.total_items_sold,              '#6a1b9a'],
              ['Transactions',           fs.total_transactions,            '#e65100'],
            ].map(([l,v,c])=>(
              <div key={l} style={{ background:'#f9f9f9', borderRadius:10, padding:'14px 16px', borderLeft:`3px solid ${c}` }}>
                <div style={{ fontSize:11, color:'#888', fontWeight:600 }}>{l}</div>
                <div style={{ fontSize:20, fontWeight:800, color:c, marginTop:4 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ background:'#f9f9f9', borderRadius:10, padding:14, fontFamily:'monospace', fontSize:12, lineHeight:2 }}>
            <div>Revenue: {fmt(fs.total_revenue)} &nbsp;|&nbsp; Revenue After Restock: {fmt(fs.revenue_after_restock)}</div>
            <div>Gross Profit: {fmt(fs.total_profit)} &nbsp;|&nbsp; Net Profit (gross − personal expenses): {fmt(fs.net_profit)}</div>
            <div>Personal Expenses: {fmt(fs.total_personal_expenses)} &nbsp;|&nbsp; Restock Expenses: {fmt(fs.total_restock_expenses)}</div>
            {fs.total_revenue>0 && <div>Profit Margin: {fs.profit_margin_pct}%</div>}
          </div>
        </div>
      )}

      {im && (
        <div style={{ background:'#fff', borderRadius:12, padding:22, marginBottom:18, boxShadow:'0 1px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin:'0 0 16px', fontSize:15, fontWeight:800, color:'#1a3a2a' }}>📦 Inventory Movement</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
            {[['🚀 Fast-Moving', im.fast_moving, '#2e7d32'],
              ['🐌 Slow-Moving', im.slow_moving, '#e65100'],
            ].map(([title, items, c])=>(
              <div key={title}>
                <div style={{ fontSize:13, fontWeight:700, color:c, marginBottom:10 }}>{title}</div>
                {items.length===0
                  ? <div style={{ color:'#aaa', fontSize:12 }}>No data</div>
                  : items.map(it=>(
                    <div key={it.name} style={{ display:'flex', justifyContent:'space-between',
                                                padding:'7px 0', borderBottom:'1px solid #f5f5f5', fontSize:13 }}>
                      <span style={{ color:'#333' }}>{it.name}</span>
                      <span style={{ fontWeight:700, color:c }}>{it.units_sold} sold</span>
                    </div>
                  ))}
              </div>
            ))}
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:'#c62828', marginBottom:10 }}>❌ Out of Stock</div>
              {(im.out_of_stock||[]).length===0
                ? <div style={{ color:'#aaa', fontSize:12 }}>All items in stock ✓</div>
                : (im.out_of_stock).map(i=>(
                  <div key={i.id} style={{ padding:'7px 0', borderBottom:'1px solid #f5f5f5',
                                           fontSize:13, color:'#c62828', fontWeight:600 }}>{i.name}</div>
                ))}
            </div>
          </div>
        </div>
      )}

      {sl && (
        <div style={{ background:'#fff', borderRadius:12, padding:22, marginBottom:18,
                      boxShadow:'0 1px 8px rgba(0,0,0,0.06)',
                      border: sl.discrepancies_found>0?'2px solid #ffcc02':'1px solid #e0e0e0' }}>
          <h3 style={{ margin:'0 0 14px', fontSize:15, fontWeight:800, color:'#1a3a2a' }}>🔍 Stock Loss Detection</h3>
          <div style={{ background:'#f9f9f9', borderRadius:8, padding:'10px 14px', marginBottom:14,
                        fontFamily:'monospace', fontSize:12, color:'#555' }}>
            Rule: IF (opening − closing) ≠ total_sold → flag discrepancy
          </div>
          {sl.discrepancies_found===0
            ? <div style={{ display:'flex', alignItems:'center', gap:8, color:'#2e7d32', fontWeight:600, fontSize:13 }}>
                <Icon name="check" size={16}/> No stock discrepancies detected.
              </div>
            : sl.items.map(d=>(
              <div key={d.item_id} style={{ background:'#fff8e1', borderRadius:8, padding:'12px 14px',
                                            marginBottom:8, borderLeft:'3px solid #f9a825' }}>
                <div style={{ fontWeight:700, color:'#333' }}>{d.item_name}</div>
                <div style={{ fontSize:12, color:'#666', marginTop:4 }}>
                  Opening: {d.opening_stock} | Sold: {d.sold} | Expected: {d.expected_closing} | Actual: {d.actual_closing} |{' '}
                  <span style={{ color:'#c62828', fontWeight:700 }}>Unaccounted: {Math.abs(d.discrepancy)} units</span>
                </div>
              </div>
            ))}
        </div>
      )}

      {report?.expenses_detail && (
        <div style={{ background:'#fff', borderRadius:12, padding:22, boxShadow:'0 1px 8px rgba(0,0,0,0.06)',
                      maxHeight: window.innerWidth < 768 ? 360 : 'none',
                      display:'flex', flexDirection:'column' }}>
          <h3 style={{ margin:'0 0 14px', fontSize:15, fontWeight:800, color:'#1a3a2a', flexShrink:0 }}>💳 Expense Breakdown</h3>
          {report.expenses_detail.length===0
            ? <div style={{ color:'#aaa', fontSize:13 }}>No expenses for this period.</div>
            : <div style={{ overflowY: window.innerWidth < 768 ? 'auto' : 'visible',
                            overflowX:'auto', WebkitOverflowScrolling:'touch', flex:1 }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13,
                                minWidth: window.innerWidth < 768 ? 300 : 'auto' }}>
                  <thead><tr style={{ background:'#f5f5f5' }}>
                    {['Date','Description','Amount'].map(h=>
                      <th key={h} style={{ padding:'9px 12px', textAlign:'left', fontWeight:700, color:'#444', fontSize:12 }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {report.expenses_detail.map(e=>(
                      <tr key={e.id} style={{ borderBottom:'1px solid #f5f5f5' }}>
                        <td style={{ padding:'9px 12px', color:'#666' }}>{e.date}</td>
                        <td style={{ padding:'9px 12px' }}>{e.description}</td>
                        <td style={{ padding:'9px 12px', fontWeight:700, color:'#c62828' }}>{fmt(e.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>}
        </div>
      )}
    </div>
  );
}

// ============================================================
// ============================================================
// EDIT USER MODAL
// ============================================================
function EditUserModal({ user, onSave, onClose }) {
  const [username, setUsername] = useState(user.username);
  const [name,     setName]     = useState(user.name || '');
  const [password, setPassword] = useState('');
  const [role,     setRole]     = useState(user.role);
  const [saving,   setSaving]   = useState(false);

  return (
    <div>
      <h3 style={{ margin:'0 0 16px', color:'#1a3a2a' }}>Edit User: {user.username}</h3>
      <div style={{ marginBottom:12 }}>
        <label style={{ fontSize:12, fontWeight:600, color:'#444', display:'block', marginBottom:4 }}>Full Name</label>
        <input type="text" value={name} onChange={e=>setName(e.target.value)}
               style={{ width:'100%', padding:'9px 12px', borderRadius:8,
                        border:'1.5px solid #ddd', fontSize:13, boxSizing:'border-box' }}/>
      </div>
      <div style={{ marginBottom:12 }}>
        <label style={{ fontSize:12, fontWeight:600, color:'#444', display:'block', marginBottom:4 }}>Username</label>
        <input type="text" value={username} onChange={e=>setUsername(e.target.value)}
               style={{ width:'100%', padding:'9px 12px', borderRadius:8,
                        border:'1.5px solid #ddd', fontSize:13, boxSizing:'border-box' }}/>
      </div>
      <div style={{ marginBottom:12 }}>
        <label style={{ fontSize:12, fontWeight:600, color:'#444', display:'block', marginBottom:4 }}>New Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
               placeholder="Leave blank to keep current"
               style={{ width:'100%', padding:'9px 12px', borderRadius:8,
                        border:'1.5px solid #ddd', fontSize:13, boxSizing:'border-box' }}/>
      </div>
      <div style={{ marginBottom:18 }}>
        <label style={{ fontSize:12, fontWeight:600, color:'#444', display:'block', marginBottom:4 }}>Role</label>
        <select value={role} onChange={e=>setRole(e.target.value)}
                style={{ width:'100%', padding:'9px 12px', borderRadius:8,
                         border:'1.5px solid #ddd', fontSize:13, boxSizing:'border-box' }}>
          <option value="admin">Admin</option>
          <option value="attendant">Attendant</option>
        </select>
      </div>
      <div style={{ display:'flex', gap:10 }}>
        <button onClick={onClose}
                style={{ flex:1, padding:'10px', border:'1.5px solid #ddd', borderRadius:8,
                         background:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}>
          Cancel
        </button>
        <button disabled={saving} onClick={async () => {
          if (!username.trim()) return alert('Username cannot be empty');
          setSaving(true);
          try { await onSave({ name, username, role, ...(password ? { password } : {}) }); }
          catch(e) { alert(e.message); }
          finally { setSaving(false); }
        }} style={{ flex:1, padding:'10px', background:'#1a3a2a', color:'#fff',
                    border:'none', borderRadius:8, cursor: saving ? 'not-allowed' : 'pointer',
                    fontSize:13, fontWeight:700 }}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

// USERS PAGE
// ============================================================
function UsersPage({ users, setUsers, showNotif, currentUser, setModal }) {
  const isMobile = useIsMobile();
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ name:'', username:'', role:'attendant', password:'' });
  const [saving,  setSaving]  = useState(false);

  const handleEditUser = async (id, data) => {
    const result = await api(`/api/users/${id}`, { method:'PUT', body: data });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...result.user } : u));
    showNotif('User updated successfully');
  };

  const handleDeleteUser = async (id, username) => {
    await api(`/api/users/${id}`, { method:'DELETE' });
    setUsers(prev => prev.filter(u => u.id !== id));
    showNotif(`User "${username}" deleted`);
  };

  const addUser = async () => {
    if (!newUser.name||!newUser.username||!newUser.password) return;
    setSaving(true);
    try {
      const data = await api('/api/users', { method:'POST', body: newUser });
      setUsers(prev=>[...prev, data.user]);
      setNewUser({ name:'', username:'', role:'attendant', password:'' });
      setShowAdd(false);
      showNotif('User added.');
    } catch(e){ showNotif(e.message,'error'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
        <div style={{ fontSize:14, color:'#666' }}>{users.length} registered users</div>
        <button onClick={()=>setShowAdd(!showAdd)}
                style={{ padding:'8px 16px', background:'#4caf50', color:'#fff', border:'none',
                         borderRadius:10, cursor:'pointer', fontSize:13, fontWeight:600,
                         display:'flex', alignItems:'center', gap:6 }}>
          <Icon name="plus" size={14}/> Add User
        </button>
      </div>

      {showAdd && (
        <div style={{ background:'#fff', borderRadius:12, padding:20, marginBottom:18,
                      boxShadow:'0 1px 8px rgba(0,0,0,0.06)', border:'1px solid #c8e6c9' }}>
          <h3 style={{ margin:'0 0 14px', fontSize:14, fontWeight:700, color:'#1a3a2a' }}>Add New User</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:12 }}>
            {[['Full Name','name','text'],['Username','username','text'],['Password','password','password']].map(([l,f,t])=>(
              <div key={f}>
                <label style={{ fontSize:12, fontWeight:600, color:'#444', display:'block', marginBottom:4 }}>{l}</label>
                <input type={t} value={newUser[f]} onChange={e=>setNewUser(p=>({...p,[f]:e.target.value}))}
                       style={{ width:'100%', padding:'8px 11px', borderRadius:7,
                                border:'1.5px solid #ddd', fontSize:13, boxSizing:'border-box' }}/>
              </div>
            ))}
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:'#444', display:'block', marginBottom:4 }}>Role</label>
              <select value={newUser.role} onChange={e=>setNewUser(p=>({...p,role:e.target.value}))}
                      style={{ width:'100%', padding:'8px 11px', borderRadius:7, border:'1.5px solid #ddd', fontSize:13 }}>
                <option value="admin">Admin</option>
                <option value="attendant">Attendant</option>
              </select>
            </div>
          </div>
          <button disabled={saving} onClick={addUser}
                  style={{ marginTop:12, padding:'9px 20px', background: saving?'#a5d6a7':'#4caf50',
                           color:'#fff', border:'none', borderRadius:8,
                           cursor: saving?'not-allowed':'pointer', fontSize:13, fontWeight:700 }}>
            {saving?'Adding…':'Add User'}
          </button>
        </div>
      )}

      <div style={{ background:'#fff', borderRadius:12, boxShadow:'0 1px 8px rgba(0,0,0,0.06)', overflow:'hidden' }}>
        <div style={{ overflowX: isMobile ? 'auto' : 'visible', WebkitOverflowScrolling:'touch' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize: isMobile ? 11 : 14, minWidth: isMobile ? 400 : 'auto' }}>
          <thead><tr style={{ background:'#f5f5f5' }}>
            {['#','Name','Username','Role','Access','Actions'].map(h=>
              <th key={h} style={{ padding:'11px 16px', textAlign:'left', fontWeight:700, color:'#444', fontSize:12 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {users.map(u=>(
              <tr key={u.id} style={{ borderBottom:'1px solid #f5f5f5' }}>
                <td style={{ padding:'13px 16px', color:'#aaa', fontSize:12 }}>#{u.id}</td>
                <td style={{ padding:'13px 16px', fontWeight:600 }}>{u.name}</td>
                <td style={{ padding:'13px 16px', color:'#555', fontFamily:'monospace' }}>@{u.username}</td>
                <td style={{ padding:'13px 16px' }}>
                  <span style={{ background: u.role==='admin'?'#1a3a2a':'#e8f5e9',
                                 color: u.role==='admin'?'#fff':'#2e7d32',
                                 padding:'3px 12px', borderRadius:20, fontSize:12, fontWeight:700 }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding:'13px 16px', fontSize:12, color:'#666' }}>
                  {u.role==='admin' ? 'Full access' : 'Sales entry only'}
                </td>
                <td style={{ padding:'13px 16px' }}>
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={() => setModal(
                      <EditUserModal user={u} onClose={()=>setModal(null)}
                        onSave={async (data) => { await handleEditUser(u.id, data); setModal(null); }}/>
                    )} style={{ padding:'5px 12px', background:'#e3f2fd', color:'#1565c0',
                                border:'none', borderRadius:7, cursor:'pointer', fontSize:12, fontWeight:600 }}>
                      ✏ Edit
                    </button>
                    {currentUser && u.id !== currentUser.id && (
                      <button onClick={() => setModal(
                        <div>
                          <h3 style={{ margin:'0 0 12px', color:'#1a3a2a' }}>Delete User?</h3>
                          <p style={{ color:'#666', fontSize:13, margin:'0 0 18px' }}>
                            Permanently delete <strong>{u.name} (@{u.username})</strong>? This cannot be undone.
                          </p>
                          <div style={{ display:'flex', gap:10 }}>
                            <button onClick={()=>setModal(null)}
                                    style={{ flex:1, padding:'9px', border:'1.5px solid #ddd', borderRadius:8,
                                             background:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}>
                              Cancel
                            </button>
                            <button onClick={async()=>{
                              try { await handleDeleteUser(u.id, u.username); setModal(null); }
                              catch(e){ showNotif(e.message,'error'); setModal(null); }
                            }} style={{ flex:1, padding:'9px', background:'#c62828', color:'#fff',
                                        border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:700 }}>
                              🗑 Delete
                            </button>
                          </div>
                        </div>
                      )} style={{ padding:'5px 12px', background:'#ffebee', color:'#c62828',
                                  border:'none', borderRadius:7, cursor:'pointer', fontSize:12, fontWeight:600 }}>
                        🗑 Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

// ── Mount ─────────────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AgrovetApp/>);
