import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  ShoppingBag, Star, Clock, MapPin, ArrowLeft, Plus, 
  CheckCircle, Store, TrendingUp, Shield, History, 
  LayoutDashboard, ChevronRight, Phone, Smartphone, 
  CreditCard, Search, RefreshCw, Zap, Award, DollarSign, Settings, Home, LogOut, Lock,
  Truck, BarChart3, Info, Power, User, Users, Eye, EyeOff, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabase';

const App = () => {
  // --- Constants & Config ---
  const STORAGE_KEY = 'ly_db_v7';
  
  // --- Data state from Supabase ---
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);

  // --- Session persistence (Local to this tab) ---
  const [auth, setAuth] = useState(() => sessionStorage.getItem('ly_auth') === 'true');
  const [role, setRole] = useState(() => sessionStorage.getItem('ly_role') || 'none');
  const [phone, setPhone] = useState(() => sessionStorage.getItem('ly_phone') || '');
  const [userName, setUserName] = useState(() => sessionStorage.getItem('ly_name') || '');
  const [vid, setVid] = useState(() => sessionStorage.getItem('ly_vid') || 'v1');
  const [online, setOnline] = useState(() => sessionStorage.getItem('ly_online') === 'true');

  // --- Global Unified Database (Synced across tabs) ---
  const [db, setDb] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { orders: [], presence: {} };
  });

  // --- UI state ---
  const [view, setView] = useState('home');
  const [selectedV, setSelectedV] = useState(null);
  const [cart, setCart] = useState([]);
  const [payState, setPayState] = useState('none');
  const [showBot, setShowBot] = useState(false);
  const [demoViewAll, setDemoViewAll] = useState(false);
  const [notification, setNotification] = useState(null); // { message, type: 'success' | 'error' }
  const [category, setCategory] = useState('Todos');

  // --- DATA SYNC ENGINE ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: vData } = await supabase.from('vendors').select('*');
      setVendors(vData || []);

      const { data: pData } = await supabase.from('products').select('*');
      const pMap = {};
      (pData || []).forEach(p => {
        if (!pMap[p.vendor_id]) pMap[p.vendor_id] = [];
        pMap[p.vendor_id].push(p);
      });
      setProducts(pMap);

      const { data: oData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      setDb(prev => ({ ...prev, orders: oData || [] }));
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Realtime Subscriptions

    // Realtime Subscriptions
    const orderSubscription = supabase
      .channel('orders_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        console.log('🔔 Realtime Event:', payload.eventType, payload.new?.id);
        if (payload.eventType === 'INSERT') {
          setDb(prev => {
            if (prev.orders.find(o => o.id === payload.new.id)) return prev;
            return { ...prev, orders: [payload.new, ...prev.orders] };
          });
        } else if (payload.eventType === 'UPDATE') {
          setDb(prev => ({
            ...prev,
            orders: prev.orders.map(o => o.id === payload.new.id ? payload.new : o)
          }));
        }
      })
      .subscribe();

    // Redundancy: Polling fallback every 15s
    const pollTimer = setInterval(fetchData, 15000);

    return () => {
      supabase.removeChannel(orderSubscription);
      clearInterval(pollTimer);
    };
  }, []);

  // 2. Self-Heartbeat (Presence only)
  useEffect(() => {
    const timer = setInterval(() => {
      setDb(prev => {
        const newPresence = { ...prev.presence };
        
        // Update our own presence
        if (phone) {
          newPresence[phone] = { 
            online: true, 
            name: userName, 
            lastSeen: Date.now() 
          };
        }

        // Cleanup stale presence (> 10s)
        Object.keys(newPresence).forEach(k => {
          if (Date.now() - newPresence[k].lastSeen > 10000) {
            delete newPresence[k];
          }
        });

        return { ...prev, presence: newPresence };
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [phone, userName]);

  // 3. Save Session
  useEffect(() => {
    sessionStorage.setItem('ly_auth', auth);
    sessionStorage.setItem('ly_role', role);
    sessionStorage.setItem('ly_phone', phone);
    sessionStorage.setItem('ly_name', userName);
    sessionStorage.setItem('ly_vid', vid);
    sessionStorage.setItem('ly_online', online);
  }, [auth, role, phone, userName, vid, online]);

  // --- ACTIONS ---
  const saveDb = (newDb) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newDb));
    setDb(newDb);
    window.dispatchEvent(new Event('storage'));
  };

  const login = (e) => {
    e.preventDefault();
    if (phone.length === 8) {
      setAuth(true);
      if (phone === '78756107') {
        setRole('admin'); setUserName('Super Admin');
      } else if (phone.startsWith('6')) {
        setRole('vendor');
        setVid(phone); 
        const names = {
          '60000001': 'El Horno',
          '60000002': 'Doña Paulina',
          '60000003': 'Mercado Central',
          '60000004': 'Tía María',
          '60000005': 'El Torito'
        };
        setUserName(names[phone] || 'Caserita');
      } else if (phone.startsWith('7')) {
        setRole('chaski'); setOnline(true);
        const d = phone[7]; setUserName(`Chaski0${d}`);
      } else {
        setRole('client');
        const d = phone[7]; setUserName(`Cliente0${d}`);
      }
      setView('home');
    }
  };

  const placeOrder = async () => {
    try {
      const order = {
        id: `LY-${Math.floor(1000 + Math.random() * 9000)}`,
        vendor_id: selectedV.id,
        vendor_name: selectedV.name,
        total: cart.reduce((s,i)=>s+i.p.price*i.q,0) + 6,
        items: cart.map(i=>`${i.p.name} x${i.q}`),
        status: 'pendiente',
        stage: 1,
        client_phone: phone,
        client_name: userName,
        courier_id: '', 
        courier_name: '',
        latitude: -16.5 + Math.random() * 0.1,
        longitude: -68.1 + Math.random() * 0.1
      };
      
      const { error } = await supabase.from('orders').insert([order]);
      
      if (error) throw error;

      setCart([]);
      setPayState('none');
      setShowBot(true);
      setNotification({ message: '¡Pedido realizado con éxito!', type: 'success' });
    } catch (err) {
      console.error(err);
      setNotification({ message: 'Error al realizar el pedido.', type: 'error' });
    }
  };

  const logEvent = async (orderId, action) => {
    try {
      await supabase.from('order_logs').insert([{
        order_id: orderId,
        actor_name: userName,
        actor_role: role,
        action
      }]);
    } catch (e) { console.error("Log error:", e); }
  };

  const updateOrder = async (id, s) => {
    try {
      const states = ['pendiente', 'preparando', 'listo', 'en ruta', 'recogido', 'entregado', 'concluido'];
      const updateData = { stage: s, status: states[s-1] };
      
      if (s === 4) { 
        updateData.courier_id = phone; 
        updateData.courier_name = userName; 
      }

      console.log(`Updating order ${id} to stage ${s}...`);
      await logEvent(id, `Cambio a estado: ${states[s-1]}`);
      
      // Optimistic update
      setDb(prev => ({
        ...prev,
        orders: prev.orders.map(o => o.id === id ? { ...o, ...updateData } : o)
      }));

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id);
        
      if (error) throw error;
      setNotification({ message: `¡Pedido ${states[s-1]}!`, type: 'success' });
    } catch (err) {
      console.error('Update error:', err);
      setNotification({ message: 'Error de conexión. Reintentando...', type: 'error' });
      fetchData();
    }
  };

  const resetAll = () => {
    const cleared = { orders: [], presence: {} };
    saveDb(cleared);
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  // --- ANALYTICS ---
  const stats = useMemo(() => {
    const orders = db.orders;
    const totalRev = orders.reduce((s, o) => s + o.total, 0);
    const stages = [1,2,3,4,5,6].map(s => orders.filter(o => o.stage === s).length);
    const activeChaskis = Object.values(db.presence).filter(p => p.online && p.name.includes('Chaski')).length;
    return { totalRev, stages, activeChaskis };
  }, [db.orders, db.presence]);

  // --- COMPONENTS ---
  const Nav = () => (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        <button className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}><Home size={22} /><span>Inicio</span></button>
        <button className={view === 'history' ? 'active' : ''} onClick={() => setView('history')}><History size={22} /><span>Pedidos</span></button>
        {role === 'admin' && <button className={view === 'insights' ? 'active' : ''} onClick={() => setView('insights')}><BarChart3 size={22} /><span>Metricas</span></button>}
        <button onClick={() => setView('profile')} className={view === 'profile' ? 'active' : ''}><User size={22} /><span>Perfil</span></button>
      </div>
    </nav>
  );

  const Header = ({ title, subtitle, icon: Icon }) => (
    <div style={{ padding: '2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h1 style={{ fontWeight: 900, fontSize: '1.8rem', letterSpacing: '-0.5px' }}>{title}</h1>
        {subtitle && <p style={{ color: '#00A391', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{subtitle}</p>}
      </div>
      {Icon && <div style={{ background: '#F1F5F9', padding: '12px', borderRadius: '18px' }}><Icon size={24} color="#1E293B" /></div>}
    </div>
  );

  // --- VIEWS ---
  if (!auth) return (
    <div className="app-container splash-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ width: '100%', textAlign: 'center' }}>
        <div style={{ marginBottom: '3rem' }}>
          <ShoppingBag size={100} color="#FFB800" fill="#FFB800" style={{ margin: '0 auto' }} />
          <h1 style={{ fontSize: '4.5rem', fontWeight: 950, margin: '1rem 0', color: 'white' }}>LlegoYA</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '4px', fontSize: '0.8rem', fontWeight: 700 }}>MVP ELITE EDITION</p>
        </div>
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '45px', color: '#1F2937' }}>
          <form onSubmit={login}>
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Inicia Sesión</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Acceso instantáneo al ecosistema</p>
            </div>
            <div style={{ position: 'relative' }}>
              <Phone size={20} style={{ position: 'absolute', left: '1.2rem', top: '1.2rem', color: '#94A3B8' }} />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Número de Celular" maxLength={8}
                style={{ width: '100%', padding: '1.2rem 1.2rem 1.2rem 3.5rem', borderRadius: '22px', border: '2px solid #F1F5F9', fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: 700 }} />
            </div>
            <button className="btn-primary" type="submit" style={{ width: '100%', height: '65px', fontSize: '1.1rem' }}>Ingresar ahora <ChevronRight size={20} /></button>
          </form>
          <div style={{ marginTop: '2.5rem', textAlign: 'left', background: 'rgba(0,0,0,0.02)', padding: '1.2rem', borderRadius: '20px' }}>
            <span style={{ fontSize: '0.7rem', color: '#00A391', fontWeight: 900 }}>DEMO ACCOUNTS:</span><br/>
            <span style={{ fontSize: '0.65rem', color: '#64748B' }}>
              • <b>80000001</b>: Cliente | <b>70000001</b>: Chaski<br/>
              • <b>60000001</b>: Caserita | <b>78756107</b>: Admin
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const Notify = () => (
    <AnimatePresence>
      {notification && (
        <motion.div 
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 20, x: '-50%' }}
          exit={{ opacity: 0, y: -50, x: '-50%' }}
          onAnimationComplete={() => setTimeout(() => setNotification(null), 3000)}
          style={{ 
            position: 'fixed', top: 0, left: '50%', zIndex: 10000,
            background: notification.type === 'success' ? '#10B981' : '#EF4444',
            color: 'white', padding: '15px 30px', borderRadius: '20px',
            boxShadow: '0 15px 30px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '12px',
            fontWeight: 800, fontSize: '0.9rem', width: 'max-content', maxWidth: '90vw'
          }}
        >
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {notification.message}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="app-container">
      <Notify />
      <div className="dashboard">
        
        {/* --- ADMIN VIEW --- */}
        {role === 'admin' && view === 'home' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Header title="Resumen General" subtitle="MERCADO RODRÍGUEZ LIVE" icon={LayoutDashboard} />
            
            <div style={{ padding: '0 1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="admin-premium-card" style={{ background: '#00A391', color: 'white', border: 'none' }}>
                  <TrendingUp size={24} />
                  <span>Ventas Brutas</span>
                  <strong>Bs. {stats.totalRev.toFixed(2)}</strong>
                </div>
                <div className="admin-premium-card">
                  <Users size={24} color="#6366F1" />
                  <span>Chaskis Activos</span>
                  <strong style={{ color: '#6366F1' }}>{stats.activeChaskis}</strong>
                </div>
              </div>

              <h3 style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>Monitor de Pedidos <div className="status-dot green pulse" /></h3>
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '30px', marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{stats.stages[0]}</div><div style={{ fontSize: '0.6rem', color: '#64748B' }}>INICIADOS</div></div>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#6366F1' }}>{stats.stages[1] + stats.stages[2] + stats.stages[3]}</div><div style={{ fontSize: '0.6rem', color: '#64748B' }}>EN PROCESO</div></div>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10B981' }}>{stats.stages[4] + stats.stages[5]}</div><div style={{ fontSize: '0.6rem', color: '#64748B' }}>ENTREGADOS</div></div>
                </div>
                {/* Visual Chart */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100px', padding: '0 1rem' }}>
                  {stats.stages.map((val, idx) => (
                    <div key={idx} style={{ flex: 1, background: idx < 2 ? '#E2E8F0' : idx < 4 ? '#6366F1' : '#10B981', height: `${Math.max(val * 20, 10)}%`, borderRadius: '6px 6px 0 0', transition: 'all 0.5s' }} />
                  ))}
                </div>
              </div>

              <h3 style={{ marginTop: '2.5rem' }}>Conectividad Reciente</h3>
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '30px', marginTop: '1rem' }}>
                {Object.entries(db.presence).map(([p, d]) => (
                  <div key={p} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '38px', height: '38px', background: '#F8FAFC', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={18} color="#64748B" /></div>
                      <div><div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{d.name}</div><div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>{p}</div></div>
                    </div>
                    <div className={`status-dot ${d.online ? 'green' : 'gray'} pulse`} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* --- CLIENT VIEW --- */}
        {(role === 'client' || role === 'cliente') && view === 'home' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: '#F8FAFC', minHeight: '100vh' }}>
            {/* Elite Header */}
            <div style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)', padding: '4rem 2rem 6rem', borderRadius: '0 0 60px 60px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'rgba(0, 209, 178, 0.1)', filter: 'blur(80px)', borderRadius: '50%' }} />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '20px', backdropFilter: 'blur(10px)' }}><ShoppingBag size={24} color="#00D1B2" /></div>
                    <span style={{ color: 'white', fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-0.5px' }}>LlegoYA</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 18px', borderRadius: '18px', color: 'white', fontWeight: 800, fontSize: '0.8rem', backdropFilter: 'blur(10px)' }}>Bs. 0.00</div>
                </div>
                <h1 style={{ color: 'white', fontSize: '2.8rem', fontWeight: 950, lineHeight: 1, letterSpacing: '-1.5px', marginBottom: '1rem' }}>¿Qué se te antoja hoy?</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: '0.9rem' }}>
                  <MapPin size={18} color="#00D1B2" /> Mercado Central • La Paz
                </div>
              </div>
            </div>

            {/* Categorías Elite */}
            <div style={{ marginTop: '-40px', padding: '0 1.5rem' }}>
              <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '2rem', scrollbarWidth: 'none', position: 'relative', zIndex: 10 }}>
                {['Todos', 'Comida', 'Verduras', 'Api', 'Carnes'].map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setCategory(cat)}
                    style={{ 
                      padding: '18px 30px', 
                      borderRadius: '25px', 
                      border: 'none',
                      background: category === cat ? '#00D1B2' : 'white',
                      color: category === cat ? 'white' : '#64748B',
                      fontWeight: 900,
                      fontSize: '0.9rem',
                      whiteSpace: 'nowrap',
                      boxShadow: category === cat ? '0 15px 30px rgba(0,209,178,0.3)' : '0 10px 25px rgba(0,0,0,0.05)',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: category === cat ? 'translateY(-5px)' : 'none'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div style={{ paddingBottom: '4rem' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 950, marginBottom: '2rem', color: '#0F172A', letterSpacing: '-0.5px' }}>Puestos Destacados</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }}>
                  {vendors.filter(v => category === 'Todos' || v.category === category).map(v => (
                    <motion.div 
                      key={v.id} 
                      whileTap={{ scale: 0.96 }}
                      className="vendor-card-elite" 
                      onClick={() => { setSelectedV(v); setView('products'); }}
                    >
                      <div style={{ position: 'relative', height: '280px', overflow: 'hidden' }}>
                        <img 
                          src={v.image_url} 
                          alt={v.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s' }} 
                        />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.7) 100%)' }} />
                        <div style={{ position: 'absolute', top: '25px', right: '25px', background: 'rgba(255,255,255,0.95)', padding: '10px 15px', borderRadius: '18px', fontWeight: 950, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', backdropFilter: 'blur(10px)' }}>
                          <Star size={16} fill="#FFB800" color="#FFB800" /> {v.rating || '4.8'}
                        </div>
                        <div style={{ position: 'absolute', bottom: '25px', left: '25px', right: '25px' }}>
                          <div style={{ color: 'white', fontSize: '1.6rem', fontWeight: 950, letterSpacing: '-0.5px' }}>{v.name}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', marginTop: '5px', fontWeight: 700 }}>
                            <Clock size={16} color="#00D1B2" /> {v.delivery_time} • {v.category}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}


        {/* --- PRODUCTS VIEW --- */}
        {(role === 'client' || role === 'cliente') && view === 'products' && selectedV && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} style={{ background: 'white', minHeight: '100vh' }}>
            <div style={{ height: '350px', position: 'relative' }}>
              <img src={selectedV.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 40%, rgba(0,0,0,0.8) 100%)' }} />
              <button onClick={() => setView('home')} style={{ position: 'absolute', top: '2rem', left: '1.5rem', background: 'white', padding: '15px', borderRadius: '22px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowLeft size={24} color="#0F172A" />
              </button>
              <div style={{ position: 'absolute', bottom: '3rem', left: '2rem', right: '2rem' }}>
                <h2 style={{ color: 'white', fontSize: '2.4rem', fontWeight: 950, letterSpacing: '-1px' }}>{selectedV.name}</h2>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <span style={{ background: '#00D1B2', color: 'white', padding: '6px 15px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 900 }}>{selectedV.category}</span>
                  <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '6px 15px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800, backdropFilter: 'blur(10px)' }}>⭐ {selectedV.rating}</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '2rem 1.5rem', marginTop: '-20px', background: 'white', borderRadius: '40px 40px 0 0', position: 'relative', zIndex: 10 }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '2.5rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
                {['Todo', 'Popular', 'Nuevos', 'Combos'].map(cat => (
                  <span key={cat} style={{ background: cat === 'Todo' ? '#0F172A' : '#F1F5F9', color: cat === 'Todo' ? 'white' : '#64748B', padding: '12px 25px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 800, whiteSpace: 'nowrap' }}>{cat}</span>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {(products[selectedV.id] || []).map(p => (
                  <motion.div 
                    key={p.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', background: '#F8FAFC', borderRadius: '35px', alignItems: 'center', border: '1px solid rgba(0,0,0,0.02)' }}
                  >
                    <img src={p.image_url} style={{ width: '100px', height: '100px', borderRadius: '28px', objectFit: 'cover', boxShadow: '0 8px 20px rgba(0,0,0,0.05)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 850, fontSize: '1.1rem', color: '#0F172A' }}>{p.name}</div>
                      <div style={{ color: '#00D1B2', fontWeight: 950, fontSize: '1.3rem', marginTop: '6px' }}>Bs. {p.price.toFixed(2)}</div>
                    </div>
                    <button className="btn-primary" style={{ width: '55px', height: '55px', padding: 0, borderRadius: '20px', background: '#0F172A' }} onClick={() => { setCart([{ p, q: 1 }]); setView('checkout'); }}>
                      <Plus size={24} color="white" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* --- CHECKOUT VIEW --- */}
        {(role === 'client' || role === 'cliente') && view === 'checkout' && (
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2.5rem' }}>
              <button onClick={() => setView('products')} style={{ background: 'white', padding: '10px', borderRadius: '15px', border: '1px solid #F1F5F9' }}><ArrowLeft size={20} /></button>
              <h2 style={{ fontWeight: 950, margin: 0 }}>Finalizar Pedido</h2>
            </div>
            
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '35px', marginBottom: '2rem' }}>
              <h4 style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '1px', marginBottom: '1.5rem' }}>DETALLE DE LA ORDEN</h4>
              {cart.map(i => (
                <div key={i.p.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>{i.p.name} <span style={{ color: '#94A3B8' }}>x{i.q}</span></span>
                  <strong style={{ fontSize: '1rem' }}>Bs. {(i.p.price*i.q).toFixed(2)}</strong>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                <span>Envío Chaski Express</span>
                <strong>Bs. 6.00</strong>
              </div>
              <div style={{ borderTop: '2px dashed #F1F5F9', marginTop: '1.5rem', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <span style={{ fontWeight: 800, color: '#64748B' }}>TOTAL</span>
                <span style={{ fontSize: '2.5rem', fontWeight: 950, color: '#1E293B', lineHeight: 1 }}>Bs. {(cart.reduce((s,i)=>s+i.p.price*i.q,0)+6).toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button className="btn-primary" style={{ height: '75px', fontSize: '1.2rem', background: '#004F9F' }} onClick={() => setPayState('qr')}>
                <Smartphone size={24} /> Pagar con QR Simple
              </button>
              <button className="btn-secondary" style={{ height: '70px', color: '#64748B' }}>
                <CreditCard size={20} /> Tarjeta de Crédito/Débito
              </button>
            </div>
          </div>
        )}

        {/* --- CASERITA PANEL --- */}
        {role === 'vendor' && (() => {
          // Merge both sources to be 1000% sure we find the identity
          const allPossibleVendors = [...(vendors || []), ...(db.vendors || [])];
          const currentV = allPossibleVendors.find(v => String(v.id).trim() === String(vid).trim());
          
          if (!currentV) {
            return (
              <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <div style={{ background: '#FFF5F5', color: '#C53030', padding: '2rem', borderRadius: '30px', border: '2px dashed #FEB2B2' }}>
                  <AlertCircle size={40} style={{ marginBottom: '1rem' }} />
                  <h3 style={{ fontWeight: 800 }}>Error de Identidad</h3>
                  <p style={{ fontSize: '0.85rem' }}>No encontramos el negocio con ID: {vid}.<br/>Por favor, verifica tu número de acceso.</p>
                  <button onClick={() => setRole(null)} className="btn-primary" style={{ marginTop: '1.5rem', background: '#C53030' }}>Volver</button>
                </div>
              </div>
            );
          }

          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Premium Business Header - Matches Catalog Identity */}
              <div style={{ position: 'relative', height: '260px', background: '#0F172A', borderRadius: '0 0 60px 60px', overflow: 'hidden', marginBottom: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                <img 
                  src={currentV.image_url} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} 
                  alt={currentV.name}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent, rgba(15,23,42,0.95))' }} />
                <div style={{ position: 'absolute', bottom: '2.5rem', left: '2rem', right: '2rem', display: 'flex', alignItems: 'center', gap: '25px' }}>
                  <div style={{ width: '100px', height: '100px', borderRadius: '30px', border: '5px solid white', overflow: 'hidden', background: 'white', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}>
                    <img src={currentV.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <div style={{ background: '#10B981', color: 'white', fontSize: '0.65rem', padding: '4px 10px', borderRadius: '8px', display: 'inline-block', fontWeight: 900, marginBottom: '8px', letterSpacing: '1px' }}>NEGOCIO VERIFICADO</div>
                    <h1 style={{ color: 'white', fontWeight: 950, fontSize: '2.2rem', margin: 0, letterSpacing: '-1.5px', lineHeight: 1 }}>{currentV.name}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                      <span style={{ color: '#00D1B2', fontWeight: 800, fontSize: '0.85rem' }}>{currentV.category}</span>
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
                      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600 }}>ID: {vid}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ padding: '0 1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '2.5rem' }}>
                  <div className="admin-premium-card" style={{ borderBottom: '5px solid #10B981', background: 'white' }}>
                    <div style={{ background: '#10B98120', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                      <DollarSign size={22} color="#10B981" />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>VENTAS HOY</span>
                    <strong style={{ fontSize: '1.5rem', color: '#0F172A' }}>Bs. {db.orders.filter(o => String(o.vendor_id) === String(vid)).reduce((s, o) => s + o.total, 0).toFixed(2)}</strong>
                  </div>
                  <div className="admin-premium-card" style={{ borderBottom: '5px solid #F59E0B', background: 'white' }}>
                    <div style={{ background: '#F59E0B20', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                      <Star size={22} color="#F59E0B" fill="#F59E0B" />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>CALIFICACIÓN</span>
                    <strong style={{ fontSize: '1.5rem', color: '#0F172A' }}>{currentV.rating || '4.9'}<small style={{ fontSize: '0.8rem', opacity: 0.5 }}>/5.0</small></strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontWeight: 900, fontSize: '1.2rem', color: '#0F172A' }}>Pedidos para Preparar</h3>
                  <button onClick={() => setDemoViewAll(!demoViewAll)} style={{ border: 'none', background: demoViewAll ? '#6366F120' : '#F1F5F9', color: demoViewAll ? '#6366F1' : '#64748B', padding: '10px 18px', borderRadius: '15px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s' }}>
                    {demoViewAll ? <Eye size={16}/> : <EyeOff size={16}/>} {demoViewAll ? 'VISTA GLOBAL' : 'MIS PEDIDOS'}
                  </button>
                </div>

                <AnimatePresence>
                  {(demoViewAll ? db.orders : db.orders.filter(o => String(o.vendor_id) === String(vid))).filter(o => o.stage < 3).map(o => (
                    <motion.div key={o.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-panel" style={{ padding: '2rem', borderRadius: '40px', marginBottom: '1.5rem', borderLeft: '10px solid #00D1B2', boxShadow: '0 15px 30px rgba(0,0,0,0.05)' }}>
                      {demoViewAll && String(o.vendor_id) !== String(vid) && <div style={{ background: '#6366F1', color: 'white', fontSize: '0.65rem', padding: '6px 14px', borderRadius: '12px', display: 'inline-block', marginBottom: '1.2rem', fontWeight: 900, textTransform: 'uppercase' }}>DESTINADO A: {o.vendor_name}</div>}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 950, fontSize: '1.5rem', color: '#0F172A' }}>Orden #{o.id.substring(0,6).toUpperCase()}</div>
                          <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <User size={14}/> {o.client_name}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.4rem', fontWeight: 950, color: '#0F172A' }}>Bs. {o.total.toFixed(2)}</div>
                          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#10B981', marginTop: '4px' }}>PAGADO CON QR</div>
                        </div>
                      </div>
                      <div style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '25px', margin: '1.8rem 0', border: '1px solid #E2E8F0' }}>
                        <div style={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>DETALLE DEL PEDIDO</div>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: '#334155' }}>{o.items.join(', ')}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {o.stage === 1 && (
                          <button className="btn-primary" style={{ flex: 1, height: '70px', background: '#0F172A', fontSize: '1rem', borderRadius: '22px' }} onClick={() => updateOrder(o.id, 2)}>
                            ACEPTAR Y COCINAR
                          </button>
                        )}
                        {o.stage === 2 && (
                          <button className="btn-primary" style={{ flex: 1, height: '70px', background: '#10B981', fontSize: '1rem', borderRadius: '22px' }} onClick={() => updateOrder(o.id, 3)}>
                            <Zap size={20} fill="white" /> ¡LISTO PARA CHASKI!
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {(demoViewAll ? db.orders : db.orders.filter(o => String(o.vendor_id) === String(vid))).filter(o => o.stage < 3).length === 0 && (
                  <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                    <div style={{ background: '#F1F5F9', width: '100px', height: '100px', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', transform: 'rotate(-10deg)' }}>
                      <Clock size={40} color="#94A3B8" />
                    </div>
                    <h3 style={{ color: '#64748B', fontWeight: 900 }}>¡Todo al día!</h3>
                    <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '8px', maxWidth: '200px', margin: '8px auto 0' }}>En cuanto un cliente haga un pedido, vibrará tu pantalla.</p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })()}

        {/* --- CHASKI PANEL --- */}
        {role === 'chaski' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Header title="Ruta Chaski" subtitle={userName} icon={Truck} />
            
            <div style={{ padding: '0 1.5rem' }}>
              <div style={{ background: '#0F172A', color: 'white', padding: '2.5rem', borderRadius: '40px', marginBottom: '2.5rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ opacity: 0.6, fontSize: '0.85rem', fontWeight: 700 }}>MIS GANANCIAS</div>
                    <div style={{ fontSize: '3rem', fontWeight: 950, marginTop: '5px' }}>Bs. {(db.orders.filter(o => o.courier_id === phone && o.stage >= 5).length * 5).toFixed(2)}</div>
                  </div>
                  <button onClick={() => setOnline(!online)} style={{ background: online ? '#10B981' : '#EF4444', color: 'white', padding: '10px 20px', borderRadius: '15px', fontWeight: 900, border: 'none', fontSize: '0.75rem' }}>
                    {online ? 'ONLINE' : 'OFFLINE'}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '15px', marginTop: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div className="status-dot green pulse" /> <span style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: 700 }}>ACTIVO EN MERCADO</span></div>
                </div>
              </div>

              {online ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontWeight: 800 }}>Pedidos Disponibles</h3>
                    <button onClick={fetchData} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <RefreshCw size={18} color="#94A3B8" className={loading ? 'spin' : ''} />
                    </button>
                  </div>
                  
                  {db.orders.filter(o => o.stage === 3).map(o => (
                    <motion.div key={o.id} layout initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-panel" style={{ padding: '1.8rem', borderRadius: '35px', border: '3px solid #10B981', marginBottom: '1.2rem', boxShadow: '0 20px 40px rgba(16,185,129,0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontWeight: 950, fontSize: '1.2rem' }}>{o.vendor_name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}><MapPin size={14} /> Mercado Rodríguez</div>
                        </div>
                        <div style={{ background: '#10B981', color: 'white', padding: '6px 15px', borderRadius: '12px', fontWeight: 950, fontSize: '0.8rem' }}>Bs. 5.00</div>
                      </div>
                      <div style={{ background: '#ECFDF5', padding: '1rem', borderRadius: '15px', margin: '1.5rem 0', fontSize: '0.85rem', color: '#047857', fontWeight: 600 }}>
                        Recoger: {o.items.join(', ')}
                      </div>
                      <button className="btn-primary" style={{ width: '100%', height: '65px', background: '#064E3B' }} onClick={() => updateOrder(o.id, 4)}>Aceptar este pedido</button>
                    </motion.div>
                  ))}
                  {db.orders.filter(o => o.stage === 3).length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', background: '#F1F5F9', borderRadius: '30px' }}>
                      <Search size={40} color="#94A3B8" style={{ margin: '0 auto 1.5rem' }} />
                      <p style={{ color: '#64748B', fontSize: '0.85rem' }}>Esperando que la Caserita termine un pedido...</p>
                    </div>
                  )}
                  <h3 style={{ marginTop: '3rem', marginBottom: '1.5rem' }}>Mi Ruta Actual</h3>
                  {db.orders.filter(o => o.courier_id === phone && o.stage >= 4 && o.stage < 7).map(o => (
                    <motion.div key={o.id} className="glass-panel" style={{ padding: '2rem', borderRadius: '40px', border: '3px solid #6366F1', marginBottom: '1.5rem', background: 'white' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ background: '#6366F1', color: 'white', padding: '6px 15px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 950 }}>
                          {o.stage === 4 ? 'VAS CAMINO AL PUESTO' : o.stage === 5 ? 'TIENES EL PEDIDO' : 'ENTREGANDO'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 700 }}>#{o.id.slice(-4)}</div>
                      </div>
                      <div style={{ marginBottom: '2rem' }}>
                        <div style={{ fontSize: '0.9rem', color: '#64748B' }}>{o.stage === 4 ? 'Recoger de:' : 'Entregar a:'}</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 950, color: '#1E293B', marginTop: '5px' }}>{o.stage === 4 ? o.vendor_name : o.client_name}</div>
                      </div>
                      {o.stage === 4 && (
                        <button className="btn-primary" style={{ width: '100%', height: '70px', background: '#6366F1' }} onClick={() => updateOrder(o.id, 5)}>
                          Ya recibí el pedido (Recogido)
                        </button>
                      )}
                      {o.stage === 5 && (
                        <button className="btn-primary" style={{ width: '100%', height: '70px', background: '#10B981' }} onClick={() => updateOrder(o.id, 6)}>
                          ¡Ya lo entregué al cliente!
                        </button>
                      )}
                      {o.stage === 6 && (
                        <button className="btn-primary" style={{ width: '100%', height: '70px', background: '#0F172A' }} onClick={() => updateOrder(o.id, 7)}>
                          Finalizar y Archivar
                        </button>
                      )}
                    </motion.div>
                  ))}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                  <Power size={50} color="#CBD5E1" style={{ marginBottom: '1.5rem' }} />
                  <h3 style={{ color: '#64748B', fontWeight: 800 }}>Estás en modo Offline</h3>
                  <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '5px' }}>Ponte online para recibir pedidos.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

            {/* --- COMMON HISTORY VIEW --- */}
            {view === 'history' && (
              <div className="dashboard">
                <div style={{ padding: '2rem 0 1.5rem' }}>
                  <h1 style={{ fontSize: '2.2rem', fontWeight: 950, letterSpacing: '-1px' }}>Actividad</h1>
                  <p style={{ color: '#64748B', fontWeight: 700, fontSize: '0.85rem' }}>Seguimiento de tus pedidos</p>
                </div>

                {(db.orders.filter(o => 
                  ((role === 'cliente' || role === 'client') && o.client_phone === phone) || 
                  ((role === 'chaski' || role === 'courier') && o.courier_id === phone) ||
                  ((role === 'caserita' || role === 'vendor') && o.vendor_id === phone) ||
                  role === 'admin'
                )).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                    <div style={{ background: '#F1F5F9', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}><History size={30} color="#94A3B8" /></div>
                    <h3 style={{ color: '#64748B', fontWeight: 800 }}>Sin pedidos</h3>
                    <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '5px' }}>Tus órdenes aparecerán aquí.</p>
                  </div>
                ) : (
                  db.orders.filter(o => 
                    ((role === 'cliente' || role === 'client') && o.client_phone === phone) || 
                    ((role === 'chaski' || role === 'courier') && o.courier_id === phone) ||
                    ((role === 'caserita' || role === 'vendor') && o.vendor_id === phone) ||
                    role === 'admin'
                  ).map(o => (
                    <motion.div key={o.id} className="glass-panel" style={{ padding: '1.8rem', borderRadius: '35px', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ fontWeight: 950, fontSize: '1.1rem' }}>{o.vendor_name}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8' }}>#{o.id.slice(-4)}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                        <div className={`status-dot ${o.stage >= 6 ? 'green' : 'gray'} pulse`} />
                        <div style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', color: o.stage >= 6 ? '#10B981' : '#64748B' }}>{o.status}</div>
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>{o.items.join(', ')}</div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

        {/* --- PROFILE VIEW --- */}
        {view === 'profile' && (
          <div style={{ padding: '1.5rem' }}>
            <Header title="Mi Perfil" subtitle={userName} icon={User} />
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '35px', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '2rem' }}>
                <div style={{ width: '70px', height: '70px', background: '#F1F5F9', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={32} color="#1E293B" /></div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '1.3rem' }}>{userName}</div>
                  <div style={{ color: '#64748B', fontSize: '0.85rem' }}>ID: {phone}</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '1.2rem', background: '#F8FAFC', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Settings size={18} /> Configuración</div>
                  <ChevronRight size={18} color="#94A3B8" />
                </div>
                <div style={{ padding: '1.2rem', background: '#F8FAFC', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Shield size={18} /> Seguridad</div>
                  <ChevronRight size={18} color="#94A3B8" />
                </div>
                <button onClick={resetAll} style={{ width: '100%', padding: '1.2rem', background: '#FEF2F2', color: '#EF4444', borderRadius: '20px', border: 'none', fontWeight: 800, marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <RefreshCw size={18} /> Reiniciar Todo el Sistema
                </button>
              </div>
            </div>
            
            <button className="btn-secondary" style={{ width: '100%', marginTop: '2rem', color: '#EF4444', borderColor: '#FEE2E2', height: '65px' }} onClick={() => { sessionStorage.clear(); window.location.reload(); }}>
              Cerrar Sesión
            </button>
          </div>
        )}

      </div>

      <Nav />

      {/* --- MODALS --- */}
      <AnimatePresence>
        {payState === 'qr' && (
          <motion.div className="qr-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="qr-modal-content" initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }}>
              <div className="qr-header" style={{ padding: '2.5rem', background: '#004F9F', color: 'white', textAlign: 'center' }}>
                <Smartphone size={50} style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontWeight: 900, fontSize: '1.4rem' }}>PAGO SEGURO</h3>
                <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Generado por LlegoYA Bank</p>
              </div>
              <div style={{ padding: '2.5rem' }}>
                <div style={{ background: '#F1F5F9', padding: '1.5rem', borderRadius: '30px', marginBottom: '2rem' }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=LY-AUTH-${Date.now()}`} style={{ width: '100%', mixBlendMode: 'multiply' }} />
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <button className="btn-secondary" style={{ flex: 1, height: '65px' }} onClick={() => setPayState('none')}>Cancelar</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary" style={{ flex: 1, height: '65px' }} onClick={placeOrder}>Confirmar</motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBot && (
          <div className="whatsapp-overlay">
            <motion.div initial={{ y: 600 }} animate={{ y: 0 }} exit={{ y: 600 }} className="whatsapp-phone" style={{ borderRadius: '40px 40px 0 0' }}>
              <div className="wa-header" style={{ background: '#075E54', padding: '1.8rem', color: 'white', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ background: 'white', padding: '8px', borderRadius: '12px' }}><ShoppingBag size={24} color="#075E54" /></div>
                <div>
                  <div style={{ fontWeight: 800 }}>LlegoYA Bot 🇧🇴</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Notificaciones automáticas</div>
                </div>
              </div>
              <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="wa-bubble">¡Pedido recibido! ⚡ La <b>Caserita</b> ya está preparando tus productos.</motion.div>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }} className="wa-bubble">En cuanto esté listo, notificaremos al <b>Chaski</b> más cercano para el recojo.</motion.div>
              </div>
              <div style={{ padding: '2.5rem', background: '#F1F5F9' }}>
                <button className="btn-primary" style={{ width: '100%', height: '65px' }} onClick={() => { setShowBot(false); setView('history'); }}>Ir al Seguimiento</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default App;
