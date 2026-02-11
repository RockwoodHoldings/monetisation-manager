import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  IconButton,
} from "@mui/material";
import { Edit } from "@mui/icons-material";

interface Props {
  name: string;
  description?: string;
  price: number;
  isForSale: boolean;
  iconUrl?: string;
  onEdit: () => void;
}

export default function ItemCard({
  name,
  description,
  price,
  isForSale,
  iconUrl,
  onEdit,
}: Props) {
  return (
    <Card
      sx={{
        display: "flex",
        alignItems: "center",
        bgcolor: "rgba(26, 26, 20, 0.8)",
      }}
    >
      {iconUrl ? (
        <CardMedia
          component="img"
          sx={{
            width: 72,
            height: 72,
            objectFit: "cover",
            m: 1.5,
            borderRadius: 2,
          }}
          image={iconUrl}
          alt={name}
        />
      ) : (
        <Box
          sx={{
            width: 72,
            height: 72,
            m: 1.5,
            borderRadius: 2,
            bgcolor: "rgba(212, 168, 67, 0.08)",
            border: "1px solid rgba(212, 168, 67, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.65rem" }}>
            No icon
          </Typography>
        </Box>
      )}
      <CardContent sx={{ flex: 1, py: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ color: "text.primary" }}>
            {name}
          </Typography>
          <Chip
            label={isForSale ? "On Sale" : "Off Sale"}
            size="small"
            color={isForSale ? "success" : "default"}
            variant={isForSale ? "filled" : "outlined"}
            sx={{ fontSize: "0.7rem", height: 24 }}
          />
        </Box>
        {description && (
          <Typography variant="body2" noWrap sx={{ color: "text.secondary" }}>
            {description}
          </Typography>
        )}
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{
            mt: 0.5,
            color: "primary.light",
          }}
        >
          R$ {price.toLocaleString()}
        </Typography>
      </CardContent>
      <IconButton
        onClick={onEdit}
        sx={{
          mr: 2,
          color: "text.secondary",
          "&:hover": {
            color: "primary.light",
            bgcolor: "rgba(212, 168, 67, 0.1)",
          },
        }}
      >
        <Edit />
      </IconButton>
    </Card>
  );
}
