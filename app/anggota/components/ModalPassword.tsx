"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy } from "lucide-react";

interface ModalPasswordProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  password: string;
}

export default function ModalPassword({
  open,
  onOpenChange,
  email,
  password,
}: ModalPasswordProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="w-5 h-5" />
            Password Berhasil Digenerate!
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-slate-600 mb-4">
            Berikut adalah password untuk login. Catat dan berikan ke anggota!
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-xs text-yellow-700 mb-1">Email:</p>
            <p className="font-medium text-sm break-all">{email}</p>

            <p className="text-xs text-yellow-700 mt-3 mb-1">Password:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white px-3 py-2 rounded border font-mono text-sm">
                {password}
              </code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="gap-1"
              >
                <Copy className="w-3 h-3" />
                {copied ? "Tersalin!" : "Salin"}
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-700">
              ⚠️ Password ini hanya muncul sekali! Simpan sebelum menutup modal.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
