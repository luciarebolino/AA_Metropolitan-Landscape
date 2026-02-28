# AA Metropolitan Landscape - Workshop

## Overview

**Goal**: Identify vegetation and study environmental changes using visual satellite analysis as an indicator.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ENVIRONMENTAL ANALYSIS                              │
│                                                                             │
│                    ┌──────────────────────────┐                             │
│                    │   SATELLITE IMAGERY      │                             │
│                    │   + POINT DATA           │                             │
│                    └───────────┬──────────────┘                             │
│                                │                                            │
│              ┌─────────────────┴─────────────────┐                          │
│              ▼                                   ▼                          │
│   ┌──────────────────────┐            ┌──────────────────────┐              │
│   │   TECHNIQUE 1        │            │   TECHNIQUE 2        │              │
│   │   Remote Sensing     │            │   Point Data         │              │
│   │   NDVI Analysis      │            │   Collection         │              │
│   └──────────┬───────────┘            └──────────┬───────────┘              │
│              │                                   │                          │
│              ▼                                   ▼                          │
│   ┌──────────────────────┐            ┌──────────────────────┐              │
│   │  Google Earth Engine │            │  OpenStreetMap (OSM) │              │
│   │  + QGIS Processing   │            │  + Overpass API      │              │
│   └──────────────────────┘            └──────────────────────┘              │
│                                                                             │
│              └─────────────────┬─────────────────┘                          │
│                                ▼                                            │
│                    ┌──────────────────────────┐                             │
│                    │   VEGETATION MAPPING     │                             │
│                    │   & CHANGE DETECTION     │                             │
│                    └──────────────────────────┘                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Technique 1: Remote Sensing with NDVI

**NDVI (Normalized Difference Vegetation Index)** is a numerical indicator that uses the visible and near-infrared bands of the electromagnetic spectrum to analyze whether an area contains live green vegetation.

**Formula:**
$$NDVI = \frac{NIR - RED}{NIR + RED}$$

Where:
- **NIR** = Near-Infrared reflectance
- **RED** = Red light reflectance

**Values range from -1 to +1:**
- **-1 to 0**: Water, snow, clouds, bare soil
- **0 to 0.2**: Bare rock, sand, or dead vegetation
- **0.2 to 0.5**: Sparse vegetation, shrubs, grassland
- **0.5 to 1**: Dense, healthy vegetation (forests, crops)

We use **Google Earth Engine (GEE)** scripts to calculate NDVI from satellite imagery and **QGIS** to process and visualize vegetation point data.

### Technique 2: Point Data Collection with OSM

