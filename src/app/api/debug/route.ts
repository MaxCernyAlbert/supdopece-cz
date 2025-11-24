import { NextResponse } from 'next/server';

export async function GET() {
  const hasKV = !!(process.env.KV_URL || process.env.KV_REST_API_URL);
  const isVercel = process.env.VERCEL === '1';

  return NextResponse.json({
    environment: {
      isVercel,
      hasKV,
      nodeEnv: process.env.NODE_ENV,
      hasKvUrl: !!process.env.KV_URL,
      hasKvRestApiUrl: !!process.env.KV_REST_API_URL,
      hasKvRestApiToken: !!process.env.KV_REST_API_TOKEN,
    },
    willUseKV: isVercel && hasKV,
  });
}
