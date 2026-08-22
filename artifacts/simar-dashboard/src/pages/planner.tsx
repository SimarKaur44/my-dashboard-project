import React, { useEffect, useRef, useState } from "react";
import { 
  useGetPlannerNotes, useCreatePlannerNote, useUpdatePlannerNote 
} from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Warm ivory to dusty mauve gradient variations
const CARD_COLORS = [
  "bg-[#F7F4F2]", // Mon: Ivory
  "bg-[#F5EBE8]", // Tue
  "bg-[#F2E1E0]", // Wed
  "bg-[#EED6D7]", // Thu
  "bg-[#E9CACE]", // Fri
  "bg-[#E3BFC6]", // Sat
  "bg-[#DDB2BD]"  // Sun: approaching Mauve
];

function StickyNote({ day, colorClass, initialNote }: { day: string, colorClass: string, initialNote: any }) {
  const [content, setContent] = useState("");
  const createNote = useCreatePlannerNote();
  const updateNote = useUpdatePlannerNote();
  
  const initializedId = useRef<number | null>(null);
  const lastSaved = useRef("");

  useEffect(() => {
    if (initialNote && initializedId.current !== initialNote.id) {
      initializedId.current = initialNote.id;
      setContent(initialNote.content);
      lastSaved.current = initialNote.content;
    }
  }, [initialNote]);

  const handleBlur = () => {
    if (content !== lastSaved.current) {
      if (initializedId.current) {
        updateNote.mutate({ id: initializedId.current, data: { content } });
      } else {
        const weekStart = new Date().toISOString().split('T')[0]; // Simplify for now
        createNote.mutate({ data: { dayOfWeek: day, content, weekStart } }, {
          onSuccess: (data) => {
            initializedId.current = data.id;
          }
        });
      }
      lastSaved.current = content;
    }
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.02, rotate: -1 }}
      className={cn(
        "sticky-note-bg rounded-lg p-5 shadow-sm hover:shadow-md transition-all h-[280px] flex flex-col relative",
        colorClass
      )}
    >
      {/* Tape mark visual */}
      <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-12 h-6 bg-white/40 rotate-2 backdrop-blur-sm shadow-sm" />
      
      <h3 className="font-serif font-bold text-[#5C1D35] text-xl mb-3 border-b border-[#5C1D35]/10 pb-2">
        {day}
      </h3>
      
      <textarea
        className="flex-1 w-full bg-transparent resize-none outline-none text-[#5C1D35]/80 font-medium placeholder:text-[#5C1D35]/30"
        placeholder="Plan the day..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={handleBlur}
      />
    </motion.div>
  );
}

export default function Planner() {
  const { data: notes } = useGetPlannerNotes();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto flex flex-col gap-8 pb-10"
    >
      <header>
        <h1 className="text-4xl font-serif font-bold text-white mb-2">Weekly Planner</h1>
        <p className="text-white/60 uppercase tracking-widest text-sm">
          Design your days. Execute with grace.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
        {DAYS.map((day, idx) => {
          const note = notes?.find(n => n.dayOfWeek === day);
          return (
            <StickyNote 
              key={day} 
              day={day} 
              colorClass={CARD_COLORS[idx]} 
              initialNote={note} 
            />
          );
        })}
      </div>
    </motion.div>
  );
}
