import Header from "../components/Header";
import QueueSection from "../components/QueueSection";
import { queue_data_endpoint } from "../utils/constants";
import NProgress from "nprogress";
import Router from "next/router";

NProgress.configure({ easing: "ease", speed: 500, showSpinner: false });

Router.onRouteChangeStart = () => {
  NProgress.start();
};

Router.onRouteChangeComplete = () => {
  NProgress.done();
};

Router.onRouteChangeError = () => {
  NProgress.done();
};

const Queue = ({ data }) => {
  return (
    <div>
      <Header page="queue" />
      <QueueSection
        queue_name="gb"
        name="Google Books Queue"
        active={data["gb-queue"]["active"]}
        waiting={data["gb-queue"]["waiting"]}
      />
      <QueueSection
        queue_name="pdl"
        name="Panjab Digital Library Queue"
        active={data["pdl-queue"]["active"]}
        waiting={data["pdl-queue"]["waiting"]}
      />
    </div>
  );
};

export async function getServerSideProps() {
  const resp = await fetch(queue_data_endpoint);
  const data = await resp.json();
  return { props: { data } };
  // Pass data to the page via props
}

export default Queue;
