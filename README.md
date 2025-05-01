# Neuralink Webgrid Game Clicker

An automated clicker script specifically designed for the Neuralink Webgrid game (https://neuralink.com/webgrid/). This script detects and clicks blue cells in the game grid automatically, with visual debugging features.

## Features

- Automatic detection of blue cells using color analysis
- Precise grid-based clicking using pointer events
- Visual debug overlay showing detected cells and click positions
- Configurable settings for detection and click intervals
- Real-time click counting and logging

## Usage

### Quick Start

1. Open the Neuralink Webgrid game in your browser
2. Open the browser's Developer Console (usually F12 or Ctrl+Shift+I)
3. Copy and paste the entire script into the console
4. The auto-clicker will start automatically

### Available Commands

```javascript
// Stop the auto-clicker
stopWebgridClicker()

// Start the auto-clicker with custom interval (in milliseconds)
startWebgridClicker(200)

// Scan for blue cells without clicking
findWebgridBlueCell()

// Perform a single click on the detected blue cell
clickWebgridBlueCell()
```

### Configuration

You can update the configuration using the `updateWebgridConfig()` function:

```javascript
updateWebgridConfig({
    redMax: 30,            // Max red for blue detection
    greenMax: 150,         // Max green for blue detection
    blueMin: 150,          // Min blue for blue detection
    gridSize: 30,          // Grid size (30x30 for standard game)
    clickInterval: 200,    // Milliseconds between clicks
    showDebug: true        // Show visual debugging overlay
})
```

## Technical Details

### Color Detection

The script is specifically tuned to detect the Neuralink game's blue color (RGB: 10, 132, 255). The detection parameters can be adjusted through the configuration.

### Grid System

- Works with the standard 30x30 grid
- Calculates cell centers for precise clicking
- Uses canvas image analysis for detection

### Click Implementation

- Uses `PointerEvent` for primary interaction
- Falls back to `MouseEvent` for compatibility
- Matches the game's native event handling

### Debug Overlay

- Shows detected blue pixels
- Highlights identified grid cells
- Displays click positions and coordinates
- Uses semi-transparent overlay for visibility

## Notes

- The script is designed to work with the official Neuralink Webgrid game
- Performance may vary based on browser and system capabilities
- The visual debug overlay can be toggled off for better performance

## Troubleshooting

If the script isn't working:

1. Make sure you're on the correct game page
2. Check if the canvas element is properly detected
3. Verify that the Developer Console shows no errors
4. Try refreshing the page and reapplying the script

## Disclaimer

This script is for educational purposes only. Use according to the game's terms of service and usage policies.
