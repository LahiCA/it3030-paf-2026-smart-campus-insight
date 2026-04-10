const fs = require('fs');
const acorn = require('acorn-jsx');
const code = fs.readFileSync('src/components/BWAdminBookingTable.jsx', 'utf8');
const Parser = require('acorn').Parser.extend(acorn());
try {
  Parser.parse(code, { sourceType: 'module', ecmaVersion: 'latest' });
  console.log('Parse successful');
} catch (err) {
  console.error(err);
}
