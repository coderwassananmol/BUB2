import { Box } from "@mui/material";

export default function BooksWrapper({ isCommonsMetadataReady, children }) {
  return (
    <Box
      sx={{
        width: `${isCommonsMetadataReady ? "100vw" : "auto"}`,
        height: "80vh",
        display: "flex",
        paddingX: `${isCommonsMetadataReady ? "50px" : "120px"}`,
        flexDirection: "row",
        "@media (max-width: 600px)": {
          width: "100%",
          height: "auto",
          flexDirection: "column",
          paddingX: "0px",
        },
      }}
    >
      {children}
    </Box>
  );
}
