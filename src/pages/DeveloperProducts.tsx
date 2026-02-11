import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Plus,
  ExternalLink,
  RefreshCw,
  Copy,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
  Search,
  Loader2,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
import { useToast } from "../components/ToastProvider";

interface Props {
  appState: AppState;
}

export default function DeveloperProducts({ appState }: Props) {
  const { apiKey, universeId } = appState;
  const { showToast } = useToast();

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
  const [search, setSearch] = useState("");
  const [hideOffsale, setHideOffsale] = useState(false);

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

  const filtered = useMemo(() => {
    let result = products;
    if (hideOffsale) result = result.filter((dp) => dp.isForSale);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((dp) => dp.name.toLowerCase().includes(q));
    }
    return result;
  }, [products, search, hideOffsale]);

  const sorted = useMemo(() => {
    if (!sortPrice) return filtered;
    return [...filtered].sort((a, b) =>
      sortPrice === "desc" ? b.price - a.price : a.price - b.price
    );
  }, [filtered, sortPrice]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const paged = sorted.slice(safePage * pageSize, (safePage + 1) * pageSize);

  useEffect(() => { setPage(0); }, [sortPrice, pageSize, search, hideOffsale]);

  const handleEditSave = async (data: {
    name: string;
    description: string;
    price: number;
    isForSale: boolean;
    isRegionalPricingEnabled: boolean;
    imageFile: File | null;
  }) => {
    if (!editTarget) return;
    try {
      await updateDeveloperProduct(apiKey, universeId, editTarget.id, {
        name: data.name,
        price: data.price,
        isForSale: data.isForSale,
        isRegionalPricingEnabled: data.isRegionalPricingEnabled,
        imageFile: data.imageFile,
      });
      showToast("Product updated successfully");
      await fetchProducts();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to update product", "error");
      throw e;
    }
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
    <div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
        <h2 className="text-2xl font-bold text-foreground flex-1 min-w-0">Developer Products</h2>
        <Button variant="ghost" size="sm" onClick={fetchProducts} disabled={loading}>
          <RefreshCw className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setExportOpen(true)} disabled={loading || products.length === 0}>
          <Copy className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Copy All</span>
        </Button>
        <Button size="sm" onClick={() => setBulkOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Bulk Create
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href={dashboardUrl} target="_blank" rel="noopener">
            <ExternalLink className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Manage on Roblox</span>
          </a>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Deletion is only available via the Roblox Creator Dashboard.
      </p>

      {/* Controls bar */}
      {!loading && products.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
          <div className="relative w-full sm:w-auto sm:min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Button
            variant={sortPrice ? "default" : "outline"}
            size="sm"
            onClick={() =>
              setSortPrice((prev) =>
                prev === null ? "desc" : prev === "desc" ? "asc" : null
              )
            }
            className="min-w-[120px]"
          >
            {sortPrice === "asc" ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
            {sortPrice === "desc"
              ? "High → Low"
              : sortPrice === "asc"
                ? "Low → High"
                : "Price"}
          </Button>

          <Button
            variant={hideOffsale ? "default" : "outline"}
            size="sm"
            onClick={() => setHideOffsale((v) => !v)}
          >
            <EyeOff className="h-4 w-4 mr-1" />
            {hideOffsale ? "Offsale Hidden" : "Hide Offsale"}
          </Button>

          <div className="flex-1" />

          <span className="hidden sm:inline text-sm text-muted-foreground">Per page:</span>
          <ToggleGroup className="hidden sm:flex" type="single" value={String(pageSize)} onValueChange={(v) => v && setPageSize(Number(v))}>
            <ToggleGroupItem value="10">10</ToggleGroupItem>
            <ToggleGroupItem value="20">20</ToggleGroupItem>
            <ToggleGroupItem value="50">50</ToggleGroupItem>
          </ToggleGroup>

          <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as "list" | "grid")}>
            <ToggleGroupItem value="list"><List className="h-4 w-4" /></ToggleGroupItem>
            <ToggleGroupItem value="grid"><LayoutGrid className="h-4 w-4" /></ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}

      {loading && (
        <div className="text-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        </div>
      )}

      {error && <Alert variant="destructive" className="mb-4">{error}</Alert>}

      {!loading && !error && products.length === 0 && (
        <Alert variant="info">
          No developer products found for this universe. Use "Bulk Create" to add some.
        </Alert>
      )}

      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3"
            : "flex flex-col gap-3"
        }
      >
        {paged.map((dp, i) => (
          <ItemCard
            key={dp.id}
            name={dp.name}
            price={dp.price}
            isForSale={dp.isForSale}
            iconUrl={dp.iconUrl}
            onEdit={() => setEditTarget(dp)}
            view={viewMode}
            index={i}
          />
        ))}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            disabled={safePage === 0}
            onClick={() => setPage(safePage - 1)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-50 cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-muted-foreground min-w-[80px] text-center">
            Page {safePage + 1} of {totalPages}
          </span>
          <button
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage(safePage + 1)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-50 cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
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
        onClose={(created) => {
          setBulkOpen(false);
          if (created) showToast("Developer products created successfully");
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
    </div>
  );
}
