"use client";

import { useEffect, useState } from "react";
import type { AnimationExportPackage } from "@/types/exportPackage";

export function useExportPackage(projectId: number, storyId: number) {
  const storageKey = `ai-animation-export-package-${projectId}-${storyId}`;

  const [exportPackage, setExportPackage] =
    useState<AnimationExportPackage | null>(null);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        setExportPackage(JSON.parse(saved));
      } catch {
        setExportPackage(null);
      }
    }

    setLoaded(true);
  }, [storageKey]);

  useEffect(() => {
    if (!loaded) return;

    if (exportPackage) {
      localStorage.setItem(storageKey, JSON.stringify(exportPackage));
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [exportPackage, loaded, storageKey]);

  function saveExportPackage(data: AnimationExportPackage) {
    setExportPackage(data);
  }

  function clearExportPackage() {
    setExportPackage(null);
  }

  return {
    exportPackage,
    loaded,
    saveExportPackage,
    clearExportPackage,
  };
}