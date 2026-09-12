const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /bg-\[#10B981\]/g, replacement: 'bg-violet-500' },
  { regex: /text-\[#10B981\]/g, replacement: 'text-violet-400' },
  { regex: /border-\[#10B981\]/g, replacement: 'border-violet-500' },
  { regex: /emerald-400/g, replacement: 'violet-400' },
  { regex: /emerald-500/g, replacement: 'violet-500' },
  { regex: /emerald-600/g, replacement: 'violet-600' },
  { regex: /yellow-400/g, replacement: 'rose-400' },
  { regex: /yellow-500/g, replacement: 'rose-500' },
  { regex: /yellow-600/g, replacement: 'rose-600' },
  { regex: /orange-400/g, replacement: 'rose-400' },
  { regex: /orange-500/g, replacement: 'rose-500' },
  { regex: /amber-400/g, replacement: 'rose-400' },
  { regex: /amber-500/g, replacement: 'rose-500' },
  { regex: /amber-300/g, replacement: 'rose-300' },
  { regex: /blue-400/g, replacement: '[#D946EF]' },
  { regex: /blue-500/g, replacement: '[#D946EF]' },
  { regex: /blue-300/g, replacement: '[#D946EF]' },
  { regex: /16,185,129/g, replacement: '139,92,246' }, // violet-500 rgb
  { regex: /249,115,22/g, replacement: '244,63,94' }, // rose-500 rgb
  { regex: /#6EE7B7/g, replacement: '#C4B5FD' }, // violet-300 hex
];

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      for (const { regex, replacement } of replacements) {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

walkDir('./src');
