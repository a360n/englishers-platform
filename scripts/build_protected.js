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

console.log('[1/3] 🔐 جاري تشفير وتجميع سيرفر المنصة إلى V8 Bytecode (server.jsc)...');

// Write temporary source file in rootDir so relative requires resolve correctly
const serverSource = fs.readFileSync(path.join(backupDir, 'server.js'), 'utf8');
fs.writeFileSync(tempSourcePath, serverSource, 'utf8');

// Compile temporary source file to V8 bytecode
bytenode.compileFile({
    filename: tempSourcePath,
    output: serverJscPath
});

// Clean up temporary build file
if (fs.existsSync(tempSourcePath)) {
    fs.unlinkSync(tempSourcePath);
}

// Clean up test files if present
if (fs.existsSync(path.join(rootDir, 'test.js'))) fs.unlinkSync(path.join(rootDir, 'test.js'));
if (fs.existsSync(path.join(rootDir, 'test.jsc'))) fs.unlinkSync(path.join(rootDir, 'test.jsc'));

console.log('[SUCCESS] تم توليد الكود الثنائي المشفر (server.jsc) بنجاح!');

// Create CommonJS loader code for server.js
const loaderCode = `require('bytenode');\nrequire('./server.jsc');\n`;
fs.writeFileSync(serverJsPath, loaderCode, 'utf8');
console.log('[SUCCESS] تم إعداد محمل السيرفر الثنائي (server.js loader) بنجاح!');

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
