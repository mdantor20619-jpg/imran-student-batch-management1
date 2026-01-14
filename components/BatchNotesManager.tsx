
import React, { useState } from 'react';
import { Plus, StickyNote, History, CheckCircle2, Trash2, X, AlertCircle } from 'lucide-react';
import { Batch, BatchNote } from '../types';

interface BatchNotesManagerProps {
  batch: Batch | undefined;
  notes: BatchNote[];
  setNotes: React.Dispatch<React.SetStateAction<BatchNote[]>>;
  onBack: () => void;
}

const BatchNotesManager: React.FC<BatchNotesManagerProps> = ({ batch, notes, setNotes, onBack }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [content, setContent] = useState('');
  const [type, setType] = useState<BatchNote['type']>('Note');

  const batchNotes = notes.filter(n => n.batchId === batch?.id && n.status === (showHistory ? 'Completed' : 'Pending'));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newNote: BatchNote = {
      id: Math.random().toString(36).substr(2, 9),
      batchId: batch!.id,
      content,
      type,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      userId: batch!.userId
    };
    const updated = [...notes, newNote];
    setNotes(updated);
    localStorage.setItem('imran_notes', JSON.stringify(updated));
    setIsAdding(false);
    setContent('');
  };

  const toggleStatus = (id: string) => {
    const updated = notes.map(n => n.id === id ? { ...n, status: n.status === 'Completed' ? 'Pending' : 'Completed' } : n);
    setNotes(updated as BatchNote[]);
    localStorage.setItem('imran_notes', JSON.stringify(updated));
  };

  if (!batch) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{batch.name}</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Tests & Events Panel</p>
          </div>
          <button onClick={() => setShowHistory(!showHistory)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${showHistory ? 'bg-[#009572] text-white' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
            {showHistory ? <StickyNote size={20}/> : <History size={20}/>}
          </button>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setIsAdding(true)} className="flex-1 bg-[#009572] text-white py-4 rounded-[22px] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-100 active:scale-95 transition-all">New Note/Test</button>
        </div>
      </header>

      <div className="grid gap-4">
        <div className="flex items-center gap-2 mb-2">
           <div className={`w-1.5 h-4 rounded-full ${showHistory ? 'bg-slate-300' : 'bg-orange-500'}`}></div>
           <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">{showHistory ? 'NOTE HISTORY' : 'CURRENT NOTES'}</h3>
        </div>
        
        {batchNotes.map(note => (
          <div key={note.id} className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm flex items-start justify-between group">
            <div className="flex gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${note.type === 'Test' ? 'bg-orange-50 text-orange-500' : note.type === 'Exam' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-[#009572]'}`}>
                <AlertCircle size={18}/>
              </div>
              <div>
                <span className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1 block">{note.type} • {new Date(note.createdAt).toLocaleDateString()}</span>
                <p className="font-bold text-slate-800 leading-snug">{note.content}</p>
              </div>
            </div>
            <button onClick={() => toggleStatus(note.id)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${note.status === 'Completed' ? 'bg-slate-50 text-slate-300' : 'bg-emerald-50 text-[#009572]'}`}>
               <CheckCircle2 size={20}/>
            </button>
          </div>
        ))}
        {batchNotes.length === 0 && (
          <div className="p-16 border-2 border-dashed border-slate-100 rounded-[50px] text-center bg-white/50">
             <p className="text-slate-300 font-black uppercase text-[10px] tracking-widest">No Items Found</p>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsAdding(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-t-[45px] md:rounded-[45px] p-8 pb-12 shadow-2xl relative animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Add Test/Event</h3>
              <button onClick={() => setIsAdding(false)} className="p-2 bg-slate-50 rounded-full text-slate-400"><X size={18}/></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="flex gap-2 mb-2">
                {(['Note', 'Test', 'Exam', 'Event'] as const).map(t => (
                  <button type="button" key={t} onClick={() => setType(t)} className={`flex-1 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${type === t ? 'bg-[#009572] text-white shadow-md' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>{t}</button>
                ))}
              </div>
              <textarea required placeholder="Write your note, test syllabus, or event details..." value={content} onChange={e => setContent(e.target.value)} className="w-full bg-slate-50 p-6 rounded-[30px] border border-slate-100 font-bold outline-none focus:border-[#009572] h-40 resize-none transition-all" />
              <button className="w-full bg-[#009572] text-white py-6 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-emerald-100 mt-2 active:scale-95 transition-all">Publish Item</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchNotesManager;
