import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Add, OpenInNew, Refresh } from "@mui/icons-material";
import type { AppState, DeveloperProduct } from "../types";
import {
  listDeveloperProducts,
  createDeveloperProduct,
  updateDeveloperProduct,
} from "../api/roblox";
import ItemCard from "../components/ItemCard";
import EditDialog from "../components/EditDialog";
import BulkCreateDialog from "../components/BulkCreateDialog";

interface Props {
  appState: AppState;
}

export default function DeveloperProducts({ appState }: Props) {
  const { apiKey, universeId } = appState;

  const [products, setProducts] = useState<DeveloperProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editTarget, setEditTarget] = useState<DeveloperProduct | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listDeveloperProducts(apiKey, universeId);
      setProducts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load developer products.");
    } finally {
      setLoading(false);
    }
  }, [apiKey, universeId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleEditSave = async (data: {
    name: string;
    description: string;
    price: number;
    isForSale: boolean;
    isRegionalPricingEnabled: boolean;
    imageFile: File | null;
  }) => {
    if (!editTarget) return;
    await updateDeveloperProduct(apiKey, universeId, editTarget.id, {
      name: data.name,
      price: data.price,
      isForSale: data.isForSale,
      isRegionalPricingEnabled: data.isRegionalPricingEnabled,
      imageFile: data.imageFile,
    });
    await fetchProducts();
  };

  const handleBulkCreate = async (item: {
    name: string;
    description: string;
    price: number;
    isRegionalPricingEnabled: boolean;
    imageFile: File | null;
  }) => {
    return await createDeveloperProduct(apiKey, universeId, item);
  };

  const dashboardUrl = `https://create.roblox.com/dashboard/creations/experiences/${universeId}/monetization/developer-products`;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
        <Typography variant="h4" sx={{ flex: 1, color: "text.primary" }}>
          Developer Products
        </Typography>
        <Button
          startIcon={<Refresh />}
          onClick={fetchProducts}
          disabled={loading}
          size="small"
        >
          Refresh
        </Button>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setBulkOpen(true)}
          size="small"
        >
          Bulk Create
        </Button>
        <Button
          variant="outlined"
          startIcon={<OpenInNew />}
          href={dashboardUrl}
          target="_blank"
          rel="noopener"
          size="small"
        >
          Manage on Roblox
        </Button>
      </Box>
      <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
        Deletion is only available via the Roblox Creator Dashboard.
      </Typography>

      {loading && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <CircularProgress sx={{ color: "primary.light" }} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && products.length === 0 && (
        <Alert severity="info">
          No developer products found for this universe. Use "Bulk Create" to add some.
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {products.map((dp) => (
          <ItemCard
            key={dp.id}
            name={dp.name}
            price={dp.price}
            isForSale={dp.isForSale}
            iconUrl={dp.iconUrl}
            onEdit={() => setEditTarget(dp)}
          />
        ))}
      </Box>

      {editTarget && (
        <EditDialog
          open
          onClose={() => setEditTarget(null)}
          onSave={handleEditSave}
          title={`Edit Product: ${editTarget.name}`}
          showDescription={false}
          initial={{
            name: editTarget.name,
            description: "",
            price: editTarget.price,
            isForSale: editTarget.isForSale,
            isRegionalPricingEnabled: editTarget.isRegionalPricingEnabled,
          }}
        />
      )}

      <BulkCreateDialog
        open={bulkOpen}
        onClose={() => {
          setBulkOpen(false);
          fetchProducts();
        }}
        onCreate={handleBulkCreate}
        title="Bulk Create Developer Products"
        showDescription={false}
      />
    </Box>
  );
}
