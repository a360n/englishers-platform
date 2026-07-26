const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

console.log('========================================================');
console.log('  ENGLISHERS CLUB - HEAVY OBFUSCATION BUILDER');
console.log('========================================================');

const rootDir = path.join(__dirname, '..');
const serverJsPath = path.join(rootDir, 'server.js');
const appJsPath = path.join(rootDir, 'public', 'js', 'app.js');

// Preserve original source code in .src_backup directory
const backupDir = path.join(rootDir, '.src_backup');
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

if (!fs.existsSync(path.join(backupDir, 'server.js'))) {
    fs.copyFileSync(serverJsPath, path.join(backupDir, 'server.js'));
}
if (!fs.existsSync(path.join(backupDir, 'app.js'))) {
    fs.copyFileSync(appJsPath, path.join(backupDir, 'app.js'));
}

console.log('[1/2] 🔐 جاري التوافق والتعمية الثقيلة لسيرفر المنصة (server.js)...');
const serverSource = fs.readFileSync(path.join(backupDir, 'server.js'), 'utf8');

const obfuscatedServer = JavaScriptObfuscator.obfuscate(serverSource, {
    compact: true,
    controlFlowFlattening: false,
    numbersToExpressions: true,
    simplify: true,
    stringArray: true,
    stringArrayEncoding: ['base64'],
    stringArrayThreshold: 0.85
}).getObfuscatedCode();

fs.writeFileSync(serverJsPath, obfuscatedServer, 'utf8');
console.log('[SUCCESS] تم تعمية وتشفير كود السيرفر بنجاح (توافقية 100% مع كافة إصدارات Node)!');

console.log('[2/2] 🔐 جاري تعمية كود الواجهة الأمامية (public/js/app.js)...');
const appSource = fs.readFileSync(path.join(backupDir, 'app.js'), 'utf8');

const obfuscatedApp = JavaScriptObfuscator.obfuscate(appSource, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.5,
    numbersToExpressions: true,
    simplify: true,
    stringArray: true,
    stringArrayEncoding: ['base64'],
    stringArrayThreshold: 0.8,
    splitStrings: true,
    splitStringsChunkLength: 10
}).getObfuscatedCode();

fs.writeFileSync(appJsPath, obfuscatedApp, 'utf8');
console.log('[SUCCESS] تم تعمية وتشفير كود الواجهة بنجاح!');

// Clean up server.jsc if exists
if (fs.existsSync(path.join(rootDir, 'server.jsc'))) {
    fs.unlinkSync(path.join(rootDir, 'server.jsc'));
}

console.log('\n========================================================');
console.log('  🎉 اكتمل البناء وتشفير الكود بنجاح 100%! جاهز للرفع.');
console.log('========================================================\n');
