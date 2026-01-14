
import React, { useState } from 'react';
import { DollarSign, ChevronRight, TrendingUp, Calendar, Filter } from 'lucide-react';
import { Batch } from '../types';

interface FinanceManagerProps {
  batches: Batch[];
  onSelectBatch: (id: string) => void;
}

const FinanceManager: React.FC<FinanceManagerProps> = ({ batches, onSelectBatch }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date()));
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Finance Bar</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Select a batch to manage fees</p>
        </div>
        
        <div className="flex gap-2 p-1.5 bg-white rounded-2xl border border-slate-100 shadow-sm w-fit">
           <div className="flex items-center gap-1.5 px-3">
             <Filter size={14} className="text-slate-400" />
             <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="bg-transparent font-black text-[10px] uppercase outline-none cursor-pointer">
                {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => <option key={m}>{m}</option>)}
             </select>
           </div>
           <div className="w-px h-4 bg-slate-100 my-auto"></div>
           <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="bg-transparent px-4 font-black text-[10px] uppercase outline-none cursor-pointer">
              {['2024','2025','2026','2027'].map(y => <option key={y}>{y}</option>)}
           </select>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {batches.map(batch => (
          <button 
            key={batch.id} 
            onClick={() => onSelectBatch(batch.id)}
            className={`group bg-white p-6 rounded-[35px] border border-slate-100 flex items-center justify-between shadow-sm active-scale transition-all hover:border-[#009572]/30 ${!batch.isActive && 'opacity-50'}`}
          >
             <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${batch.isActive ? 'bg-emerald-50 text-[#009572]' : 'bg-slate-50 text-slate-300'}`}>
                  {batch.name.charAt(0)}
                </div>
                <div className="text-left">
                  <h4 className="text-xl font-black text-slate-800 tracking-tight">{batch.name}</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Running Fee Collection</p>
                </div>
             </div>
             <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-[#009572] transition-colors">
                <ChevronRight size={20}/>
             </div>
          </button>
        ))}
        {batches.length === 0 && (
          <div className="p-16 border-2 border-dashed border-slate-100 rounded-[50px] text-center">
            <p className="text-slate-300 font-black uppercase text-[10px] tracking-widest">No Batches Registered</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceManager;
