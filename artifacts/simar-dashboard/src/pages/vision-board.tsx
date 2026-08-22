import React, { useState } from "react";
import { 
  useGetVisionBoard, useCreateVisionItem, useDeleteVisionItem 
} from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Image as ImageIcon, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function VisionBoard() {
  const { data: items = [], refetch } = useGetVisionBoard();
  const createItem = useCreateVisionItem();
  const deleteItem = useDeleteVisionItem();

  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<"image" | "quote">("image");
  const [content, setContent] = useState("");
  const [caption, setCaption] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createItem.mutate({ data: { type, content, caption } }, {
      onSuccess: () => {
        setContent("");
        setCaption("");
        setIsOpen(false);
        refetch();
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteItem.mutate({ id }, { onSuccess: () => refetch() });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto flex flex-col gap-8 pb-10"
    >
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold text-white mb-2">Vision Board</h1>
          <p className="text-white/60 uppercase tracking-widest text-sm">
            Curate your reality.
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="glass" className="h-12 px-6 rounded-full text-sm tracking-wide">
              <Plus className="w-4 h-4 mr-2" /> Add to Vision
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-[#5C1D35] border-primary/20 text-white">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Add to Vision</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-6 pt-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType("image")}
                  className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 border transition-colors ${
                    type === "image" ? "border-primary bg-primary/10 text-primary" : "border-white/10 text-white/50"
                  }`}
                >
                  <ImageIcon className="w-4 h-4" /> Image URL
                </button>
                <button
                  type="button"
                  onClick={() => setType("quote")}
                  className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 border transition-colors ${
                    type === "quote" ? "border-primary bg-primary/10 text-primary" : "border-white/10 text-white/50"
                  }`}
                >
                  <Quote className="w-4 h-4" /> Quote
                </button>
              </div>

              {type === "image" ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm text-white/70 uppercase tracking-wider">Image URL</label>
                    <input 
                      type="url" 
                      required
                      placeholder="https://..."
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary outline-none"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-white/70 uppercase tracking-wider">Caption (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="What does this mean to you?"
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary outline-none"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm text-white/70 uppercase tracking-wider">Quote</label>
                    <textarea 
                      required
                      placeholder="Enter the quote..."
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary outline-none resize-none h-32"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-white/70 uppercase tracking-wider">Author (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="Who said it?"
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary outline-none"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                    />
                  </div>
                </>
              )}
              <Button type="submit" className="w-full h-12 bg-primary text-[#5C1D35] hover:bg-primary/90 font-bold tracking-widest uppercase">
                Add to Board
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {/* Masonry Layout via CSS columns */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="break-inside-avoid relative group"
            >
              {item.type === 'image' ? (
                <div className="rounded-2xl overflow-hidden glass-panel border-white/10">
                  <img src={item.content} alt={item.caption || "Vision"} className="w-full h-auto object-cover" loading="lazy" />
                  {item.caption && (
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                      <p className="text-white font-medium drop-shadow-md">{item.caption}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl glass-panel p-8 border-white/10 flex flex-col justify-center min-h-[200px]">
                  <Quote className="w-8 h-8 text-primary/40 mb-4" />
                  <p className="font-serif text-2xl text-white/90 leading-snug">"{item.content}"</p>
                  {item.caption && (
                    <p className="mt-4 text-primary font-medium tracking-widest uppercase text-sm">
                      — {item.caption}
                    </p>
                  )}
                </div>
              )}
              
              {/* Delete Button (visible on hover) */}
              <button 
                onClick={() => handleDelete(item.id)}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-white transition-all backdrop-blur-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {items.length === 0 && (
        <div className="text-center py-20 text-white/40 font-serif italic text-xl">
          Your vision board is empty. Start dreaming.
        </div>
      )}
    </motion.div>
  );
}
