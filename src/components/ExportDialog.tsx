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
} from "@mui/material";
import { ContentCopy } from "@mui/icons-material";

interface ExportItem {
  name: string;
  id: string;
  price: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  items: ExportItem[];
  title: string;
}

export default function ExportDialog({ open, onClose, items, title }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const lines = items.map((r) => `${r.name}\t${r.id}\t${r.price}`);
    const text = `Name\tID\tPrice\n${lines.join("\n")}`;
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
              {items.length} item{items.length !== 1 ? "s" : ""}
            </Typography>
            {items.length > 0 && (
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
                {items.map((r, i) => (
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
