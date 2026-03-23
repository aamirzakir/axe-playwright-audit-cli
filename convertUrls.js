const fs = require('fs');

const urls = `
https://google.com/
https://gmail.com/
https://youtube.com/
`;

function extractName(url) {
  try {
    const u = new URL(url);
    let path = u.pathname;

    // remove trailing slash
    if (path.endsWith('/')) path = path.slice(0, -1);

    let name = path.split('/').pop();

    // fallback if empty
    if (!name || name === '') {
      name = u.hostname.replace(/\./g, '');
    }

    return name.replace(/[^a-zA-Z0-9]/g, '');
  } catch {
    return 'invalidUrl';
  }
}

const formatted = urls
  .split('\n')
  .map(u => u.trim())
  .filter(Boolean)
  .map(url => {
    const name = extractName(url);
    return `{
  name: '${name}',
  url: '${url}'
},`;
  })
  .join('\n');

fs.writeFileSync('formattedUrls.js', formatted);

console.log("✅ Done. Output saved to formattedUrls.js");