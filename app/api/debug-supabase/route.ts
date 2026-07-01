import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return NextResponse.json({
    url_defined:    !!url,
    url_value:      url ?? "UNDEFINED",
    url_length:     url?.length ?? 0,
    url_starts_ok:  url?.startsWith("https://") ?? false,
    url_ends_slash: url?.endsWith("/") ?? false,
    url_has_spaces: url?.includes(" ") ?? false,
    key_defined:    !!key,
    key_length:     key?.length ?? 0,
    key_starts_ok:  key?.startsWith("eyJ") ?? false,
  });
}