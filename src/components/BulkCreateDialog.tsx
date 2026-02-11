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
import { Progress } from "@/components/ui/progress";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useToast } from "@/components/ToastProvider";
import { Plus, Trash2, Upload, Copy } from "lucide-react";
import type { BulkCreateItem, CreateResult } from "../types";

interface Props {
  open: boolean;
  onClose: (created?: boolean) => void;
  onCreate: (item: BulkCreateItem) => Promise<{ id: string; name: string; price: number }>;
  title: string;
  showDescription: boolean;
}

function emptyRow(): BulkCreateItem {
  return { name: "", description: "", price: 0, isRegionalPricingEnabled: false, imageFile: null };
}

export default function BulkCreateDialog({
  open,
  onClose,
  onCreate,
  title,
  showDescription,
}: Props) {
  const [rows, setRows] = useState<BulkCreateItem[]>([emptyRow()]);
  const [creating, setCreating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [results, setResults] = useState<CreateResult[]>([]);
  const { showToast } = useToast();

  const updateRow = (i: number, patch: Partial<BulkCreateItem>) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const removeRow = (i: number) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleCreate = async () => {
    const valid = rows.filter((r) => r.name.trim());
    if (valid.length === 0) {
      setError("Add at least one item with a name.");
      return;
    }
    setError("");
    setCreating(true);
    setProgress(0);
    setResults([]);
    const collected: CreateResult[] = [];

    for (let i = 0; i < valid.length; i++) {
      try {
        const created = await onCreate(valid[i]);
        collected.push({
          name: created.name,
          id: created.id,
          price: created.price,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        collected.push({
          name: valid[i].name,
          id: "-",
          price: valid[i].price,
          error: msg,
        });
      }
      setProgress(((i + 1) / valid.length) * 100);
      setResults([...collected]);
      if (i < valid.length - 1) {
        await new Promise((r) => setTimeout(r, 350));
      }
    }

    setCreating(false);
  };

  const handleCopy = async () => {
    const successful = results.filter((r) => !r.error);
    const lines = successful.map(
      (r) => `${r.name}\t${r.id}\t${r.price}`
    );
    const text = `Name\tID\tPrice\n${lines.join("\n")}`;
    await navigator.clipboard.writeText(text);
    showToast("Copied to clipboard");
  };

  const handleClose = () => {
    if (creating) return;
    const hadSuccess = results.some((r) => !r.error);
    setRows([emptyRow()]);
    setProgress(0);
    setResults([]);
    setError("");
    onClose(hadSuccess);
  };

  const successCount = results.filter((r) => !r.error).length;
  const failCount = results.filter((r) => r.error).length;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {creating && (
          <div className="mb-4">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground mt-2">
              {Math.round(progress)}% complete
            </p>
          </div>
        )}

        {!creating && results.length > 0 && (
          <div className="mt-2">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm text-muted-foreground">
                {successCount} created{failCount > 0 ? `, ${failCount} failed` : ""}
              </span>
              {successCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy to Clipboard
                </Button>
              )}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  {failCount > 0 && <TableHead>Status</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r, i) => (
                  <TableRow
                    key={i}
                    className={r.error ? "bg-destructive/10" : undefined}
                  >
                    <TableCell>{r.name}</TableCell>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell className="text-right">R$ {r.price.toLocaleString()}</TableCell>
                    {failCount > 0 && (
                      <TableCell>
                        {r.error ? (
                          <span className="text-sm text-destructive">
                            {r.error.length > 60 ? r.error.slice(0, 60) + "..." : r.error}
                          </span>
                        ) : (
                          <span className="text-sm text-success">OK</span>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!creating && results.length === 0 && (
          <div className="flex flex-col gap-3 mt-2">
            {rows.map((row, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card/50 p-3"
              >
                <div className="flex gap-2 items-start flex-wrap">
                  <div className="flex-2 min-w-[150px]">
                    <Input
                      placeholder="Name"
                      value={row.name}
                      onChange={(e) => updateRow(i, { name: e.target.value })}
                    />
                  </div>
                  {showDescription && (
                    <div className="flex-2 min-w-[150px]">
                      <Input
                        placeholder="Description"
                        value={row.description}
                        onChange={(e) => updateRow(i, { description: e.target.value })}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-[100px]">
                    <Input
                      type="number"
                      placeholder="Price"
                      value={row.price}
                      onChange={(e) => updateRow(i, { price: Number(e.target.value) })}
                    />
                  </div>
                  <Button variant="outline" size="sm" className="h-10" asChild>
                    <label className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-1" />
                      {row.imageFile ? row.imageFile.name.slice(0, 12) : "Icon"}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) =>
                          updateRow(i, { imageFile: e.target.files?.[0] ?? null })
                        }
                      />
                    </label>
                  </Button>
                  <div className="flex items-center gap-2 h-10">
                    <Switch
                      checked={row.isRegionalPricingEnabled}
                      onCheckedChange={(v) => updateRow(i, { isRegionalPricingEnabled: v })}
                    />
                    <Label className="text-sm text-muted-foreground">Regional</Label>
                  </div>
                  <button
                    onClick={() => removeRow(i)}
                    disabled={rows.length <= 1}
                    className="h-10 w-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            <Button variant="ghost" onClick={addRow}>
              <Plus className="h-4 w-4 mr-1" />
              Add Another
            </Button>
          </div>
        )}

        {error && <Alert variant="destructive" className="mt-2">{error}</Alert>}

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose} disabled={creating}>
            {results.length > 0 ? "Done" : "Cancel"}
          </Button>
          {results.length === 0 && (
            <Button onClick={handleCreate} disabled={creating}>
              Create All ({rows.filter((r) => r.name.trim()).length})
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
