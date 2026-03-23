const fs = require('fs-extra');
const path = require('path');
const { createHtmlReport } = require('axe-html-reporter');

// 🔹 UPDATE: Absolute Windows paths
const inputDir = 'C:\\Users\\Admin\\Desktop\\test10\\jsonreports1';
const outputDir = 'C:\\Users\\Admin\\Desktop\\test10\\htmlreports1';

// Ensure output folder exists
fs.ensureDirSync(outputDir);

// Read all files from JSON folder
fs.readdirSync(inputDir).forEach(file => {
  if (!file.endsWith('.json')) return;

  const jsonPath = path.join(inputDir, file);
  const axeResults = fs.readJsonSync(jsonPath);

  const htmlReport = createHtmlReport({
    results: axeResults,
    options: {
      projectKey: file.replace('.json', ''),
      doNotCreateReportFile: true
    }
  });

  const outputFile = path.join(
    outputDir,
    file.replace('.json', '.html')
  );

  fs.writeFileSync(outputFile, htmlReport);
  console.log(`✔ Converted: ${file}`);
});

console.log('🎉 All Axe JSON files converted to HTML successfully');