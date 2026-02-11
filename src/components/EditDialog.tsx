import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";

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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
        {showDescription && (
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />
        )}
        <TextField
          label="Price (Robux)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="number"
          fullWidth
        />
        <FormControlLabel
          control={
            <Switch checked={isForSale} onChange={(e) => setIsForSale(e.target.checked)} />
          }
          label="For Sale"
        />
        <FormControlLabel
          control={
            <Switch
              checked={isRegionalPricingEnabled}
              onChange={(e) => setIsRegionalPricingEnabled(e.target.checked)}
            />
          }
          label="Regional Pricing"
        />
        <Button
          variant="outlined"
          component="label"
          startIcon={<CloudUpload />}
        >
          {imageFile ? imageFile.name : "Upload Icon"}
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
        </Button>
        {error && <Alert severity="error">{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}>
          {saving ? <CircularProgress size={20} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
