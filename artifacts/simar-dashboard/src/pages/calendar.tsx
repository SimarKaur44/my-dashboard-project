import React, { useMemo, useState } from "react";
import {
  useGetCalendarTasks,
  useCreateCalendarTask,
  useUpdateCalendarTask,
  useDeleteCalendarTask,
} from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Trash2, Plus, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

const formatKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export default function CalendarPage() {
  const { data: tasks = [], refetch } = useGetCalendarTasks();
  const createTask = useCreateCalendarTask();
  const updateTask = useUpdateCalendarTask();
  const deleteTask = useDeleteCalendarTask();
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(formatKey(new Date()));
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });
  }, [month]);

  const selectedTasks = tasks.filter(t => t.date === selectedDate);
  const workedDays = new Set(tasks.filter(t => t.completed).map(t => t.date)).size;
  const today = formatKey(new Date());

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createTask.mutate({ data: { title: title.trim(), date: selectedDate, notes: notes.trim() || undefined } }, {
      onSuccess: () => { setTitle(""); setNotes(""); refetch(); },
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto flex flex-col gap-8 pb-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-white mb-2">Task Calendar</h1>
          <p className="text-white/60 uppercase tracking-widest text-sm">Plan your days. See your semester take shape.</p>
        </div>
        <div className="glass-panel rounded-xl px-5 py-3 text-right">
          <div className="text-2xl font-serif text-primary">{workedDays}</div>
          <div className="text-[10px] text-white/50 uppercase tracking-widest">Days worked</div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <section className="glass-panel rounded-2xl p-5 md:p-7">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10"><ChevronLeft /></button>
            <h2 className="text-2xl font-serif text-white">{month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h2>
            <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10"><ChevronRight /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => <div key={day} className="text-[10px] text-primary uppercase tracking-widest py-2">{day}</div>)}
            {days.map(day => {
              const key = formatKey(day);
              const dayTasks = tasks.filter(t => t.date === key);
              const isCurrentMonth = day.getMonth() === month.getMonth();
              return (
                <button key={key} onClick={() => setSelectedDate(key)} className={`min-h-20 rounded-lg p-2 text-left border transition-colors ${selectedDate === key ? "border-primary bg-primary/15" : "border-transparent hover:border-white/20 bg-white/5"} ${!isCurrentMonth ? "opacity-30" : ""}`}>
                  <span className={`text-sm ${key === today ? "text-primary font-bold" : "text-white/80"}`}>{day.getDate()}</span>
                  <div className="mt-1 space-y-1">
                    {dayTasks.slice(0, 2).map(task => <div key={task.id} className={`truncate text-[10px] rounded px-1 ${task.completed ? "line-through text-emerald-300/60 bg-emerald-400/10" : "text-white/60 bg-white/10"}`}>{task.title}</div>)}
                    {dayTasks.length > 2 && <div className="text-[10px] text-primary">+{dayTasks.length - 2} more</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="glass-panel rounded-2xl p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4 text-white">
            <CalendarDays className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-xl">{new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric" })}</h2>
          </div>
          <form onSubmit={addTask} className="space-y-3 mb-6">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="What needs doing?" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder:text-white/30 outline-none focus:border-primary" />
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)" rows={2} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/30 outline-none focus:border-primary resize-none" />
            <Button type="submit" variant="glass" className="w-full"><Plus className="w-4 h-4 mr-2" /> Add task</Button>
          </form>
          <div className="space-y-2">
            {selectedTasks.map(task => (
              <div key={task.id} className="flex items-start gap-2 rounded-lg bg-white/5 p-3">
                <button onClick={() => updateTask.mutate({ id: task.id, data: { completed: !task.completed } }, { onSuccess: () => refetch() })} className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center ${task.completed ? "bg-primary border-primary text-[#5C1D35]" : "border-white/30 text-transparent"}`}><Check className="w-3 h-3" /></button>
                <div className="flex-1 min-w-0"><div className={`text-sm text-white ${task.completed ? "line-through text-white/40" : ""}`}>{task.title}</div>{task.notes && <div className="text-xs text-white/40 mt-1">{task.notes}</div>}</div>
                <button onClick={() => deleteTask.mutate({ id: task.id }, { onSuccess: () => refetch() })} className="text-white/30 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {selectedTasks.length === 0 && <p className="text-sm text-white/40 italic text-center py-5">Nothing planned yet.</p>}
          </div>
        </section>
      </div>
    </motion.div>
  );
}