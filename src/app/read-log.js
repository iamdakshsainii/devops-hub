const fs = require('fs');
const text = fs.readFileSync('eslint-log-2.txt', 'utf16le');
text.split('\n').forEach(line => console.log(line));
