import React, { useState } from "react";
import { 
  useGetQuotes, useCreateQuote, useDeleteQuote 
} from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Quote as QuoteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const CATEGORIES = ["All", "CEO Energy", "Soft Girl Discipline", "Academic Comeback", "Main Character", "Delusional Confidence"];

export default function Quotes() {
  const [filter, setFilter] = useState("All");
  
  const { data: quotes = [], refetch } = useGetQuotes(filter !== "All" ? { category: filter } : undefined);
  const createQuote = useCreateQuote();
  const deleteQuote = useDeleteQuote();

  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState(CATEGORIES[1]); // Default to first actual category

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    createQuote.mutate({ data: { text, category, author } }, {
      onSuccess: () => {
        setText("");
        setAuthor("");
        setIsOpen(false);
        refetch();
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteQuote.mutate({ id }, { onSuccess: () => refetch() });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto flex flex-col gap-8 pb-10"
    >
      <header className="flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-serif font-bold text-white mb-2">Quotes</h1>
            <p className="text-white/60 uppercase tracking-widest text-sm">
              Words to live by.
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="glass" className="h-12 px-6 rounded-full text-sm tracking-wide">
                <Plus className="w-4 h-4 mr-2" /> Add Quote
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-[#5C1D35] border-primary/20 text-white">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl">Capture the Wisdom</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm text-white/70 uppercase tracking-wider">Quote</label>
                  <textarea 
                    required
                    placeholder="Enter the quote..."
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary outline-none resize-none h-32"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-white/70 uppercase tracking-wider">Author (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Who said it?"
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary outline-none"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-white/70 uppercase tracking-wider">Vibe</label>
                  <select 
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary outline-none"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.slice(1).map(c => <option key={c} value={c} className="bg-[#5C1D35]">{c}</option>)}
                  </select>
                </div>
                <Button type="submit" className="w-full h-12 mt-4 bg-primary text-[#5C1D35] hover:bg-primary/90 font-bold tracking-widest uppercase">
                  Save Quote
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === c 
                  ? "bg-primary text-[#5C1D35]" 
                  : "glass-panel text-white hover:border-primary/50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </header>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        <AnimatePresence>
          {quotes.map((q) => (
            <motion.div
              key={q.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="break-inside-avoid relative group"
            >
              <div className="rounded-2xl glass-panel p-8 border-white/10 flex flex-col justify-center relative overflow-hidden">
                <QuoteIcon className="w-8 h-8 text-primary/20 mb-4 absolute top-4 left-4" />
                <p className="font-serif text-2xl text-white/90 leading-snug relative z-10 pt-4">"{q.text}"</p>
                <div className="mt-6 flex flex-col gap-2 relative z-10">
                  {q.author && (
                    <p className="text-primary font-medium tracking-widest uppercase text-sm">
                      — {q.author}
                    </p>
                  )}
                  <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-[10px] uppercase tracking-wider w-fit text-white/60">
                    {q.category}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => handleDelete(q.id)}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive transition-all z-20 backdrop-blur-md"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {quotes.length === 0 && (
        <div className="text-center py-20 text-white/40 font-serif italic text-xl">
          No quotes found for this vibe. Add some fire.
        </div>
      )}
    </motion.div>
  );
}
