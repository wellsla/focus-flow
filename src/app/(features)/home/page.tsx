import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect("/auth/login?returnTo=/home");
  }
  const name = session.user.name || "User";
  return <HomeClient userName={name} />;
}
