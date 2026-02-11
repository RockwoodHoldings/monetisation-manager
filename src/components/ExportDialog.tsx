import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { ContentCopy } from "@mui/icons-material";

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
  const [copied, setCopied] = useState(false);
  const [includeOffsale, setIncludeOffsale] = useState(false);

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
    setCopied(true);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {filtered.length} item{filtered.length !== 1 ? "s" : ""}
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={includeOffsale}
                  onChange={(e) => setIncludeOffsale(e.target.checked)}
                />
              }
              label="Include off-sale"
            />
            {filtered.length > 0 && (
              <Button
                size="small"
                startIcon={<ContentCopy />}
                onClick={handleCopy}
              >
                Copy to Clipboard
              </Button>
            )}
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell align="right">Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell
                      sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
                    >
                      {r.id}
                    </TableCell>
                    <TableCell align="right">
                      R$ {r.price.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="Copied to clipboard"
      />
    </Dialog>
  );
}
