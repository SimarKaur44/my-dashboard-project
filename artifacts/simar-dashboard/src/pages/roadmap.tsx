import React, { useState, useRef } from "react";
import { 
  useGetRoadmapItems, useCreateRoadmapItem, 
  useUpdateRoadmapItem, useDeleteRoadmapItem,
  useGetCategoryProgress
} from "@workspace/api-client-react";
import type { RoadmapItem } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Trash2, GripVertical, List, X, ChevronDown, Mail, Link as LinkIcon, FileText, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoadmapProps {
  category: string;
  title: string;
}

/** Parse a pasted/typed list into individual task titles. */
function parseList(raw: string): string[] {
  return raw
    .split("\n")
    .map(line => line.trim())
    .map(line => line.replace(/^(\d+[\.\)]|[-•*])\s*/, "").trim())
    .filter(Boolean);
}

const STATUS_OPTIONS = [
  { value: "", label: "No status", color: "text-white/30 bg-white/5" },
  { value: "Not Started", label: "Not Started", color: "text-white/60 bg-white/10" },
  { value: "In Progress", label: "In Progress", color: "text-[#C9A96E] bg-[#C9A96E]/15" },
  { value: "Waiting", label: "Waiting…", color: "text-amber-300 bg-amber-400/15" },
  { value: "Done", label: "Done ✓", color: "text-emerald-300 bg-emerald-400/15" },
  { value: "Rejected", label: "Rejected", color: "text-red-300 bg-red-400/15" },
];

function statusStyle(value: string | null | undefined) {
  return STATUS_OPTIONS.find(o => o.value === (value ?? ""))?.color ?? "text-white/30 bg-white/5";
}

interface DetailPanelProps {
  item: RoadmapItem;
  onSave: (fields: Partial<Pick<RoadmapItem, "notes" | "status" | "contactEmail" | "linkUrl">>) => void;
}

