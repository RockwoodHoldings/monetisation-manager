import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
} from "@mui/material";
import {
  Add,
  OpenInNew,
  Refresh,
  ContentCopy,
  ArrowUpward,
  ArrowDownward,
  ChevronLeft,
  ChevronRight,
  ViewList,
  GridView,
} from "@mui/icons-material";
import type { AppState, DeveloperProduct } from "../types";
import {
  listDeveloperProducts,
  createDeveloperProduct,
  updateDeveloperProduct,
} from "../api/roblox";
import ItemCard from "../components/ItemCard";
import EditDialog from "../components/EditDialog";
import BulkCreateDialog from "../components/BulkCreateDialog";
import ExportDialog from "../components/ExportDialog";

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
  const [exportOpen, setExportOpen] = useState(false);

  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [sortPrice, setSortPrice] = useState<"asc" | "desc" | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

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

  const sorted = useMemo(() => {
    if (!sortPrice) return products;
    return [...products].sort((a, b) =>
      sortPrice === "desc" ? b.price - a.price : a.price - b.price
    );
  }, [products, sortPrice]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const paged = sorted.slice(safePage * pageSize, (safePage + 1) * pageSize);

  // Reset page when sort or pageSize changes
  useEffect(() => { setPage(0); }, [sortPrice, pageSize]);

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
          startIcon={<ContentCopy />}
          onClick={() => setExportOpen(true)}
          disabled={loading || products.length === 0}
          size="small"
        >
          Copy All
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
      <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
        Deletion is only available via the Roblox Creator Dashboard.
      </Typography>

      {/* Controls bar */}
      {!loading && products.length > 0 && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Button
            size="small"
            variant={sortPrice ? "contained" : "outlined"}
            startIcon={sortPrice === "asc" ? <ArrowUpward /> : <ArrowDownward />}
            onClick={() =>
              setSortPrice((prev) =>
                prev === null ? "desc" : prev === "desc" ? "asc" : null
              )
            }
            sx={{ minWidth: 120 }}
          >
            {sortPrice === "desc"
              ? "High → Low"
              : sortPrice === "asc"
                ? "Low → High"
                : "Price"}
          </Button>

          <Box sx={{ flex: 1 }} />

          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Per page:
          </Typography>
          <ToggleButtonGroup
            size="small"
            value={pageSize}
            exclusive
            onChange={(_, v) => v !== null && setPageSize(v)}
          >
            <ToggleButton value={10}>10</ToggleButton>
            <ToggleButton value={20}>20</ToggleButton>
            <ToggleButton value={50}>50</ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup
            size="small"
            value={viewMode}
            exclusive
            onChange={(_, v) => v !== null && setViewMode(v)}
          >
            <ToggleButton value="list"><ViewList fontSize="small" /></ToggleButton>
            <ToggleButton value="grid"><GridView fontSize="small" /></ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}

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

      <Box
        sx={
          viewMode === "grid"
            ? {
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: 2,
              }
            : { display: "flex", flexDirection: "column", gap: 1.5 }
        }
      >
        {paged.map((dp) => (
          <ItemCard
            key={dp.id}
            name={dp.name}
            price={dp.price}
            isForSale={dp.isForSale}
            iconUrl={dp.iconUrl}
            onEdit={() => setEditTarget(dp)}
            view={viewMode}
          />
        ))}
      </Box>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            mt: 3,
          }}
        >
          <IconButton
            size="small"
            disabled={safePage === 0}
            onClick={() => setPage(safePage - 1)}
          >
            <ChevronLeft />
          </IconButton>
          <Typography variant="body2" sx={{ color: "text.secondary", minWidth: 80, textAlign: "center" }}>
            Page {safePage + 1} of {totalPages}
          </Typography>
          <IconButton
            size="small"
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage(safePage + 1)}
          >
            <ChevronRight />
          </IconButton>
        </Box>
      )}

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

      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        items={products.map((dp) => ({ name: dp.name, id: dp.id, price: dp.price, isForSale: dp.isForSale }))}
        title="All Developer Products"
      />
    </Box>
  );
}
