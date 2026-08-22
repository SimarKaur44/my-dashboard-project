import React, { useEffect, useState, useRef } from "react";
import { 
  useGetSettings, useUpdateSettings 
} from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useUpload } from "@workspace/object-storage-web";
import { ImageUp, Loader2 } from "lucide-react";

const BUILT_IN_WALLPAPERS = [
  { label: "Dark Moody Library", url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2790&auto=format&fit=crop" },
  { label: "Burgundy Velvet", url: "https://images.unsplash.com/photo-1627885743452-25e2e8e97c9b?q=80&w=2940&auto=format&fit=crop" },
  { label: "Dark Floral", url: "https://images.unsplash.com/photo-1500693570624-9fdfb78e2d4d?q=80&w=2789&auto=format&fit=crop" },
  { label: "Starry Night Academic", url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2940&auto=format&fit=crop" }
];

export default function Settings() {
  const { data: settings, refetch } = useGetSettings();
  const updateSettings = useUpdateSettings();

  const [name, setName] = useState("");
  const [semester, setSemester] = useState("");
  const [wallpaper, setWallpaper] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [blur, setBlur] = useState(12);
  const [darkness, setDarkness] = useState(40);

  const initialized = useRef(false);

  const { uploadFile, isUploading } = useUpload({
    onSuccess: (response) => {
      const url = `/api/storage${response.objectPath}`;
      setWallpaper(url);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    uploadFile(file);
  };

  useEffect(() => {
    if (settings && !initialized.current) {
      setName(settings.name || "");
      setSemester(settings.currentSemester || "");
      setWallpaper(settings.wallpaper || "");
      setBlur(settings.blurAmount || 12);
      setDarkness(settings.darknessAmount || 40);
      initialized.current = true;
    }
  }, [settings]);

  // Live preview effect
  useEffect(() => {
    document.documentElement.style.setProperty('--glass-blur', `${blur}px`);
    document.documentElement.style.setProperty('--glass-darkness', `${darkness / 100}`);
    const layer = document.getElementById('wallpaper-layer');
    if (layer) {
      layer.style.backgroundImage = `url(${wallpaper})`;
    }
  }, [blur, darkness, wallpaper]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate({ 
      data: {
        name,
        currentSemester: semester,
        wallpaper,
        blurAmount: blur,
        darknessAmount: darkness
      }
    }, {
      onSuccess: () => refetch()
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto flex flex-col gap-8 pb-10"
    >
      <header>
        <h1 className="text-4xl font-serif font-bold text-white mb-2">Aesthetics & Settings</h1>
        <p className="text-white/60 uppercase tracking-widest text-sm">
          Tune your environment.
        </p>
      </header>

      <form onSubmit={handleSave} className="space-y-8 glass-panel p-8 rounded-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm text-white/70 uppercase tracking-wider font-semibold">Your Name</label>
            <input 
              type="text" 
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/70 uppercase tracking-wider font-semibold">Current Semester</label>
            <input 
              type="text" 
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary outline-none"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm text-white/70 uppercase tracking-wider font-semibold">Wallpaper Selection</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {BUILT_IN_WALLPAPERS.map(w => (
              <button
                key={w.url}
                type="button"
                onClick={() => { setWallpaper(w.url); setUploadedFileName(null); }}
                className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                  wallpaper === w.url ? "border-primary scale-105 shadow-[0_0_20px_rgba(212,175,55,0.4)] z-10" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={w.url} className="w-full h-full object-cover" alt={w.label} />
                <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-xs text-white text-center font-medium">
                  {w.label}
                </div>
              </button>
            ))}
          </div>
          
          <div className="pt-2">
            <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Or upload your own image</label>
            <label className="flex items-center gap-3 cursor-pointer w-fit bg-black/20 border border-white/10 hover:border-primary/50 rounded-lg px-4 py-3 text-white/70 hover:text-white transition-colors">
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ImageUp className="w-4 h-4" />
              )}
              <span className="text-sm">
                {isUploading ? "Uploading…" : uploadedFileName ?? "Choose image…"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>
          </div>
        </div>

        <div className="space-y-8 pt-4 border-t border-white/10">
          <div className="space-y-4">
            <div className="flex justify-between">
              <label className="text-sm text-white/70 uppercase tracking-wider font-semibold">Glass Blur</label>
              <span className="text-primary font-mono">{blur}px</span>
            </div>
            <input 
              type="range" 
              min="0" max="40" 
              value={blur}
              onChange={(e) => setBlur(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <label className="text-sm text-white/70 uppercase tracking-wider font-semibold">Background Darkness</label>
              <span className="text-primary font-mono">{darkness}%</span>
            </div>
            <input 
              type="range" 
              min="0" max="90" 
              value={darkness}
              onChange={(e) => setDarkness(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>

        <Button type="submit" className="w-full h-14 text-lg bg-primary text-[#5C1D35] hover:bg-primary/90 font-bold tracking-widest uppercase rounded-xl">
          Save Configuration
        </Button>
      </form>
    </motion.div>
  );
}
