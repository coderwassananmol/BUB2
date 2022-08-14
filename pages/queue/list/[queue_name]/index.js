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
import ShowJobInformation from "./ShowJobInformation";
import Link from "next/link";
import Header from "../../../../components/Header";

const ShowUploadQueue = (props) => {
  const useStyles = makeStyles((theme) => ({
    backdrop: {
      zIndex: 5,
      color: "#fff",
    },
    head: {
      backgroundColor: "#0095ff",
      color: theme.palette.common.white,
      fontSize: "16px",
      fontFamily: "Open Sans",
    },
    body: {
      fontSize: "14px",
      fontFamily: "Montserrat",
    },
    root: {
      marginTop: "20px",
      width: "100%",
      zIndex: 0,
    },
    row: {
      "&:nth-of-type(odd)": {
        backgroundColor: "rgb(212 222 226 / 0.4)",
      },
      "&:nth-of-type(even)": {
        backgroundColor: "rgb(193 207 218 / 0.6)",
      },
    },
    container: {
      maxHeight: 440,
    },
    id: {
      cursor: "pointer",
      color: "#0095ff",
    },
    toolbar: {
      fontSize: "12px",
      fontFamily: "Open Sans",
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
    router.push(
      `?job_id=${id}`,
      `/queue/list/${props.queue_name}?job_id=${id}`,
      { shallow: true }
    );
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
    { id: "status", label: "Status", minWidth: 30, align: "left" },
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
  const [rows, setRows] = useState([]);

  const handleClose = (e) => {
    setOpen(false);
    router.push(``, `/queue/list/${props.queue_name}`, { shallow: true });
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
    } else {
      return value;
    }
  };

  useEffect(() => {
    // The job id changed!
    if (router.query.job_id) {
      setJobId(router.query.job_id);
      setOpen(true);
    }
  }, [router.query.job_id]);

  useEffect(() => {
    if (props.queue_name)
      fetch(`http://localhost:5000/allJobs?queue_name=${props.queue_name}`)
        .then((resp) => resp.json())
        .then((resp) => {
          setRows(resp);
        });
  }, [props.queue_name]);

  return (
    <div>
      <Header page="queue" />
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
                      style={{ minWidth: column.minWidth }}
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
        <Backdrop
          className={classes.backdrop}
          open={open}
          onClick={handleClose}
        >
          <ShowJobInformation queue_name={props.queue_name} job_id={jobId} />
        </Backdrop>
      </div>
    </div>
  );
};

// This function gets called at build time
export async function getStaticProps({ params }) {
  // Call an external API endpoint to get posts
  return {
    props: params,
  };
}

export async function getStaticPaths() {
  return {
    paths: [
      { params: { queue_name: "gb" } }, // See the "paths" section below
    ],
    fallback: true, // See the "fallback" section below
  };
}

export default ShowUploadQueue;
