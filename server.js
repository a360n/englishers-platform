const bytenode = require('bytenode');
const path = require('path');
bytenode.runBytecodeFile(path.join(__dirname, 'server.jsc'));
