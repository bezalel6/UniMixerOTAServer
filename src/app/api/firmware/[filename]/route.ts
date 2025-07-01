import { NextRequest, NextResponse } from 'next/server';
import { readFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const FIRMWARE_DIR = path.join(process.cwd(), 'public', 'firmware');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    // Validate filename
    if (!filename || !filename.endsWith('.bin')) {
      return NextResponse.json(
        { error: 'Invalid firmware filename' },
        { status: 400 }
      );
    }

    const filePath = path.join(FIRMWARE_DIR, filename);

    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Firmware file not found' },
        { status: 404 }
      );
    }

    const fileBuffer = await readFile(filePath);

    // Set appropriate headers for ESP32 OTA
    const headers = new Headers();
    headers.set('Content-Type', 'application/octet-stream');
    headers.set('Content-Length', fileBuffer.length.toString());
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    // Log download for ESP32 requests
    const userAgent = request.headers.get('user-agent') || '';
    if (userAgent.includes('ESP32') || filename === 'latest.bin') {
      console.log(`OTA Download: ${filename} (${fileBuffer.length} bytes) - User-Agent: ${userAgent}`);
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: headers
    });

  } catch (error) {
    console.error('Error serving firmware file:', error);
    return NextResponse.json(
      { error: 'Failed to serve firmware file' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // Don't allow deletion of latest.bin
    if (filename === 'latest.bin') {
      return NextResponse.json(
        { error: 'Cannot delete latest.bin file' },
        { status: 400 }
      );
    }

    // Validate filename
    if (!filename || !filename.endsWith('.bin')) {
      return NextResponse.json(
        { error: 'Invalid firmware filename' },
        { status: 400 }
      );
    }

    const filePath = path.join(FIRMWARE_DIR, filename);

    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Firmware file not found' },
        { status: 404 }
      );
    }

    await unlink(filePath);

    console.log(`Firmware deleted: ${filename}`);

    return NextResponse.json({
      message: 'Firmware file deleted successfully',
      filename: filename
    });

  } catch (error) {
    console.error('Error deleting firmware file:', error);
    return NextResponse.json(
      { error: 'Failed to delete firmware file' },
      { status: 500 }
    );
  }
} 
