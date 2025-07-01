import { NextRequest, NextResponse } from 'next/server';
import { readFile, unlink, writeFile, readFile as readFileAsync } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const FIRMWARE_DIR = path.join(process.cwd(), 'public', 'firmware');
const STATS_FILE = path.join(process.cwd(), 'data', 'download-stats.json');

interface DownloadStats {
  totalDownloads: number;
  lastDownload: string | null;
  downloadHistory: Array<{
    filename: string;
    timestamp: string;
    userAgent: string;
    size: number;
  }>;
}

async function updateDownloadStats(filename: string, userAgent: string, size: number) {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(STATS_FILE);
    if (!existsSync(dataDir)) {
      await writeFile(path.join(dataDir, '.gitkeep'), '');
    }

    let stats: DownloadStats = {
      totalDownloads: 0,
      lastDownload: null,
      downloadHistory: []
    };

    // Read existing stats if file exists
    if (existsSync(STATS_FILE)) {
      try {
        const data = await readFileAsync(STATS_FILE, 'utf-8');
        stats = JSON.parse(data);
      } catch (e) {
        console.warn('Failed to read download stats, starting fresh');
      }
    }

    // Update stats
    const now = new Date().toISOString();
    stats.totalDownloads += 1;
    stats.lastDownload = now;
    stats.downloadHistory.push({
      filename,
      timestamp: now,
      userAgent,
      size
    });

    // Keep only last 100 downloads to prevent file from growing too large
    if (stats.downloadHistory.length > 100) {
      stats.downloadHistory = stats.downloadHistory.slice(-100);
    }

    // Save updated stats
    await writeFile(STATS_FILE, JSON.stringify(stats, null, 2));
  } catch (error) {
    console.error('Failed to update download stats:', error);
  }
}

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

    // Log and track download
    const userAgent = request.headers.get('user-agent') || '';
    console.log(`OTA Download: ${filename} (${fileBuffer.length} bytes) - User-Agent: ${userAgent}`);
    
    // Update download statistics
    await updateDownloadStats(filename, userAgent, fileBuffer.length);

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
