import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Star, Heart, Zap, Target, BookOpen, Coffee, Music, Globe,
  Award, Dumbbell, Pen, Sparkles, Sun, Moon, Flame, Crown,
  Leaf, Gem, Clock, Camera, Headphones, Plane, LucideIcon
} from "lucide-react";

const ICON_OPTIONS: { name: string; label: string; Icon: LucideIcon }[] = [
  { name: "Star", label: "Star", Icon: Star },
  { name: "Heart", label: "Heart", Icon: Heart },
  { name: "Zap", label: "Energy", Icon: Zap },
  { name: "Target", label: "Target", Icon: Target },
  { name: "BookOpen", label: "Study", Icon: BookOpen },
  { name: "Coffee", label: "Coffee", Icon: Coffee },
  { name: "Music", label: "Music", Icon: Music },
  { name: "Globe", label: "World", Icon: Globe },
  { name: "Award", label: "Award", Icon: Award },
  { name: "Dumbbell", label: "Fitness", Icon: Dumbbell },
  { name: "Pen", label: "Writing", Icon: Pen },
  { name: "Sparkles", label: "Sparkle", Icon: Sparkles },
  { name: "Sun", label: "Morning", Icon: Sun },
  { name: "Moon", label: "Night", Icon: Moon },
  { name: "Flame", label: "Hustle", Icon: Flame },
  { name: "Crown", label: "CEO", Icon: Crown },
  { name: "Leaf", label: "Wellness", Icon: Leaf },
  { name: "Gem", label: "Goals", Icon: Gem },
  { name: "Clock", label: "Time", Icon: Clock },
  { name: "Camera", label: "Memories", Icon: Camera },
  { name: "Headphones", label: "Focus", Icon: Headphones },
  { name: "Plane", label: "Travel", Icon: Plane },
];

export function getIconComponent(name: string): LucideIcon {
  return ICON_OPTIONS.find(o => o.name === name)?.Icon ?? Star;
}

export interface CustomCard {
  id: string;
  title: string;
  icon: string;
  description: string;
  link?: string;
}

interface AddCardDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (card: Omit<CustomCard, "id">) => void;
}

export function AddCardDialog({ open, onClose, onSave }: AddCardDialogProps) {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("Star");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), icon, description: description.trim(), link: link.trim() || undefined });
    setTitle("");
    setIcon("Star");
    setDescription("");
    setLink("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="glass-panel border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-white">New Card</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-primary uppercase tracking-widest">Title</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Morning Routine, Side Project..."
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          {/* Icon picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-primary uppercase tracking-widest">Icon</label>
            <div className="grid grid-cols-8 gap-1.5">
              {ICON_OPTIONS.map(({ name, label, Icon }) => (
                <button
                  key={name}
                  type="button"
                  title={label}
                  onClick={() => setIcon(name)}
                  className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                    icon === name
                      ? "bg-primary/30 border border-primary text-primary"
                      : "bg-white/5 border border-white/5 text-white/50 hover:border-white/20 hover:text-white/80"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-primary uppercase tracking-widest">Note <span className="text-white/30 normal-case font-normal">(optional)</span></label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this card for?"
              rows={2}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          {/* Link */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-primary uppercase tracking-widest">Link <span className="text-white/30 normal-case font-normal">(optional — paste any URL)</span></label>
            <input
              type="url"
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder="https://..."
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1 border-white/10 text-white/60" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="glass" className="flex-1">
              Add Card
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
