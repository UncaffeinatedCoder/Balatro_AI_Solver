/**
 * Balatro AI Assistant - Phase 1 POC
 * Main entry point for screen capture and analysis
 */

const screenshot = require('screenshot-desktop');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  captureInterval: 1000, // Capture every 1 second for POC
  outputDir: path.join(__dirname, '../screenshots'),
  debugMode: true
};

class BalatroCaptureService {
  constructor() {
    this.isRunning = false;
    this.captureCount = 0;
  }

  async initialize() {
    // Create output directory if it doesn't exist
    try {
      await fs.mkdir(CONFIG.outputDir, { recursive: true });
      console.log('✓ Output directory created:', CONFIG.outputDir);
    } catch (error) {
      console.error('Failed to create output directory:', error);
    }
  }

  async captureScreen() {
    try {
      const img = await screenshot({ format: 'png' });
      
      // Save raw screenshot
      const timestamp = Date.now();
      const filename = `capture_${timestamp}.png`;
      const filepath = path.join(CONFIG.outputDir, filename);
      
      await fs.writeFile(filepath, img);
      this.captureCount++;
      
      console.log(`[${new Date().toLocaleTimeString()}] Captured screenshot #${this.captureCount}: ${filename}`);
      
      // Process the image
      await this.processImage(img, timestamp);
      
      return filepath;
    } catch (error) {
      console.error('Screenshot capture failed:', error.message);
      return null;
    }
  }

  async processImage(imageBuffer, timestamp) {
    try {
      // Get image metadata
      const metadata = await sharp(imageBuffer).metadata();
      console.log(`  → Image size: ${metadata.width}x${metadata.height}`);
      
      // Create a thumbnail for quick inspection
      const thumbPath = path.join(CONFIG.outputDir, `thumb_${timestamp}.png`);
      await sharp(imageBuffer)
        .resize(400, null, { fit: 'inside' })
        .toFile(thumbPath);
      
      // TODO: Add card detection here in Phase 2
      // For now, just analyze basic image properties
      const stats = await sharp(imageBuffer).stats();
      console.log(`  → Detected ${stats.channels.length} color channels`);
      
    } catch (error) {
      console.error('Image processing failed:', error.message);
    }
  }

  async start() {
    if (this.isRunning) {
      console.log('⚠ Capture service is already running');
      return;
    }

    console.log('\n🎮 Balatro AI Assistant - Phase 1 POC');
    console.log('=====================================');
    console.log('Starting screen capture service...\n');
    
    await this.initialize();
    
    this.isRunning = true;
    
    // Initial capture
    await this.captureScreen();
    
    // Set up interval for continuous capture
    this.intervalId = setInterval(async () => {
      if (this.isRunning) {
        await this.captureScreen();
      }
    }, CONFIG.captureInterval);
    
    console.log(`\n✓ Capture service started (${CONFIG.captureInterval}ms interval)`);
    console.log('Press Ctrl+C to stop\n');
  }

  async stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('\n✓ Capture service stopped');
    console.log(`Total captures: ${this.captureCount}`);
  }
}

// Main execution
async function main() {
  const captureService = new BalatroCaptureService();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\nReceived interrupt signal...');
    await captureService.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    await captureService.stop();
    process.exit(0);
  });
  
  // Start the service
  await captureService.start();
}

// Run if this is the main module
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { BalatroCaptureService };
