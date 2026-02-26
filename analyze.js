const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// ====================================================================
// GREEN CONTENT ANALYZER
// Analyzes satellite tiles for vegetation content
// ====================================================================

const TILES_FOLDER = 'tiles';

// Vegetation detection thresholds
const EXG_THRESHOLD = 12;
const GRVI_THRESHOLD = 0.025;
const MIN_BRIGHTNESS = 20;
const MAX_BRIGHTNESS = 250;

async function analyzeGreenContent(imagePath) {
    const { data, info } = await sharp(imagePath)
        .raw()
        .toBuffer({ resolveWithObject: true });

    const totalPixels = info.width * info.height;
    let vegetationPixels = 0;

    for (let i = 0; i < data.length; i += 3) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const brightness = (r + g + b) / 3;
        if (brightness < MIN_BRIGHTNESS || brightness > MAX_BRIGHTNESS) continue;

        const exg = 2 * g - r - b;
        const grvi = (g - r) / Math.max(1, g + r);
        
        if (exg > EXG_THRESHOLD && g > b && grvi > GRVI_THRESHOLD) {
            vegetationPixels++;
        }
    }

    return Math.round((vegetationPixels / totalPixels) * 10000) / 100;
}

(async () => {
    console.log('\n🌿 ANALYZING GREEN CONTENT\n');

    const manifestPath = path.join(TILES_FOLDER, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
        console.error('❌ No manifest.json found. Run download.js first.');
        process.exit(1);
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    let allTiles = [];
    let analyzed = 0;

    for (const point of manifest.points) {
        console.log(`📍 Point ${point.index} (${point.tiles.length} images)`);
        
        for (const tile of point.tiles) {
            const imagePath = path.join(TILES_FOLDER, point.folder, tile.filename);
            
            if (!fs.existsSync(imagePath)) continue;

            try {
                tile.greenPercent = await analyzeGreenContent(imagePath);
                analyzed++;
                
                allTiles.push({
                    pointIndex: point.index,
                    lat: point.lat,
                    lon: point.lon,
                    folder: point.folder,
                    ...tile
                });

                const bar = '█'.repeat(Math.round(tile.greenPercent / 5)) + 
                           '░'.repeat(20 - Math.round(tile.greenPercent / 5));
                process.stdout.write(`\r  [${bar}] ${tile.greenPercent.toFixed(1).padStart(5)}%`);
            } catch (err) {
                // Skip errors
            }
        }
        console.log('');
    }

    // Calculate stats
    const greenValues = allTiles.map(t => t.greenPercent);
    manifest.greenStats = {
        min: Math.min(...greenValues),
        max: Math.max(...greenValues),
        avg: Math.round(greenValues.reduce((a, b) => a + b, 0) / greenValues.length * 100) / 100
    };

    // Create flat tiles array for easy grid display
    manifest.allTiles = allTiles.sort((a, b) => b.greenPercent - a.greenPercent);

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Analyzed ${analyzed} tiles`);
    console.log(`   Green range: ${manifest.greenStats.min}% - ${manifest.greenStats.max}%`);
    console.log(`   Average: ${manifest.greenStats.avg}%`);
    console.log(`\n   Open index.html to view the grid!\n`);
})();
