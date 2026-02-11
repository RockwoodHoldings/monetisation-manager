import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert } from "@/components/ui/alert";
import { Upload, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    description: string;
    price: number;
    isForSale: boolean;
    isRegionalPricingEnabled: boolean;
    imageFile: File | null;
  }) => Promise<void>;
  title: string;
  showDescription: boolean;
  initial: {
    name: string;
    description: string;
    price: number;
    isForSale: boolean;
    isRegionalPricingEnabled: boolean;
  };
}

export default function EditDialog({
  open,
  onClose,
  onSave,
  title,
  showDescription,
  initial,
}: Props) {
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [price, setPrice] = useState(String(initial.price));
  const [isForSale, setIsForSale] = useState(initial.isForSale);
  const [isRegionalPricingEnabled, setIsRegionalPricingEnabled] = useState(
    initial.isRegionalPricingEnabled
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError("Price must be a valid positive number.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        price: priceNum,
        isForSale,
        isRegionalPricingEnabled,
        imageFile,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          {showDescription && (
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="flex w-full rounded-[10px] border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:border-primary/40 transition-colors resize-none"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>Price (Robux)</Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>For Sale</Label>
            <Switch checked={isForSale} onCheckedChange={setIsForSale} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Regional Pricing</Label>
            <Switch
              checked={isRegionalPricingEnabled}
              onCheckedChange={setIsRegionalPricingEnabled}
            />
          </div>
          <Button variant="outline" className="relative" asChild>
            <label className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              {imageFile ? imageFile.name : "Upload Icon"}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </Button>
          {error && <Alert variant="destructive">{error}</Alert>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
