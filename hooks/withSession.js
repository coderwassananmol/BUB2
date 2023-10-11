import { useSession } from "next-auth/react";

export const withSession = (Component) => (props) => {
  const session = useSession();

  return <Component session={session} {...props} />;
};
