"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type NewStoryDialogProps = {
  onCreate: (data: {
    title: string;
    idea: string;
    category: string;
    targetPlatform: string;
    duration: string;
    language: string;
  }) => void;
};

export default function NewStoryDialog({ onCreate }: NewStoryDialogProps) {
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [idea, setIdea] = useState("");
  const [category, setCategory] = useState("");
  const [targetPlatform, setTargetPlatform] = useState("");
  const [duration, setDuration] = useState("");
  const [language, setLanguage] = useState("");

  function handleCreate() {
    if (!title.trim()) return;
    if (!idea.trim()) return;

    onCreate({
      title: title.trim(),
      idea: idea.trim(),
      category: category.trim() || "Adventure",
      targetPlatform: targetPlatform.trim() || "YouTube Shorts",
      duration: duration.trim() || "30-45 seconds",
      language: language.trim() || "Indonesian",
    });

    setTitle("");
    setIdea("");
    setCategory("");
    setTargetPlatform("");
    setDuration("");
    setLanguage("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-500">
          + Add Story
        </Button>
      </DialogTrigger>

      <DialogContent className="border-zinc-800 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle>Add New Story</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Story title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-zinc-800 bg-zinc-900 text-white"
          />

          <textarea
            placeholder="Story idea... e.g. Oren helps a lost duck find its family."
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            className="min-h-28 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500"
          />

          <Input
            placeholder="Category... e.g. Adventure, Comedy, Education"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border-zinc-800 bg-zinc-900 text-white"
          />

          <Input
            placeholder="Target platform... e.g. YouTube Shorts, TikTok"
            value={targetPlatform}
            onChange={(e) => setTargetPlatform(e.target.value)}
            className="border-zinc-800 bg-zinc-900 text-white"
          />

          <Input
            placeholder="Duration... e.g. 30-45 seconds"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="border-zinc-800 bg-zinc-900 text-white"
          />

          <Input
            placeholder="Language... e.g. Indonesian"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border-zinc-800 bg-zinc-900 text-white"
          />

          <Button
            onClick={handleCreate}
            className="w-full bg-blue-600 text-white hover:bg-blue-500"
          >
            Save Story
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}