**[OpenStreetMap (OSM)](https://wiki.openstreetmap.org/wiki/Map_features)** is a collaborative, open-source project that creates a free editable map of the world. Contributors worldwide map roads, buildings, land use, and natural features, making it a rich source of geospatial data.

To programmatically extract specific vegetation data, we use the **[Overpass API](https://overpass-turbo.eu/)** — a powerful query tool that allows us to filter and download OSM data based on custom criteria (e.g., parks, forests, grasslands).


## References

- [Laura Kurgan](https://c4sr.columbia.edu/projects/plain-sight)
- [CSR - Conflict Urbanism](https://centerforspatialresearch.github.io/conflict_urbanism_sp2023/2023/04/28/Those-Who-Live-and-Travel-in-the-Dark.html)
- [Robert Pietrusko](https://www.warning-office.org/wo-test-sites)
- [Sam Lavigne](https://lav.io/projects/street-views/)
- [James Bridle](https://jamesbridle.com/works/every-cctv-camera-cc)
- [Clement Valla](https://clementvalla.com/work/postcards-from-google-earth/)
- [Dan Miller](https://dl.acm.org/doi/10.1145/3715668.3736392#:~:text=As%20we%20Witness%20the%20unraveling,stored%20the%20files%20%5B9%5D.)
- [Mario Santamaria](https://www.mariosantamaria.net/Emerald-black-latency/)
- [Simon Weckert](https://www.simonweckert.com/googlemapshacks.html)
- [Jenny Odell](https://www.jennyodell.com/satellite-landscapes.html)
- [Josh Begley](https://joshbegley.com/)
- [WTTDOTM](https://trafficcamphotobooth.com/animenyc.html)
- [Tatu Gustaffsson](https://stanisland.com/2024/10/08/tatu-gustaffsson-cctv-project-finland/)

---


## HOW TO GET DATA

### OpenStreetMap (OSM) 
- **OpenStreetMap (OSM)**: OpenStreetMap (OSM) is a dynamic, collaborative project to build a freely editable map of the world. It serves as an excellent source of geospatial data, enriched by a global community of mappers. The open-source nature of OSM means that while the data is rich and diverse, its accuracy and detail can vary, thus it shouldn't be solely relied upon for critical data needs. For our workshop, OSM is a valuable starting point to understand geographical locations and examine landforms.
  
- **Overpass API**: To delve deeper and extract specific features or points based on tailored criteria, we use the [Overpass API](https://overpass-turbo.eu/). This powerful tool enables the definition of custom queries to fetch detailed information from OSM, which can then be directly imported into QGIS for enriched analysis.

#### Vegetation and Green Spaces Query
```query
[out:json][timeout:90];
(
  // leisure green spaces
  nwr["leisure"~"^(park|garden|recreation_ground|nature_reserve|common|village_green|golf_course)$"]({{bbox}});

  // natural vegetation types
  nwr["natural"~"^(wood|grassland|scrub|heath|fell|wetland)$"]({{bbox}});

  // landuse vegetated/managed green
  nwr["landuse"~"^(forest|meadow|grass|orchard|vineyard|plant_nursery)$"]({{bbox}});

  // landcover (if present)
  nwr["landcover"~"^(trees|grass|forest|meadow|scrub|heath)$"]({{bbox}});

  // optional: some cemeteries read as green in many contexts
  nwr["landuse"="cemetery"]({{bbox}});
  nwr["amenity"="grave_yard"]({{bbox}});
);
out tags geom;
out center;
```

This query retrieves various types of vegetation and green spaces including:
- **Leisure**: parks, gardens, recreation grounds, nature reserves, village greens, golf courses
- **Natural**: woods, grasslands, scrub, heath, fell, wetlands
- **Landuse**: forests, meadows, grass, orchards, vineyards, plant nurseries
- **Landcover**: trees, grass, forest, meadow, scrub, heath
- **Cemeteries**: often appear as green spaces in many contexts


### Google Earth Engine (GEE)

**Google Earth Engine** is a cloud-based platform for planetary-scale geospatial analysis. It provides access to satellite imagery (Sentinel-2, Landsat, etc.) and powerful computing infrastructure for processing.

**[Open the NDVI Script in GEE →](https://code.earthengine.google.com/f788883e7a593c25ccee357b8ceaba72)**

#### NDVI Analysis Script

```javascript
// ========== AREA OF INTEREST ==========
var region = geometry; // use your drawn/imported geometry

// ========== SETTINGS ==========
var NDVI_THR = 0.3;          // vegetation threshold
var CLOUD_PCT = 20;          // max scene cloudiness filter
var START = '2024-09-01';    // change if needed
var END   = '2024-10-01';    // change if needed

// ========== VISUALIZATION ==========
var trueColorParams = {bands: ['B4','B3','B2'], min: 0.05, max: 0.35, gamma: 1.1};
var ndviParams = {
  min: -1, max: 1,
  palette: ['#800026','#e31a1c','#fd8d3c','#f7f7f7','#78c679','#006837']
};
var vegMaskColor = {palette: ['#00ff00']};

// ========== CLOUD MASK (smart: QA60 if present, else MSK_CLASSI*) ==========
function maskCloudsSmart(img) {
  var bands = img.bandNames();
  var hasQA60 = bands.contains('QA60');

  var withQA = ee.Image(function() {
    var qa = img.select('QA60');
    var cloud  = qa.bitwiseAnd(1 << 10).neq(0);
    var cirrus = qa.bitwiseAnd(1 << 11).neq(0);
    return img.updateMask(cloud.or(cirrus).not());
  }());

  var withMSK = ee.Image(function() {
    // may not exist for all S2 collections/versions, but kept as fallback
    var opaque = img.select('MSK_CLASSI_OPAQUE');
    var cirrus = img.select('MSK_CLASSI_CIRRUS');
    var snow   = img.select('MSK_CLASSI_SNOW_ICE');
    return img.updateMask(opaque.eq(0).and(cirrus.eq(0)).and(snow.eq(0)));
  }());

  return ee.Image(ee.Algorithms.If(hasQA60, withQA, withMSK));
}

// ========== BUILD NDVI + VEGETATION MASK ==========
function addNdvi(img) {
  var scaled = img.divide(10000);
  var ndvi = scaled.normalizedDifference(['B8','B4']).rename('ndvi');
  var vegMask = ndvi.gte(NDVI_THR).rename('veg_mask');
  return scaled.addBands([ndvi, vegMask]).select(['B4','B3','B2','ndvi','veg_mask']);
}

// Sentinel-2 collection (simple median composite)
var s2 = ee.ImageCollection('COPERNICUS/S2')
  .filterBounds(region)
  .filterDate(START, END)
  .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', CLOUD_PCT)
  .map(maskCloudsSmart)
  .map(addNdvi);

var composite = s2.median().clip(region);

var ndvi = composite.select('ndvi');
var vegMask = composite.select('veg_mask');           // 0/1
var vegMaskVis = vegMask.selfMask();                 // for display (only shows 1s)

// ========== MAP ==========
Map.centerObject(region, 10);
Map.addLayer(composite.select(['B4','B3','B2']), trueColorParams, 'True Color', false);
Map.addLayer(ndvi, ndviParams, 'NDVI', true);
Map.addLayer(vegMaskVis, vegMaskColor, 'Vegetation Mask (NDVI ≥ ' + NDVI_THR + ')', true);

// ========== EXPORTS ==========
// Shorter NDVI export
Export.image.toDrive({
  image: ndvi,
  description: 'NDVI_' + START,
  folder: 'EarthEngineExports',
  fileNamePrefix: 'NDVI_' + START,
  scale: 10,
  region: region,
  fileFormat: 'GeoTIFF',
  formatOptions: {cloudOptimized: true},
  maxPixels: 1e13
});

// Shorter vegetation mask export
Export.image.toDrive({
  image: vegMask,
  description: 'VM_' + START,
  folder: 'EarthEngineExports',
  fileNamePrefix: 'VM_' + START,
  scale: 10,
  region: region,
  fileFormat: 'GeoTIFF',
  formatOptions: {cloudOptimized: true},
  maxPixels: 1e13
});

Export.image.toDrive({
  image: composite.select(['B4','B3','B2']),
  description: 'RGB_' + START,
  folder: 'EarthEngineExports',
  fileNamePrefix: 'RGB_' + START,
  scale: 10,
  region: region,
  fileFormat: 'GeoTIFF',
  formatOptions: {cloudOptimized: true},
  maxPixels: 1e13
});
```

**How to use:**
1. Open the script link above (requires a Google Earth Engine account)
2. Draw a geometry on the map or import your area of interest
3. Adjust `START` and `END` dates as needed
4. Adjust `NDVI_THR` threshold (0.3 is a good default for vegetation)
5. Click **Run** to visualize NDVI and vegetation mask
6. Use the **Tasks** tab to export GeoTIFFs to Google Drive


### Esri Wayback (Historical Satellite Imagery)

**[Esri Wayback](https://livingatlas.arcgis.com/wayback/)** is a digital archive of the World Imagery basemap, maintained by Esri. It preserves snapshots of satellite and aerial imagery captured at different points in time, allowing users to explore how locations have changed visually.

**Why we use Esri Wayback:**
- **Free access** — No API key or account required
- **Historical archive** — Access imagery from multiple dates (some locations have 50+ versions dating back to 2014)
- **Global coverage** — Consistent worldwide imagery from commercial satellites
- **Web tile format** — Easy to download programmatically at various zoom levels
- **Change detection** — Compare the same location across different time periods to observe vegetation loss, urban expansion, or environmental changes

**How it works:**
1. Esri updates the World Imagery basemap periodically with new satellite captures
2. Each time they update, Wayback saves the previous version as a timestamped snapshot
3. Our `download.js` script queries the Wayback API to find all available dates for each coordinate
4. It downloads the tile images for each date, creating a time series for visual analysis

**Limitations:**
- Not all locations have the same number of historical captures
- Urban and populated areas typically have more frequent updates
- Rural or remote areas may have fewer dates available
- Image quality and cloud cover vary by capture date


## Requirements

- macOS or Windows computer
- Internet connection


## Step 1: Install Node.js

### macOS

**Option A: Using Homebrew (recommended)**

If you don't have Homebrew, install it first:
1. Open Terminal
2. Run:
```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Then install Node.js:
```
brew install node
```

**Option B: Manual download**
1. Go to https://nodejs.org
2. Download the macOS installer (LTS version)
3. Open the .pkg file and follow the installation steps

### Windows

**Option A: Using winget**

Open PowerShell (as Administrator) and run:
```
winget install OpenJS.NodeJS.LTS
```

**Option B: Manual download**
1. Go to https://nodejs.org
2. Download the Windows installer (LTS version)
3. Run the .msi file and follow the installation steps


## Step 2: Install Visual Studio Code

1. Go to https://code.visualstudio.com
2. Download and install VS Code
3. Open VS Code


## Step 3: Install Live Server Extension

1. In VS Code, click the Extensions icon in the left sidebar (four squares icon)
2. Search for "Live Server"
3. Click Install on "Live Server" by Ritwick Dey


## Step 4: Open the Project

1. In VS Code, go to File > Open Folder
2. Select the AA_Metropolitan-Landscape folder
3. Click Open


## Step 5: Install Dependencies

1. In VS Code, go to Terminal > New Terminal
2. A terminal panel will open at the bottom
3. Type the following command and press Enter:

```
npm install
```

4. Wait for the installation to complete


## Step 6: Configure Your Points

Open the file `points.geojson` to see the coordinates. Each point has:
- longitude (first number)
- latitude (second number)

You can replace this file with your own GeoJSON points.


## Step 7: Download Satellite Images

In the terminal, type:

```
node download.js
```

This downloads historical satellite imagery from Esri Wayback for each point.

To change the zoom level, open `download.js` and edit line 13:
- Zoom 18 = building level (default)
- Zoom 17 = block level
- Zoom 16 = neighborhood level


## Step 8: Analyze Vegetation

In the terminal, type:

```
node analyze.js
```

This calculates the percentage of green/vegetation pixels in each image.


## Step 9: View Results

1. In the VS Code file explorer (left sidebar), right-click on `index.html`
2. Select "Open with Live Server"
3. A browser window will open showing your satellite grid

Controls:
- Drag the slider to change the date
- Use arrow keys (left/right) to step through dates
- Hover on an image to see the vegetation highlight
- Click an image to see details and coordinates
- Pinch trackpad to zoom in/out


## File Structure

```
AA_Metropolitan-Landscape/
  points.geojson    - Your coordinate points
  download.js       - Downloads satellite tiles
  analyze.js        - Calculates vegetation percentage
  index.html        - Web viewer
  tiles/            - Downloaded images (created after download)
```


## Notes

- Satellite imagery comes from Esri Wayback (free, no API key needed)
- Historical imagery availability varies by location
- Rural or remote areas may have fewer historical dates
- The vegetation detection highlights pixels where green dominates