const fs = require('fs');
const path = require('path');
const bytenode = require('bytenode');
const JavaScriptObfuscator = require('javascript-obfuscator');

console.log('========================================================');
console.log('  ENGLISHERS CLUB - OBFUSCATION & BYTECODE BUILDER');
console.log('========================================================');

const rootDir = path.join(__dirname, '..');
const serverJsPath = path.join(rootDir, 'server.js');
const serverJscPath = path.join(rootDir, 'server.jsc');
const tempSourcePath = path.join(rootDir, '.temp_server_build.js');
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

console.log('[1/3] 🔐 جاري تشفير وتعمية سيرفر المنصة (server.js & server.jsc)...');

const serverSource = fs.readFileSync(path.join(backupDir, 'server.js'), 'utf8');

// 1. Heavy Obfuscation of server source
const obfuscatedServer = JavaScriptObfuscator.obfuscate(serverSource, {
    compact: true,
    controlFlowFlattening: false,
    numbersToExpressions: true,
    simplify: true,
    stringArray: true,
    stringArrayEncoding: ['base64'],
    stringArrayThreshold: 0.85
}).getObfuscatedCode();

// Write temporary source file in rootDir to compile V8 Bytecode
fs.writeFileSync(tempSourcePath, serverSource, 'utf8');

try {
    bytenode.compileFile({
        filename: tempSourcePath,
        output: serverJscPath
    });
    console.log('[SUCCESS] تم توليد الكود الثنائي المشفر (server.jsc) بنجاح!');
} catch (e) {
    console.log('[WARNING] Could not compile bytenode file:', e.message);
}

if (fs.existsSync(tempSourcePath)) {
    fs.unlinkSync(tempSourcePath);
}

// Write robust loader in server.js with fallback to obfuscated code for cross-Node version compatibility
const loaderCode = `
let loaded = false;
try {
    const bytenode = require('bytenode');
    const path = require('path');
    const jscPath = path.join(__dirname, 'server.jsc');
    if (require('fs').existsSync(jscPath)) {
        require(jscPath);
        loaded = true;
    }
} catch (e) {
    // If bytenode or bytecode fails due to Node version difference, fallback to obfuscated code
}

if (!loaded) {
    ${obfuscatedServer}
}
`;

fs.writeFileSync(serverJsPath, loaderCode, 'utf8');
console.log('[SUCCESS] تم تعمية وتشفير كود السيرفر وتجهيز الفولباك العابر للإصدارات بنجاح!');

console.log('[2/3] 🔐 جاري تعمية كود الواجهة الأمامية (public/js/app.js)...');
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

console.log('\n========================================================');
console.log('  🎉 اكتمل البناء وتشفير الكود بنجاح 100%! جاهز للرفع.');
console.log('========================================================\n');
