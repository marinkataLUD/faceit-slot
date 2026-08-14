import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const cookieStore = await cookies();
  if (cookieStore.get("faceit_admin")?.value !== "1") redirect("/admin/login");
  return <AdminClient />;
}