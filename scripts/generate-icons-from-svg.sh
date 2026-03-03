#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_DIR="/private/tmp/reddirect-icon-build"

CHROME_SVG="$ROOT_DIR/assets/logo/reddirect-logo.svg"

CHROME_DIR="$ROOT_DIR/chrome/icons"
SAFARI_DIR="$ROOT_DIR/safari/ReddirectExtension/Resources/icons"

mkdir -p "$TMP_DIR" "$CHROME_DIR" "$SAFARI_DIR"

render_svg() {
  local svg_path="$1"
  local out_png="$2"
  qlmanage -t -s 1024 -o "$TMP_DIR" "$svg_path" >/dev/null 2>&1
  local rendered="$TMP_DIR/$(basename "$svg_path").png"
  if [[ ! -f "$rendered" ]]; then
    echo "Failed to render $svg_path" >&2
    exit 1
  fi
  cp "$rendered" "$out_png"
}

write_icon_set() {
  local master="$1"
  local out_dir="$2"

  cp "$master" "$out_dir/icon1024.png"

  for size in 128 48 32 16; do
    sips -z "$size" "$size" "$master" --out "$out_dir/icon${size}.png" >/dev/null
  done
}

CHROME_RAW="$TMP_DIR/chrome-raw.png"
CHROME_MASTER="$TMP_DIR/chrome-master.png"
SAFARI_MASTER="$TMP_DIR/safari-master.png"

render_svg "$CHROME_SVG" "$CHROME_RAW"

# Clean source logo to the main circle mark and derive Safari grayscale variant.
swift - "$CHROME_RAW" "$CHROME_MASTER" "$SAFARI_MASTER" <<'SWIFT'
import AppKit

let args = CommandLine.arguments
guard args.count == 4 else {
    fputs("Expected input, chrome output, and safari output paths\n", stderr)
    exit(1)
}

let inputPath = args[1]
let chromeOutputPath = args[2]
let safariOutputPath = args[3]

guard let srcImage = NSImage(contentsOfFile: inputPath),
      let tiffData = srcImage.tiffRepresentation,
      let srcRep = NSBitmapImageRep(data: tiffData),
      let chromeRep = NSBitmapImageRep(
          bitmapDataPlanes: nil,
          pixelsWide: srcRep.pixelsWide,
          pixelsHigh: srcRep.pixelsHigh,
          bitsPerSample: 8,
          samplesPerPixel: 4,
          hasAlpha: true,
          isPlanar: false,
          colorSpaceName: .deviceRGB,
          bitmapFormat: [],
          bytesPerRow: 0,
          bitsPerPixel: 0
      ),
      let safariRep = NSBitmapImageRep(
          bitmapDataPlanes: nil,
          pixelsWide: srcRep.pixelsWide,
          pixelsHigh: srcRep.pixelsHigh,
          bitsPerSample: 8,
          samplesPerPixel: 4,
          hasAlpha: true,
          isPlanar: false,
          colorSpaceName: .deviceRGB,
          bitmapFormat: [],
          bytesPerRow: 0,
          bitsPerPixel: 0
      ) else {
    fputs("Failed to load source image for icon cleanup\n", stderr)
    exit(1)
}

let width = srcRep.pixelsWide
let height = srcRep.pixelsHigh
let total = width * height

guard let srcData = srcRep.bitmapData,
      let chromeData = chromeRep.bitmapData,
      let safariData = safariRep.bitmapData else {
    fputs("Failed to access bitmap buffers for icon generation\n", stderr)
    exit(1)
}

let srcBpr = srcRep.bytesPerRow
let chromeBpr = chromeRep.bytesPerRow
let safariBpr = safariRep.bytesPerRow
let bytesPerPixel = 4

func isOrange(r: UInt8, g: UInt8, b: UInt8, a: UInt8) -> Bool {
    if a < 128 { return false }
    let rf = Double(r) / 255.0
    let gf = Double(g) / 255.0
    let bf = Double(b) / 255.0
    return rf > 0.75 && gf > 0.2 && gf < 0.65 && bf < 0.35 && rf > gf + 0.08
}

