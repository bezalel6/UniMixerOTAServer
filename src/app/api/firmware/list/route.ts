import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const FIRMWARE_DIR = path.join(process.cwd(), 'public', 'firmware');

interface FirmwareFile {
  name: string;
  size: number;
  uploadDate: string;
  version?: string;
  isLatest?: boolean;
}

export async function GET() {
  try {
    if (!existsSync(FIRMWARE_DIR)) {
      return NextResponse.json({
        files: [],
        message: 'No firmware directory found'
      });
    }

    const files = await readdir(FIRMWARE_DIR);
    const firmwareFiles: FirmwareFile[] = [];

    for (const file of files) {
      // Skip non-.bin files and the latest.bin symlink
      if (!file.endsWith('.bin') || file === 'latest.bin') {
        continue;
      }

      const filePath = path.join(FIRMWARE_DIR, file);
      const stats = await stat(filePath);

      // Extract version from filename if it follows our pattern
      let version: string | undefined;
      const versionMatch = file.match(/firmware-(.+)\.bin/);
      if (versionMatch) {
        // Convert timestamp back to readable version
        const timestamp = versionMatch[1];
        const date = timestamp.replace(/-/g, ':').replace(/T/, ' ');
        try {
          const dateObj = new Date(date);
          version = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
        } catch {
          version = timestamp;
        }
      }

      firmwareFiles.push({
        name: file,
        size: stats.size,
        uploadDate: stats.mtime.toISOString(),
        version: version
      });
    }

    // Sort by upload date (newest first)
    firmwareFiles.sort((a, b) => 
      new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    );

    // Mark the newest as latest
    if (firmwareFiles.length > 0) {
      firmwareFiles[0].isLatest = true;
    }

    return NextResponse.json({
      files: firmwareFiles,
      total: firmwareFiles.length,
      message: `Found ${firmwareFiles.length} firmware file(s)`
    });

  } catch (error) {
    console.error('Error listing firmware files:', error);
    return NextResponse.json(
      { error: 'Failed to list firmware files' },
      { status: 500 }
    );
  }
} 
