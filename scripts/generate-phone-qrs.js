import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';

const urls = [
  {
    id: 'lan-https',
    name: 'Local Wi-Fi (HTTPS - Camera Enabled)',
    url: 'https://192.168.29.187:5174',
    filename: 'qr-lan-https',
  },
  {
    id: 'lan-http',
    name: 'Local Wi-Fi (HTTP)',
    url: 'http://192.168.29.187:5173',
    filename: 'qr-lan-http',
  },
  {
    id: 'tunnel-https',
    name: 'Live Public HTTPS Tunnel',
    url: 'https://light-rivers-warn.loca.lt',
    filename: 'qr-tunnel-https',
  },
  {
    id: 'cloudflare-pages',
    name: 'Cloudflare Pages Live URL',
    url: 'https://cancer-awareness-qr.pages.dev',
    filename: 'qr-cloudflare-pages',
  },
];

const publicQrDir = path.resolve('public/qr');
const artifactDir = '/Users/hs3p33d/.gemini/antigravity-ide/brain/64e978cd-bc67-4497-b78f-8dbb943e4c76';

if (!fs.existsSync(publicQrDir)) {
  fs.mkdirSync(publicQrDir, { recursive: true });
}
if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, { recursive: true });
}

async function run() {
  console.log('Generating high-contrast QR codes for physical phone testing...\n');

  for (const item of urls) {
    // 1. Generate PNG (512x512 with Level H error correction)
    const pngPathProject = path.join(publicQrDir, `${item.filename}.png`);
    const pngPathArtifact = path.join(artifactDir, `${item.filename}.png`);
    await QRCode.toFile(pngPathProject, item.url, {
      width: 512,
      margin: 4,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    });
    fs.copyFileSync(pngPathProject, pngPathArtifact);

    // 2. Generate SVG (vector)
    const svgPathProject = path.join(publicQrDir, `${item.filename}.svg`);
    const svgPathArtifact = path.join(artifactDir, `${item.filename}.svg`);
    const svgString = await QRCode.toString(item.url, {
      type: 'svg',
      width: 512,
      margin: 4,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    });
    fs.writeFileSync(svgPathProject, svgString, 'utf-8');
    fs.writeFileSync(svgPathArtifact, svgString, 'utf-8');

    // 3. Generate terminal ASCII / Unicode block QR
    const terminalQr = await QRCode.toString(item.url, {
      type: 'terminal',
      small: true,
    });

    console.log(`====================================================`);
    console.log(`📱 ${item.name}`);
    console.log(`URL: ${item.url}`);
    console.log(`PNG: ${pngPathProject}`);
    console.log(`SVG: ${svgPathProject}`);
    console.log(`Scan this QR code from your phone:`);
    console.log(terminalQr);
    console.log(`\n`);
  }
}

run().catch(console.error);
