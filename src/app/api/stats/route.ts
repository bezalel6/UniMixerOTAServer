import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const FIRMWARE_DIR = path.join(process.cwd(), 'public', 'firmware');

// Track server start time for uptime calculation
const serverStartTime = Date.now();

interface Stats {
  totalFirmwareFiles: number;
  totalDownloads: number;
  lastUpdate: string | null;
  serverUptime: string;
  diskSpace: {
    used: string;
    available: string;
  };
}

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function getDiskUsage(): Promise<{ used: string; available: string }> {
  try {
    // For cross-platform compatibility, we'll estimate based on firmware directory
    if (!existsSync(FIRMWARE_DIR)) {
      return { used: '0 MB', available: 'Unknown' };
    }

    const files = await readdir(FIRMWARE_DIR);
    let totalSize = 0;

    for (const file of files) {
      if (file.endsWith('.bin')) {
        const filePath = path.join(FIRMWARE_DIR, file);
        const stats = await stat(filePath);
        totalSize += stats.size;
      }
    }

    return {
      used: formatBytes(totalSize),
      available: 'Available' // Simplified for now
    };
  } catch (error) {
    return { used: 'Unknown', available: 'Unknown' };
  }
}

export async function GET() {
  try {
    let firmwareFiles: string[] = [];
    let lastUpdate: string | null = null;

    if (existsSync(FIRMWARE_DIR)) {
      const files = await readdir(FIRMWARE_DIR);
      firmwareFiles = files.filter(file => file.endsWith('.bin') && file !== 'latest.bin');

      // Find the most recent file
      let mostRecentTime = 0;
      for (const file of firmwareFiles) {
        const filePath = path.join(FIRMWARE_DIR, file);
        const stats = await stat(filePath);
        if (stats.mtime.getTime() > mostRecentTime) {
          mostRecentTime = stats.mtime.getTime();
          lastUpdate = stats.mtime.toISOString();
        }
      }
    }

    const diskSpace = await getDiskUsage();
    const uptime = formatUptime(Date.now() - serverStartTime);

    const stats: Stats = {
      totalFirmwareFiles: firmwareFiles.length,
      totalDownloads: 0, // This would need to be tracked in a database or log file
      lastUpdate: lastUpdate,
      serverUptime: uptime,
      diskSpace: diskSpace
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error getting stats:', error);
    return NextResponse.json(
      { error: 'Failed to get server statistics' },
      { status: 500 }
    );
  }
} 
