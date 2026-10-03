import { getLandingPageDataAction } from "@/lib/actions/homepage-actions";
import { LandingClient } from "./LandingClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getLandingPageDataAction();

  return <LandingClient initialData={data} />;
}
