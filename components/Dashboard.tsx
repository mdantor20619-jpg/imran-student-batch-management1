
import React, { useMemo } from 'react';
import { Package, Users, Clock, TrendingUp, Calendar, ChevronRight, AlertCircle, DollarSign } from 'lucide-react';
import { NavTab, Batch, Student, PaymentRecord } from '../types';

interface DashboardProps {
  user: any;
  onNavigate: (tab: NavTab) => void;
  batches: Batch[];
  students: Student[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate, batches, students }) => {
  // Load payments to calculate actual lifetime due and monthly revenue
  const payments: PaymentRecord[] = useMemo(() => {
    return JSON.parse(localStorage.getItem('imran_payments') || '[]');
  }, [students, batches]); // Re-memoize when context might have changed

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const now = new Date();
  const currentMonthIdx = now.getMonth();
  const currentMonthName = months[currentMonthIdx];
  const currentYear = now.getFullYear();
  const currentYearStr = String(currentYear);

  // Calculate Monthly Revenue (MO REVENUE)
  // Only counts 'Paid' status for the current month/year from active students/batches
  const monthlyRevenue = useMemo(() => {
    return payments
      .filter(p => 
        p.status === 'Paid' && 
        p.month === currentMonthName && 
        p.year === currentYearStr &&
        // Ensure student is still in an active batch (optional but follows integrity rules)
        batches.some(b => b.id === p.batchId && b.isActive)
      )
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments, currentMonthName, currentYearStr, batches]);

  // Calculate Total Lifetime Due for the Dashboard Card
  const totalLifetimeDue = useMemo(() => {
    let total = 0;
    students.filter(s => s.status === 'Active').forEach(student => {
      const batch = batches.find(b => b.id === student.batchId);
      if (!batch) return;

      const years = ['2024', '2025', '2026', '2027'];
      years.forEach(y => {
        const yearInt = parseInt(y);
        if (yearInt > currentYear) return;

        months.forEach((m, mIdx) => {
          const isPastOrRunning = yearInt < currentYear || (yearInt === currentYear && mIdx <= currentMonthIdx);
          if (!isPastOrRunning) return;

          const enrollYear = parseInt(student.enrollmentDate.year);
          const enrollMonthIdx = months.indexOf(student.enrollmentDate.month);
          const wasEnrolled = yearInt > enrollYear || (yearInt === enrollYear && mIdx >= enrollMonthIdx);

          if (wasEnrolled) {
            const hasPaid = payments.some(p => 
              p.studentId === student.id && 
              p.month === m && 
              p.year === y && 
              p.status === 'Paid'
            );
            if (!hasPaid) total += batch.fee;
          }
        });
      });
    });
    return total;
  }, [students, batches, payments, currentMonthIdx, currentYear]);

  // Logic to determine batch status for priority sorting
  const getBatchStatus = (batch: Batch) => {
    const parseTime = (timeStr: string) => {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const batchStart = parseTime(batch.time);
    const batchEnd = batchStart + 60;
    if (nowMinutes >= batchStart && nowMinutes < batchEnd) return 'Running';
    return 'Upcoming';
  };

  const sortedActiveBatches = [...batches]
    .filter(b => b.isActive)
    .sort((a, b) => {
      const statusA = getBatchStatus(a);
      const statusB = getBatchStatus(b);
      if (statusA === 'Running' && statusB !== 'Running') return -1;
      if (statusA !== 'Running' && statusB === 'Running') return 1;
      return 0;
    });

  return (
    <div className="space-y-10 animate-fade-in">
      <header>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Home Bar</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Management Overview</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="BATCHES" value={batches.length} icon={<Package size={16}/>} color="indigo" onClick={() => onNavigate(NavTab.TOOLS)} />
        <StatCard label="STUDENTS" value={students.length} icon={<Users size={16}/>} color="rose" onClick={() => onNavigate(NavTab.TOOLS)} />
        <StatCard label="MO REVENUE" value={`${monthlyRevenue}৳`} icon={<TrendingUp size={16}/>} color="emerald" onClick={() => onNavigate(NavTab.FINANCE)} />
        <StatCard label="LIFETIME DUE" value={`${totalLifetimeDue}৳`} icon={<AlertCircle size={16}/>} color="amber" onClick={() => onNavigate(NavTab.LIFETIME_DUE)} highlight={totalLifetimeDue > 0} />
      </div>

      <section className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-6 bg-[#009572] rounded-full"></div>
          <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-widest">ACTIVE SCHEDULE</h3>
        </div>
        <div className="space-y-4">
          {sortedActiveBatches.map(batch => {
            const isRunning = getBatchStatus(batch) === 'Running';
            return (
              <div key={batch.id} className={`flex items-center justify-between p-5 rounded-[30px] border active-scale cursor-pointer transition-all ${isRunning ? 'bg-emerald-50 border-emerald-100 shadow-sm ring-1 ring-emerald-500/10' : 'bg-slate-50 border-slate-100'}`} onClick={() => onNavigate(NavTab.TOOLS)}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm ${isRunning ? 'bg-[#009572] text-white animate-pulse' : 'bg-slate-200 text-slate-500'}`}>
                    {batch.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-black text-slate-900 text-base tracking-tight">{batch.name}</p>
                      {isRunning && <span className="text-[7px] font-black bg-[#009572] text-white px-2 py-0.5 rounded-full uppercase tracking-widest">NOW RUNNING</span>}
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{batch.time} • {batch.days.join(', ')}</p>
                  </div>
                </div>
                <ChevronRight size={18} className={isRunning ? 'text-[#009572]' : 'text-slate-300'}/>
              </div>
            );
          })}
          {sortedActiveBatches.length === 0 && (
            <div className="py-10 text-center">
               <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">No Active Batches Scheduled</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ label, value, icon, color, onClick, highlight }: any) => {
  const colors: any = { 
    indigo: 'bg-indigo-50 text-indigo-600', 
    rose: 'bg-rose-50 text-rose-600', 
    emerald: 'bg-emerald-50 text-emerald-600', 
    amber: highlight ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-amber-50 text-amber-600' 
  };
  return (
    <div onClick={onClick} className={`bg-white p-6 rounded-[35px] border border-slate-50 shadow-sm flex flex-col items-center text-center cursor-pointer active-scale transition-all ${highlight ? 'ring-2 ring-rose-500/5' : ''}`}>
      <div className={`w-10 h-10 ${colors[color]} rounded-2xl flex items-center justify-center mb-4 transition-colors`}>{icon}</div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-black tracking-tight transition-colors ${highlight && color === 'amber' ? 'text-rose-600' : 'text-slate-900'}`}>{value}</p>
    </div>
  );
};

export default Dashboard;
