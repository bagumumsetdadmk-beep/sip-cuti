import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MIME_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> | { filename: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const filename = resolvedParams?.filename || '';
    const safeName = path.basename(decodeURIComponent(filename));

    const candidatePaths = [
      path.join('/app/applet/public/uploads', safeName),
      path.join('/public/uploads', safeName),
      path.join(process.cwd(), 'public', 'uploads', safeName),
    ];

    let foundPath: string | null = null;
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        foundPath = p;
        break;
      }
    }

    if (!foundPath) {
      return NextResponse.json(
        { error: 'Berkas tidak ditemukan' },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(foundPath);
    const ext = safeName.split('.').pop()?.toLowerCase() || '';
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Gagal memuat berkas' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> | { filename: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const filename = resolvedParams?.filename || '';
    const safeName = path.basename(decodeURIComponent(filename));

    const candidatePaths = [
      path.join('/app/applet/public/uploads', safeName),
      path.join('/public/uploads', safeName),
      path.join(process.cwd(), 'public', 'uploads', safeName),
    ];

    for (const p of candidatePaths) {
      try {
        if (fs.existsSync(p)) {
          fs.unlinkSync(p);
        }
      } catch (err) {
        console.warn(`Could not delete from ${p}:`, err);
      }
    }

    return NextResponse.json({ success: true, message: 'Berkas berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Gagal menghapus berkas' }, { status: 500 });
  }
}
