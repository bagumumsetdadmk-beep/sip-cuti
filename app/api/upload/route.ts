import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const prefix = (formData.get('prefix') as string) || 'file';

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Tidak ada berkas yang diunggah' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const originalExt = file.name.split('.').pop() || 'png';
    const cleanExt = originalExt.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanPrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${cleanPrefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${cleanExt}`;

    // Target upload locations (support both cwd and container absolute path)
    const dirs = [
      path.join(process.cwd(), 'public', 'uploads'),
      '/app/applet/public/uploads',
      '/public/uploads',
    ];

    for (const dir of dirs) {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(path.join(dir, fileName), buffer);
      } catch (writeErr) {
        console.warn(`Could not write to ${dir}:`, writeErr);
      }
    }

    const publicUrl = `/api/files/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
    });
  } catch (error: any) {
    console.error('Server error on file upload:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Gagal menyimpan berkas di server' },
      { status: 500 }
    );
  }
}
