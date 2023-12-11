import { Backdrop, CircularProgress } from "@mui/material";

export default function Loading({ isLoading }) {
  return (
    <Backdrop sx={{ color: "#fff", zIndex: 9999 }} open={isLoading}>
      <CircularProgress size={50} color="inherit" />
    </Backdrop>
  );
}
