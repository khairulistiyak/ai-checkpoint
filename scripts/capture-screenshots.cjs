const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const assetsDir = path.resolve(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

function capturePage(url, outputPath, delayMs = 3500) {
  return new Promise((resolve, reject) => {
    const port = 9333 + Math.floor(Math.random() * 100);
    const chrome = spawn(chromePath, [
      '--headless=new',
      `--remote-debugging-port=${port}`,
      '--hide-scrollbars',
      '--window-size=1440,900',
      '--force-device-scale-factor=2',
      url
    ], { stdio: 'ignore' });

    setTimeout(async () => {
      try {
        const list = await fetch(`http://localhost:${port}/json/list`).then(r => r.json());
        const page = list.find(t => t.type === 'page');
        if (!page || !page.webSocketDebuggerUrl) throw new Error('Page target not found');

        const ws = new WebSocket(page.webSocketDebuggerUrl);
        ws.onopen = () => {
          ws.send(JSON.stringify({ id: 1, method: 'Page.captureScreenshot', params: { format: 'png' } }));
        };
        ws.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.id === 1 && msg.result && msg.result.data) {
            fs.writeFileSync(outputPath, Buffer.from(msg.result.data, 'base64'));
            ws.close();
            chrome.kill();
            resolve();
          }
        };
        ws.onerror = (e) => {
          chrome.kill();
          reject(e);
        };
      } catch (err) {
        chrome.kill();
        reject(err);
      }
    }, delayMs);
  });
}

async function main() {
  await capturePage('http://localhost:20226', path.join(assetsDir, 'ui-multiproject.png'), 3000);
  await capturePage('http://localhost:20226/#/project/1785648558108', path.join(assetsDir, 'ui-cockpit.png'), 3500);
  await capturePage('http://localhost:20226/#/project/1785648558108/plans/progress', path.join(assetsDir, 'ui-plans.png'), 3500);
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
