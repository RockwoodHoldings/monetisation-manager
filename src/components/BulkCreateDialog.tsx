import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  Typography,
  LinearProgress,
  Alert,
  Paper,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
} from "@mui/material";
import { Add, Delete, CloudUpload, ContentCopy } from "@mui/icons-material";
import type { BulkCreateItem, CreateResult } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
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
  const [copied, setCopied] = useState(false);

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
    setCopied(true);
  };

  const handleClose = () => {
    if (creating) return;
    setRows([emptyRow()]);
    setProgress(0);
    setResults([]);
    setError("");
    setCopied(false);
    onClose();
  };

  const successCount = results.filter((r) => !r.error).length;
  const failCount = results.filter((r) => r.error).length;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>
      <DialogContent>
        {creating && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
              {Math.round(progress)}% complete
            </Typography>
          </Box>
        )}

        {!creating && results.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {successCount} created{failCount > 0 ? `, ${failCount} failed` : ""}
              </Typography>
              {successCount > 0 && (
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
                    {failCount > 0 && <TableCell>Status</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((r, i) => (
                    <TableRow
                      key={i}
                      sx={r.error ? { bgcolor: "rgba(239, 68, 68, 0.1)" } : undefined}
                    >
                      <TableCell>{r.name}</TableCell>
                      <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{r.id}</TableCell>
                      <TableCell align="right">R$ {r.price.toLocaleString()}</TableCell>
                      {failCount > 0 && (
                        <TableCell>
                          {r.error ? (
                            <Typography variant="body2" color="error">
                              {r.error.length > 60 ? r.error.slice(0, 60) + "..." : r.error}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="success.main">
                              OK
                            </Typography>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {!creating && results.length === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {rows.map((row, i) => (
              <Paper
                key={i}
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: "rgba(26, 26, 20, 0.5)",
                }}
              >
                <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <TextField
                    label="Name"
                    size="small"
                    value={row.name}
                    onChange={(e) => updateRow(i, { name: e.target.value })}
                    sx={{ flex: 2, minWidth: 150 }}
                  />
                  {showDescription && (
                    <TextField
                      label="Description"
                      size="small"
                      value={row.description}
                      onChange={(e) => updateRow(i, { description: e.target.value })}
                      sx={{ flex: 2, minWidth: 150 }}
                    />
                  )}
                  <TextField
                    label="Price"
                    size="small"
                    type="number"
                    value={row.price}
                    onChange={(e) => updateRow(i, { price: Number(e.target.value) })}
                    sx={{ flex: 1, minWidth: 100 }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    component="label"
                    startIcon={<CloudUpload />}
                    sx={{ minWidth: 130, height: 40 }}
                  >
                    {row.imageFile ? row.imageFile.name.slice(0, 12) : "Icon"}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) =>
                        updateRow(i, { imageFile: e.target.files?.[0] ?? null })
                      }
                    />
                  </Button>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={row.isRegionalPricingEnabled}
                        onChange={(e) =>
                          updateRow(i, { isRegionalPricingEnabled: e.target.checked })
                        }
                      />
                    }
                    label="Regional"
                    sx={{ minWidth: 110 }}
                  />
                  <IconButton
                    onClick={() => removeRow(i)}
                    disabled={rows.length <= 1}
                    size="small"
                    sx={{
                      color: "text.secondary",
                      "&:hover": { color: "error.main" },
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </Paper>
            ))}
            <Button startIcon={<Add />} onClick={addRow}>
              Add Another
            </Button>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={handleClose} disabled={creating}>
          {results.length > 0 ? "Done" : "Cancel"}
        </Button>
        {results.length === 0 && (
          <Button onClick={handleCreate} variant="contained" disabled={creating}>
            Create All ({rows.filter((r) => r.name.trim()).length})
          </Button>
        )}
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
