import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ProgressRing } from "./progress-ring";
import { useGetDashboard } from "@workspace/api-client-react";
import { Skeleton } from "./ui/skeleton";
import { motion } from "framer-motion";
import { 
  Calendar, Image as ImageIcon, Folder, Trophy, Flag, Quote, 
  Settings, Home, Map, GraduationCap, Briefcase, FlaskConical, X
} from "lucide-react";

interface SidebarProps {
  onClose: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const [location] = useLocation();
  const { data: dashboard, isLoading } = useGetDashboard();

  const links = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/gis", label: "GIS Tracker", icon: Map },
    { href: "/university", label: "University", icon: GraduationCap },
    { href: "/applications", label: "Applications", icon: Briefcase },
    { href: "/research", label: "Research", icon: FlaskConical },
    { href: "/planner", label: "Weekly Planner", icon: Calendar },
    { href: "/calendar", label: "Task Calendar", icon: Calendar },
    { href: "/vision", label: "Vision Board", icon: ImageIcon },
    { href: "/documents", label: "Documents", icon: Folder },
    { href: "/wins", label: "Win Counter", icon: Trophy },
    { href: "/milestones", label: "Milestones", icon: Flag },
    { href: "/quotes", label: "Quotes", icon: Quote },
  ];

  return (
    <div className="w-[280px] h-screen bg-[#5C1D35] flex flex-col shadow-2xl border-r border-primary/20 overflow-y-auto overflow-x-hidden">
      {/* Header */}
      <div className="p-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#F7F4F2] mb-1">Simar's Space</h1>
          <p className="text-primary text-xs uppercase tracking-widest font-semibold">
            {dashboard?.currentSemester || "Loading..."}
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-1 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Rings */}
      <div className="px-4 py-2 grid grid-cols-2 gap-4 mb-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="w-20 h-20 rounded-full bg-white/10" />
              <Skeleton className="w-16 h-3 bg-white/10" />
            </div>
          ))
        ) : dashboard?.progressRings ? (
          dashboard.progressRings.map((ring) => (
            <Link key={ring.category} href={`/${ring.category.toLowerCase()}`} className="group cursor-pointer" onClick={onClose}>
              <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                <ProgressRing 
                  percentage={ring.percentage} 
                  emoji={ring.emoji} 
                  size={80} 
                  strokeWidth={6}
                  label={ring.label}
                  className="group-hover:text-primary transition-colors"
                />
              </motion.div>
            </Link>
          ))
        ) : null}
      </div>

      {/* Streak & Wins */}
      <div className="px-6 mb-8 flex justify-between items-center bg-black/10 mx-4 py-3 rounded-xl border border-white/5">
        <div className="flex flex-col">
          <span className="text-xs text-white/50 uppercase tracking-wider">Streak</span>
          <span className="text-lg font-bold text-white">
            {dashboard?.streak || 0}
          </span>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="flex flex-col items-end">
          <span className="text-xs text-white/50 uppercase tracking-wider">Wins</span>
          <span className="text-lg font-bold text-white">
            {dashboard?.winsThisMonth || 0}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1 mb-6">
        {links.map((link) => {
          const isActive = location === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive 
                  ? "bg-primary/20 text-primary" 
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <link.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-white/50 group-hover:text-white/80")} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="p-4 mt-auto">
        <Link href="/settings" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-all">
          <Settings className="w-4 h-4 text-white/50" />
          Settings
        </Link>
      </div>
    </div>
  );
}
