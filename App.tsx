
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  LayoutDashboard, LogOut, Settings, Cloud, Menu, X, Plus, 
  DollarSign, Layers, Calendar, Power, ArrowLeft, ClipboardList, 
  Clock, UserPlus, StickyNote, CheckCircle2, History, AlertCircle
} from 'lucide-react';
import { NavTab, Batch, Student, BatchNote, PaymentRecord, AttendanceRecord, FineRecord } from './types';
import Dashboard from './components/Dashboard';
import BatchManager from './components/BatchManager';
import StudentManager from './components/StudentManager';
import FinanceManager from './components/FinanceManager';
import SessionPlanner from './components/SessionPlanner';
import AuthScreen from './components/AuthScreen';
import BatchNotesManager from './components/BatchNotesManager';
import BatchFinanceDetail from './components/BatchFinanceDetail';
import StudentDetail from './components/StudentDetail';
import LifetimeDueList from './components/LifetimeDueList';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<NavTab>(NavTab.DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNewBatchModalOpen, setIsNewBatchModalOpen] = useState(false);
  
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [notes, setNotes] = useState<BatchNote[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [fines, setFines] = useState<FineRecord[]>([]);
  
  const [standardFee, setStandardFee] = useState(1000);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const [batchForm, setBatchForm] = useState({
    name: '', className: '', time: '04:00 PM', days: [] as string[],
    fee: 1000,
    day: String(new Date().getDate()).padStart(2, '0'), 
    month: new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date()), 
    year: String(new Date().getFullYear())
  });

  useEffect(() => {
    if (activeTab === NavTab.DASHBOARD && window.history.state?.tab !== NavTab.DASHBOARD) {
      window.history.replaceState({ tab: NavTab.DASHBOARD }, '', '');
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.tab) {
        setActiveTab(event.state.tab);
        if (event.state.batchId) setSelectedBatchId(event.state.batchId);
        if (event.state.studentId) setSelectedStudentId(event.state.studentId);
      } else {
        setActiveTab(NavTab.DASHBOARD);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = useCallback((tab: NavTab, params?: { batchId?: string, studentId?: string }) => {
    if (tab === activeTab && 
        params?.batchId === selectedBatchId && 
        params?.studentId === selectedStudentId) return;

    if (params?.batchId) setSelectedBatchId(params.batchId);
    if (params?.studentId) setSelectedStudentId(params.studentId);

    setActiveTab(tab);
    setIsSidebarOpen(false);
    
    window.history.pushState({ 
      tab, 
      batchId: params?.batchId || selectedBatchId,
      studentId: params?.studentId || selectedStudentId
    }, '', '');
  }, [activeTab, selectedBatchId, selectedStudentId]);

  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      setActiveTab(NavTab.DASHBOARD);
    }
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('imran_app_user');
    const savedFee = localStorage.getItem('imran_standard_fee');
    const savedBatches = localStorage.getItem('imran_batches');
    const savedStudents = localStorage.getItem('imran_students');
    const savedNotes = localStorage.getItem('imran_notes');
    const savedPayments = localStorage.getItem('imran_payments');
    const savedAttendance = localStorage.getItem('imran_attendance');
    const savedFines = localStorage.getItem('imran_fines');
    
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedFee) {
      const fee = parseInt(savedFee);
      setStandardFee(fee);
      setBatchForm(prev => ({ ...prev, fee }));
    }
    if (savedBatches) setBatches(JSON.parse(savedBatches));
    if (savedStudents) setStudents(JSON.parse(savedStudents));
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedPayments) setPayments(JSON.parse(savedPayments));
    if (savedAttendance) setAttendance(JSON.parse(savedAttendance));
    if (savedFines) setFines(JSON.parse(savedFines));
    
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('imran_batches', JSON.stringify(batches));
      localStorage.setItem('imran_students', JSON.stringify(students));
      localStorage.setItem('imran_notes', JSON.stringify(notes));
      localStorage.setItem('imran_payments', JSON.stringify(payments));
      localStorage.setItem('imran_attendance', JSON.stringify(attendance));
      localStorage.setItem('imran_fines', JSON.stringify(fines));
      localStorage.setItem('imran_standard_fee', standardFee.toString());
    }
  }, [batches, students, notes, payments, attendance, fines, standardFee, loading]);

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const newBatch: Batch = {
      id: Math.random().toString(36).substr(2, 9),
      name: batchForm.name,
      className: batchForm.className,
      time: batchForm.time,
      days: batchForm.days,
      fee: batchForm.fee || standardFee,
      isActive: true,
      status: 'Upcoming',
      startDate: { day: batchForm.day, month: batchForm.month, year: batchForm.year },
      userId: user.uid
    };
    setBatches(prev => [...prev, newBatch]);
    setIsNewBatchModalOpen(false);
    setBatchForm({
      name: '', className: '', time: '04:00 PM', days: [],
      fee: standardFee,
      day: String(new Date().getDate()).padStart(2, '0'), 
      month: new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date()), 
      year: String(new Date().getFullYear())
    });
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white text-[#009572] font-black uppercase tracking-[0.3em]">Imran's Panel...</div>;
  if (!user) return <AuthScreen onLogin={setUser} />;

  const renderContent = () => {
    switch (activeTab) {
      case NavTab.DASHBOARD: 
        return <Dashboard user={user} onNavigate={navigateTo} batches={batches} students={students} />;
      case NavTab.TOOLS: 
        return <BatchManager batches={batches} setBatches={setBatches} notes={notes} onSelectBatch={(id) => navigateTo(NavTab.STUDENT_LIST, { batchId: id })} onManageNotes={(id) => navigateTo(NavTab.NOTES, { batchId: id })} />;
      case NavTab.FINANCE:
        return <FinanceManager batches={batches} onSelectBatch={(id) => navigateTo(NavTab.BATCH_FINANCE_DETAIL, { batchId: id })} />;
      case NavTab.BATCH_FINANCE_DETAIL:
        return <BatchFinanceDetail batch={batches.find(b => b.id === selectedBatchId)} students={students} payments={payments} setPayments={setPayments} />;
      case NavTab.STUDENT_LIST: 
        return <StudentManager batch={batches.find(b => b.id === selectedBatchId)} students={students} setStudents={setStudents} attendance={attendance} setAttendance={setAttendance} fines={fines} setFines={setFines} onSelectStudent={(id) => navigateTo(NavTab.STUDENT_DETAIL, { studentId: id })} onBack={goBack} payments={payments} setPayments={setPayments} />;
      case NavTab.STUDENT_DETAIL:
        return <StudentDetail student={students.find(s => s.id === selectedStudentId)} batch={batches.find(b => b.id === students.find(s => s.id === selectedStudentId)?.batchId)} payments={payments} setPayments={setPayments} setStudents={setStudents} />;
      case NavTab.NOTES:
        return <BatchNotesManager batch={batches.find(b => b.id === selectedBatchId)} notes={notes} setNotes={setNotes} onBack={goBack} />;
      case NavTab.BATCHES: 
        return <SessionPlanner userId={user.uid} standardFee={standardFee} setStandardFee={setStandardFee} />;
      case NavTab.LIFETIME_DUE:
        return <LifetimeDueList students={students} batches={batches} payments={payments} onSelectStudent={(id) => navigateTo(NavTab.STUDENT_DETAIL, { studentId: id })} />;
      default: return <Dashboard user={user} onNavigate={navigateTo} batches={batches} students={students} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#fcfcfc] overflow-hidden">
      <aside className="hidden md:flex w-72 flex-col border-r border-slate-100 bg-white shadow-xl">
        <div className="p-8 border-b border-slate-50 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#009572] rounded-xl flex items-center justify-center text-white font-black shadow-lg">I</div>
          <span className="font-black text-slate-900 tracking-tight">Imran's Panel</span>
        </div>
        <nav className="flex-1 p-6 space-y-2">
          <SidebarItem active={activeTab === NavTab.DASHBOARD} onClick={() => navigateTo(NavTab.DASHBOARD)} icon={<LayoutDashboard size={20}/>} label="Home Bar" />
          <SidebarItem active={activeTab === NavTab.TOOLS} onClick={() => navigateTo(NavTab.TOOLS)} icon={<Layers size={20}/>} label="Tools Bar" />
          <SidebarItem active={activeTab === NavTab.FINANCE} onClick={() => navigateTo(NavTab.FINANCE)} icon={<DollarSign size={20}/>} label="Finance Bar" />
          <SidebarItem active={activeTab === NavTab.BATCHES} onClick={() => navigateTo(NavTab.BATCHES)} icon={<Cloud size={20}/>} label="Cloud Option" />
          <SidebarItem active={activeTab === NavTab.LIFETIME_DUE} onClick={() => navigateTo(NavTab.LIFETIME_DUE)} icon={<AlertCircle size={20}/>} label="Defaulters List" />
        </nav>
        <button onClick={() => { localStorage.removeItem('imran_app_user'); setUser(null); }} className="p-8 text-rose-500 font-black flex items-center gap-2 text-xs uppercase hover:bg-rose-50 transition-all"><LogOut size={16}/> Logout</button>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 z-40">
          <div className="flex items-center gap-3">
            {activeTab !== NavTab.DASHBOARD && (
              <button onClick={goBack} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 active:scale-90 transition-all shadow-sm border border-slate-100">
                <ArrowLeft size={20}/>
              </button>
            )}
            <span className="font-black text-slate-800 tracking-tight">Imran's Panel</span>
          </div>
          <button className="md:hidden p-2" onClick={() => setIsSidebarOpen(true)}><Menu size={24} className="text-slate-600"/></button>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar pb-32">
          <div className="max-w-4xl mx-auto">
            {renderContent()}
          </div>
        </main>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 pt-3 pb-8 flex justify-between items-center shadow-2xl z-40">
          <BottomNavItem active={activeTab === NavTab.DASHBOARD} onClick={() => navigateTo(NavTab.DASHBOARD)} icon={<LayoutDashboard size={22}/>} label="Home" />
          <BottomNavItem active={activeTab === NavTab.TOOLS} onClick={() => navigateTo(NavTab.TOOLS)} icon={<Layers size={22}/>} label="Tools" />
          <button onClick={() => setIsNewBatchModalOpen(true)} className="w-16 h-16 bg-[#009572] -mt-12 rounded-[22px] flex items-center justify-center text-white shadow-xl border-4 border-[#fcfcfc] active:scale-95 transition-all"><Plus size={28}/></button>
          <BottomNavItem active={activeTab === NavTab.FINANCE} onClick={() => navigateTo(NavTab.FINANCE)} icon={<DollarSign size={22}/>} label="Finance" />
          <BottomNavItem active={activeTab === NavTab.BATCHES} onClick={() => navigateTo(NavTab.BATCHES)} icon={<Cloud size={22}/>} label="Cloud" />
        </nav>
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-[150] md:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
          <aside className="absolute top-0 left-0 h-full w-4/5 bg-white shadow-2xl animate-slide-in flex flex-col">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#009572] rounded-xl flex items-center justify-center text-white font-black shadow-lg">I</div>
                <span className="font-black text-slate-900">Imran's Panel</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2"><X size={24} className="text-slate-400"/></button>
            </div>
            <nav className="flex-1 p-6 space-y-4">
              <SidebarItem active={activeTab === NavTab.DASHBOARD} onClick={() => navigateTo(NavTab.DASHBOARD)} icon={<LayoutDashboard size={22}/>} label="Dashboard" />
              <SidebarItem active={activeTab === NavTab.TOOLS} onClick={() => navigateTo(NavTab.TOOLS)} icon={<Layers size={22}/>} label="Batch Tools" />
              <SidebarItem active={activeTab === NavTab.FINANCE} onClick={() => navigateTo(NavTab.FINANCE)} icon={<DollarSign size={22}/>} label="Finance Hub" />
              <SidebarItem active={activeTab === NavTab.BATCHES} onClick={() => navigateTo(NavTab.BATCHES)} icon={<Cloud size={22}/>} label="Cloud Settings" />
              <SidebarItem active={activeTab === NavTab.LIFETIME_DUE} onClick={() => navigateTo(NavTab.LIFETIME_DUE)} icon={<AlertCircle size={22}/>} label="Due Records" />
            </nav>
          </aside>
        </div>
      )}

      {isNewBatchModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsNewBatchModalOpen(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-t-[50px] md:rounded-[50px] p-8 pb-12 shadow-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Register New Batch</h2>
              <button onClick={() => setIsNewBatchModalOpen(false)} className="p-3 bg-slate-50 rounded-full text-slate-400"><X size={20}/></button>
            </div>
            <form onSubmit={handleCreateBatch} className="space-y-5">
              <input type="text" required placeholder="Batch Unique Name" value={batchForm.name} onChange={e => setBatchForm({...batchForm, name: e.target.value})} className="w-full bg-slate-50 p-6 rounded-3xl border border-slate-100 font-bold outline-none focus:border-[#009572] transition-all" />
              <input type="text" required placeholder="Target Class (e.g. SSC 25)" value={batchForm.className} onChange={e => setBatchForm({...batchForm, className: e.target.value})} className="w-full bg-slate-50 p-6 rounded-3xl border border-slate-100 font-bold outline-none focus:border-[#009572] transition-all" />
              
              <div className="space-y-2 px-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-3">Monthly Fee (Batch Default)</label>
                <input type="number" required placeholder="Amount in Tk" value={batchForm.fee} onChange={e => setBatchForm({...batchForm, fee: parseInt(e.target.value) || 0})} className="w-full bg-slate-50 p-6 rounded-3xl border border-slate-100 font-bold outline-none focus:border-[#009572] transition-all" />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-3">Academic Days</label>
                <div className="grid grid-cols-4 gap-2 px-1">
                  {['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                    <button type="button" key={day} onClick={() => setBatchForm({...batchForm, days: batchForm.days.includes(day) ? batchForm.days.filter(d => d !== day) : [...batchForm.days, day]})} className={`p-4 rounded-2xl font-black text-[10px] uppercase border transition-all ${batchForm.days.includes(day) ? 'bg-[#009572] text-white shadow-emerald-50' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>{day}</button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-3">Start Time</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <select value={batchForm.time} onChange={e => setBatchForm({...batchForm, time: e.target.value})} className="w-full pl-12 pr-4 py-5 bg-slate-50 rounded-2xl border border-slate-100 font-bold outline-none appearance-none">
                      {Array.from({ length: 24 }).map((_, i) => {
                        const h = i % 12 || 12;
                        const ampm = i >= 12 ? 'PM' : 'AM';
                        const t = `${String(h).padStart(2, '0')}:00 ${ampm}`;
                        return <option key={t} value={t}>{t}</option>;
                      })}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-3">Admission Date</label>
                  <div className="grid grid-cols-3 gap-1">
                    <select value={batchForm.day} onChange={e => setBatchForm({...batchForm, day: e.target.value})} className="bg-slate-50 p-3 rounded-xl font-bold border-none outline-none text-xs">
                      {Array.from({length: 31}).map((_, i) => <option key={i+1}>{String(i+1).padStart(2,'0')}</option>)}
                    </select>
                    <select value={batchForm.month} onChange={e => setBatchForm({...batchForm, month: e.target.value})} className="bg-slate-50 p-3 rounded-xl font-bold border-none outline-none text-xs">
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <option key={m}>{m.substring(0,3)}</option>)}
                    </select>
                    <select value={batchForm.year} onChange={e => setBatchForm({...batchForm, year: e.target.value})} className="bg-slate-50 p-3 rounded-xl font-bold border-none outline-none text-xs">
                      {['2024', '2025', '2026', '2027'].map(y => <option key={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-[#009572] text-white py-6 rounded-[32px] font-black uppercase tracking-widest mt-6 shadow-2xl shadow-emerald-50 active:scale-95 transition-all">Launch Official Batch</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SidebarItem = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-5 rounded-[25px] transition-all ${active ? 'sidebar-link-active shadow-sm border border-[#009572]/10' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>
    {icon} <span className="text-sm font-black">{label}</span>
  </button>
);

const BottomNavItem = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 group">
    <div className={`transition-transform group-active:scale-90 ${active ? 'text-[#009572]' : 'text-slate-300'}`}>{icon}</div>
    <span className={`text-[9px] font-black uppercase tracking-tight ${active ? 'text-[#009572]' : 'text-slate-300'}`}>{label}</span>
  </button>
);

export default App;
