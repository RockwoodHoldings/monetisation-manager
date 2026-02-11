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
import type { AppState, GamePass } from "../types";
import { listGamePasses, createGamePass, updateGamePass } from "../api/roblox";
import ItemCard from "../components/ItemCard";
import EditDialog from "../components/EditDialog";
import BulkCreateDialog from "../components/BulkCreateDialog";
import ExportDialog from "../components/ExportDialog";

interface Props {
  appState: AppState;
}

export default function Gamepasses({ appState }: Props) {
  const { apiKey, universeId } = appState;

  const [passes, setPasses] = useState<GamePass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editTarget, setEditTarget] = useState<GamePass | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [sortPrice, setSortPrice] = useState<"asc" | "desc" | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const fetchPasses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listGamePasses(apiKey, universeId);
      setPasses(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load gamepasses.");
    } finally {
      setLoading(false);
    }
  }, [apiKey, universeId]);

  useEffect(() => {
    fetchPasses();
  }, [fetchPasses]);

  const sorted = useMemo(() => {
    if (!sortPrice) return passes;
    return [...passes].sort((a, b) =>
      sortPrice === "desc" ? b.price - a.price : a.price - b.price
    );
  }, [passes, sortPrice]);

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
    await updateGamePass(apiKey, universeId, editTarget.id, {
      name: data.name,
      description: data.description,
      price: data.price,
      isForSale: data.isForSale,
      isRegionalPricingEnabled: data.isRegionalPricingEnabled,
      imageFile: data.imageFile,
    });
    await fetchPasses();
  };

  const handleBulkCreate = async (item: {
    name: string;
    description: string;
    price: number;
    isRegionalPricingEnabled: boolean;
    imageFile: File | null;
  }) => {
    return await createGamePass(apiKey, universeId, item);
  };

  const dashboardUrl = `https://create.roblox.com/dashboard/creations/experiences/${universeId}/monetization/passes`;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
        <Typography variant="h4" sx={{ flex: 1, color: "text.primary" }}>
          Gamepasses
        </Typography>
        <Button
          startIcon={<Refresh />}
          onClick={fetchPasses}
          disabled={loading}
          size="small"
        >
          Refresh
        </Button>
        <Button
          startIcon={<ContentCopy />}
          onClick={() => setExportOpen(true)}
          disabled={loading || passes.length === 0}
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
      {!loading && passes.length > 0 && (
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

      {!loading && !error && passes.length === 0 && (
        <Alert severity="info">
          No gamepasses found for this universe. Use "Bulk Create" to add some.
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
        {paged.map((gp) => (
          <ItemCard
            key={gp.id}
            name={gp.name}
            description={gp.description}
            price={gp.price}
            isForSale={gp.isForSale}
            iconUrl={gp.iconUrl}
            onEdit={() => setEditTarget(gp)}
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
          title={`Edit Gamepass: ${editTarget.name}`}
          showDescription
          initial={{
            name: editTarget.name,
            description: editTarget.description,
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
          fetchPasses();
        }}
        onCreate={handleBulkCreate}
        title="Bulk Create Gamepasses"
        showDescription
      />

      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        items={passes.map((gp) => ({ name: gp.name, id: gp.id, price: gp.price, isForSale: gp.isForSale }))}
        title="All Gamepasses"
      />
    </Box>
  );
}
