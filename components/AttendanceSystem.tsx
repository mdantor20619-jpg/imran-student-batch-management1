
import React, { useState } from 'react';
import { ChevronLeft, Plus, AlertTriangle } from 'lucide-react';

const AttendanceSystem: React.FC<{ userId: string }> = () => {
  const [activeTab, setActiveTab] = useState<'PRESENCE' | 'HONORIUM' | 'FINES'>('PRESENCE');
  const [showAbsentRecord, setShowAbsentRecord] = useState(false);
  const [attendance, setAttendance] = useState<'P' | 'A' | null>('P');

  const handleConfirmAbsent = () => {
    setAttendance('A');
    setShowAbsentRecord(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
           <button className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors">
              <ChevronLeft size={20}/>
           </button>
           <div>
              <h3 className="text-2xl font-black text-slate-900">Batch A</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">1 Students Enrolled</p>
           </div>
        </div>
        <button className="bg-[#009572] text-white p-3 rounded-xl shadow-lg shadow-emerald-100 active:scale-95 transition-all"><Plus/></button>
      </div>

      <div className="bg-white p-1.5 rounded-[25px] flex border border-slate-100">
         {(['PRESENCE', 'HONORIUM', 'FINES'] as const).map(tab => (
           <button 
             key={tab} 
             onClick={() => setActiveTab(tab)}
             className={`flex-1 py-3 rounded-[20px] text-[8px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-[#009572] text-white shadow-sm' : 'text-slate-300 hover:text-slate-400'}`}
           >
             {tab}
           </button>
         ))}
      </div>

      {activeTab === 'PRESENCE' && (
        <div className="bg-white p-6 rounded-[35px] border border-slate-50 shadow-sm flex items-center justify-between transition-all hover:border-emerald-100">
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#009572] text-white rounded-2xl flex items-center justify-center font-black text-2xl">R</div>
              <div>
                 <p className="text-lg font-black text-slate-900">Rifat</p>
                 <div className="flex gap-2 text-[8px] font-black uppercase tracking-widest mt-1">
                    <span className="text-slate-300">R: 1</span>
                    <span className="text-emerald-500">P: {attendance === 'P' ? '1' : '0'}</span>
                    <span className="text-rose-400">A: {attendance === 'A' ? '1' : '0'}</span>
                 </div>
              </div>
           </div>
           <div className="flex gap-2">
              <button 
                onClick={() => setAttendance('P')}
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-all ${attendance === 'P' ? 'bg-[#009572] text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
              >
                P
              </button>
              <button 
                onClick={() => setShowAbsentRecord(true)} 
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-all ${attendance === 'A' ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-50 text-slate-800 hover:bg-slate-100'}`}
              >
                A
              </button>
              <div className="w-10 h-10 flex items-center justify-center text-slate-200">...</div>
           </div>
        </div>
      )}

      {showAbsentRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-[80]">
           <div className="bg-white rounded-[50px] p-10 w-full max-w-lg shadow-2xl relative overflow-hidden animate-fade-in">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                 <AlertTriangle size={32}/>
              </div>
              <h3 className="text-3xl font-black text-slate-900 text-center mb-1">Absent Record</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] text-center mb-8">RIFAT IS MARKED ABSENT</p>
              
              <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">APPLY FINE? (৳)</p>
              <div className="bg-white border-2 border-[#009572] rounded-3xl p-6 mb-8 flex items-center justify-between">
                 <span className="text-4xl font-black text-slate-900 mx-auto">10</span>
                 <div className="flex flex-col text-slate-400">
                    <button className="hover:text-emerald-500"><Plus size={12} className="rotate-45"/></button>
                    <button className="hover:text-emerald-500 opacity-50"><Plus size={12} className="rotate-45"/></button>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <button onClick={() => setShowAbsentRecord(false)} className="flex-1 bg-[#f0f4f9] py-5 rounded-[25px] font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-colors">IGNORE</button>
                 <button 
                  onClick={handleConfirmAbsent}
                  className="bg-orange-500 text-white px-8 py-5 rounded-full font-black text-[10px] uppercase shadow-lg shadow-orange-100 hover:bg-orange-600 active:scale-95 transition-all"
                 >
                   CONFIRM
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceSystem;
