const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/pages/SettingsWorkspace.tsx',
  'src/pages/HistoryWorkspace.tsx',
  'src/pages/Results.tsx',
  'src/pages/GenerateWorkspace.tsx',
  'src/pages/WorkflowsWorkspace.tsx',
  'src/pages/AssetsWorkspace.tsx',
  'src/components/workspace/ModelSelector.tsx',
  'src/components/workspace/JobInspector.tsx',
  'src/components/workspace/ResultInspector.tsx',
  'src/components/workspace/LiveExecution.tsx',
  'src/components/accounts/AddConnectionModal.tsx',
  'src/components/layout/NotificationsPanel.tsx',
  'src/components/layout/Sidebar.tsx',
  'src/components/layout/AppShell.tsx',
  'src/components/layout/Header.tsx',
  'src/components/layout/RightInspector.tsx',
  'src/components/layout/PageContainer.tsx',
  'src/components/layout/CommandPalette.tsx',
];

for (const file of filesToUpdate) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // We remove `no-scrollbar` only where it's a vertical scroll (overflow-y-auto) 
    // because horizontal scrolls for tabs/chips generally shouldn't have scrollbars
    // But actually, the prompt says: "Only keep internal scrolling for genuinely long content areas such as logs, model lists, notifications, and large selectors, and style those scrollbars as thin, subtle dark-glass scrollbars consistent with the SMASH design system."
    // 
    // This implies we should REMOVE `no-scrollbar` from those areas so that our newly styled custom scrollbar shows up!
    
    const areas = [
      'src/components/workspace/ModelSelector.tsx', 
      'src/components/workspace/JobInspector.tsx', 
      'src/components/layout/NotificationsPanel.tsx',
      'src/components/layout/Header.tsx', // large selectors (projects/models dropdowns)
      'src/components/layout/CommandPalette.tsx',
      'src/components/workspace/LiveExecution.tsx', // logs
    ];
    
    if (areas.includes(file)) {
      content = content.replace(/overflow-y-auto no-scrollbar/g, 'overflow-y-auto');
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated ${file} (removed no-scrollbar)`);
    }
  }
}
