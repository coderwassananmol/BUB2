import { useSession } from "next-auth/react";

export const withSession = (Component) => (props) => {
  const session = useSession();

  if (Component.prototype && Component.prototype?.render) {
    return <Component session={session} {...props} />;
  }
  return null;
};
