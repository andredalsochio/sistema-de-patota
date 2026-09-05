import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { yellowStandardSecondary } from "../Constants";

export interface CardModelProps {
  patotaId: string;
  imageUrl: string;
  cardTitle: string;
  cardDescription: string;
  onDeleteFunction: (id: string) => void;
  onEditFunction: (id: string) => void;
}

const PatotaCardModel = ({
  patotaId,
  imageUrl,
  cardTitle,
  cardDescription,
  onDeleteFunction,
  onEditFunction,
}: CardModelProps) => {
  return (
    <Card
      sx={{
        maxWidth: 300,
        borderRadius: 2,
        boxShadow: 3,
        background: "#D6D4D2",
      }}
    >
      <CardMedia
        component="img"
        alt="green iguana"
        height="140"
        image={imageUrl}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {cardTitle}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {cardDescription}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          sx={{ color: "red" }}
          onClick={() => onDeleteFunction(patotaId)}
        >
          <DeleteOutlineIcon />
        </Button>
        <Button
          size="small"
          sx={{ color: yellowStandardSecondary }}
          onClick={() => onEditFunction(patotaId)}
        >
          <VisibilityIcon />
        </Button>
      </CardActions>
    </Card>
  );
};

export default PatotaCardModel;
