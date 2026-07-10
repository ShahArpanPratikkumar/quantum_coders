const fs = require('fs');
const path = require('path');

const targetDir = path.resolve(__dirname, 'src');

function walkAndReplace(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      walkAndReplace(fullPath);
    } else {
      const ext = path.extname(fullPath);
      if (['.jsx', '.css', '.js'].includes(ext)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let originalContent = content;
        
        // Replacements
        content = content.replace(/PagePilot AI/g, 'Quantum AI');
        content = content.replace(/PagePilotContext/g, 'QuantumContext');
        content = content.replace(/PagePilotProvider/g, 'QuantumProvider');
        content = content.replace(/usePagePilot/g, 'useQuantum');
        content = content.replace(/PagePilot/g, 'Quantum');
        
        if (content !== originalContent) {
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`Updated: ${fullPath}`);
        }
      }
    }
  }
}

walkAndReplace(targetDir);

// Rename Context file
const oldContext = path.join(targetDir, 'context', 'PagePilotContext.jsx');
const newContext = path.join(targetDir, 'context', 'QuantumContext.jsx');

if (fs.existsSync(oldContext)) {
  let content = fs.readFileSync(oldContext, 'utf8');
  fs.renameSync(oldContext, newContext);
  console.log(`Renamed context file to: ${newContext}`);
}
