
import React, { useState } from 'react';
import { Student, Batch, PaymentRecord } from '../types';
import { Calendar, DollarSign, Award, CheckCircle, Clock, Trash2, Edit, Save, ArrowLeft, User, Phone, ClipboardCheck, History as HistoryIcon } from 'lucide-react';

interface StudentDetailProps {
  student: Student | undefined;
  batch: Batch | undefined;
  payments: PaymentRecord[];
  setPayments: React.Dispatch<React.SetStateAction<PaymentRecord[]>>;
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
}

const StudentDetail: React.FC<StudentDetailProps> = ({ student, batch, payments, setPayments, setStudents }) => {
  const [activeSubTab, setActiveSubTab] = useState<'FINANCE' | 'PRESENTATION'>('FINANCE');
  const [editingScore, setEditingScore] = useState(false);
  const [score, setScore] = useState(student?.presentationScore || 0);
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);

  if (!student || !batch) return null;

  const currentMonth = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());
  const currentYear = String(new Date().getFullYear());

  const studentPayments = payments.filter(p => p.studentId === student.id);
  
  const handleTogglePayment = () => {
    const existing = payments.find(p => 
      p.studentId === student.id && 
      p.month === currentMonth && 
      p.year === currentYear &&
      p.type === 'Monthly'
    );

    const studentFee = student.monthlyFee || batch.fee;

    if (existing) {
      setPayments(prev => prev.map(p => p.id === existing.id 
        ? { ...p, status: p.status === 'Paid' ? 'Due' : 'Paid', paymentDate: manualDate, amount: studentFee } 
        : p
      ));
    } else {
      const newPayment: PaymentRecord = {
        id: Math.random().toString(36).substr(2, 9),
        studentId: student.id,
        batchId: batch.id,
        amount: studentFee,
        month: currentMonth,
        year: currentYear,
        paymentDate: manualDate,
        type: 'Monthly',
        status: 'Paid',
        userId: student.userId
      };
      setPayments(prev => [...prev, newPayment]);
    }
  };

  const saveScore = () => {
    setStudents(prev => prev.map(s => s.id === student.id ? { ...s, presentationScore: score } : s));
    setEditingScore(false);
  };

  const isCurrentPaid = payments.some(p => 
    p.studentId === student.id && 
    p.month === currentMonth && 
    p.year === currentYear && 
    p.status === 'Paid'
  );

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <header className="flex items-center gap-6 p-8 bg-white rounded-[45px] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <User size={120} />
        </div>
        <div className="w-24 h-24 bg-[#009572] text-white rounded-[32px] flex items-center justify-center font-black text-4xl shadow-xl shadow-emerald-100 shrink-0 border-4 border-white">
          {student.name.charAt(0)}
        </div>
        <div className="z-10">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{student.name}</h2>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-1 flex items-center gap-2">
            <Phone size={12}/> {student.mobile}
          </p>
          <div className="flex gap-2 mt-4">
             <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${isCurrentPaid ? 'bg-emerald-50 text-[#009572] border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
                {isCurrentPaid ? 'Monthly Paid' : 'Fee Pending'}
             </span>
             <span className="px-4 py-1.5 rounded-full bg-slate-50 text-slate-400 border border-slate-100 text-[9px] font-black uppercase tracking-widest">
                Roll {student.roll}
             </span>
          </div>
        </div>
      </header>

      <div className="bg-white p-2 rounded-[35px] flex border border-slate-100 shadow-sm">
        <button onClick={() => setActiveSubTab('FINANCE')} className={`flex-1 flex items-center justify-center gap-2 py-5 rounded-[28px] text-[11px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'FINANCE' ? 'bg-[#009572] text-white shadow-lg shadow-emerald-50' : 'text-slate-400'}`}>
          <DollarSign size={16}/> Finance
        </button>
        <button onClick={() => setActiveSubTab('PRESENTATION')} className={`flex-1 flex items-center justify-center gap-2 py-5 rounded-[28px] text-[11px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'PRESENTATION' ? 'bg-[#009572] text-white shadow-lg shadow-emerald-50' : 'text-slate-400'}`}>
          <ClipboardCheck size={16}/> Presentation
        </button>
      </div>

      {activeSubTab === 'FINANCE' ? (
        <div className="space-y-6">
          <section className="bg-white p-10 rounded-[45px] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-widest">{currentMonth} {currentYear}</h3>
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <Clock size={14} className="text-slate-400" />
                <input 
                  type="date" 
                  value={manualDate} 
                  onChange={(e) => setManualDate(e.target.value)} 
                  className="bg-transparent text-[10px] font-black text-slate-600 outline-none" 
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between p-10 bg-[#f7f9fc] rounded-[40px] border border-slate-50 gap-8">
               <div className="text-center md:text-left">
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Fee</p>
                 <p className="text-5xl font-black text-slate-900 tracking-tighter">{student.monthlyFee || batch.fee}৳</p>
               </div>
               <button 
                 onClick={handleTogglePayment}
                 className={`w-full md:w-auto px-16 py-6 rounded-[30px] font-black text-[13px] uppercase tracking-widest shadow-2xl transition-all active:scale-95 ${isCurrentPaid ? 'bg-[#009572] text-white shadow-emerald-100' : 'bg-rose-500 text-white shadow-rose-100'}`}
               >
                 {isCurrentPaid ? 'COLLECTED ✓' : 'COLLECT NOW'}
               </button>
            </div>
          </section>

          <section className="bg-white p-10 rounded-[45px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-widest">History Log</h3>
              <HistoryIcon size={18} className="text-slate-300" />
            </div>
            <div className="space-y-4">
              {studentPayments.length > 0 ? (
                studentPayments.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-50">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#009572] shadow-sm"><CheckCircle size={22}/></div>
                      <div>
                        <p className="font-black text-slate-900 text-base">{p.month} {p.year}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.paymentDate}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-[#009572]">{p.amount}৳</p>
                      <span className="text-[8px] font-black bg-emerald-50 text-[#009572] px-2 py-0.5 rounded uppercase tracking-tighter">Verified</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                   <p className="text-slate-300 font-black uppercase text-[11px] tracking-widest italic mb-2">Clear Ledger</p>
                   <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">No previous collections detected</p>
                </div>
              )}
            </div>
          </section>
        </div>
      ) : (
        <div className="space-y-6">
           <section className="bg-white p-12 rounded-[50px] border border-slate-100 shadow-sm text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
              <div className="w-24 h-24 bg-emerald-50 text-[#009572] rounded-[35px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Award size={48}/>
              </div>
              <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Academic Presentation Score</h3>
              
              {editingScore ? (
                <div className="flex flex-col items-center gap-6 animate-fade-in">
                   <div className="flex items-center gap-6">
                     <button onClick={() => setScore(s => Math.max(0, s - 1))} className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black">-</button>
                     <input 
                       type="number" 
                       value={score} 
                       onChange={e => setScore(Number(e.target.value))}
                       className="text-7xl font-black text-slate-900 w-40 text-center bg-slate-50 rounded-[40px] p-6 border-4 border-[#009572] outline-none shadow-inner"
                     />
                     <button onClick={() => setScore(s => s + 1)} className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black">+</button>
                   </div>
                   <button onClick={saveScore} className="bg-[#009572] text-white px-12 py-5 rounded-3xl font-black text-[12px] uppercase tracking-widest shadow-2xl flex items-center gap-3 active:scale-95 transition-all">
                     <Save size={18}/> Commit to Record
                   </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6">
                   <p className="text-9xl font-black text-slate-900 tracking-tighter shadow-text">{student.presentationScore || 0}</p>
                   <button onClick={() => setEditingScore(true)} className="bg-slate-50 text-slate-600 font-black text-[11px] uppercase tracking-widest flex items-center gap-3 hover:bg-[#009572] hover:text-white px-10 py-4 rounded-[25px] transition-all shadow-sm">
                      <Edit size={16}/> Edit Performance
                   </button>
                </div>
              )}
           </section>

           <section className="bg-white p-10 rounded-[50px] border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-widest">Active Metrics</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time attendance & engagement</p>
                </div>
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300">
                  <ClipboardCheck size={20} />
                </div>
             </div>
             <div className="grid grid-cols-2 gap-5">
                <div className="p-10 bg-slate-50/80 rounded-[40px] border border-slate-50 text-center transition-transform hover:scale-[1.02]">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Class Reach</p>
                   <p className="text-3xl font-black text-slate-900 tracking-tight">Prime</p>
                </div>
                <div className="p-10 bg-slate-50/80 rounded-[40px] border border-slate-50 text-center transition-transform hover:scale-[1.02]">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Attendance</p>
                   <p className="text-3xl font-black text-[#009572] tracking-tight">95%</p>
                </div>
             </div>
           </section>
        </div>
      )}
    </div>
  );
};

export default StudentDetail;