function DetailPanel({ item, onSave }: DetailPanelProps) {
  const [notes, setNotes] = useState(item.notes ?? "");
  const [status, setStatus] = useState(item.status ?? "");
  const [contactEmail, setContactEmail] = useState(item.contactEmail ?? "");
  const [linkUrl, setLinkUrl] = useState(item.linkUrl ?? "");

  const save = (fields: Partial<Pick<RoadmapItem, "notes" | "status" | "contactEmail" | "linkUrl">>) => {
    onSave(fields);
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
      className="overflow-hidden"
    >
      <div className="mt-2 ml-[72px] mr-10 mb-2 grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-white/5 border border-white/10">

        {/* Status */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-[10px] font-bold text-white/40 uppercase tracking-widest">
            <Tag className="w-3 h-3" /> Status
          </label>
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); save({ status: e.target.value }); }}
            className={`rounded-lg px-3 py-2 text-sm border border-white/10 bg-transparent focus:outline-none focus:border-primary transition-colors cursor-pointer ${statusStyle(status)}`}
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value} className="bg-[#1a0a10] text-white">{o.label}</option>
            ))}
          </select>
        </div>

        {/* Contact email */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-[10px] font-bold text-white/40 uppercase tracking-widest">
            <Mail className="w-3 h-3" /> Contact / Email
          </label>
          <input
            type="text"
            value={contactEmail}
            onChange={e => setContactEmail(e.target.value)}
            onBlur={() => save({ contactEmail })}
            placeholder="prof@university.edu"
            className="bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Link */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-[10px] font-bold text-white/40 uppercase tracking-widest">
            <LinkIcon className="w-3 h-3" /> Link / URL
          </label>
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              onBlur={() => save({ linkUrl })}
              placeholder="https://..."
              className="flex-1 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-colors"
            />
            {linkUrl && (
              <a href={linkUrl} target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-primary hover:bg-white/10 transition-colors shrink-0">
                <LinkIcon className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="flex items-center gap-1.5 text-[10px] font-bold text-white/40 uppercase tracking-widest">
            <FileText className="w-3 h-3" /> Notes
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            onBlur={() => save({ notes })}
            placeholder="Deadline, requirements, key details..."
            rows={2}
            className="bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-colors resize-none"
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function Roadmap({ category, title }: RoadmapProps) {
  const { data: items = [], refetch } = useGetRoadmapItems({ category });
  const { data: progress } = useGetCategoryProgress(category);
  
  const createItem = useCreateRoadmapItem();
  const updateItem = useUpdateRoadmapItem();
  const deleteItem = useDeleteRoadmapItem();

  const [newItemTitle, setNewItemTitle] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkParsed, setBulkParsed] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleBulkChange = (val: string) => {
    setBulkText(val);
    setBulkParsed(parseList(val));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    createItem.mutate({ data: { category, title: newItemTitle, order: items.length } }, {
      onSuccess: () => { setNewItemTitle(""); refetch(); }
    });
  };

  const handleBulkAdd = async () => {
    const lines = parseList(bulkText);
    if (lines.length === 0) return;
    setBulkLoading(true);
    let orderBase = items.length;
    for (const line of lines) {
      await new Promise<void>((resolve, reject) => {
        createItem.mutate(
          { data: { category, title: line, order: orderBase++ } },
          { onSuccess: () => resolve(), onError: reject }
        );
      });
    }
    setBulkLoading(false);
    setBulkText(""); setBulkParsed([]); setBulkMode(false);
    refetch();
  };

  const handleToggle = (id: number, currentStatus: boolean) => {
    updateItem.mutate({ id, data: { completed: !currentStatus } }, { onSuccess: () => refetch() });
  };

  const handleDelete = (id: number) => {
    deleteItem.mutate({ id }, { onSuccess: () => { if (expandedId === id) setExpandedId(null); refetch(); } });
  };

  const handleDetailSave = (id: number, fields: Partial<Pick<RoadmapItem, "notes" | "status" | "contactEmail" | "linkUrl">>) => {
    const data = {
      notes: fields.notes ?? undefined,
      status: fields.status ?? undefined,
      contactEmail: fields.contactEmail ?? undefined,
      linkUrl: fields.linkUrl ?? undefined,
    };
    updateItem.mutate({ id, data }, { onSuccess: () => refetch() });
  };

  const percentage = progress?.percentage || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto flex flex-col gap-8 pb-10"
    >
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold text-white mb-2">{title}</h1>
          <p className="text-white/60 uppercase tracking-widest text-sm">
            {progress?.completedItems || 0} / {progress?.totalItems || 0} Completed
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-3xl font-serif text-primary">{percentage}%</div>
            <div className="text-xs text-white/50 uppercase tracking-widest">Progress</div>
          </div>
          <div className="w-16 h-16 relative">
            <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
              <path className="text-white/10" strokeWidth="4" stroke="currentColor" fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              <path className="text-primary" strokeWidth="4"
                strokeDasharray={`${percentage}, 100`} strokeLinecap="round"
                stroke="currentColor" fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
            </svg>
          </div>
        </div>
      </header>

      <div className="glass-panel rounded-2xl p-6 md:p-8">
        {/* Mode Toggle */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => { setBulkMode(false); setBulkText(""); setBulkParsed([]); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              !bulkMode ? "bg-primary/20 text-primary border border-primary/30" : "text-white/40 hover:text-white/70 hover:bg-white/5"
            }`}
          >
            <Plus className="w-4 h-4" /> Single Task
          </button>
          <button
            onClick={() => setBulkMode(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              bulkMode ? "bg-primary/20 text-primary border border-primary/30" : "text-white/40 hover:text-white/70 hover:bg-white/5"
            }`}
          >
            <List className="w-4 h-4" /> Paste a List
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!bulkMode ? (
            <motion.form key="single" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              onSubmit={handleAdd} className="flex gap-4 mb-8">
              <input type="text" placeholder="Add a new goal or task..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:bg-white/10 transition-all"
                value={newItemTitle} onChange={(e) => setNewItemTitle(e.target.value)} />
              <Button type="submit" variant="glass" className="h-auto px-6">
                <Plus className="w-5 h-5 mr-2" /> Add
              </Button>
            </motion.form>
          ) : (
            <motion.div key="bulk" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              className="mb-8 flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-xs font-bold text-primary uppercase tracking-widest">Paste or type your list</label>
                  <textarea autoFocus rows={6} value={bulkText} onChange={e => handleBulkChange(e.target.value)}
                    placeholder={"1. Submit GIS application\n2. Update CV\n3. Email Dr. Chen\n\n(Numbered, bulleted, or plain lines all work)"}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:bg-white/10 transition-all resize-none font-serif text-sm leading-relaxed" />
                </div>
                {bulkParsed.length > 0 && (
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    className="w-56 flex flex-col gap-2 shrink-0">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                      Preview — {bulkParsed.length} task{bulkParsed.length !== 1 ? "s" : ""}
                    </label>
                    <div className="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                      {bulkParsed.map((t, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-white/70">
                          <div className="w-5 h-5 rounded-full border border-white/20 shrink-0 mt-0.5 flex items-center justify-center text-[10px] text-white/30">{i + 1}</div>
                          <span className="truncate">{t}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button type="button" variant="glass" disabled={bulkParsed.length === 0 || bulkLoading} onClick={handleBulkAdd} className="px-6">
                  {bulkLoading ? `Adding ${bulkParsed.length} tasks…` : `Add ${bulkParsed.length > 0 ? bulkParsed.length : ""} Task${bulkParsed.length !== 1 ? "s" : ""}`}
                </Button>
                <button type="button" onClick={() => { setBulkMode(false); setBulkText(""); setBulkParsed([]); }}
                  className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors">
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task list */}
        <div className="space-y-1">
          <AnimatePresence>
            {items.sort((a, b) => a.order - b.order).map((item) => {
              const isExpanded = expandedId === item.id;
              const hasDetails = item.status || item.contactEmail || item.linkUrl || item.notes;

              return (
                <motion.div key={item.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {/* Main row */}
                  <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    item.completed ? "bg-white/5 border-white/5 opacity-60" : "bg-white/10 border-white/10 hover:border-primary/50"
                  }`}>
                    <div className="cursor-move text-white/20 hover:text-white/50 shrink-0">
                      <GripVertical className="w-5 h-5" />
                    </div>

                    <button onClick={() => handleToggle(item.id, item.completed)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                        item.completed ? "border-primary bg-primary text-[#5C1D35]" : "border-white/30 hover:border-primary"
                      }`}>
                      {item.completed && <Check className="w-4 h-4" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <span className={`text-lg font-medium transition-colors block truncate ${item.completed ? "text-white/50 line-through" : "text-white"}`}>
                        {item.title}
                      </span>
                      {/* Inline status badge */}
                      {item.status && !isExpanded && (
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusStyle(item.status)}`}>
                          {item.status}
                        </span>
                      )}
                    </div>

                    {/* Expand chevron */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className={`p-2 rounded-lg transition-colors shrink-0 ${
                        isExpanded ? "text-primary bg-primary/10" : hasDetails ? "text-white/50 hover:text-white hover:bg-white/5" : "text-white/20 hover:text-white/50 hover:bg-white/5"
                      }`}
                      title="More details"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                    </button>

                    <button onClick={() => handleDelete(item.id)}
                      className="p-2 text-white/20 hover:text-destructive transition-colors rounded-lg hover:bg-white/5 shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Expandable detail panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <DetailPanel
                        key={`detail-${item.id}`}
                        item={item}
                        onSave={(fields) => handleDetailSave(item.id, fields)}
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {items.length === 0 && (
            <div className="text-center py-12 text-white/40 font-serif italic">
              Nothing here yet. Time to set some goals.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
