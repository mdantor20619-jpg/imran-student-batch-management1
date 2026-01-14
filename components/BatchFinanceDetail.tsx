
import React, { useState, useMemo } from 'react';
import { Batch, Student, PaymentRecord } from '../types';
import { Calendar, DollarSign, Clock, CreditCard, ChevronDown, CheckCircle, AlertTriangle, ArrowRight, Zap } from 'lucide-react';

interface BatchFinanceDetailProps {
  batch: Batch | undefined;
  students: Student[];
  payments: PaymentRecord[];
  setPayments: React.Dispatch<React.SetStateAction<PaymentRecord[]>>;
}

const BatchFinanceDetail: React.FC<BatchFinanceDetailProps> = ({ batch, students, payments, setPayments }) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = ['2024', '2025', '2026', '2027'];
  
  const now = new Date();
  const currentMonthIdx = now.getMonth();
  const currentMonthName = months[currentMonthIdx];
  const currentYearStr = String(now.getFullYear());

  const [selectedYear, setSelectedYear] = useState(currentYearStr);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(months[currentMonthIdx]);
  const [payDate, setPayDate] = useState(now.toISOString().split('T')[0]);

  if (!batch) return null;

  const activeStudents = students.filter(s => s.batchId === batch.id && s.status === 'Active');

  const getMonthStatus = (monthName: string) => {
    const monthIdx = months.indexOf(monthName);
    const selYear = parseInt(selectedYear);
    const curYear = now.getFullYear();

    if (selYear < curYear) return 'Past';
    if (selYear > curYear) return 'Future';
    if (monthIdx < currentMonthIdx) return 'Past';
    if (monthIdx === currentMonthIdx) return 'Running';
    return 'Future';
  };

  // Calculation for Batch-Specific Lifetime Stats
  const batchFinanceStats = useMemo(() => {
    let dueTotal = 0;
    let paidTotal = 0;

    activeStudents.forEach(student => {
      // Calculate Lifetime Paid for this student in this batch
      const studentPaid = payments
        .filter(p => p.studentId === student.id && p.batchId === batch.id && p.status === 'Paid')
        .reduce((sum, p) => sum + p.amount, 0);
      paidTotal += studentPaid;

      // Calculate Lifetime Due
      years.forEach(y => {
        const yearInt = parseInt(y);
        const curYearInt = now.getFullYear();
        if (yearInt > curYearInt) return;

        months.forEach((m, mIdx) => {
          const isPastOrCurrent = yearInt < curYearInt || (yearInt === curYearInt && mIdx <= currentMonthIdx);
          if (!isPastOrCurrent) return;

          const enrollYear = parseInt(student.enrollmentDate.year);
          const enrollMonthIdx = months.indexOf(student.enrollmentDate.month);
          const wasEnrolled = yearInt > enrollYear || (yearInt === enrollYear && mIdx >= enrollMonthIdx);
          
          if (wasEnrolled) {
            const hasPaid = payments.some(p => 
              p.studentId === student.id && 
              p.batchId === batch.id &&
              p.month === m && 
              p.year === y && 
              p.status === 'Paid'
            );
            if (!hasPaid) dueTotal += batch.fee;
          }
        });
      });
    });
    return { dueTotal, paidTotal };
  }, [activeStudents, payments, batch.id, batch.fee, currentMonthIdx]);

  const handleTogglePayment = (studentId: string, month: string, year: string, type: PaymentRecord['type']) => {
    const monthStatus = getMonthStatus(month);
    const finalType = monthStatus === 'Future' ? 'Advance' : type;

    const existing = payments.find(p => 
      p.studentId === studentId && 
      p.month === month && 
      p.year === year
    );

    if (existing) {
      setPayments(prev => prev.map(p => p.id === existing.id 
        ? { ...p, status: p.status === 'Paid' ? 'Due' : 'Paid', paymentDate: payDate } 
        : p
      ));
    } else {
      const newPayment: PaymentRecord = {
        id: Math.random().toString(36).substr(2, 9),
        studentId,
        batchId: batch.id,
        amount: batch.fee,
        month,
        year,
        paymentDate: payDate,
        type: finalType,
        status: 'Paid',
        userId: batch.userId
      };
      setPayments(prev => [...prev, newPayment]);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      <header className="flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{batch.name} Finance</h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Full-Year Month-wise Console</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
            <Calendar size={14} className="text-[#009572]"/>
            <select 
              value={selectedYear} 
              onChange={e => setSelectedYear(e.target.value)}
              className="bg-transparent font-black text-[11px] outline-none cursor-pointer"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Enhanced Lifetime Stats Card */}
        <div className="bg-slate-900 p-8 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Zap size={80} />
          </div>
          <div className="grid grid-cols-2 gap-8 w-full md:w-auto relative z-10">
            <div>
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Lifetime Total Due</p>
              <h3 className="text-2xl font-black tracking-tighter text-rose-400">{batchFinanceStats.dueTotal}৳</h3>
            </div>
            <div>
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Lifetime Total Paid</p>
              <h3 className="text-2xl font-black tracking-tighter text-emerald-400">{batchFinanceStats.paidTotal}৳</h3>
            </div>
          </div>
          <div className="text-center md:text-right relative z-10 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Batch Fee</p>
            <p className="text-2xl font-black text-[#009572] tracking-tighter">{batch.fee}৳ / Month</p>
          </div>
        </div>
      </header>

      <div className="space-y-4">
        {months.map((month) => {
          const status = getMonthStatus(month);
          const isExpanded = expandedMonth === month;
          const isCurrentMonthInView = month === currentMonthName && selectedYear === currentYearStr;
          
          const monthPayments = payments.filter(p => p.batchId === batch.id && p.month === month && p.year === selectedYear && p.status === 'Paid');
          const paidCount = activeStudents.filter(s => monthPayments.some(p => p.studentId === s.id)).length;
          const monthPaidAmount = monthPayments.reduce((sum, p) => sum + p.amount, 0);
          const monthDueAmount = (activeStudents.length - paidCount) * batch.fee;

          return (
            <div key={month} className={`bg-white rounded-[35px] border transition-all overflow-hidden ${isExpanded ? 'border-[#009572] shadow-xl' : 'border-slate-100 shadow-sm'}`}>
              <button 
                onClick={() => setExpandedMonth(isExpanded ? null : month)}
                className={`w-full p-6 flex items-center justify-between ${status === 'Running' ? 'bg-emerald-50/50' : ''}`}
              >
                <div className="flex items-center gap-5 flex-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm border-2 shrink-0 ${
                    status === 'Running' ? 'bg-[#009572] text-white border-[#009572]' : 
                    status === 'Past' ? 'bg-slate-50 text-slate-800 border-slate-100' : 
                    'bg-slate-50 text-slate-400 border-slate-100 opacity-60'
                  }`}>
                    {month.substring(0, 3)}
                  </div>
                  <div className="text-left flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-black tracking-tight ${status === 'Future' ? 'text-slate-400' : 'text-slate-800'}`}>{month}</h4>
                      {status === 'Running' && <span className="bg-[#009572] text-white text-[7px] px-2 py-0.5 rounded-full font-black uppercase">Running</span>}
                    </div>
                    <div className="flex items-center gap-3">
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                        {paidCount} Paid • {activeStudents.length - paidCount} {status === 'Future' ? 'Waiting' : 'Due'}
                      </p>
                      {/* Enhancement: Show Paid/Due Amount for current selected month view */}
                      {isCurrentMonthInView && (
                        <div className="flex gap-2">
                          <span className="text-[8px] font-black text-emerald-500 uppercase">Paid: {monthPaidAmount}৳</span>
                          <span className="text-[8px] font-black text-rose-500 uppercase">Due: {monthDueAmount}৳</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronDown size={20} className={`text-slate-300 transition-transform ${isExpanded ? 'rotate-180 text-[#009572]' : ''}`} />
              </button>

              {isExpanded && (
                <div className="p-6 pt-0 border-t border-slate-50 animate-fade-in">
                  <div className="flex items-center justify-between mb-6 pt-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student List ({month})</p>
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                      <Clock size={12} className="text-slate-400" />
                      <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} className="bg-transparent text-[9px] font-black text-slate-600 outline-none" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {activeStudents.map(student => {
                      const pay = payments.find(p => p.studentId === student.id && p.month === month && p.year === selectedYear);
                      const isPaid = pay?.status === 'Paid';
                      const isAdvance = pay?.type === 'Advance';

                      return (
                        <div key={student.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-slate-400 border border-slate-100">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-800">{student.name}</p>
                              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Roll: {student.roll}</p>
                            </div>
                          </div>

                          <button 
                            onClick={() => handleTogglePayment(student.id, month, selectedYear, 'Monthly')}
                            className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${
                              isPaid ? 'bg-[#009572] text-white shadow-md' : 
                              status === 'Future' ? 'bg-indigo-50 text-indigo-500 border border-indigo-100' :
                              'bg-rose-50 text-rose-500 border border-rose-100'
                            }`}
                          >
                            {isPaid ? (isAdvance ? 'Advance Paid' : 'Paid ✓') : (status === 'Future' ? 'Add Advance' : 'Mark Due')}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BatchFinanceDetail;
