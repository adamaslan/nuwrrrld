#!/usr/bin/env ts-node

/**
 * NUWRRRLD Media Size Validation Script
 * Scans public/media/ and warns if any file exceeds 1MB
 * Can be used as a pre-commit hook or npm script
 */

import * as fs from 'fs';
import * as path from 'path';

// ANSI color codes
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

// Configuration
const MAX_IMAGE_SIZE_MB = 1;
const MAX_VIDEO_SIZE_MB = 2;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi'];

interface FileInfo {
  name: string;
  path: string;
  sizeBytes: number;
  sizeMB: number;
  type: 'image' | 'video' | 'other';
  exceedsLimit: boolean;
}

/**
 * Get file type based on extension
 */
function getFileType(filename: string): 'image' | 'video' | 'other' {
  const ext = path.extname(filename).toLowerCase();
  if (IMAGE_EXTENSIONS.includes(ext)) return 'image';
  if (VIDEO_EXTENSIONS.includes(ext)) return 'video';
  return 'other';
}

/**
 * Get max size for file type
 */
function getMaxSize(type: 'image' | 'video' | 'other'): number {
  if (type === 'image') return MAX_IMAGE_SIZE_BYTES;
  if (type === 'video') return MAX_VIDEO_SIZE_BYTES;
  return Infinity; // No limit for other files
}

/**
 * Format bytes to human-readable size
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Scan media directory and collect file info
 */
function scanMediaDirectory(mediaDir: string): FileInfo[] {
  const files: FileInfo[] = [];

  if (!fs.existsSync(mediaDir)) {
    console.error(`${colors.red}ERROR: Media directory not found: ${mediaDir}${colors.reset}`);
    process.exit(1);
  }

  const entries = fs.readdirSync(mediaDir, { withFileTypes: true });

  for (const entry of entries) {
    // Skip directories (like 'originals' backup folder)
    if (entry.isDirectory()) continue;

    // Skip hidden files
    if (entry.name.startsWith('.')) continue;

    const filePath = path.join(mediaDir, entry.name);
    const stats = fs.statSync(filePath);
    const type = getFileType(entry.name);
    const maxSize = getMaxSize(type);
    const sizeMB = stats.size / (1024 * 1024);

    files.push({
      name: entry.name,
      path: filePath,
      sizeBytes: stats.size,
      sizeMB,
      type,
      exceedsLimit: stats.size > maxSize,
    });
  }

  return files;
}

/**
 * Main validation function
 */
function main() {
  // Resolve media directory
  const projectRoot = path.resolve(__dirname, '..');
  const mediaDir = path.join(projectRoot, 'public', 'media');

  console.log(`${colors.bold}==================================`);
  console.log('NUWRRRLD Media Size Validation');
  console.log(`==================================${colors.reset}\n`);

  console.log(`Scanning: ${mediaDir}\n`);

  // Scan files
  const files = scanMediaDirectory(mediaDir);

  if (files.length === 0) {
    console.log(`${colors.yellow}No media files found.${colors.reset}\n`);
    return;
  }

  // Separate files by type
  const images = files.filter((f) => f.type === 'image');
  const videos = files.filter((f) => f.type === 'video');
  const other = files.filter((f) => f.type === 'other');

  // Check for violations
  const violations = files.filter((f) => f.exceedsLimit);
  const totalSize = files.reduce((sum, f) => sum + f.sizeBytes, 0);

  // Display results
  console.log(`${colors.bold}File Summary:${colors.reset}`);
  console.log(`  Images: ${images.length}`);
  console.log(`  Videos: ${videos.length}`);
  console.log(`  Other: ${other.length}`);
  console.log(`  Total: ${files.length} files, ${formatBytes(totalSize)}\n`);

  // Display size limits
  console.log(`${colors.bold}Size Limits:${colors.reset}`);
  console.log(`  Images: ${MAX_IMAGE_SIZE_MB} MB`);
  console.log(`  Videos: ${MAX_VIDEO_SIZE_MB} MB\n`);

  // List all files
  console.log(`${colors.bold}All Media Files:${colors.reset}`);
  for (const file of files) {
    const sizeStr = formatBytes(file.sizeBytes);
    const typeStr = `[${file.type}]`.padEnd(8);

    if (file.exceedsLimit) {
      const maxStr = formatBytes(getMaxSize(file.type));
      console.log(
        `${colors.red}  ✗ ${typeStr} ${file.name.padEnd(30)} ${sizeStr.padStart(10)} (exceeds ${maxStr})${colors.reset}`
      );
    } else {
      console.log(
        `${colors.green}  ✓ ${typeStr} ${file.name.padEnd(30)} ${sizeStr.padStart(10)}${colors.reset}`
      );
    }
  }

  console.log();

  // Final verdict
  if (violations.length > 0) {
    console.log(`${colors.red}${colors.bold}FAILED: ${violations.length} file(s) exceed size limits!${colors.reset}`);
    console.log(`\n${colors.yellow}Run scripts/optimize-media.sh to compress media files.${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${colors.green}${colors.bold}PASSED: All media files within size limits!${colors.reset}\n`);
    process.exit(0);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { scanMediaDirectory, getFileType, formatBytes };
