import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { seedSampleReport } from "@/lib/sample-report";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error_description = searchParams.get("error_description");
  const redirect = searchParams.get("redirect") || "/dashboard";

  if (error_description) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error_description)}`);
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }

    if (data?.user) {
      await seedSampleReport(data.user.id);
    }
  } else {
    return NextResponse.redirect(`${origin}/login`);
  }

  return NextResponse.redirect(`${origin}${redirect}`);
}
