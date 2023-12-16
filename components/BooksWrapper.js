import { Box } from "@mui/material";

export default function BooksWrapper({ isCommonsMetadataReady, children }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "540px !important",
        "@media (max-width: 600px)": {
          width: "100% !important",
        },
      }}
    >
      {children}
    </Box>
  );
}
