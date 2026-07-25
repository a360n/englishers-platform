const { execSync } = require('child_process');
const dns = require('dns');
const https = require('https');

console.log('========================================================');
console.log('  ENGLISHERS CLUB - SMART AUTO UPDATE CHECKER');
console.log('========================================================');
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
