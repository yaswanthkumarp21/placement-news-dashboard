import { redirect } from "next/navigation";

/** Distribution moved into the Data section. */
export default function AdminDistributionPage() {
  redirect("/admin/data?tab=distribution");
}
