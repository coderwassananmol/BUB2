import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Backdrop,
} from "@mui/material";
import { host } from "../utils/constants";
import ShowJobInformation from "../components/ShowJobInformation";

const ShowUploadQueue = (props) => {
  const styles = {
    backdrop: {
      zIndex: 5,
      color: "#fff",
    },
    head: {
      backgroundColor: "#f8f9fa",
      color: "#202122",
      fontSize: "14px",
      fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
    },
    body: {
      fontSize: "14px",
      fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
      color: "#54595d",
    },
    root: {
      marginTop: "20px",
      width: "100%",
      zIndex: 0,
    },
    row: {
      "&:nth-of-type(odd)": {
        backgroundColor: "#fff",
      },
      "&:nth-of-type(even)": {
        backgroundColor: "#f8f9fa",
      },
    },
    container: {
      maxHeight: 330,
    },
    id: {
      cursor: "pointer",
      color: "#36c",
    },
    toolbar: {
      marginTop: "8px",
      fontSize: "12px",
      fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
      color: "#54595d",
    },
    selectIcon: {
      fontSize: "12px",
      top: "calc(50% - 8px)",
    },
  };

  const router = useRouter();
  // const classes = useStyles();
  const [jobId, setJobId] = useState("");

  const onClick = (id) => {
    setJobId(id);
    setOpen(true);
  };

  const columns = [
    {
      id: "id",
      label: "Job ID",
      minWidth: 50,
      align: "left",
      format: (value) => (
        <a sx={styles.id} onClick={() => onClick(value)}>
          {value}
        </a>
      ),
    },
    {
      id: "title",
      label: "Title",
      minWidth: 300,
      align: "left",
      format: (value, label) => (
        <a sx={styles.id} onClick={() => onClick(value)}>
          {label}
        </a>
      ),
    },
    {
      id: "userName",
      label: "Wiki Username",
      minWidth: 150,
      align: "left",
      format: (value) =>
        value !== "-" ? (
          <a href={"https://meta.wikimedia.org/wiki/" + value} target="_blank">
            {value}
          </a>
        ) : (
          value
        ),
    },
    {
      id: "timestamp",
      label: "Timestamp",
      minWidth: 150,
      align: "left",
      format: (value) => value,
    },
    {
      id: "status",
      label: "Status",
      minWidth: 30,
      align: "left",
      format: (value) => {
        const isPDLMissingPage = /<a [^>]*>([^<]+)<\/a>/;
        const missingPageLink = isPDLMissingPage.exec(value);
        return missingPageLink ? (
          <span>
            Failed! (Reason: Upload to Internet Archive failed because {""}
            <a href={missingPageLink[1]} target="_blank">
              {missingPageLink[1]}
            </a>{" "}
            is not reachable. Please try again or contact Panjab Digital Library
            for more details. )
          </span>
        ) : (
          value
        );
      },
    },
    {
      id: "upload_progress",
      label: "Upload Progress",
      minWidth: 50,
      align: "left",
      format: (value) => value + "%",
    },
  ];

  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const rows = props.tableData ? props.tableData : [];

  const handleClose = (e) => {
    setOpen(false);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const conditionalRender = (column, value, row) => {
    if (column.id === "id" || column.id === "upload_progress") {
      return column.format(value);
    } else if (column.id === "title") {
      return column.format(row["id"], value);
    } else if (column.id === "userName") {
      return column.format((value === "-" ? "" : "User:") + value);
    } else if (column.id === "date") {
      return column.format(value);
    } else if (column.id === "status") {
      return column.format(value);
    } else {
      return value;
    }
  };

  useEffect(() => {
    setPage(0);
  }, [props.isSearch]);

  return (
    <div>
      <Paper sx={styles.root}>
        <TableContainer sx={styles.container}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    sx={{ minWidth: column.minWidth, ...styles.head }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  return (
                    <TableRow sx={styles.row} tabIndex={-1} key={row.code}>
                      {columns.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell
                            key={column.id}
                            sx={styles.body}
                            align={column.align}
                          >
                            {conditionalRender(column, value, row)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          SelectProps={styles.selectIcon}
          labelRowsPerPage={<div style={styles.toolbar}>Rows per page</div>}
          labelDisplayedRows={({ from, to, count }) => (
            <div style={styles.toolbar}>
              {`${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`}
            </div>
          )}
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <Backdrop sx={styles.backdrop} open={open} onClick={handleClose}>
        {open ? (
          <ShowJobInformation queue_name={props.queue_name} job_id={jobId} />
        ) : null}
      </Backdrop>
    </div>
  );
};

export default ShowUploadQueue;
