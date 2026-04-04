import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { seedSampleReport } from "@/lib/sample-report";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error_description = searchParams.get("error_description");
  const redirect = searchParams.get("redirect") || "/dashboard";

  console.log("Auth callback hit:", {
    hasCode: !!code,
    error_description,
    allParams: Object.fromEntries(searchParams.entries()),
    origin,
  });

  if (error_description) {
    console.error("Auth callback error from provider:", error_description);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error_description)}`);
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log("Auth callback exchange:", {
      hasUser: !!data?.user,
      userId: data?.user?.id,
      email: data?.user?.email,
      error: error?.message,
    });

    if (error) {
      console.error("Auth exchange failed:", error.message);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }

    if (data?.user) {
      await seedSampleReport(data.user.id);
    }
  } else {
    console.log("Auth callback: no code received, redirecting to login");
    return NextResponse.redirect(`${origin}/login`);
  }

  return NextResponse.redirect(`${origin}${redirect}`);
}
