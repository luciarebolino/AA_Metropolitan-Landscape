const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

// ====================================================================
// SATELLITE TILE DOWNLOADER
// Downloads historical Esri Wayback imagery for each point in GeoJSON
// ====================================================================

// ==================== SETTINGS (EDIT HERE) ==========================

const ZOOM_LEVEL = 18;           // 18 = building level, 17 = block, 16 = neighborhood
const MAX_POINTS = 0;            // 0 = all points, or set a number to limit
const SKIP_YEARS_BEFORE = 0;     // 0 = all dates, or e.g. 2020 for recent only

// ====================================================================

const GEOJSON_FILE = 'points.geojson';
const OUTPUT_FOLDER = 'tiles';
const DELAY_MS = 100;

function latLonToTile(lat, lon, zoom) {
    const n = Math.pow(2, zoom);
    const x = Math.floor((lon + 180) / 360 * n);
    const latRad = lat * Math.PI / 180;
    const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
    return { x, y, z: zoom };
}

function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
            });
        }).on('error', reject);
    });
}

function downloadImage(url, outputPath) {
    return new Promise((resolve, reject) => {
        const doRequest = (requestUrl) => {
            https.get(requestUrl, (response) => {
                if (response.statusCode === 301 || response.statusCode === 302) {
                    let redirectUrl = response.headers.location;
                    if (redirectUrl.startsWith('/')) {
                        const urlObj = new URL(requestUrl);
                        redirectUrl = `${urlObj.protocol}//${urlObj.host}${redirectUrl}`;
                    }
                    response.resume();
                    doRequest(redirectUrl);
                    return;
                }
                if (response.statusCode !== 200) {
                    response.resume();
                    reject(new Error(`HTTP ${response.statusCode}`));
                    return;
                }
                const fileStream = fs.createWriteStream(outputPath);
                response.pipe(fileStream);
                fileStream.on('finish', () => { fileStream.close(); resolve(); });
                fileStream.on('error', reject);
            }).on('error', reject);
        };
        doRequest(url);
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getFileHash(filepath) {
    const data = fs.readFileSync(filepath);
    return crypto.createHash('md5').update(data).digest('hex');
}

(async () => {
    console.log('\n🛰️  SATELLITE TILE DOWNLOADER\n');
    console.log(`   Zoom level: ${ZOOM_LEVEL}`);

    // Fetch available Wayback releases
    console.log('   Fetching available dates...');
    const apiUrl = 'https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer?f=json';
    const apiData = await fetchJSON(apiUrl);
    
    let releases = apiData.Selection.map(r => ({
        m: r.M,
        date: r.Name.replace('World Imagery (Wayback ', '').replace(')', ''),
        year: parseInt(r.Name.match(/\d{4}/)[0])
    }));

    if (SKIP_YEARS_BEFORE > 0) {
        releases = releases.filter(r => r.year >= SKIP_YEARS_BEFORE);
    }

    console.log(`   Found ${releases.length} releases\n`);

    // Read GeoJSON
    const geojsonData = JSON.parse(fs.readFileSync(GEOJSON_FILE, 'utf8'));
    let points = geojsonData.features.map((f, index) => ({
        index,
        id: f.properties.fid || index,
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
    }));

    if (MAX_POINTS > 0) {
        points = points.slice(0, MAX_POINTS);
    }

    // Create output folder
    if (!fs.existsSync(OUTPUT_FOLDER)) {
        fs.mkdirSync(OUTPUT_FOLDER, { recursive: true });
    }

    const manifest = {
        generated: new Date().toISOString(),
        zoom: ZOOM_LEVEL,
        source: 'Esri Wayback',
        releases: releases,
        points: []
    };

    let totalUnique = 0;
    let totalDuplicates = 0;

    // Download tiles for each point
    for (let p = 0; p < points.length; p++) {
        const point = points[p];
        const tile = latLonToTile(point.lat, point.lon, ZOOM_LEVEL);
        
        const pointFolder = path.join(OUTPUT_FOLDER, `point_${String(point.index).padStart(5, '0')}`);
        if (!fs.existsSync(pointFolder)) {
            fs.mkdirSync(pointFolder, { recursive: true });
        }

        console.log(`📍 Point ${p + 1}/${points.length} (${point.lat.toFixed(4)}, ${point.lon.toFixed(4)})`);

        const pointData = {
            index: point.index,
            lat: point.lat,
            lon: point.lon,
            fid: point.id,
            folder: `point_${String(point.index).padStart(5, '0')}`,
            tiles: []
        };

        const seenHashes = new Map();

        for (let r = 0; r < releases.length; r++) {
            const release = releases[r];
            const filename = `${release.date}.jpg`;
            const filepath = path.join(pointFolder, filename);

            // Skip existing
            if (fs.existsSync(filepath)) {
                const hash = getFileHash(filepath);
                if (seenHashes.has(hash)) {
                    fs.unlinkSync(filepath);
                    totalDuplicates++;
                    continue;
                }
                seenHashes.set(hash, { date: release.date, filename });
                pointData.tiles.push({ date: release.date, filename, m: release.m });
                totalUnique++;
                continue;
            }

            const url = `https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/${release.m}/${tile.z}/${tile.y}/${tile.x}`;

            try {
                await downloadImage(url, filepath);
                
                const hash = getFileHash(filepath);
                if (seenHashes.has(hash)) {
                    fs.unlinkSync(filepath);
                    totalDuplicates++;
                    process.stdout.write(`\r  [${Math.round(((p * releases.length + r + 1) / (points.length * releases.length)) * 100)}%] ${release.date} (dup)`);
                } else {
                    seenHashes.set(hash, { date: release.date, filename });
                    pointData.tiles.push({ date: release.date, filename, m: release.m });
                    totalUnique++;
                    process.stdout.write(`\r  [${Math.round(((p * releases.length + r + 1) / (points.length * releases.length)) * 100)}%] ${release.date} ✓`);
                }
            } catch (err) {
                // Skip failed downloads
            }

            await sleep(DELAY_MS);
        }

        manifest.points.push(pointData);
        console.log(`\n  ✓ ${pointData.tiles.length} unique images\n`);
    }

    // Save manifest
    fs.writeFileSync(path.join(OUTPUT_FOLDER, 'manifest.json'), JSON.stringify(manifest, null, 2));

    console.log('='.repeat(50));
    console.log(`✅ DONE! ${totalUnique} unique tiles, ${totalDuplicates} duplicates removed`);
    console.log(`   Output: ${OUTPUT_FOLDER}/`);
    console.log(`\n   Next: run "node analyze.js" then open index.html\n`);
})();
