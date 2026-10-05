import { redirect } from "next/navigation";

export default function PlansRedirect() {
  redirect("/super-admin/settings");
}
