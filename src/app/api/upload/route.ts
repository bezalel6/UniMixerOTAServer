import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'firmware');

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureUploadDir();

    const formData = await request.formData();
    const file = formData.get('firmware') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No firmware file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith('.bin')) {
      return NextResponse.json(
        { error: 'Only .bin files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large. Maximum 50MB allowed.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate timestamped filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `firmware-${timestamp}.bin`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Write the file
    await writeFile(filepath, buffer);

    // Also create/update a symlink or copy for "latest.bin"
    const latestPath = path.join(UPLOAD_DIR, 'latest.bin');
    await writeFile(latestPath, buffer);

    console.log(`Firmware uploaded: ${filename} (${file.size} bytes)`);

    return NextResponse.json({
      message: 'Firmware uploaded successfully',
      filename: filename,
      size: file.size,
      uploadDate: new Date().toISOString()
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error during upload' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to upload firmware.' },
    { status: 405 }
  );
} 
