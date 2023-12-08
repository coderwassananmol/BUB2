import { Box } from "@mui/material";

export default function BooksWrapper({ isCommonsMetadataReady, children }) {
  return (
    <Box
      sx={{
        width: `${isCommonsMetadataReady ? "80vw" : "auto"}`,
        height: "80vh",
        display: "flex",
        flexDirection: "row",
        "@media (max-width: 600px)": {
          width: "100%",
          height: "auto",
          flexDirection: "column",
        },
      }}
    >
      {children}
    </Box>
  );
}
