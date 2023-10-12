import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import _ from "lodash";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Link from "next/link";
import { CircularProgress } from "@material-ui/core";
import { host } from "../utils/constants";

const ShowJobInformation = (props) => {
  const useStyles = makeStyles({
    card: {
      maxWidth: 365,
      height: "80vh",
      margin: "10vh auto",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignContent: "center",
    },

    cardActionArea: {
      display: "flex",
      flexDirection: "column",
      overflowY: "scroll",
      flex: 1,
    },

    cardActions: {
      display: "flex",
      justifyContent: "space_between",
      padding: "15px",
    },

    cardButton: {
      fontSize: "11px",
      width: "48%",
    },

    cardImage: {
      objectFit: "cover",
    },
  });

  const router = useRouter();
  const classes = useStyles();

  const [data, setData] = useState({
    title: "",
    description: "",
    previewLink: "https://bub2.toolforge.org",
    imageLinks: {},
    uploadStatus: {
      isUploaded: false,
      uploadLink: "",
    },
    queueName: props.queue_name,
  });

  const [progress, setProgress] = useState(0);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      if (props.queue_name && props.job_id) {
        setLoading(true);
        fetch(
          `${host}/getJobInformation?queue_name=${props.queue_name}&job_id=${props.job_id}`
        )
          .then((resp) => resp.json())
          .then((resp) => {
            setData(resp);
            setProgress(resp.progress);
          })
          .catch((err) => console.error(err));
      }
    } catch (err) {
      console.log(err, "::err");
    } finally {
      setLoading(false);
    }
  }, [props.queue_name, props.job_id]);

  if (loading) {
    return <CircularProgress />;
  } else {
    return (
      <div>
        <Card className={classes.card}>
          <CardActionArea className={classes.cardActionArea}>
            <CardMedia
              component="img"
              alt={data.title}
              image={data.imageLinks ? data.imageLinks.small : data.coverImage}
              title={data.title}
              className={classes.cardImage}
            />
            <CardContent>
              <Typography gutterBottom variant="h2">
                {data.title}
              </Typography>
              <Typography variant="h5" color="textSecondary">
                {data.description}
              </Typography>
              <Typography variant="h5" color="textSecondary">
                <strong>Upload Progress:</strong> {progress}%
              </Typography>
            </CardContent>
          </CardActionArea>

          <CardActions className={classes.cardActions}>
            {data.uploadStatus.isUploaded ? (
              <Link passHref href={data.uploadStatus.uploadLink}>
                <Button
                  className={classes.cardButton}
                  target="_blank"
                  size="large"
                  color="primary"
                >
                  View on Internet Archive
                </Button>
              </Link>
            ) : null}
            <Link passHref href={data.previewLink}>
              <Button
                className={classes.cardButton}
                target="_blank"
                size="large"
                color="primary"
              >
                View on {data.queueName}
              </Button>
            </Link>
          </CardActions>
        </Card>
      </div>
    );
  }
};

export default ShowJobInformation;
