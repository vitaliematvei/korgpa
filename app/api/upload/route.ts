import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  // 🔒 FEATURE DISABLED - Upload API dezactivat temporar
  // Pentru a activa: setează ENABLE_UPLOAD_API=true în .env.local
  if (process.env.ENABLE_UPLOAD_API !== 'true') {
    return NextResponse.json(
      {
        error: 'Upload feature is currently disabled',
        message: 'This endpoint is not available at the moment',
      },
      { status: 503 } // Service Unavailable
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // TODO: Implement user authentication check
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif'],
          tokenPayload: JSON.stringify({}),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // TODO: Save blob.url to database if needed
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
