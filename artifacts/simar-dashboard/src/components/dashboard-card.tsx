import React from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DashboardCardProps {
  href: string;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function DashboardCard({ href, title, icon, children, delay = 0, className }: DashboardCardProps) {
  return (
    <Link href={href} className="block w-full h-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
        className={cn(
          "glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col h-[220px] relative overflow-hidden group",
          className
        )}
      >
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary/20 transition-colors pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-4 text-white z-10">
          <div className="p-2 bg-white/10 rounded-lg text-primary">
            {icon}
          </div>
          <h3 className="font-serif text-xl font-medium tracking-wide">{title}</h3>
        </div>
        
        <div className="flex-1 flex flex-col justify-end z-10 w-full overflow-hidden">
          {children}
        </div>
      </motion.div>
    </Link>
  );
}
