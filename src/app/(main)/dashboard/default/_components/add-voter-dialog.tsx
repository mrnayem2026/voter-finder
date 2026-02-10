"use client";

import * as React from "react";

import { BadgePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { AddVoterForm } from "./add-voter-form";

interface AddVoterDialogProps {
  onSuccess: () => void;
}

export function AddVoterDialog({ onSuccess }: AddVoterDialogProps) {
  const [open, setOpen] = React.useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="cursor-pointer">
          <BadgePlus className="mr-2 h-4 w-4" />
          <span>Add Voter</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Voter</DialogTitle>
          <DialogDescription>Enter the voter's details below to create a new record.</DialogDescription>
        </DialogHeader>
        <AddVoterForm onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
