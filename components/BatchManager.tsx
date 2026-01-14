
import React, { useState, useEffect } from 'react';
import { Settings, Power, ChevronRight, Users, StickyNote, AlertCircle, Edit3, X, Clock, Calendar, CheckCircle, Timer, Forward, AlertTriangle } from 'lucide-react';
import { Batch, BatchNote } from '../types';

interface BatchManagerProps {
  batches: Batch[];
  setBatches: React.Dispatch<React.SetStateAction<Batch[]>>;
  onSelectBatch: (id: string) => void;
  onManageNotes: (id: string) => void;
  notes: BatchNote[];
}

const BatchManager: React.FC<BatchManagerProps> = ({ batches, setBatches, onSelectBatch, onManageNotes, notes }) => {
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const getAutoStatus = (batch: Batch): 'Running' | 'Upcoming' | 'Completed' => {
    const parseTime = (timeStr: string) => {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const batchStart = parseTime(batch.time);
    const batchEnd = batchStart + 60;

    if (nowMinutes >= batchStart && nowMinutes < batchEnd) return 'Running';
    if (nowMinutes < batchStart) return 'Upcoming';
    return 'Completed';
  };

  const sortedBatches = [...batches].sort((a, b) => {
    const statusOrder = { 'Running': 0, 'Upcoming': 1, 'Completed': 2 };
    return statusOrder[getAutoStatus(a)] - statusOrder[getAutoStatus(b)];
  });

  const toggleActive = (id: string) => {
    const updated = batches.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b);
    setBatches(updated);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch) return;
    const updated = batches.map(b => b.id === editingBatch.id ? editingBatch : b);
    setBatches(updated);
    setEditingBatch(null);
  };

  const getPendingNotesCount = (batchId: string) => {
    return notes.filter(n => n.batchId === batchId && n.status === 'Pending').length;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Tools Bar</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Smart Priority Sorting Enabled</p>
        </div>
        <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 flex items-center gap-2">
          <Clock size={14} className="text-[#009572]" />
          <span className="text-[11px] font-black text-[#009572]">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </header>

      <div className="grid gap-5">
        {sortedBatches.map((batch) => {
          const status = getAutoStatus(batch);
          const pendingCount = getPendingNotesCount(batch.id);
          
          return (
            <div key={batch.id} className={`bg-white p-6 rounded-[40px] border transition-all ${batch.isActive ? 'border-emerald-100 shadow-sm' : 'border-slate-50 opacity-60'}`}>
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5 cursor-pointer flex-1" onClick={() => onSelectBatch(batch.id)}>
                    <div className={`relative w-16 h-16 rounded-[24px] flex items-center justify-center font-black text-2xl shadow-sm ${batch.isActive ? 'bg-emerald-50 text-[#009572]' : 'bg-slate-50 text-slate-300'}`}>
                      {batch.name.charAt(0)}
                      {pendingCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center text-[11px] border-4 border-white font-black">
                          {pendingCount}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-xl font-black text-slate-800 tracking-tight">{batch.name}</h4>
                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-sm ${
                          status === 'Running' ? 'bg-emerald-500 text-white border-emerald-400 animate-pulse' : 
                          status === 'Upcoming' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                          'bg-slate-100 text-slate-400 border-slate-200'
                        }`}>
                          {status === 'Running' ? <Timer size={10}/> : status === 'Upcoming' ? <Forward size={10}/> : <CheckCircle size={10}/>}
                          {status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{batch.className} • {batch.time}</p>
                    </div>
                  </div>
                  <button onClick={() => toggleActive(batch.id)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${batch.isActive ? 'bg-emerald-50 text-[#009572] shadow-inner' : 'bg-rose-50 text-rose-400'}`}>
                    <Power size={22} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <ActionButton onClick={() => onSelectBatch(batch.id)} icon={<Users size={18} />} label="Students" />
                  <ActionButton onClick={() => onManageNotes(batch.id)} icon={<StickyNote size={18} />} label="Notes/Alerts" badge={pendingCount > 0} />
                  <ActionButton onClick={() => setEditingBatch(batch)} icon={<Edit3 size={18} />} label="Edit Batch" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editingBatch && (
        <div className="fixed inset-0 z-[120] flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setEditingBatch(null)}></div>
          <div className="bg-white w-full max-w-lg rounded-t-[45px] md:rounded-[45px] p-8 pb-12 shadow-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Modify Batch</h2>
              <button onClick={() => setEditingBatch(null)} className="p-2 bg-slate-50 rounded-full text-slate-400"><X size={20} /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">General Info</label>
                <input type="text" required value={editingBatch.name} onChange={e => setEditingBatch({ ...editingBatch, name: e.target.value })} className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold outline-none focus:border-[#009572]" placeholder="Batch Name" />
                <input type="text" required value={editingBatch.className} onChange={e => setEditingBatch({ ...editingBatch, className: e.target.value })} className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold outline-none focus:border-[#009572]" placeholder="Class Level" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Monthly Fee (Batch Default)</label>
                <input type="number" required value={editingBatch.fee} onChange={e => setEditingBatch({ ...editingBatch, fee: parseInt(e.target.value) || 0 })} className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold outline-none focus:border-[#009572]" placeholder="Amount in Tk" />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Class Days</label>
                <div className="grid grid-cols-4 gap-2">
                  {['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                    <button type="button" key={day} onClick={() => setEditingBatch({ ...editingBatch, days: editingBatch.days.includes(day) ? editingBatch.days.filter(d => d !== day) : [...editingBatch.days, day] })} className={`py-3 rounded-xl font-black text-[10px] uppercase border transition-all ${editingBatch.days.includes(day) ? 'bg-[#009572] text-white' : 'bg-slate-50 text-slate-400'}`}>{day}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Start Time</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <select value={editingBatch.time} onChange={e => setEditingBatch({ ...editingBatch, time: e.target.value })} className="w-full pl-12 pr-4 py-5 bg-slate-50 rounded-2xl border border-slate-100 font-bold outline-none appearance-none">
                    {Array.from({ length: 24 }).map((_, i) => {
                      const h = i % 12 || 12;
                      const ampm = i >= 12 ? 'PM' : 'AM';
                      const t = `${String(h).padStart(2, '0')}:00 ${ampm}`;
                      return <option key={t} value={t}>{t}</option>;
                    })}
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full bg-[#009572] text-white py-6 rounded-3xl font-black uppercase tracking-widest mt-6 shadow-xl shadow-emerald-50 active:scale-95 transition-all">Update Database</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ActionButton = ({ onClick, icon, label, badge }: any) => (
  <button onClick={onClick} className="relative flex flex-col items-center gap-2 p-5 bg-slate-50 rounded-[30px] hover:bg-[#009572]/5 transition-colors group">
    <div className="text-slate-400 group-hover:text-[#009572] transition-colors">{icon}</div>
    <span className="text-[9px] font-black uppercase text-slate-400 group-hover:text-[#009572] tracking-widest">{label}</span>
    {badge && <div className="absolute top-3 right-3 w-2 h-2 bg-orange-500 rounded-full"></div>}
  </button>
);

export default BatchManager;
