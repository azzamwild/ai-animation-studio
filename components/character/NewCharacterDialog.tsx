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

type NewCharacterDialogProps = {
  onCreate: (data: {
    name: string;
    role: string;
    description: string;
    imageUrl?: string;
  }) => void;
};

export default function NewCharacterDialog({
  onCreate,
}: NewCharacterDialogProps) {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  function handleCreate() {
    if (!name.trim()) return;

    onCreate({
      name: name.trim(),
      role: role.trim() || "Main Character",
      description: description.trim(),
      imageUrl: imageUrl.trim() || undefined,
    });

    setName("");
    setRole("");
    setDescription("");
    setImageUrl("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-500">
          + Add Character
        </Button>
      </DialogTrigger>

      <DialogContent className="border-zinc-800 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle>Add New Character</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Character name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-zinc-800 bg-zinc-900 text-white"
          />

          <Input
            placeholder="Role... e.g. Main Character"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border-zinc-800 bg-zinc-900 text-white"
          />

          <textarea
            placeholder="Character description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
            Save Character
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}