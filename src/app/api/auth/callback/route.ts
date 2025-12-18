import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const error_description = searchParams.get('error_description');
  const next = searchParams.get('next') ?? '/repos';

  // If there's an error from the OAuth provider
  if (error) {
    console.error('OAuth error:', error, error_description);
    return NextResponse.redirect(
      `${origin}/signin?error=${encodeURIComponent(error_description || error)}`
    );
  }

  if (code) {
    const cookieStore = await cookies();

    // Create response first so we can set cookies on it
    const response = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Session exchange error:', error.message);
      return NextResponse.redirect(
        `${origin}/signin?error=${encodeURIComponent(error.message)}`
      );
    }

    return response;
  }

  // No code provided
  return NextResponse.redirect(`${origin}/signin?error=no_code_provided`);
}
