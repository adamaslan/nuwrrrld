#!/bin/bash

# NUWRRRLD Media Optimization Script
# Compresses all media assets over 1MB to reduce scene memory usage
# Target: 6.3 MB -> ~2.2 MB (65% reduction)

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Directories
MEDIA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/public/media"
BACKUP_DIR="${MEDIA_DIR}/originals"

echo "=================================="
echo "NUWRRRLD Media Optimization"
echo "=================================="
echo ""

# Check dependencies
echo "Checking dependencies..."
if ! command -v cwebp &> /dev/null; then
    echo -e "${RED}ERROR: cwebp not found. Install with: brew install webp${NC}"
    exit 1
fi

if ! command -v ffmpeg &> /dev/null; then
    echo -e "${RED}ERROR: ffmpeg not found. Install with: brew install ffmpeg${NC}"
    exit 1
fi

echo -e "${GREEN}✓ cwebp found${NC}"
echo -e "${GREEN}✓ ffmpeg found${NC}"
echo ""

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Function to get file size in KB
get_file_size() {
    local file="$1"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        stat -f%z "$file" | awk '{print int($1/1024)}'
    else
        stat -c%s "$file" | awk '{print int($1/1024)}'
    fi
}

# Function to compress image to WebP
compress_image() {
    local input="$1"
    local quality="${2:-80}"
    local max_size="${3:-1024}"

    local basename=$(basename "$input" | sed 's/\.[^.]*$//')
    local output="${MEDIA_DIR}/${basename}.webp"

    echo "Compressing image: $(basename "$input")"

    # Backup original if not already backed up
    if [ ! -f "${BACKUP_DIR}/$(basename "$input")" ]; then
        cp "$input" "${BACKUP_DIR}/"
        echo -e "  ${YELLOW}→ Original backed up to ${BACKUP_DIR}${NC}"
    fi

    local original_size=$(get_file_size "$input")

    # Compress with cwebp
    cwebp -q ${quality} -resize ${max_size} 0 "$input" -o "$output" > /dev/null 2>&1

    local new_size=$(get_file_size "$output")
    local savings=$((original_size - new_size))
    local percent=$((100 * savings / original_size))

    echo -e "  ${GREEN}✓ ${original_size} KB -> ${new_size} KB (saved ${savings} KB, -${percent}%)${NC}"
    echo -e "  ${GREEN}→ Output: ${output}${NC}"
    echo ""
}

# Function to compress video
compress_video() {
    local input="$1"
    local crf="${2:-28}"
    local max_height="${3:-720}"

    local basename=$(basename "$input" | sed 's/\.[^.]*$//')
    local output="${MEDIA_DIR}/${basename}-optimized.mp4"

    echo "Compressing video: $(basename "$input")"

    # Backup original if not already backed up
    if [ ! -f "${BACKUP_DIR}/$(basename "$input")" ]; then
        cp "$input" "${BACKUP_DIR}/"
        echo -e "  ${YELLOW}→ Original backed up to ${BACKUP_DIR}${NC}"
    fi

    local original_size=$(get_file_size "$input")

    # Compress with ffmpeg (H.264, CRF 28, max 720p, 1 Mbps target)
    ffmpeg -i "$input" \
        -vf "scale=-2:min(${max_height}\,ih)" \
        -c:v libx264 \
        -crf ${crf} \
        -preset medium \
        -b:v 1M \
        -maxrate 1.5M \
        -bufsize 2M \
        -c:a aac \
        -b:a 128k \
        -movflags +faststart \
        "$output" -y > /dev/null 2>&1

    local new_size=$(get_file_size "$output")
    local savings=$((original_size - new_size))
    local percent=$((100 * savings / original_size))

    echo -e "  ${GREEN}✓ ${original_size} KB -> ${new_size} KB (saved ${savings} KB, -${percent}%)${NC}"
    echo -e "  ${GREEN}→ Output: ${output}${NC}"
    echo ""
}

# Compress images over 1MB
echo "=================================="
echo "Compressing Images"
echo "=================================="
echo ""

if [ -f "${MEDIA_DIR}/doves1.jpg" ]; then
    compress_image "${MEDIA_DIR}/doves1.jpg" 80 1024
fi

if [ -f "${MEDIA_DIR}/postmascaa1.jpg" ]; then
    compress_image "${MEDIA_DIR}/postmascaa1.jpg" 85 1024
fi

if [ -f "${MEDIA_DIR}/nathans1.jpg" ]; then
    echo -e "${YELLOW}Note: nathans1.jpg (1.1 MB) found but unused in config${NC}"
    echo -e "${YELLOW}Compressing anyway for future use...${NC}"
    echo ""
    compress_image "${MEDIA_DIR}/nathans1.jpg" 80 1024
fi

# Compress video
echo "=================================="
echo "Compressing Video"
echo "=================================="
echo ""

if [ -f "${MEDIA_DIR}/thresh-plan1-good.mp4" ]; then
    compress_video "${MEDIA_DIR}/thresh-plan1-good.mp4" 28 720
fi

# Summary
echo "=================================="
echo "Optimization Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Update config/mediaConfig.ts to use .webp extensions for images"
echo "2. Update config/mediaConfig.ts to use -optimized.mp4 for video"
echo "3. Test the scene to verify no visual regressions"
echo "4. Run scripts/check-media-size.ts to verify all files under 1MB"
echo ""
echo -e "${YELLOW}Note: Original files backed up in ${BACKUP_DIR}${NC}"
