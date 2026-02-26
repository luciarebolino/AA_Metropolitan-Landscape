# Satellite Vegetation Analysis

This tool downloads satellite imagery for geographic coordinates and analyzes vegetation content.


## Requirements

- macOS or Windows computer
- Internet connection


## Step 1: Install Node.js

1. Go to https://nodejs.org
2. Download the LTS version (left button)
3. Open the downloaded file and follow the installation steps
4. Restart your computer after installation


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


## Troubleshooting

Problem: "node: command not found"
Solution: Restart VS Code after installing Node.js. If still not working, restart your computer.

Problem: Images not loading in browser
Solution: Make sure you opened index.html with Live Server, not by double-clicking the file.

Problem: No images downloaded
Solution: Check your internet connection. Some areas may have limited historical imagery available.


## Notes

- Satellite imagery comes from Esri Wayback (free, no API key needed)
- Historical imagery availability varies by location
- Rural or remote areas may have fewer historical dates
- The vegetation detection highlights pixels where green dominates