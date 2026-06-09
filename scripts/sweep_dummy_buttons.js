const fs = require('fs');
const path = require('path');

const directoryPath = path.join(process.cwd(), 'apps/web/src');

function getAllFiles(dirPath, arrayOfFiles) {
  let files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });
  return arrayOfFiles;
}

const files = getAllFiles(directoryPath);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace onClick={() => {}}
  content = content.replace(/onClick=\{\(\) => \{\}\}/g, "onClick={() => toast.info('Tính năng này đang được phát triển cho phiên bản thương mại.')}");

  // Replace onClick={() => console.log(...)}
  content = content.replace(/onClick=\{\(\) => console\.log\([^)]+\)\}/g, "onClick={() => toast.info('Tính năng này đang được phát triển cho phiên bản thương mại.')}");

  // Replace href="#"
  // First we need to make sure we don't break existing onClick handlers when replacing href="#"
  // A simple heuristic for demo links is <a href="#"> or <Link href="#"> without onClick.
  // Actually, it's safer to just change href="#" to href="#" onClick={(e) => { e.preventDefault(); toast.info('Màn hình chi tiết đang được phát triển.'); }}
  content = content.replace(/href="#"/g, `href="#" onClick={(e) => { e.preventDefault(); toast.info('Màn hình chi tiết đang được phát triển.'); }}`);

  if (content !== originalContent) {
    // Add import { toast } from 'sonner'; if not present
    if (!content.includes("import { toast } from 'sonner';")) {
       // insert after the first import or at the top
       const firstImportMatch = content.match(/import .*\n/);
       if (firstImportMatch) {
         content = content.replace(firstImportMatch[0], firstImportMatch[0] + "import { toast } from 'sonner';\n");
       } else {
         content = "import { toast } from 'sonner';\n" + content;
       }
    }
    fs.writeFileSync(file, content);
    console.log("Updated: " + file);
  }
});
console.log("Sweep complete.");
