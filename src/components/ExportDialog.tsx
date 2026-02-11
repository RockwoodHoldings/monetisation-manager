import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useToast } from "@/components/ToastProvider";
import { Copy } from "lucide-react";

interface ExportItem {
  name: string;
  id: string;
  price: number;
  isForSale: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  items: ExportItem[];
  title: string;
}

export default function ExportDialog({ open, onClose, items, title }: Props) {
  const [includeOffsale, setIncludeOffsale] = useState(false);
  const { showToast } = useToast();

  const filtered = includeOffsale ? items : items.filter((r) => r.isForSale);

  const handleCopy = async () => {
    const nameW = Math.max(4, ...filtered.map((r) => r.name.length));
    const idW = Math.max(2, ...filtered.map((r) => r.id.length));
    const priceW = Math.max(5, ...filtered.map((r) => `R$ ${r.price.toLocaleString()}`.length));
    const pad = (s: string, w: number) => s + " ".repeat(Math.max(0, w - s.length));
    const header = `${pad("Name", nameW)}  ${pad("ID", idW)}  ${pad("Price", priceW)}`;
    const divider = `${"-".repeat(nameW)}  ${"-".repeat(idW)}  ${"-".repeat(priceW)}`;
    const lines = filtered.map(
      (r) => `${pad(r.name, nameW)}  ${pad(r.id, idW)}  R$ ${r.price.toLocaleString()}`
    );
    const text = [header, divider, ...lines].join("\n");
    await navigator.clipboard.writeText(text);
    showToast("Copied to clipboard");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          <div className="flex items-center gap-4 mb-3">
            <span className="text-sm text-muted-foreground">
              {filtered.length} item{filtered.length !== 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-2">
              <Switch
                id="include-offsale"
                checked={includeOffsale}
                onCheckedChange={setIncludeOffsale}
              />
              <Label htmlFor="include-offsale" className="text-sm text-muted-foreground">
                Include off-sale
              </Label>
            </div>
            {filtered.length > 0 && (
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r, i) => (
                <TableRow key={i}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell className="font-mono text-xs">{r.id}</TableCell>
                  <TableCell className="text-right">R$ {r.price.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
