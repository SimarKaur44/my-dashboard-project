import React, { useState } from "react";
import { 
  useGetMilestones, useCreateMilestone, 
  useUpdateMilestone, useDeleteMilestone 
} from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Plus, Trash2, Check, Clock, PlusCircle, MinusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Milestones() {
  const { data: milestones = [], refetch } = useGetMilestones();
  const createMilestone = useCreateMilestone();
  const updateMilestone = useUpdateMilestone();
  const deleteMilestone = useDeleteMilestone();

  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("checkbox");
  const [targetCount, setTargetCount] = useState<number | "">("");
  const [targetDate, setTargetDate] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    createMilestone.mutate({ 
      data: { 
        title, 
        milestoneType: type,
        targetCount: targetCount !== "" ? Number(targetCount) : undefined,
        targetDate: targetDate ? new Date(targetDate).toISOString() : undefined
      } 
    }, {
      onSuccess: () => {
        setTitle("");
        setType("checkbox");
        setTargetCount("");
        setTargetDate("");
        setIsOpen(false);
        refetch();
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteMilestone.mutate({ id }, { onSuccess: () => refetch() });
  };

  const handleUpdate = (id: number, data: any) => {
    updateMilestone.mutate({ id, data }, { onSuccess: () => refetch() });
  };

  const renderMilestone = (m: any) => {
    const isCompleted = m.completed;
    
    if (m.milestoneType === 'checkbox') {
      return (
        <div className={`flex items-center gap-4 ${isCompleted ? 'opacity-50' : ''}`}>
          <button 
            onClick={() => handleUpdate(m.id, { completed: !isCompleted })}
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
              isCompleted ? "border-primary bg-primary text-[#5C1D35]" : "border-white/30 hover:border-primary"
            }`}
          >
            {isCompleted && <Check className="w-5 h-5" />}
          </button>
          <span className={`text-xl font-serif text-white ${isCompleted ? 'line-through text-white/50' : ''}`}>{m.title}</span>
        </div>
      );
    }
    
    if (m.milestoneType === 'counter') {
      const current = m.currentCount || 0;
      const target = m.targetCount || 100;
      return (
        <div className="flex flex-col gap-3 w-full">
          <div className="flex justify-between items-end">
            <span className="text-xl font-serif text-white">{m.title}</span>
            <span className="text-2xl font-bold text-primary">{current}<span className="text-white/30 text-lg font-normal">/{target}</span></span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => handleUpdate(m.id, { currentCount: Math.max(0, current - 1) })} className="text-white/40 hover:text-white"><MinusCircle className="w-6 h-6" /></button>
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${Math.min(100, (current/target)*100)}%` }} />
            </div>
            <button onClick={() => handleUpdate(m.id, { currentCount: current + 1 })} className="text-white/40 hover:text-white"><PlusCircle className="w-6 h-6" /></button>
          </div>
        </div>
      );
    }

    if (m.milestoneType === 'progress') {
      const current = m.currentCount || 0;
      return (
        <div className="flex flex-col gap-3 w-full">
          <div className="flex justify-between items-end">
            <span className="text-xl font-serif text-white">{m.title}</span>
            <div className="flex items-center gap-1">
              <input 
                type="number" 
                value={current}
                onChange={(e) => handleUpdate(m.id, { currentCount: Number(e.target.value) })}
                className="w-16 bg-transparent text-right text-2xl font-bold text-primary outline-none border-b border-white/20 focus:border-primary"
              />
              <span className="text-primary text-2xl font-bold">%</span>
            </div>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-primary" style={{ width: `${Math.min(100, current)}%` }} />
          </div>
        </div>
      );
    }

    if (m.milestoneType === 'countdown') {
      const target = new Date(m.targetDate || Date.now());
      const now = new Date();
      const diffTime = target.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return (
        <div className="flex flex-col gap-1 w-full">
          <span className="text-xl font-serif text-white">{m.title}</span>
          <div className="flex items-center gap-2 text-primary mt-2">
            <Clock className="w-5 h-5" />
            <span className="text-3xl font-bold">{Math.max(0, diffDays)}</span>
            <span className="uppercase tracking-widest text-sm text-white/50 pt-1">Days Remaining</span>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto flex flex-col gap-8 pb-10"
    >
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold text-white mb-2">Milestones</h1>
          <p className="text-white/60 uppercase tracking-widest text-sm">
            Big goals broken down.
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="glass" className="h-12 px-6 rounded-full text-sm tracking-wide">
              <Plus className="w-4 h-4 mr-2" /> New Milestone
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-[#5C1D35] border-primary/20 text-white">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Define the Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm text-white/70 uppercase tracking-wider">Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Publish First Paper"
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary outline-none"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70 uppercase tracking-wider">Type</label>
                <select 
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary outline-none"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="checkbox" className="bg-[#5C1D35]">Simple Checkbox (Yes/No)</option>
                  <option value="counter" className="bg-[#5C1D35]">Counter (e.g. 0/100)</option>
                  <option value="progress" className="bg-[#5C1D35]">Percentage Progress (0-100%)</option>
                  <option value="countdown" className="bg-[#5C1D35]">Countdown (Target Date)</option>
                </select>
              </div>
              
              {type === 'counter' && (
                <div className="space-y-2">
                  <label className="text-sm text-white/70 uppercase tracking-wider">Target Number</label>
                  <input 
                    type="number" 
                    required
                    placeholder="100"
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary outline-none"
                    value={targetCount}
                    onChange={(e) => setTargetCount(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>
              )}

              {type === 'countdown' && (
                <div className="space-y-2">
                  <label className="text-sm text-white/70 uppercase tracking-wider">Target Date</label>
                  <input 
                    type="date" 
                    required
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary outline-none"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                  />
                </div>
              )}

              <Button type="submit" className="w-full h-12 mt-4 bg-primary text-[#5C1D35] hover:bg-primary/90 font-bold tracking-widest uppercase">
                Plant Flag
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {milestones.map((m) => (
          <div key={m.id} className="glass-panel p-6 md:p-8 rounded-2xl flex relative group">
            {renderMilestone(m)}
            <button 
              onClick={() => handleDelete(m.id)}
              className="absolute top-4 right-4 p-2 bg-black/20 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      
      {milestones.length === 0 && (
        <div className="text-center py-20 text-white/40 font-serif italic text-xl">
          No milestones defined. Where are we heading?
        </div>
      )}
    </motion.div>
  );
}
