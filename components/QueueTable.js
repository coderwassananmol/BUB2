import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import Backdrop from "@material-ui/core/Backdrop";
import ShowJobInformation from "../components/ShowJobInformation";

const ShowUploadQueue = (props) => {
  const useStyles = makeStyles((theme) => ({
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
      fontSize: "12px",
      fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
      color: "#54595d",
    },
    selectIcon: {
      top: "calc(50% - 8px)",
    },
  }));

  const router = useRouter();
  const classes = useStyles();
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
        <a className={classes.id} onClick={() => onClick(value)}>
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
        <a className={classes.id} onClick={() => onClick(value)}>
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
    } else {
      return value;
    }
  };

  useEffect(() => {
    setPage(0);
  }, [props.isSearch]);

  return (
    <div>
      <Paper className={classes.root}>
        <TableContainer className={classes.container}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{
                      minWidth: column.minWidth,
                    }}
                    className={classes.head}
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
                    <TableRow
                      className={classes.row}
                      tabIndex={-1}
                      key={row.code}
                    >
                      {columns.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell
                            key={column.id}
                            className={classes.body}
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
          classes={{
            toolbar: classes.toolbar,
            caption: classes.toolbar,
            menuItem: classes.toolbar,
            selectIcon: classes.selectIcon,
          }}
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
      <Backdrop className={classes.backdrop} open={open} onClick={handleClose}>
        {open ? (
          <ShowJobInformation queue_name={props.queue_name} job_id={jobId} />
        ) : null}
      </Backdrop>
    </div>
  );
};

export default ShowUploadQueue;
