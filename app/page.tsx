import { redirect } from "next/navigation";

/** La entrada lleva al login (que ofrece el acceso a la demo). */
export default function Home() {
  redirect("/login");
}
