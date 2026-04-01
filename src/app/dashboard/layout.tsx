import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, credits_remaining, total_reports_run")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen">
      <Sidebar user={profile} />
      <main className="md:ml-56 p-5 md:p-6 min-w-0 min-h-screen print:ml-0 print:p-0">
        {children}
      </main>
    </div>
  );
}