var orangeMask = [Bool](repeating: false, count: total)
for y in 0..<height {
    for x in 0..<width {
        let idx = y * width + x
        let p = (y * srcBpr) + (x * bytesPerPixel)
        let r = srcData[p]
        let g = srcData[p + 1]
        let b = srcData[p + 2]
        let a = srcData[p + 3]
        orangeMask[idx] = isOrange(r: r, g: g, b: b, a: a)
    }
}

struct Component {
    var count = 0
    var minX = Int.max
    var minY = Int.max
    var maxX = Int.min
    var maxY = Int.min
}

var visited = [Bool](repeating: false, count: total)
var largest = Component()

for start in 0..<total {
    if !orangeMask[start] || visited[start] {
        continue
    }

    var queue = [start]
    visited[start] = true
    var head = 0
    var comp = Component()

    while head < queue.count {
        let idx = queue[head]
        head += 1

        let x = idx % width
        let y = idx / width
        comp.count += 1
        comp.minX = min(comp.minX, x)
        comp.minY = min(comp.minY, y)
        comp.maxX = max(comp.maxX, x)
        comp.maxY = max(comp.maxY, y)

        let yStart = max(0, y - 1)
        let yEnd = min(height - 1, y + 1)
        let xStart = max(0, x - 1)
        let xEnd = min(width - 1, x + 1)

        for ny in yStart...yEnd {
            for nx in xStart...xEnd {
                let nIdx = ny * width + nx
                if orangeMask[nIdx] && !visited[nIdx] {
                    visited[nIdx] = true
                    queue.append(nIdx)
                }
            }
        }
    }

    if comp.count > largest.count {
        largest = comp
    }
}

if largest.count == 0 {
    fputs("Failed to detect primary logo circle in source SVG render\n", stderr)
    exit(1)
}

let cx = Double(largest.minX + largest.maxX) / 2.0
let cy = Double(largest.minY + largest.maxY) / 2.0
let radius = max(Double(largest.maxX - largest.minX + 1), Double(largest.maxY - largest.minY + 1)) / 2.0
let clipRadius = radius + 1.5

for y in 0..<height {
    for x in 0..<width {
        let dx = Double(x) - cx
        let dy = Double(y) - cy
        let inside = (dx * dx + dy * dy) <= (clipRadius * clipRadius)
        let srcP = (y * srcBpr) + (x * bytesPerPixel)
        let chromeP = (y * chromeBpr) + (x * bytesPerPixel)
        let safariP = (y * safariBpr) + (x * bytesPerPixel)

        if !inside {
            chromeData[chromeP] = 0
            chromeData[chromeP + 1] = 0
            chromeData[chromeP + 2] = 0
            chromeData[chromeP + 3] = 0
            safariData[safariP] = 0
            safariData[safariP + 1] = 0
            safariData[safariP + 2] = 0
            safariData[safariP + 3] = 0
            continue
        }

        let r = srcData[srcP]
        let g = srcData[srcP + 1]
        let b = srcData[srcP + 2]
        let a = srcData[srcP + 3]
        let gray = UInt8(
            min(
                255.0,
                (0.2126 * Double(r)) + (0.7152 * Double(g)) + (0.0722 * Double(b))
            )
        )

        chromeData[chromeP] = r
        chromeData[chromeP + 1] = g
        chromeData[chromeP + 2] = b
        chromeData[chromeP + 3] = a

        safariData[safariP] = gray
        safariData[safariP + 1] = gray
        safariData[safariP + 2] = gray
        safariData[safariP + 3] = a
    }
}

guard let chromePng = chromeRep.representation(using: .png, properties: [:]),
      let safariPng = safariRep.representation(using: .png, properties: [:]) else {
    fputs("Failed to encode icon PNG output\n", stderr)
    exit(1)
}

do {
    try chromePng.write(to: URL(fileURLWithPath: chromeOutputPath))
    try safariPng.write(to: URL(fileURLWithPath: safariOutputPath))
} catch {
    fputs("Failed to write icon output files\n", stderr)
    exit(1)
}
SWIFT

write_icon_set "$CHROME_MASTER" "$CHROME_DIR"
write_icon_set "$SAFARI_MASTER" "$SAFARI_DIR"

echo "Generated Chrome icons from: $CHROME_SVG"
echo "Generated Safari icons from grayscale of: $CHROME_SVG"
