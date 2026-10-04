import { redirect } from "next/navigation";

export default function CustomDomainBoutiquePage() {
  redirect("/?tab=about");
}
