
import React, { useMemo } from 'react';
import { Student, Batch, PaymentRecord } from '../types';
import { Phone, MessageSquare, AlertCircle, ArrowRight, Zap, DollarSign } from 'lucide-react';

interface LifetimeDueListProps {
  students: Student[];
  batches: Batch[];
  payments: PaymentRecord[];
  onSelectStudent: (id: string) => void;
}

const LifetimeDueList: React.FC<LifetimeDueListProps> = ({ students, batches, payments, onSelectStudent }) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = ['2024', '2025', '2026', '2027'];
  
  const dueData = useMemo(() => {
    const now = new Date();
    const currentMonthIdx = now.getMonth();
    const currentYear = now.getFullYear();
    
    let totalSystemDue = 0;
    const studentWiseDetails = students.filter(s => s.status === 'Active').map(student => {
      const batch = batches.find(b => b.id === student.batchId);
      if (!batch) return null;

      let studentDues = 0;
      let dueMonthsList: string[] = [];

      const studentFee = student.monthlyFee || batch.fee;

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
            
            if (!hasPaid) {
              studentDues += studentFee;
              dueMonthsList.push(`${m.substring(0, 3)} ${y}`);
            }
          }
        });
      });

      if (studentDues > 0) {
        totalSystemDue += studentDues;
        return {
          ...student,
          batchName: batch.name,
          totalDue: studentDues,
          dueMonths: dueMonthsList
        };
      }
      return null;
    }).filter(Boolean);

    return { totalSystemDue, studentWiseDetails };
  }, [students, batches, payments]);

  return (
    <div className="space-y-8 animate-fade-in pb-28">
      <section className="bg-slate-900 p-8 rounded-[45px] text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Zap size={100} />
        </div>
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-14 h-14 bg-rose-500 rounded-[22px] flex items-center justify-center text-white shadow-lg shadow-rose-900/20">
            <DollarSign size={28}/>
          </div>
          <div>
            <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Total Lifetime Due</p>
            <h3 className="text-5xl font-black tracking-tighter text-rose-400">{dueData.totalSystemDue}৳</h3>
          </div>
        </div>
        <div className="text-center md:text-right relative z-10">
          <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Defaulter Students</p>
          <p className="text-2xl font-black text-emerald-400 tracking-tighter">{dueData.studentWiseDetails.length} Accounts</p>
        </div>
      </section>

      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
           <div className="w-2 h-6 bg-rose-500 rounded-full"></div>
           <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Defaulter Detailed Records</h3>
        </div>

        {dueData.studentWiseDetails.map((item: any) => (
          <div key={item.id} className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-rose-100 group">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => onSelectStudent(item.id)}>
                  <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-[22px] flex items-center justify-center font-black text-2xl border border-slate-100 group-hover:bg-rose-50 group-hover:text-rose-500 group-hover:border-rose-100 transition-colors">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-800 tracking-tight">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{item.batchName}</span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Roll: {item.roll}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-rose-500 tracking-tighter">{item.totalDue}৳</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Pending Fee</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 py-4 border-t border-b border-slate-50">
                 {item.dueMonths.map((m: string) => (
                   <span key={m} className="px-3 py-1 bg-rose-50/50 text-rose-600 rounded-full text-[9px] font-black uppercase tracking-tighter border border-rose-100/50">
                     {m}
                   </span>
                 ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a 
                  href={`tel:${item.mobile}`} 
                  className="flex items-center justify-center gap-3 py-4 bg-emerald-50 text-[#009572] rounded-[22px] hover:bg-emerald-100 active:scale-95 transition-all border border-emerald-100"
                >
                   <Phone size={18}/>
                   <span className="text-[10px] font-black uppercase tracking-widest">Phone Call</span>
                </a>
                <a 
                  href={`sms:${item.mobile}?body=Hello ${item.name}, your total due of ${item.totalDue}৳ for ${item.batchName} is pending. Please clear it soon. - Admin`} 
                  className="flex items-center justify-center gap-3 py-4 bg-indigo-50 text-indigo-600 rounded-[22px] hover:bg-indigo-100 active:scale-95 transition-all border border-indigo-100"
                >
                   <MessageSquare size={18}/>
                   <span className="text-[10px] font-black uppercase tracking-widest">Send SMS</span>
                </a>
              </div>
              
              <button 
                onClick={() => onSelectStudent(item.id)}
                className="w-full flex items-center justify-center gap-2 py-2 text-slate-300 hover:text-rose-500 font-black text-[8px] uppercase tracking-[0.3em] transition-all"
              >
                Open Financial Ledger <ArrowRight size={10}/>
              </button>
            </div>
          </div>
        ))}

        {dueData.studentWiseDetails.length === 0 && (
          <div className="p-24 text-center border-2 border-dashed border-slate-100 rounded-[60px] bg-white/50">
             <div className="w-20 h-20 bg-emerald-50 text-[#009572] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <AlertCircle size={40} />
             </div>
             <p className="text-slate-500 font-black uppercase text-sm tracking-widest">Zero Dues</p>
             <p className="text-[10px] text-slate-300 font-bold uppercase mt-2 tracking-widest">Database reflects all payments are cleared</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LifetimeDueList;
