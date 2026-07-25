const fs = require('fs');
const http = require('http');
const path = require('path');
const { exec, execSync } = require('child_process');
const dns = require('dns');
const https = require('https');

console.log('========================================================');
console.log('  ENGLISHERS CLUB - SMART AUTO UPDATE CHECKER');
console.log('========================================================');

// Start temporary splash server on port 3001 and open browser
const splashHtmlPath = path.join(__dirname, '..', 'public', 'splash.html');
const logoPath = path.join(__dirname, '..', 'horizontal logo.png');

let splashServer = null;
try {
    splashServer = http.createServer((req, res) => {
        if (req.url === '/horizontal%20logo.png' || req.url === '/horizontal logo.png') {
            if (fs.existsSync(logoPath)) {
                res.writeHead(200, { 'Content-Type': 'image/png' });
                return res.end(fs.readFileSync(logoPath));
            }
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(splashHtmlPath));
    });

    splashServer.listen(3001, () => {
        console.log('[INFO] تم فتح صفحة التحميل الذكية على المتصفح (http://localhost:3001)...');
        if (process.platform === 'darwin') {
            exec('open http://localhost:3001');
        } else if (process.platform === 'win32') {
            exec('start http://localhost:3001');
        } else {
            exec('xdg-open http://localhost:3001');
        }
    });
} catch (e) {
    console.log('[INFO] Splash server note:', e.message);
}

console.log('[INFO] جاري فحص الاتصال بالشبكة والإنترنت (مهلة 10 ثوانٍ)...');

// Function to check internet connectivity with a 10s timeout
function checkInternet(timeoutMs = 10000) {
    return new Promise((resolve) => {
        let finished = false;

        const timer = setTimeout(() => {
            if (!finished) {
                finished = true;
                resolve(false);
            }
        }, timeoutMs);

        // Attempt DNS resolution for github.com
        dns.lookup('github.com', (err) => {
            if (finished) return;
            if (!err) {
                finished = true;
                clearTimeout(timer);
                resolve(true);
            } else {
                // Fallback attempt HTTPS request to github.com
                const req = https.get('https://github.com', { timeout: 4000 }, () => {
                    if (finished) return;
                    finished = true;
                    clearTimeout(timer);
                    resolve(true);
                });
                req.on('error', () => {
                    if (finished) return;
                    finished = true;
                    clearTimeout(timer);
                    resolve(false);
                });
                req.on('timeout', () => {
                    req.destroy();
                    if (finished) return;
                    finished = true;
                    clearTimeout(timer);
                    resolve(false);
                });
            }
        });
    });
}

async function runAutoUpdate() {
    try {
        const hasInternet = await checkInternet(10000);

        if (!hasInternet) {
            console.log('[INFO] لم يتم العثور على اتصال إنترنت خلال 10 ثوانٍ.');
            console.log('[INFO] سيتم تشغيل المنصة بالوضع المحلي بدون تعديل.');
            process.exit(0);
        }

        console.log('[SUCCESS] تم اكتشاف اتصال الإنترنت بنجاح!');
        console.log('[INFO] جاري فحص المستودع وسحب التحديثات (git pull)...');

        let pullOutput = '';
        try {
            pullOutput = execSync('git pull', { encoding: 'utf8', timeout: 30000 });
            console.log(pullOutput.trim());
        } catch (gitErr) {
            console.log('[WARNING] تعذر تنفيذ git pull أو حدث انقطاع مؤقت:', gitErr.message);
            process.exit(0);
        }

        const normalizedOutput = pullOutput.toLowerCase().trim();
        const isUpToDate = normalizedOutput.includes('already up to date') || 
                           normalizedOutput.includes('already up-to-date') ||
                           normalizedOutput.includes('محدث بالفعل');

        if (isUpToDate) {
            console.log('[INFO] المنصة محدثة لأحدث إصدار بالفعل. سيتم تشغيل السيرفر...');
            process.exit(0);
        } else {
            console.log('\n========================================================');
            console.log('[SUCCESS] 🎉 تم تنزيل وسحب تحديثات جديدة للمنصة بنجاح!');
            console.log('[INFO] جاري إعادة تشغيل المشغل تلقائياً ليعمل بالنسخة المحدثة...');
            console.log('========================================================\n');
            process.exit(42); // Special exit code 42 signaling update pulled -> restart launcher
        }
    } catch (err) {
        console.error('[ERROR] حدث خطأ أثناء التحديث:', err.message);
        process.exit(0);
    }
}

runAutoUpdate();
