import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";

interface Props {
  name: string;
  description?: string;
  price: number;
  isForSale: boolean;
  iconUrl?: string;
  onEdit: () => void;
  view?: "list" | "grid";
}

export default function ItemCard({
  name,
  description,
  price,
  isForSale,
  iconUrl,
  onEdit,
  view = "list",
}: Props) {
  if (view === "grid") {
    return (
      <Card className="flex flex-col relative bg-card/80">
        {iconUrl ? (
          <img
            src={iconUrl}
            alt={name}
            className="w-full aspect-square object-cover rounded-t-xl"
          />
        ) : (
          <div className="w-full aspect-square bg-primary/8 border-b border-border flex items-center justify-center rounded-t-xl">
            <span className="text-xs text-muted-foreground">No icon</span>
          </div>
        )}
        <Badge
          variant={isForSale ? "success" : "outline"}
          className="absolute top-2 left-2 text-[0.65rem]"
        >
          {isForSale ? "On Sale" : "Off Sale"}
        </Badge>
        <div className="flex-1 p-3">
          <p className="text-sm font-semibold text-foreground truncate">{name}</p>
          <p className="text-sm font-semibold text-primary-light mt-1">
            R$ {price.toLocaleString()}
          </p>
        </div>
        <div className="px-3 pb-3">
          <button
            onClick={onEdit}
            className="w-full flex items-center justify-center h-8 rounded-md border border-primary/20 text-muted-foreground hover:text-primary-light hover:bg-primary/10 transition-colors cursor-pointer"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex items-center bg-card/80">
      {iconUrl ? (
        <img
          src={iconUrl}
          alt={name}
          className="w-[72px] h-[72px] object-cover m-3 rounded-lg"
        />
      ) : (
        <div className="w-[72px] h-[72px] m-3 rounded-lg bg-primary/8 border border-primary/15 flex items-center justify-center">
          <span className="text-[0.65rem] text-muted-foreground">No icon</span>
        </div>
      )}
      <div className="flex-1 py-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base font-semibold text-foreground">{name}</span>
          <Badge variant={isForSale ? "success" : "outline"} className="text-[0.7rem]">
            {isForSale ? "On Sale" : "Off Sale"}
          </Badge>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground truncate">{description}</p>
        )}
        <p className="text-sm font-semibold text-primary-light mt-1">
          R$ {price.toLocaleString()}
        </p>
      </div>
      <button
        onClick={onEdit}
        className="mr-4 p-2 rounded-lg text-muted-foreground hover:text-primary-light hover:bg-primary/10 transition-colors cursor-pointer"
      >
        <Pencil className="h-5 w-5" />
      </button>
    </Card>
  );
}
