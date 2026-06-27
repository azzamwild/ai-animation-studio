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

type NewBackgroundDialogProps = {
  onCreate: (data: {
    name: string;
    locationType: string;
    description: string;
    prompt: string;
    imageUrl?: string;
  }) => void;
};

export default function NewBackgroundDialog({
  onCreate,
}: NewBackgroundDialogProps) {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [locationType, setLocationType] = useState("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  function handleCreate() {
    if (!name.trim()) return;

    onCreate({
      name: name.trim(),
      locationType: locationType.trim() || "General Location",
      description: description.trim(),
      prompt: prompt.trim(),
      imageUrl: imageUrl.trim() || undefined,
    });

    setName("");
    setLocationType("");
    setDescription("");
    setPrompt("");
    setImageUrl("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-500">
          + Add Background
        </Button>
      </DialogTrigger>

      <DialogContent className="border-zinc-800 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle>Add New Background</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Background name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-zinc-800 bg-zinc-900 text-white"
          />

          <Input
            placeholder="Location type... e.g. Forest, Bedroom, City"
            value={locationType}
            onChange={(e) => setLocationType(e.target.value)}
            className="border-zinc-800 bg-zinc-900 text-white"
          />

          <textarea
            placeholder="Background description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-24 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500"
          />

          <textarea
            placeholder="Image generation prompt..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-28 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500"
          />

          <Input
            placeholder="Image URL optional..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="border-zinc-800 bg-zinc-900 text-white"
          />

          <Button
            onClick={handleCreate}
            className="w-full bg-blue-600 text-white hover:bg-blue-500"
          >
            Save Background
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}