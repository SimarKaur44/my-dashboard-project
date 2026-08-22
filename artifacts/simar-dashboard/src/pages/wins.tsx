import React, { useState } from "react";
import { useGetWins, useAddWin, useDeleteWin } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default function Wins() {
  const { data: winsSummary, refetch } = useGetWins();
  const addWin = useAddWin();
  const deleteWin = useDeleteWin();

  const [description, setDescription] = useState("");
  const [showPop, setShowPop] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    
    addWin.mutate({ data: { description } }, {
      onSuccess: () => {
        setDescription("");
        setShowPop(true);
        setTimeout(() => setShowPop(false), 1000);
        refetch();
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteWin.mutate({ id }, { onSuccess: () => refetch() });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto flex flex-col gap-12 pb-10 relative"
    >
      <header className="flex flex-col items-center justify-center text-center mt-8">
        <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6 relative">
          <Trophy className="w-12 h-12 text-primary" />
          <AnimatePresence>
            {showPop && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 0 }}
                animate={{ opacity: 1, scale: 1.5, y: -40 }}
                exit={{ opacity: 0 }}
                className="absolute text-3xl font-bold text-primary font-serif drop-shadow-md z-50"
              >
                +1
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <h1 className="text-6xl font-serif font-bold text-white mb-4 drop-shadow-sm">
          {winsSummary?.totalThisMonth || 0}
        </h1>
        <p className="text-white/60 uppercase tracking-widest font-medium">Wins This Month</p>
        <p className="text-white/40 text-sm mt-2">All time: {winsSummary?.total || 0}</p>
      </header>

      <form onSubmit={handleAdd} className="glass-panel p-6 rounded-2xl flex gap-4 max-w-2xl mx-auto w-full relative z-20">
        <input 
          type="text" 
          placeholder="What did you conquer today?"
          className="flex-1 bg-transparent border-none text-white text-lg placeholder:text-white/30 outline-none focus:ring-0"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button type="submit" className="rounded-full px-8 bg-primary text-[#5C1D35] hover:bg-primary/90 font-bold uppercase tracking-widest">
          Record Win
        </Button>
      </form>

      <div className="space-y-4 max-w-3xl mx-auto w-full">
        <h3 className="text-white/50 uppercase tracking-widest text-sm font-semibold border-b border-white/10 pb-2 mb-6">
          Recent Victories
        </h3>
        
        <AnimatePresence>
          {winsSummary?.wins.map((win) => (
            <motion.div 
              key={win.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass-panel p-5 rounded-xl border border-white/10 flex items-center justify-between group"
            >
              <div>
                <p className="text-white text-lg font-medium">{win.description}</p>
                <p className="text-white/40 text-xs mt-1 uppercase tracking-wider">{formatDate(win.createdAt)}</p>
              </div>
              <button 
                onClick={() => handleDelete(win.id)}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-white/40 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-white transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {(!winsSummary?.wins || winsSummary.wins.length === 0) && (
          <div className="text-center py-12 text-white/40 font-serif italic text-lg">
            No wins recorded yet. Time to get to work.
          </div>
        )}
      </div>
    </motion.div>
  );
}
