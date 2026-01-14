
import React, { useState, useEffect } from 'react';
import { Download, Edit3, MessageSquare, Save, Info } from 'lucide-react';

const SessionPlanner: React.FC<{ userId: string; standardFee: number; setStandardFee: (f: number) => void }> = ({ standardFee, setStandardFee }) => {
  const [instName, setInstName] = useState(localStorage.getItem('imran_inst_name') || "Imran's Academy");
  const [smsTemplate, setSmsTemplate] = useState(localStorage.getItem('imran_sms_template') || "{INSTITUTE_NAME}\n\nDear {STUDENT_NAME},\n\nPaid Months: {PAID_MONTHS}\nDue Months: {DUE_MONTHS}\n\nTotal Due: {TOTAL_DUE_AMOUNT} Tk\n\nThank you.");

  const saveConfig = () => {
    localStorage.setItem('imran_inst_name', instName);
    localStorage.setItem('imran_sms_template', smsTemplate);
    alert('Configurations Saved Successfully!');
  };

  const exportData = () => {
    const data = {
      batches: JSON.parse(localStorage.getItem('imran_batches') || '[]'),
      students: JSON.parse(localStorage.getItem('imran_students') || '[]'),
      notes: JSON.parse(localStorage.getItem('imran_notes') || '[]'),
      settings: { standardFee, instName, smsTemplate }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `imran_panel_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10 pb-20 animate-fade-in">
      <div className="flex items-center gap-4 mb-2">
         <div className="w-2 h-8 bg-[#009572] rounded-full"></div>
         <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Cloud Options</h2>
      </div>

      <section className="bg-white p-10 rounded-[50px] border border-slate-50 shadow-sm space-y-8">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-[#009572] rounded-2xl flex items-center justify-center">
               <Edit3 size={24}/>
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fee Configuration</p>
               <h4 className="font-bold text-slate-800">Standard Monthly Fee</h4>
            </div>
         </div>
         <div className="bg-[#f7f9fc] rounded-[40px] p-8 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 w-full">
               <input type="number" value={standardFee} onChange={(e) => setStandardFee(parseInt(e.target.value) || 0)} className="w-full bg-white px-8 py-5 rounded-[25px] border-2 border-slate-50 text-2xl font-black text-[#009572] outline-none shadow-inner" placeholder="1000"/>
            </div>
            <div className="bg-[#009572] text-white p-8 rounded-[35px] shadow-xl shadow-emerald-100 min-w-[150px] text-center">
               <p className="text-[8px] font-black uppercase tracking-widest mb-1 opacity-70">CURRENT</p>
               <p className="text-3xl font-black">{standardFee}৳</p>
            </div>
         </div>
      </section>

      <section className="bg-white p-10 rounded-[50px] border border-slate-100 shadow-sm space-y-6">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
               <MessageSquare size={24}/>
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Communication Settings</p>
               <h4 className="font-bold text-slate-800">Summary SMS Template</h4>
            </div>
         </div>

         <div className="space-y-4">
           <div>
              <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-4 mb-2 block">Institute / Teacher Name</label>
              <input type="text" value={instName} onChange={e => setInstName(e.target.value)} className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold outline-none focus:border-indigo-600" />
           </div>

           <div>
              <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-4 mb-2 block">Message Structure</label>
              <textarea value={smsTemplate} onChange={e => setSmsTemplate(e.target.value)} className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold outline-none focus:border-indigo-600 h-48 resize-none text-sm leading-relaxed" />
           </div>

           <div className="bg-amber-50 p-5 rounded-3xl flex gap-3 border border-amber-100">
              <Info size={18} className="text-amber-500 shrink-0 mt-1"/>
              <div>
                 <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-1">Dynamic Placeholders</p>
                 <p className="text-[9px] text-amber-500 font-medium leading-relaxed uppercase">Use {'{INSTITUTE_NAME}, {STUDENT_NAME}, {BATCH_NAME}, {PAID_MONTHS}, {DUE_MONTHS}, {TOTAL_DUE_AMOUNT}'} to auto-inject data.</p>
              </div>
           </div>

           <button onClick={saveConfig} className="w-full bg-indigo-600 text-white py-5 rounded-[25px] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95 flex items-center justify-center gap-3">
              <Save size={18}/> Save Settings
           </button>
         </div>
      </section>

      <section className="bg-white p-10 rounded-[50px] border border-slate-100 shadow-sm relative overflow-hidden">
         <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg"><Download size={28}/></div>
            <div><p className="text-[11px] font-black text-[#009572] uppercase tracking-[0.2em] mb-0.5">DATA SAFETY</p><p className="font-bold text-slate-800 text-lg">Export local database</p></div>
         </div>
         <div className="flex justify-end mt-4"><button onClick={exportData} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all active:scale-95">DOWNLOAD JSON</button></div>
      </section>
    </div>
  );
};

export default SessionPlanner;
