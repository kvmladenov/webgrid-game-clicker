// Fun little project
// Neuralink Webgrid Game Clicker - https://neuralink.com/webgrid/
// Special version specifically for the Neuralink Webgrid game

(function() {
  console.log('Starting Neuralink Webgrid Game Clicker');
  
  // Configuration
  const config = {
    // Detection settings - tuned for the Neuralink game's blue (10, 132, 255)
    redMax: 30,            // Max red for blue detection  
    greenMax: 150,         // Max green for blue detection
    blueMin: 150,          // Min blue for blue detection
    
    // Game specifics
    gridSize: 30,          // 30x30 grid size for the standard game
    
    // Click settings
    clickInterval: 200,    // Ms between clicks
    showDebug: true        // Show visual debugging overlay
  };
  
  // Debug overlay
  let debugOverlay, debugCtx;
  
  // Function to get canvas based on class names from the source code
  function getGameCanvas() {
    // These class names were found in the game source code
    return document.querySelector('canvas.canvas_bdugn_22, canvas._canvas_bdugn_22, canvas'); 
  }
  
  // Setup debug overlay
  function setupDebugOverlay() {
    // Remove any existing overlay
    const existing = document.getElementById('webgrid-debug-overlay');
    if (existing) {
      existing.remove();
    }
    
    // Create new overlay
    debugOverlay = document.createElement('canvas');
    debugOverlay.id = 'webgrid-debug-overlay';
    debugOverlay.style.position = 'fixed';
    debugOverlay.style.top = '0';
    debugOverlay.style.left = '0';
    debugOverlay.style.zIndex = '9999';
    debugOverlay.style.pointerEvents = 'none'; // Don't intercept clicks
    debugOverlay.style.border = '2px solid red';
    debugOverlay.style.opacity = '0.7';
    document.body.appendChild(debugOverlay);
    
    // Size and position overlay to match game canvas
    const gameCanvas = getGameCanvas();
    if (gameCanvas) {
      const rect = gameCanvas.getBoundingClientRect();
      debugOverlay.width = rect.width;
      debugOverlay.height = rect.height;
      debugOverlay.style.top = rect.top + 'px';
      debugOverlay.style.left = rect.left + 'px';
    } else {
      console.error('Game canvas not found for overlay positioning');
      return null;
    }
    
    debugCtx = debugOverlay.getContext('2d');
    return debugCtx;
  }
  
  // Clear debug overlay
  function clearDebugOverlay() {
    if (debugCtx) {
      debugCtx.clearRect(0, 0, debugOverlay.width, debugOverlay.height);
    }
  }
  
  // Mark a position on debug overlay
  function markPosition(x, y, color, size = 10, label) {
    if (!debugCtx) return;
    
    // Draw circle
    debugCtx.beginPath();
    debugCtx.arc(x, y, size, 0, 2 * Math.PI);
    debugCtx.fillStyle = color || 'rgba(255, 0, 0, 0.5)';
    debugCtx.fill();
    
    // Add label if provided
    if (label) {
      debugCtx.font = '14px Arial';
      debugCtx.fillStyle = 'white';
      debugCtx.textAlign = 'center';
      debugCtx.fillText(label, x, y - size - 5);
    }
  }
  
  // Find the blue cell
  function findBlueCell() {
    const canvas = getGameCanvas();
    if (!canvas) {
      console.error('Game canvas not found');
      return null;
    }
    
    // Clear debug overlay
    if (config.showDebug) {
      setupDebugOverlay();
      clearDebugOverlay();
    }
    
    try {
      // Get canvas image data
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const width = canvas.width;
      const height = canvas.height;
      console.log(`Canvas dimensions: ${width}x${height}`);
      
      // Get whole canvas data
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      
      // Looking specifically for the Neuralink blue color from source code: RGB(10, 132, 255)
      // The source code shows this is the exact color used for the target
      const bluePixels = [];
      
      // Scan for blue pixels
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const index = (y * width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          
          // Check if this matches the game's blue color
          if (r <= config.redMax && g <= config.greenMax && b >= config.blueMin) {
            bluePixels.push({
              x, y, r, g, b,
              score: b - Math.max(r, g) // How "blue" the pixel is
            });
            
            // Mark on debug overlay
            if (config.showDebug) {
              // Use small blue dots for detected pixels
              debugCtx.fillStyle = 'rgba(0, 0, 255, 0.3)';
              debugCtx.fillRect(x, y, 1, 1);
            }
          }
        }
      }
      
      console.log(`Found ${bluePixels.length} blue pixels`);
      
      if (bluePixels.length === 0) {
        console.log('No blue pixels found');
        return null;
      }
      
      // Calculate grid cell size - the game source shows it divides canvas width by gridSize
      const cellSize = width / config.gridSize;
      
      // Group pixels by grid cell
      const cells = {};
      for (const pixel of bluePixels) {
        const cellX = Math.floor(pixel.x / cellSize);
        const cellY = Math.floor(pixel.y / cellSize);
        const key = `${cellX},${cellY}`;
        
        if (!cells[key]) {
          cells[key] = {
            cellX, cellY,
            pixels: [],
            totalScore: 0
          };
        }
        
        cells[key].pixels.push(pixel);
        cells[key].totalScore += pixel.score;
      }
      
      // Find the cell with the most blue score
      let bestCell = null;
      let bestScore = 0;
      
      for (const key in cells) {
        const cell = cells[key];
        if (cell.totalScore > bestScore) {
          bestScore = cell.totalScore;
          bestCell = cell;
        }
      }
      
      if (bestCell) {
        // Calculate the center of the cell (this is critical based on the game source)
        // The game draws the blue square by calculating the cell center
        const centerX = (bestCell.cellX + 0.5) * cellSize;
        const centerY = (bestCell.cellY + 0.5) * cellSize;
        
        console.log(`Found blue cell at grid (${bestCell.cellX+1}, ${bestCell.cellY+1})`);
        console.log(`Cell center at pixels (${centerX.toFixed(1)}, ${centerY.toFixed(1)})`);
        
        // Mark on debug overlay
        if (config.showDebug) {
          // Draw cell outline
          debugCtx.strokeStyle = 'yellow';
          debugCtx.lineWidth = 2;
          debugCtx.strokeRect(
            bestCell.cellX * cellSize,
            bestCell.cellY * cellSize,
            cellSize,
            cellSize
          );
          
          // Mark center
          markPosition(centerX, centerY, 'red', 5, `(${bestCell.cellX+1},${bestCell.cellY+1})`);
        }
        
        // Sample a blue pixel for debugging
        const samplePixel = bestCell.pixels[0];
        console.log(`Sample blue pixel RGB: (${samplePixel.r}, ${samplePixel.g}, ${samplePixel.b})`);
        
        return {
          cellX: bestCell.cellX,
          cellY: bestCell.cellY,
          centerX,
          centerY,
          pixelCount: bestCell.pixels.length
        };
      }
      
      return null;
    } catch (e) {
      console.error('Error analyzing canvas:', e);
      return null;
    }
  }

  // Click a position using the correct event for this game
  function clickPosition(x, y) {
    const canvas = getGameCanvas();
    if (!canvas) {
      console.error('Canvas not found for clicking');
      return false;
    }
    
    try {
      // Get screen coordinates
      const rect = canvas.getBoundingClientRect();
      const clientX = rect.left + (x / canvas.width) * rect.width;
      const clientY = rect.top + (y / canvas.height) * rect.height;
      
      console.log(`Clicking at canvas(${x}, ${y}), screen(${clientX.toFixed(1)}, ${clientY.toFixed(1)})`);
      
      // Based on the game source code, it uses pointerup events for detection
      // This is the key difference - we need to use pointerup, not click events
      const pointerEvent = new PointerEvent('pointerup', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: clientX,
        clientY: clientY,
        screenX: clientX,
        screenY: clientY,
        button: 0,
        buttons: 0,
        pointerId: 1,
        pointerType: 'mouse'
      });
      
      // Dispatch to the canvas
      canvas.dispatchEvent(pointerEvent);
      
      // Additional click event as fallback
      canvas.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: clientX,
        clientY: clientY
      }));
      
      return true;
    } catch (e) {
      console.error('Error clicking:', e);
      return false;
    }
  }
  
  // Find and click the blue cell
  function clickBlueCell() {
    const blueCell = findBlueCell();
    if (!blueCell) {
      console.log('No blue cell found');
      return false;
    }
    
    // Click at the center of the blue cell
    return clickPosition(blueCell.centerX, blueCell.centerY);
  }
  
  // Auto-clicker function
  function startAutoClicker(intervalMs) {
    intervalMs = intervalMs || config.clickInterval;
    
    // Clear any existing interval
    if (window.webgridClickerInterval) {
      clearInterval(window.webgridClickerInterval);
    }
    
    console.log(`Starting auto-clicker with interval ${intervalMs}ms`);
    
    // Click counter
    window.clickCount = 0;
    
    // Set up interval
    window.webgridClickerInterval = setInterval(() => {
      const success = clickBlueCell();
      if (success) {
        window.clickCount++;
        console.log(`Click count: ${window.clickCount}`);
      }
    }, intervalMs);
    
    console.log('Auto-clicker running. To stop: stopWebgridClicker()');
  }
  
  // Stop auto-clicker
  function stopAutoClicker() {
    if (window.webgridClickerInterval) {
      clearInterval(window.webgridClickerInterval);
      console.log(`Auto-clicker stopped. Total clicks: ${window.clickCount || 0}`);
    } else {
      console.log('No auto-clicker running');
    }
  }
  
  // Update configuration
  function updateConfig(newConfig) {
    Object.assign(config, newConfig);
    console.log('Configuration updated:', config);
  }
  
  // Make functions globally available
  window.findWebgridBlueCell = findBlueCell;
  window.clickWebgridBlueCell = clickBlueCell;
  window.startWebgridClicker = startAutoClicker;
  window.stopWebgridClicker = stopAutoClicker;
  window.updateWebgridConfig = updateConfig;
  
  // Automatically start
  console.log('Running initial scan...');
  findBlueCell();
  
  // Start auto-clicker
  startAutoClicker();
  
  // Show instructions
  console.log(`
  =================================
  NEURALINK WEBGRID GAME CLICKER
  =================================
  
  Auto-clicker is running. Visual debug overlay shows detected blue cells.
  
  Commands:
  - stopWebgridClicker() - Stop the auto-clicker
  - startWebgridClicker(200) - Start with custom interval (ms)
  - findWebgridBlueCell() - Scan without clicking
  - clickWebgridBlueCell() - Click once
  
  The script uses pointerup events to match the game's code.
  `);
  
})();
