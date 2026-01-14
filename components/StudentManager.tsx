
import React, { useState, useMemo } from 'react';
import { Plus, Phone, X, ChevronLeft, AlertTriangle, Edit, ChevronDown, MessageSquare, Power, CheckCircle2, CircleDashed, History, FileText, Calendar as CalendarIcon, UserMinus, UserCheck } from 'lucide-react';
import { Batch, Student, AttendanceRecord, FineRecord, PaymentRecord } from '../types';

interface StudentManagerProps {
  batch: Batch | undefined;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  fines: FineRecord[];
  setFines: React.Dispatch<React.SetStateAction<FineRecord[]>>;
  onSelectStudent: (id: string) => void;
  onBack: () => void;
  payments: PaymentRecord[];
  setPayments: React.Dispatch<React.SetStateAction<PaymentRecord[]>>;
}

const StudentManager: React.FC<StudentManagerProps> = ({ 
  batch, students, setStudents, attendance, setAttendance, fines, setFines, onSelectStudent, onBack, payments, setPayments
}) => {
  const [activeTab, setActiveTab] = useState<'PRESENCE' | 'HONORIUM' | 'FINES'>('PRESENCE');
  const [isAdding, setIsAdding] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingFineHistoryId, setViewingFineHistoryId] = useState<string | null>(null);
  const [showGlobalFineHistory, setShowGlobalFineHistory] = useState(false);
  const [reportMonth, setReportMonth] = useState(new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date()));
  const [reportYear, setReportYear] = useState(String(new Date().getFullYear()));
  
  const initialFormState = { 
    name: '', 
    roll: '', 
    mobile: '', 
    monthlyFee: batch?.fee || 1000,
    day: String(new Date().getDate()).padStart(2, '0'), 
    month: new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date()), 
    year: String(new Date().getFullYear()),
    status: 'Active' as 'Active' | 'Archive'
  };

  const [form, setForm] = useState(initialFormState);
  const [absentFineModal, setAbsentFineModal] = useState<{studentId: string, name: string} | null>(null);
  const [fineAmountInput, setFineAmountInput] = useState('10');
  
  const [selectedHonorariumStudentId, setSelectedHonorariumStudentId] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [smsPreviewModal, setSmsPreviewModal] = useState<{ message: string, phone: string } | null>(null);

  // Added missing selectedStudent memo
  const selectedStudent = useMemo(() => 
    students.find(s => s.id === selectedHonorariumStudentId),
    [students, selectedHonorariumStudentId]
  );

  if (!batch) return null;

  const today = new Date().toISOString().split('T')[0];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonthName = months[new Date().getMonth()];
  const currentYearStr = String(new Date().getFullYear());

  const sortedBatchStudents = useMemo(() => {
    return students
      .filter(s => s.batchId === batch.id)
      .sort((a, b) => {
        if (a.status === 'Active' && b.status === 'Archive') return -1;
        if (a.status === 'Archive' && b.status === 'Active') return 1;
        return a.name.localeCompare(b.name);
      });
  }, [students, batch.id]);

  const activeBatchStudents = sortedBatchStudents.filter(s => s.status === 'Active');

  const getStudentPaymentStats = (student: Student) => {
    const now = new Date();
    const curMonthIdx = now.getMonth();
    const curYear = now.getFullYear();
    let paidCount = 0, dueCount = 0, paidMonths: string[] = [], dueMonths: string[] = [];
    const enrollYear = parseInt(student.enrollmentDate.year);
    const enrollMonthIdx = months.indexOf(student.enrollmentDate.month);
    
    for (let y = enrollYear; y <= curYear; y++) {
      const startM = y === enrollYear ? enrollMonthIdx : 0;
      const endM = y === curYear ? curMonthIdx : 11;
      for (let m = startM; m <= endM; m++) {
        const isPaid = payments.some(p => p.studentId === student.id && p.month === months[m] && p.year === String(y) && p.status === 'Paid');
        const monthYear = `${months[m].substring(0, 3)}/${y}`;
        if (isPaid) { paidCount++; paidMonths.push(monthYear); }
        else if (student.status === 'Active') { dueCount++; dueMonths.push(monthYear); }
      }
    }
    return { paidCount, dueCount, paidMonths, dueMonths };
  };

  // Added missing honorariumStats memo
  const honorariumStats = useMemo(() => {
    if (!selectedStudent) return { paidCount: 0, dueCount: 0 };
    return getStudentPaymentStats(selectedStudent);
  }, [selectedStudent, payments]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      const updated = students.map(s => s.id === editingStudent.id ? { ...s, ...form } : s);
      setStudents(updated);
      setEditingStudent(null);
    } else {
      const newStudent: Student = {
        id: `std_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        name: form.name, roll: form.roll, mobile: form.mobile, batchId: batch.id, status: 'Active',
        monthlyFee: form.monthlyFee,
        enrollmentDate: { day: form.day, month: form.month, year: form.year }, userId: batch.userId
      };
      setStudents([...students, newStudent]);
    }
    setForm(initialFormState);
    setIsAdding(false);
  };

  const toggleFineStatus = (fineId: string) => {
    const updatedFines = fines.map(f => f.id === fineId ? { ...f, status: f.status === 'Paid' ? 'Pending' : 'Paid' } : f);
    setFines(updatedFines as FineRecord[]);
    localStorage.setItem('imran_fines', JSON.stringify(updatedFines));
  };

  const markPresence = (studentId: string, status: 'P' | 'A') => {
    if (status === 'A') {
      const student = students.find(s => s.id === studentId);
      setAbsentFineModal({ studentId, name: student?.name || 'Unknown' });
      return;
    }

    const existing = attendance.find(a => a.studentId === studentId && a.date === today);
    let updated;
    if (existing) {
      updated = attendance.map(a => a.id === existing.id ? { ...a, status } : a);
    } else {
      updated = [...attendance, { id: `att_${Date.now()}`, studentId, batchId: batch.id, date: today, status, userId: batch.userId }];
    }
    setAttendance(updated as AttendanceRecord[]);
    localStorage.setItem('imran_attendance', JSON.stringify(updated));
  };

  const confirmAbsenceWithFine = () => {
    if (!absentFineModal) return;
    const { studentId } = absentFineModal;
    
    const existingAtt = attendance.find(a => a.studentId === studentId && a.date === today);
    let updatedAtt;
    if (existingAtt) {
      updatedAtt = attendance.map(a => a.id === existingAtt.id ? { ...a, status: 'A' } : a);
    } else {
      updatedAtt = [...attendance, { id: `att_${Date.now()}`, studentId, batchId: batch.id, date: today, status: 'A', userId: batch.userId }];
    }
    setAttendance(updatedAtt as AttendanceRecord[]);

    const fineAmount = parseInt(fineAmountInput);
    if (fineAmount > 0) {
      const newFine: FineRecord = {
        id: `fine_${Date.now()}`,
        studentId,
        batchId: batch.id,
        amount: fineAmount,
        reason: 'Absence Fine',
        status: 'Pending',
        date: today,
        userId: batch.userId
      };
      setFines([...fines, newFine]);
    }

    setAbsentFineModal(null);
    setFineAmountInput('10');
  };

  const handleBack = () => {
    if (smsPreviewModal) setSmsPreviewModal(null);
    else if (showGlobalFineHistory) setShowGlobalFineHistory(false);
    else if (viewingFineHistoryId) setViewingFineHistoryId(null);
    else if (selectedHonorariumStudentId) setSelectedHonorariumStudentId(null);
    else onBack();
  };

  // Added missing payment handler
  const handleTogglePayment = (studentId: string, month: string, year: string) => {
    const existing = payments.find(p => p.studentId === studentId && p.month === month && p.year === year);
    if (existing) {
      setPayments(payments.filter(p => p.id !== existing.id));
    } else {
      const student = students.find(s => s.id === studentId);
      const newPayment: PaymentRecord = {
        id: `pay_${Date.now()}`,
        studentId,
        batchId: batch.id,
        amount: student?.monthlyFee || batch.fee,
        month,
        year,
        paymentDate: new Date().toISOString().split('T')[0],
        type: 'Monthly',
        status: 'Paid',
        userId: batch.userId
      };
      setPayments([...payments, newPayment]);
    }
  };

  // Added missing SMS handler
  const handleSendSummarySMS = (student: Student) => {
    const stats = getStudentPaymentStats(student);
    const instName = localStorage.getItem('imran_inst_name') || "Imran's Academy";
    const template = localStorage.getItem('imran_sms_template') || "{INSTITUTE_NAME}\n\nDear {STUDENT_NAME},\n\nPaid Months: {PAID_MONTHS}\nDue Months: {DUE_MONTHS}\n\nTotal Due: {TOTAL_DUE_AMOUNT} Tk\n\nThank you.";
    
    const message = template
      .replace('{INSTITUTE_NAME}', instName)
      .replace('{STUDENT_NAME}', student.name)
      .replace('{BATCH_NAME}', batch.name)
      .replace('{PAID_MONTHS}', stats.paidMonths.join(', '))
      .replace('{DUE_MONTHS}', stats.dueMonths.join(', '))
      .replace('{TOTAL_DUE_AMOUNT}', (stats.dueCount * (student.monthlyFee || batch.fee)).toString());

    window.open(`sms:${student.mobile}?body=${encodeURIComponent(message)}`);
  };

  // Added missing edit modal handler
  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setForm({
      name: student.name,
      roll: student.roll,
      mobile: student.mobile,
      monthlyFee: student.monthlyFee || batch.fee,
      day: student.enrollmentDate.day,
      month: student.enrollmentDate.month,
      year: student.enrollmentDate.year,
      status: student.status
    });
    setIsAdding(true);
  };

  const filteredFineStudents = useMemo(() => {
    return students
      .filter(s => s.batchId === batch.id)
      .map(student => {
        const studentFines = fines.filter(f => f.studentId === student.id && f.batchId === batch.id);
        const currentMonthFines = studentFines.filter(f => {
          const fDate = new Date(f.date);
          return months[fDate.getMonth()] === currentMonthName && String(fDate.getFullYear()) === currentYearStr;
        });
        const hasUnpaid = currentMonthFines.some(f => f.status === 'Pending');
        const totalAmount = currentMonthFines.reduce((sum, f) => sum + f.amount, 0);
        return { student, currentMonthFines, hasUnpaid, totalAmount };
      })
      .filter(item => item.currentMonthFines.length > 0)
      .sort((a, b) => {
        if (a.hasUnpaid && !b.hasUnpaid) return -1;
        if (!a.hasUnpaid && b.hasUnpaid) return 1;
        return 0;
      });
  }, [students, fines, batch.id, currentMonthName, currentYearStr]);

  const fineSummary = useMemo(() => {
    const batchFines = fines.filter(f => {
      const fDate = new Date(f.date);
      return f.batchId === batch.id && months[fDate.getMonth()] === currentMonthName && String(fDate.getFullYear()) === currentYearStr;
    });
    const total = batchFines.length;
    const paid = batchFines.filter(f => f.status === 'Paid').length;
    const pending = batchFines.filter(f => f.status === 'Pending').length;
    const collected = batchFines.filter(f => f.status === 'Paid').reduce((acc, f) => acc + f.amount, 0);
    return { total, paid, pending, collected };
  }, [fines, batch.id, currentMonthName, currentYearStr]);

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-50 shadow-sm transition-all">
            <ChevronLeft size={20}/>
          </button>
          <div>
            <h3 className="text-2xl font-black text-slate-900">{batch.name}</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{activeBatchStudents.length} Students Online</p>
          </div>
        </div>
        <button onClick={() => { setIsAdding(true); setForm(initialFormState); }} className="bg-[#009572] text-white p-3 rounded-xl shadow-lg shadow-emerald-100 active-scale transition-all">
          <Plus size={24}/>
        </button>
      </div>

      {!selectedHonorariumStudentId && !viewingFineHistoryId && !showGlobalFineHistory && (
        <div className="bg-white p-1.5 rounded-[25px] flex border border-slate-100 shadow-sm mx-2">
          {(['PRESENCE', 'HONORIUM', 'FINES'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3.5 rounded-[20px] text-[8px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? (tab === 'FINES' ? 'bg-orange-600 text-white shadow-sm' : 'bg-[#009572] text-white shadow-sm') : 'text-slate-300 hover:text-slate-400'}`}>
              {tab}
            </button>
          ))}
        </div>
      )}

      {activeTab === 'FINES' && !viewingFineHistoryId && !showGlobalFineHistory && (
        <div className="space-y-6 px-2">
           <div className="flex justify-between items-center px-2">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Fines ({currentMonthName})</h4>
              <button onClick={() => setShowGlobalFineHistory(true)} className="flex items-center gap-2 text-[9px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-4 py-2 rounded-full border border-orange-100 active-scale">
                <FileText size={12}/> Global History
              </button>
           </div>
           
           <div className="grid grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-50 shadow-sm text-center">
                 <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest mb-1">TOTAL FINED</p>
                 <p className="text-xl font-black text-slate-900">{fineSummary.total}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-50 shadow-sm text-center">
                 <p className="text-[7px] font-black text-emerald-300 uppercase tracking-widest mb-1">PAID</p>
                 <p className="text-xl font-black text-emerald-500">{fineSummary.paid}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                 <p className="text-[7px] font-black text-rose-300 uppercase tracking-widest mb-1">PENDING</p>
                 <p className="text-xl font-black text-rose-500">{fineSummary.pending}</p>
              </div>
              <div className="bg-orange-600 p-4 rounded-2xl shadow-lg shadow-orange-100 text-center">
                 <p className="text-[7px] font-black text-white/50 uppercase tracking-widest mb-1">COLLECTED</p>
                 <p className="text-xl font-black text-white">{fineSummary.collected}৳</p>
              </div>
           </div>

           <div className="space-y-3">
              {filteredFineStudents.map(item => (
                <div key={item.student.id} onClick={() => setViewingFineHistoryId(item.student.id)} className="bg-white p-5 rounded-[30px] border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:border-orange-200 cursor-pointer active-scale group">
                   <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center font-black text-lg ${item.hasUnpaid ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>
                      {item.student.name.charAt(0)}
                   </div>
                   <div className="flex-1">
                      <h4 className="font-black text-slate-800 text-base leading-tight group-hover:text-orange-600 transition-colors">{item.student.name}</h4>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{batch.name} • Roll: {item.student.roll}</p>
                      <div className="flex gap-2 mt-1.5">
                         <span className="text-[7px] font-black bg-slate-50 text-slate-400 px-2 py-0.5 rounded-full uppercase tracking-widest">{currentMonthName} {currentYearStr}</span>
                         <span className={`text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${item.hasUnpaid ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-emerald-50 text-emerald-500 border border-emerald-100'}`}>
                           {item.hasUnpaid ? 'Unpaid' : 'Paid'}
                         </span>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className={`text-lg font-black leading-none ${item.hasUnpaid ? 'text-rose-500' : 'text-slate-400'}`}>{item.totalAmount}৳</p>
                      <p className="text-[7px] font-black text-slate-300 uppercase tracking-tighter mt-1">Fine Total</p>
                   </div>
                </div>
              ))}
              {filteredFineStudents.length === 0 && (
                <div className="p-20 text-center border-2 border-dashed border-slate-100 rounded-[50px] bg-white/50">
                   <p className="text-slate-300 font-black uppercase text-[10px] tracking-widest">No Fines Found For This Month</p>
                </div>
              )}
           </div>
        </div>
      )}

      {viewingFineHistoryId && (
        <div className="px-2 space-y-6 animate-fade-in">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-[22px] flex items-center justify-center font-black text-2xl">
              {students.find(s => s.id === viewingFineHistoryId)?.name.charAt(0)}
            </div>
            <div>
              <h4 className="text-xl font-black text-slate-800 tracking-tight">{students.find(s => s.id === viewingFineHistoryId)?.name}</h4>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Fine History Log</p>
            </div>
          </div>
          <div className="space-y-3">
             {fines.filter(f => f.studentId === viewingFineHistoryId && f.batchId === batch.id)
               .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
               .map(fine => {
                 const fDate = new Date(fine.date);
                 return (
                   <div key={fine.id} className="bg-white p-5 rounded-[30px] border border-slate-100 flex items-center justify-between shadow-sm">
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${fine.status === 'Paid' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                           {fine.status === 'Paid' ? <CheckCircle2 size={18}/> : <CircleDashed size={18}/>}
                        </div>
                        <div>
                           <p className="text-sm font-black text-slate-800">{months[fDate.getMonth()]} {fDate.getFullYear()}</p>
                           <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{fine.reason}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <p className={`text-lg font-black ${fine.status === 'Paid' ? 'text-slate-400' : 'text-slate-900'}`}>{fine.amount}৳</p>
                        <button onClick={() => toggleFineStatus(fine.id)} className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${fine.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-500 text-white shadow-lg shadow-rose-100'}`}>
                           {fine.status === 'Paid' ? 'Paid' : 'Pay'}
                        </button>
                     </div>
                   </div>
                 );
               })}
          </div>
        </div>
      )}

      {activeTab === 'HONORIUM' && (
        <div className="px-2">
          {!selectedHonorariumStudentId ? (
            <div className="space-y-4">
              {sortedBatchStudents.map(student => {
                const stats = getStudentPaymentStats(student);
                const isOffline = student.status === 'Archive';
                return (
                  <div key={student.id} onClick={() => setSelectedHonorariumStudentId(student.id)} className={`bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer active-scale transition-all hover:border-[#009572]/20 group ${isOffline ? 'opacity-40 grayscale border-dashed bg-slate-50/50' : ''}`}>
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 bg-slate-50 text-slate-300 rounded-[22px] flex items-center justify-center font-black text-2xl group-hover:bg-emerald-50 group-hover:text-[#009572] transition-colors ${isOffline ? 'bg-slate-200' : ''}`}>
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`text-lg font-black leading-tight ${isOffline ? 'text-slate-400' : 'text-slate-800'}`}>{student.name}</h4>
                          {isOffline && <span className="bg-slate-200 text-slate-500 text-[6px] font-black uppercase px-2 py-0.5 rounded-full tracking-tighter">OFFLINE</span>}
                        </div>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{batch.name}</p>
                        <div className="flex gap-3 mt-1.5">
                           <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${isOffline ? 'text-slate-400 bg-slate-100' : 'text-[#009572] bg-emerald-50'}`}>Paid: {stats.paidCount} Mo</span>
                           <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${isOffline ? 'text-slate-400 bg-slate-100' : 'text-rose-500 bg-rose-50'}`}>Due: {stats.dueCount} Mo</span>
                        </div>
                      </div>
                    </div>
                    <ChevronDown className="-rotate-90 text-slate-200 group-hover:text-[#009572] transition-colors" size={20}/>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="flex gap-4">
                <div className="flex-1 bg-slate-900 rounded-[35px] p-6 text-white shadow-xl">
                  <p className="text-[8px] font-black uppercase text-white/50 tracking-widest mb-1">TOTAL COLLECTED</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-black text-emerald-400">{(honorariumStats?.paidCount || 0) * (selectedStudent?.monthlyFee || batch.fee)}৳</h3>
                    <span className="text-[9px] font-bold text-white/30 uppercase">({honorariumStats?.paidCount || 0} MO)</span>
                  </div>
                </div>
                <div className="flex-1 bg-white rounded-[35px] border border-slate-100 p-6 shadow-sm">
                  <p className="text-[8px] font-black uppercase text-slate-300 tracking-widest mb-1">TOTAL DUE</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-black text-rose-500">{(honorariumStats?.dueCount || 0) * (selectedStudent?.monthlyFee || batch.fee)}৳</h3>
                    <span className="text-[9px] font-bold text-slate-300 uppercase">({honorariumStats?.dueCount || 0} MO)</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-black text-white rounded-[20px] p-4 flex items-center justify-between cursor-pointer px-8 shadow-xl">
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Fiscal Year Selector:</p>
                 <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-transparent font-black text-xs uppercase tracking-widest outline-none cursor-pointer">
                    {['2024', '2025', '2026', '2027'].map(y => <option key={y} value={y} className="text-black">{y}</option>)}
                 </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {months.map((m, idx) => {
                  const now = new Date();
                  const enrollY = selectedStudent ? parseInt(selectedStudent.enrollmentDate.year) : 0;
                  const enrollM = selectedStudent ? months.indexOf(selectedStudent.enrollmentDate.month) : 0;
                  const isPaid = payments.some(p => p.studentId === selectedHonorariumStudentId && p.month === m && p.year === selectedYear && p.status === 'Paid');
                  const isFuture = parseInt(selectedYear) > now.getFullYear() || (parseInt(selectedYear) === now.getFullYear() && idx > now.getMonth());
                  const isPreEnroll = parseInt(selectedYear) < enrollY || (parseInt(selectedYear) === enrollY && idx < enrollM);
                  const isDue = !isPaid && !isFuture && !isPreEnroll;
                  const isOffline = selectedStudent?.status === 'Archive';

                  return (
                    <div 
                      key={m} 
                      onClick={() => !isPreEnroll && !isOffline && handleTogglePayment(selectedHonorariumStudentId!, m, selectedYear)} 
                      className={`p-6 rounded-[35px] border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active-scale ${isPaid ? 'bg-emerald-50/50 border-emerald-100 ring-1 ring-emerald-500/20' : isFuture ? 'bg-white border-slate-100' : isPreEnroll ? 'bg-slate-50 border-slate-50 opacity-10 pointer-events-none' : 'bg-rose-50/50 border-rose-100 ring-1 ring-rose-500/10'} ${isOffline ? 'cursor-default pointer-events-none' : ''}`}
                    >
                      <span className={`text-[7px] font-black uppercase tracking-widest ${isPaid ? 'text-emerald-500' : isDue ? 'text-rose-500' : 'text-slate-400'}`}>{m}</span>
                      <p className="text-xl font-black text-slate-800 tracking-tighter">{selectedStudent?.monthlyFee || batch.fee}৳</p>
                      <span className={`px-4 py-1 rounded-full text-[7px] font-black uppercase border transition-all ${isPaid ? 'bg-emerald-500 text-white border-emerald-400' : isFuture ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-rose-500 text-white border-rose-400'}`}>
                        {isPaid ? 'PAID' : isFuture ? 'ADVANCE' : 'UNPAID'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 pt-6">
                <div className="grid grid-cols-2 gap-4">
                   <a 
                     href={selectedStudent?.status === 'Active' ? `tel:${selectedStudent.mobile}` : '#'} 
                     className={`flex items-center justify-center gap-3 py-5 rounded-[25px] font-black text-[10px] uppercase tracking-widest transition-all ${selectedStudent?.status === 'Active' ? 'bg-[#009572] text-white shadow-xl shadow-emerald-50 active-scale' : 'bg-slate-100 text-slate-300 cursor-not-allowed opacity-50'}`}
                     onClick={(e) => selectedStudent?.status !== 'Active' && e.preventDefault()}
                   >
                     <Phone size={18}/> 📞 Call Student
                   </a>
                   <button 
                     onClick={() => selectedStudent && handleSendSummarySMS(selectedStudent)} 
                     className={`flex items-center justify-center gap-3 py-5 rounded-[25px] font-black text-[10px] uppercase tracking-widest shadow-xl transition-all ${selectedStudent?.status === 'Active' ? 'bg-indigo-600 text-white shadow-indigo-50 active-scale' : 'bg-slate-100 text-slate-300 cursor-not-allowed opacity-50'}`}
                     disabled={selectedStudent?.status === 'Archive'}
                   >
                     <MessageSquare size={18}/> ✉️ Summary SMS
                   </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'PRESENCE' && (
        <div className="space-y-4 px-2">
          {sortedBatchStudents.map(student => {
            const isOffline = student.status === 'Archive';
            const currentRec = attendance.find(rec => rec.studentId === student.id && rec.date === today);
            const presentCount = attendance.filter(a => a.studentId === student.id && a.status === 'P').length;
            const absentCount = attendance.filter(a => a.studentId === student.id && a.status === 'A').length;

            return (
              <div key={student.id} className={`bg-white p-6 rounded-[35px] border border-slate-50 shadow-sm flex items-center justify-between transition-all group ${isOffline ? 'opacity-40 grayscale-0 border-dashed bg-slate-50/50' : 'hover:border-emerald-100'}`}>
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => onSelectStudent(student.id)}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl transition-colors ${currentRec?.status === 'P' ? 'bg-[#009572] text-white' : currentRec?.status === 'A' ? 'bg-rose-500 text-white' : isOffline ? 'bg-slate-200 text-slate-400' : 'bg-slate-50 text-slate-300'}`}>
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`text-lg font-black leading-tight ${isOffline ? 'text-slate-400' : 'text-slate-900'}`}>{student.name}</p>
                      {isOffline && <span className="bg-slate-200 text-slate-500 text-[6px] font-black uppercase px-2 py-0.5 rounded-full tracking-tighter">OFFLINE</span>}
                    </div>
                    <div className="flex gap-2 text-[8px] font-black uppercase tracking-widest mt-1">
                      <span className="text-slate-300">R: {student.roll}</span>
                      <span className="text-emerald-500">P: {presentCount}</span>
                      <span className="text-rose-400">A: {absentCount}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!isOffline && (
                    <>
                      <button onClick={() => markPresence(student.id, 'P')} className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-all ${currentRec?.status === 'P' ? 'bg-[#009572] text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 active-scale'}`}>P</button>
                      <button onClick={() => markPresence(student.id, 'A')} className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-all ${currentRec?.status === 'A' ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-50 text-slate-800 hover:bg-slate-100 active-scale'}`}>A</button>
                    </>
                  )}
                  <button onClick={() => openEditModal(student)} className="w-10 h-10 flex items-center justify-center text-slate-200 active:text-[#009572] transition-colors"><Edit size={16}/></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsAdding(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-t-[50px] md:rounded-[50px] p-8 pb-12 shadow-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editingStudent ? 'Edit Student' : 'Add New Student'}</h2>
              <button onClick={() => setIsAdding(false)} className="p-3 bg-slate-50 rounded-full text-slate-400"><X size={20}/></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-5">
              <input type="text" required placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-50 p-6 rounded-3xl border border-slate-100 font-bold outline-none focus:border-[#009572] transition-all" />
              <input type="text" required placeholder="Roll Number" value={form.roll} onChange={e => setForm({...form, roll: e.target.value})} className="w-full bg-slate-50 p-6 rounded-3xl border border-slate-100 font-bold outline-none focus:border-[#009572] transition-all" />
              <input type="text" required placeholder="Mobile Number" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} className="w-full bg-slate-50 p-6 rounded-3xl border border-slate-100 font-bold outline-none focus:border-[#009572] transition-all" />
              
              <div className="space-y-2 px-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-3">Monthly Fee (Override)</label>
                <input type="number" required placeholder="Amount in Tk" value={form.monthlyFee} onChange={e => setForm({...form, monthlyFee: parseInt(e.target.value) || 0})} className="w-full bg-slate-50 p-6 rounded-3xl border border-slate-100 font-bold outline-none focus:border-[#009572] transition-all" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <select value={form.day} onChange={e => setForm({...form, day: e.target.value})} className="bg-slate-50 p-4 rounded-xl font-bold border-none outline-none">
                  {Array.from({length: 31}).map((_, i) => <option key={i+1}>{String(i+1).padStart(2,'0')}</option>)}
                </select>
                <select value={form.month} onChange={e => setForm({...form, month: e.target.value})} className="bg-slate-50 p-4 rounded-xl font-bold border-none outline-none">
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <option key={m}>{m}</option>)}
                </select>
                <select value={form.year} onChange={e => setForm({...form, year: e.target.value})} className="bg-slate-50 p-4 rounded-xl font-bold border-none outline-none">
                  {['2024', '2025', '2026', '2027'].map(y => <option key={y}>{y}</option>)}
                </select>
              </div>

              {editingStudent && (
                <div className="flex gap-2">
                  <button type="button" onClick={() => setForm({...form, status: 'Active'})} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${form.status === 'Active' ? 'bg-[#009572] text-white border-[#009572]' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>Active</button>
                  <button type="button" onClick={() => setForm({...form, status: 'Archive'})} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${form.status === 'Archive' ? 'bg-rose-500 text-white border-rose-500' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>Offline</button>
                </div>
              )}

              <button type="submit" className="w-full bg-[#009572] text-white py-6 rounded-[32px] font-black uppercase tracking-widest mt-6 shadow-2xl shadow-emerald-50 active:scale-95 transition-all">
                {editingStudent ? 'Save Record Changes' : 'Enroll Student'}
              </button>
            </form>
          </div>
        </div>
      )}

      {absentFineModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setAbsentFineModal(null)}></div>
          <div className="bg-white rounded-[50px] p-10 w-full max-w-lg shadow-2xl relative animate-fade-in">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32}/>
            </div>
            <h3 className="text-3xl font-black text-slate-900 text-center mb-1">Absent Record</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] text-center mb-8">{absentFineModal.name.toUpperCase()} IS MARKED ABSENT</p>
            
            <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">APPLY FINE? (৳)</p>
            <div className="bg-white border-2 border-[#009572] rounded-3xl p-6 mb-8 flex items-center justify-between">
              <input type="number" value={fineAmountInput} onChange={e => setFineAmountInput(e.target.value)} className="text-4xl font-black text-slate-900 w-full text-center outline-none" />
            </div>

            <div className="flex items-center gap-4">
              <button onClick={() => setAbsentFineModal(null)} className="flex-1 bg-[#f0f4f9] py-5 rounded-[25px] font-black text-[10px] uppercase tracking-widest">CANCEL</button>
              <button onClick={confirmAbsenceWithFine} className="flex-1 bg-orange-500 text-white py-5 rounded-[25px] font-black text-[10px] uppercase shadow-lg shadow-orange-100">CONFIRM</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManager;
