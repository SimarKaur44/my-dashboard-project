import React, { useState, useEffect, useRef } from "react";
import { 
  useGetDashboard, useGetFocus, useSetFocus, 
  useGetRoadmapItems, useGetPlannerNotes, useGetVisionBoard, useGetCalendarTasks
} from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatTime, formatDate } from "@/lib/utils";
import { DashboardCard } from "@/components/dashboard-card";
import { AddCardDialog, CustomCard, getIconComponent } from "@/components/add-card-dialog";
import { Map, GraduationCap, Briefcase, FlaskConical, Calendar, ImageIcon, Folder, Quote, Plus, X, ExternalLink } from "lucide-react";

const STORAGE_KEY = "simar_custom_cards";

function loadCustomCards(): CustomCard[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveCustomCards(cards: CustomCard[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

export default function Dashboard() {
  const { data: dashboard, isLoading: isLoadingDashboard } = useGetDashboard();
  const { data: focus } = useGetFocus();
  const { mutate: setFocus } = useSetFocus();

  const [focusText, setFocusText] = useState("");
  const [time, setTime] = useState(new Date());
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [customCards, setCustomCards] = useState<CustomCard[]>([]);
  const [editMode, setEditMode] = useState(false);
  const initializedFocus = useRef(false);

  useEffect(() => {
    setCustomCards(loadCustomCards());
  }, []);

  useEffect(() => {
    if (focus?.text && !initializedFocus.current) {
      setFocusText(focus.text);
      initializedFocus.current = true;
    }
  }, [focus]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleFocusBlur = () => {
    if (focusText !== focus?.text) {
      setFocus({ data: { text: focusText } });
    }
  };

  const handleFocusKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") (e.currentTarget as HTMLElement).blur();
  };

  const handleAddCard = (card: Omit<CustomCard, "id">) => {
    const newCard: CustomCard = { ...card, id: crypto.randomUUID() };
    const updated = [...customCards, newCard];
    setCustomCards(updated);
    saveCustomCards(updated);
  };

  const handleDeleteCard = (id: string) => {
    const updated = customCards.filter(c => c.id !== id);
    setCustomCards(updated);
    saveCustomCards(updated);
    if (updated.length === 0) setEditMode(false);
  };

  // Pre-fetching for previews
  const { data: gisItems } = useGetRoadmapItems({ category: "gis" });
  const { data: appItems } = useGetRoadmapItems({ category: "applications" });
  const { data: universityItems } = useGetRoadmapItems({ category: "university" });
  const { data: researchItems } = useGetRoadmapItems({ category: "research" });
  const { data: calendarTasks } = useGetCalendarTasks();
  const { data: plannerNotes } = useGetPlannerNotes();
  const { data: visionItems } = useGetVisionBoard();

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaysNote = plannerNotes?.find(n => n.dayOfWeek.toLowerCase() === todayStr.toLowerCase())?.content;
  const todayKey = new Date().toISOString().slice(0, 10);
  const todaysTasks = calendarTasks?.filter(task => task.date === todayKey) ?? [];

  if (isLoadingDashboard) {
    return <div className="text-white">Loading your space...</div>;
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      <header className="flex items-start justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-1 text-white"
        >
          <h1 className="text-5xl font-serif font-bold tracking-tight">
            {dashboard?.greeting || "Welcome back, Simar"}
          </h1>
          <p className="text-lg text-white/70 font-medium tracking-wide">
            {formatDate(time.toISOString())} &mdash; {formatTime(time)}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-4 rounded-xl min-w-[300px]"
        >
          <label className="text-xs font-bold text-primary uppercase tracking-widest mb-1 block">
            Today's Main Character Mission
          </label>
          <input 
            type="text"
            className="w-full bg-transparent border-b border-white/20 text-white placeholder:text-white/30 outline-none focus:border-primary transition-colors py-1 text-lg font-serif"
            placeholder="Conquer the world..."
            value={focusText}
            onChange={(e) => setFocusText(e.target.value)}
            onBlur={handleFocusBlur}
            onKeyDown={handleFocusKey}
          />
        </motion.div>
      </header>

      {dashboard?.quote && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="my-6 text-center max-w-3xl mx-auto"
        >
          <p className="font-serif text-3xl italic text-white/90 leading-snug">
            "{dashboard.quote.text}"
          </p>
          {dashboard.quote.author && (
            <p className="mt-4 text-primary font-medium tracking-widest uppercase text-sm">
              — {dashboard.quote.author}
            </p>
          )}
        </motion.div>
      )}

      {/* Built-in cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
        <DashboardCard href="/gis" title="GIS Tracker" icon={<Map className="w-5 h-5" />} delay={0.2}>
          <div className="space-y-2">
            {gisItems?.slice(0, 3).map(item => (
              <div key={item.id} className="flex items-center gap-2 text-sm text-white/80">
                <div className={`w-2 h-2 rounded-full ${item.completed ? 'bg-primary' : 'bg-white/20'}`} />
                <span className={`truncate ${item.completed ? 'line-through text-white/50' : ''}`}>{item.title}</span>
              </div>
            ))}
            {(!gisItems || gisItems.length === 0) && (
              <p className="text-white/50 text-sm italic">No items yet</p>
            )}
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${dashboard?.progressRings.find(r => r.category === 'GIS')?.percentage || 0}%` }} />
          </div>
        </DashboardCard>

        <DashboardCard href="/applications" title="Applications" icon={<Briefcase className="w-5 h-5" />} delay={0.3}>
          <div className="space-y-2 overflow-hidden">
            {appItems?.slice(0, 3).map(item => <div key={item.id} className={`text-sm truncate ${item.completed ? "line-through text-white/40" : "text-white/80"}`}>{item.title}</div>)}
            <span className="text-white/50 text-xs uppercase tracking-wider">{appItems?.length || 0} Active Apps</span>
          </div>
        </DashboardCard>

        <DashboardCard href="/planner" title="Planner" icon={<Calendar className="w-5 h-5" />} delay={0.4}>
          <div className="bg-white/5 rounded p-3 h-full overflow-hidden flex flex-col justify-start">
            <span className="text-primary text-xs uppercase tracking-widest mb-1">{todayStr}</span>
            <p className="text-sm text-white/80 line-clamp-3 whitespace-pre-wrap font-serif">
              {todaysNote || "No notes for today. Rest and recharge."}
            </p>
          </div>
        </DashboardCard>

        <DashboardCard href="/calendar" title="Today's Tasks" icon={<Calendar className="w-5 h-5" />} delay={0.45}>
          <div className="space-y-2 overflow-hidden">
            {todaysTasks.slice(0, 3).map(task => (
              <div key={task.id} className={`text-sm truncate ${task.completed ? "line-through text-white/40" : "text-white/80"}`}>{task.title}</div>
            ))}
            {todaysTasks.length === 0 && <p className="text-white/50 text-sm italic">Nothing planned today.</p>}
            {todaysTasks.length > 3 && <span className="text-primary text-xs">+{todaysTasks.length - 3} more</span>}
          </div>
        </DashboardCard>

        <DashboardCard href="/vision" title="Vision Board" icon={<ImageIcon className="w-5 h-5" />} delay={0.5}>
          <div className="grid grid-cols-3 gap-2 h-full opacity-80">
            {visionItems?.filter(i => i.type === 'image').slice(0, 6).map(item => (
              <div key={item.id} className="bg-white/10 rounded overflow-hidden aspect-square">
                <img src={item.content} className="w-full h-full object-cover" alt="" />
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard href="/university" title="University" icon={<GraduationCap className="w-5 h-5" />} delay={0.6}>
          <div className="space-y-2 overflow-hidden">
            {universityItems?.slice(0, 2).map(item => <div key={item.id} className={`text-sm truncate ${item.completed ? "line-through text-white/40" : "text-white/80"}`}>{item.title}</div>)}
            <div className="flex items-center justify-between mt-auto"><span className="text-white/60">Progress</span><span className="text-primary font-bold">{dashboard?.progressRings.find(r => r.category === 'University')?.percentage || 0}%</span></div>
          </div>
        </DashboardCard>

        <DashboardCard href="/research" title="Research" icon={<FlaskConical className="w-5 h-5" />} delay={0.7}>
          <div className="space-y-2 overflow-hidden">
            {researchItems?.slice(0, 2).map(item => <div key={item.id} className={`text-sm truncate ${item.completed ? "line-through text-white/40" : "text-white/80"}`}>{item.title}</div>)}
            <div className="flex items-center justify-between mt-auto"><span className="text-white/60">Progress</span><span className="text-primary font-bold">{dashboard?.progressRings.find(r => r.category === 'Research')?.percentage || 0}%</span></div>
          </div>
        </DashboardCard>

        <DashboardCard href="/documents" title="Documents" icon={<Folder className="w-5 h-5" />} delay={0.8}>
          <p className="text-white/60 text-sm mt-auto">Organize your CVs, SOPs, and certificates.</p>
        </DashboardCard>

        <DashboardCard href="/quotes" title="Quotes" icon={<Quote className="w-5 h-5" />} delay={0.9}>
          <p className="text-white/60 text-sm mt-auto">Collect your CEO energy.</p>
        </DashboardCard>
      </div>

      {/* Custom Cards Section */}
      {(customCards.length > 0 || true) && (
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-white/50 text-xs uppercase tracking-widest font-bold">My Cards</h2>
            <div className="flex items-center gap-2">
              {customCards.length > 0 && (
                <button
                  onClick={() => setEditMode(v => !v)}
                  className={`text-xs uppercase tracking-widest px-3 py-1 rounded-lg transition-colors ${
                    editMode ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"
                  }`}
                >
                  {editMode ? "Done" : "Edit"}
                </button>
              )}
              <button
                onClick={() => setAddCardOpen(true)}
                className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-primary hover:text-primary/80 transition-colors px-3 py-1 rounded-lg hover:bg-white/5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Card
              </button>
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {customCards.length > 0 ? (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {customCards.map((card, i) => {
                  const IconComp = getIconComponent(card.icon);
                  const inner = (
                    <motion.div
                      key={card.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.25, delay: i * 0.05 }}
                      className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col h-[220px] relative overflow-hidden group"
                    >
                      {/* Glow */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary/20 transition-colors pointer-events-none" />

                      {/* Delete button in edit mode */}
                      {editMode && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={e => { e.preventDefault(); handleDeleteCard(card.id); }}
                          className="absolute top-3 right-3 z-20 w-6 h-6 rounded-full bg-destructive/80 flex items-center justify-center text-white hover:bg-destructive transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </motion.button>
                      )}

                      <div className="flex items-center gap-3 mb-4 text-white z-10">
                        <div className="p-2 bg-white/10 rounded-lg text-primary">
                          <IconComp className="w-5 h-5" />
                        </div>
                        <h3 className="font-serif text-xl font-medium tracking-wide truncate">{card.title}</h3>
                        {card.link && !editMode && (
                          <ExternalLink className="w-3.5 h-3.5 text-white/30 ml-auto shrink-0" />
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-end z-10 w-full overflow-hidden">
                        <p className="text-white/60 text-sm line-clamp-3">
                          {card.description || "No description yet."}
                        </p>
                      </div>
                    </motion.div>
                  );

                  return card.link && !editMode ? (
                    <a key={card.id} href={card.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                      {inner}
                    </a>
                  ) : (
                    <div key={card.id}>{inner}</div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.button
                key="add-prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setAddCardOpen(true)}
                className="glass-panel rounded-2xl p-6 h-[120px] flex items-center justify-center gap-3 text-white/30 hover:text-white/60 hover:border-primary/30 border border-transparent transition-all group"
              >
                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/10 transition-colors">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="font-serif text-lg">Add your first custom card</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

      <AddCardDialog
        open={addCardOpen}
        onClose={() => setAddCardOpen(false)}
        onSave={handleAddCard}
      />
    </div>
  );
}
