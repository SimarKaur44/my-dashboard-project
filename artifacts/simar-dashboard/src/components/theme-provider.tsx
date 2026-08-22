import { Settings } from "@workspace/api-client-react";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useGetSettings } from "@workspace/api-client-react";

type ThemeContextType = {
  wallpaper: string;
  blurAmount: number;
  darknessAmount: number;
};

const ThemeContext = createContext<ThemeContextType>({
  wallpaper: "",
  blurAmount: 12,
  darknessAmount: 0.4,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: settings } = useGetSettings();
  
  useEffect(() => {
    if (settings) {
      document.documentElement.style.setProperty('--glass-blur', `${settings.blurAmount}px`);
      document.documentElement.style.setProperty('--glass-darkness', `${settings.darknessAmount / 100}`);
    }
  }, [settings]);

  return (
    <ThemeContext.Provider 
      value={{
        wallpaper: settings?.wallpaper || "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2790&auto=format&fit=crop", 
        blurAmount: settings?.blurAmount || 12,
        darknessAmount: settings?.darknessAmount || 40,
      }}
    >
      <div id="wallpaper-layer" style={{ backgroundImage: `url(${settings?.wallpaper || "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2790&auto=format&fit=crop"})` }} />
      <div id="wallpaper-overlay" />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
