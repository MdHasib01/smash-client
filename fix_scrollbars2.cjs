const fs = require('fs');
const filesToUpdate = [
  'src/components/workspace/ModelSelector.tsx', 
  'src/components/workspace/JobInspector.tsx', 
  'src/components/layout/Header.tsx'
];

for (const file of filesToUpdate) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/overflow-y-auto( overflow-x-hidden)? no-scrollbar/g, 'overflow-y-auto$1');
    content = content.replace(/overflow-y-auto p-4 flex flex-col gap-6 no-scrollbar/g, 'overflow-y-auto p-4 flex flex-col gap-6');
    content = content.replace(/overflow-y-auto p-6 flex flex-col gap-8 no-scrollbar/g, 'overflow-y-auto p-6 flex flex-col gap-8');
    content = content.replace(/max-h-60 overflow-y-auto pr-2 no-scrollbar/g, 'max-h-60 overflow-y-auto pr-2');
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file} (removed no-scrollbar completely)`);
  }
}
