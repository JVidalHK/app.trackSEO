import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { seedSampleReport } from "@/lib/sample-report";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") || "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log("Auth callback:", {
      hasUser: !!data?.user,
      userId: data?.user?.id,
      email: data?.user?.email,
      error: error?.message,
    });

    if (data?.user) {
      await seedSampleReport(data.user.id);
    }
  }

  return NextResponse.redirect(`${origin}${redirect}`);
}
