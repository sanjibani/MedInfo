import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = path.join(__dirname, '../public/screenshots');

async function capture() {
    if (!fs.existsSync(SCREENSHOT_DIR)) {
        fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }

    console.log('📸 Launching browser...');
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    // Mobile Viewport
    await page.setViewport({ width: 393, height: 852, isMobile: true });

    try {
        console.log(`Navigating to ${BASE_URL}...`);
        await page.goto(BASE_URL, { waitUntil: 'networkidle0' });

        // Wait for render
        await new Promise(r => setTimeout(r, 2000));

        const filePath = path.join(SCREENSHOT_DIR, 'landing-mobile.png');
        await page.screenshot({ path: filePath, fullPage: true });
        console.log(`✅ Captured: ${filePath}`);

    } catch (err) {
        console.error('❌ Error capturing screenshot:', err);
    } finally {
        await browser.close();
    }
}

capture();
