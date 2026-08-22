import React, { useState } from "react";
import { 
  useGetDocuments, useCreateDocument, useDeleteDocument 
} from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Folder, Plus, Trash2, FileText, Upload, Paperclip, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUpload } from "@workspace/object-storage-web";

const CATEGORIES = ["CV", "SOP", "Research Papers", "Certificates", "Patents", "Presentations"];

export default function Documents() {
  const { data: documents = [], refetch } = useGetDocuments();
  const createDoc = useCreateDocument();
  const deleteDoc = useDeleteDocument();

  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [pendingFileUrl, setPendingFileUrl] = useState<string | null>(null);
  const [pendingFileName, setPendingFileName] = useState<string | null>(null);

  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: (response) => {
      setPendingFileUrl(response.objectPath);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFileName(file.name);
    uploadFile(file);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createDoc.mutate(
      { data: { category, name, notes: notes || undefined, fileUrl: pendingFileUrl ?? undefined } },
      {
        onSuccess: () => {
          setName("");
          setNotes("");
          setPendingFileUrl(null);
          setPendingFileName(null);
          setIsOpen(false);
          refetch();
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteDoc.mutate({ id }, { onSuccess: () => refetch() });
  };

  const groupedDocs = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = documents.filter(d => d.category === cat);
    return acc;
  }, {} as Record<string, typeof documents>);

  const getFileViewUrl = (fileUrl: string) => `/api/storage${fileUrl}`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto flex flex-col gap-8 pb-10"
    >
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold text-white mb-2">Vault</h1>
          <p className="text-white/60 uppercase tracking-widest text-sm">
            Your most valuable assets.
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setName("");
            setNotes("");
            setPendingFileUrl(null);
            setPendingFileName(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button variant="glass" className="h-12 px-6 rounded-full text-sm tracking-wide">
              <Plus className="w-4 h-4 mr-2" /> Add Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-[#5C1D35] border-primary/20 text-white">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">New Record</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm text-white/70 uppercase tracking-wider">Category</label>
                <select 
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary outline-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#5C1D35]">{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70 uppercase tracking-wider">Document Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Master CV 2024"
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70 uppercase tracking-wider">Notes / Link</label>
                <input 
                  type="text" 
                  placeholder="G-Drive link or details..."
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary outline-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70 uppercase tracking-wider">Upload File</label>
                <label className={`flex items-center gap-3 w-full bg-black/20 border rounded-lg px-4 py-3 cursor-pointer transition-all ${
                  pendingFileUrl ? "border-primary/50 text-primary" : "border-white/10 text-white/50 hover:border-white/30"
                }`}>
                  <Paperclip className="w-4 h-4 shrink-0" />
                  <span className="text-sm truncate flex-1">
                    {isUploading
                      ? `Uploading… ${Math.round(progress)}%`
                      : pendingFileName
                      ? pendingFileName
                      : "Choose a file to attach"}
                  </span>
                  {pendingFileUrl && (
                    <span className="text-xs text-primary font-medium shrink-0">✓ Ready</span>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                </label>
              </div>
              <Button
                type="submit"
                disabled={isUploading || createDoc.isPending}
                className="w-full h-12 mt-4 bg-primary text-[#5C1D35] hover:bg-primary/90 font-bold tracking-widest uppercase"
              >
                Save to Vault
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((cat) => (
          <div key={cat} className="glass-panel p-6 rounded-2xl flex flex-col min-h-[300px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/10 rounded-lg text-primary">
                <Folder className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-medium tracking-wide text-white">{cat}</h3>
              <span className="ml-auto text-white/30 text-sm font-bold">{groupedDocs[cat].length}</span>
            </div>
            
            <div className="flex-1 space-y-3 overflow-y-auto">
              {groupedDocs[cat].map(doc => (
                <div key={doc.id} className="group p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all flex items-start gap-3">
                  <FileText className="w-4 h-4 text-white/40 mt-1 shrink-0 group-hover:text-primary transition-colors" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{doc.name}</p>
                    {doc.notes && <p className="text-white/40 text-xs truncate mt-0.5">{doc.notes}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {doc.fileUrl && (
                      <a
                        href={getFileViewUrl(doc.fileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-primary transition-colors"
                        title="Open file"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button 
                      onClick={() => handleDelete(doc.id)}
                      className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {groupedDocs[cat].length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-white/20 mt-8">
                  <Upload className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm font-serif italic">Empty folder</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
