const fs = require('fs');
const filesToUpdate = [
  'src/pages/SettingsWorkspace.tsx',
  'src/pages/HistoryWorkspace.tsx',
  'src/pages/Results.tsx',
  'src/pages/GenerateWorkspace.tsx',
  'src/pages/WorkflowsWorkspace.tsx',
  'src/pages/AssetsWorkspace.tsx',
  'src/components/workspace/ResultInspector.tsx',
  'src/components/accounts/AddConnectionModal.tsx',
  'src/components/layout/Sidebar.tsx',
  'src/components/layout/AppShell.tsx',
  'src/components/layout/RightInspector.tsx',
  'src/components/layout/PageContainer.tsx'
];

for (const file of filesToUpdate) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/ no-scrollbar/g, ''); // just strip it out. All scrolling areas will use the custom styled scrollbar from global css.
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
