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

type NewProjectDialogProps = {
  onCreate: (title: string) => void;
};

export default function NewProjectDialog({ onCreate }: NewProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  function handleCreate() {
    if (!title.trim()) return;

    onCreate(title.trim());
    setTitle("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-500">
          + New Project
        </Button>
      </DialogTrigger>

      <DialogContent className="border-zinc-800 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Project name..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
            className="border-zinc-800 bg-zinc-900 text-white"
          />

          <Button
            onClick={handleCreate}
            className="w-full bg-blue-600 text-white hover:bg-blue-500"
          >
            Create Project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}