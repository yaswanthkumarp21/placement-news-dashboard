import { redirect } from "next/navigation";

/** Flow moved into the Data section. */
export default function AdminFlowPage() {
  redirect("/admin/data?tab=flow");
}
