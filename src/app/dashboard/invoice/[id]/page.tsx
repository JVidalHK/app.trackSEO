import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { InvoiceView } from "./invoice-view";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: purchase } = await supabase
    .from("credit_purchases")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!purchase || purchase.status !== "completed") {
    redirect("/dashboard/credits");
  }

  return <InvoiceView purchase={purchase} />;
}
