#!/usr/bin/env node
/**
 * 解析 companies.md 和 people.md，生成 site 可用的 data.json
 * 用法: node scripts/build.js [repoUrl]
 * repoUrl 可选，如 https://github.com/owner/ai-resource，用于详情链接
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REPO_URL = process.argv[2] || 'https://github.com';

function mdToHtml(text) {
  const lines = text.split('\n');
  const out = [];
  let inList = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (/^#+\s/.test(trimmed)) {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      const level = (trimmed.match(/^(#+)/) || [])[1].length;
      let content = trimmed.replace(/^#+\s+/, '');
      content = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
      out.push(`<h${Math.min(level, 6)}>${content}</h${Math.min(level, 6)}>`);
    } else if (/^-\s/.test(trimmed)) {
      if (!inList) {
        out.push('<ul>');
        inList = true;
      }
      let content = trimmed.slice(2);
      content = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
      out.push(`<li>${content}</li>`);
    } else {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      if (trimmed) {
        let content = trimmed;
        content = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
        out.push(`<p>${content}</p>`);
      }
    }
  }
  if (inList) out.push('</ul>');
  return out.join('\n');
}

function parseTableRows(text) {
  const lines = text.split('\n').filter((l) => l.trim().startsWith('|'));
  if (lines.length < 2) return []; // header + separator
  const rows = lines.slice(2).map((line) => {
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());
    return cells;
  });
  return rows;
}

function extractLink(mdCell) {
  const m = mdCell.match(/\]\(([^)]+)\)/);
  return m ? m[1] : null;
}

function parseCompanies(content) {
  const regions = [];
  const regionBlocks = content.split(/(?=^##\s)/m).filter(Boolean);
  const regionNames = {
    '🇨🇳 中国': { id: 'china', name: '中国' },
    '🇺🇸 美国': { id: 'usa', name: '美国' },
    '🇪🇺 欧洲': { id: 'europe', name: '欧洲' },
  };
  for (const block of regionBlocks) {
    const headerMatch = block.match(/^##\s+(.+)$/m);
    if (!headerMatch) continue;
    const regionLabel = headerMatch[1].trim();
    const meta = regionNames[regionLabel];
    if (!meta) continue;
    const rows = parseTableRows(block);
    const items = rows
      .map((cells) => {
        if (cells.length < 5) return null;
        const logoCell = cells[0];
        const nameCell = cells[1];
        const location = cells[2];
        const products = cells[3];
        const linkCell = cells[4];
        const href = extractLink(linkCell);
        if (!href) return null;
        let logo = null;
        const img = logoCell.match(/<img\s+src="([^"]+)"/);
        if (img) logo = img[1];
        const name = nameCell
          .replace(/\*\*([^*]+)\*\*/g, '$1')
          .replace(/<br\s*\/?>/gi, ' / ')
          .trim();
        return { logo, name, location, products, href };
      })
      .filter(Boolean);
    regions.push({ id: meta.id, name: meta.name, items });
  }
  return regions;
}

function parsePeople(content) {
  const sections = [];
  const blocks = content.split(/(?=^#{2,3}\s)/m).filter(Boolean);
  let currentRegion = null;
  let currentCategory = null;
  for (const block of blocks) {
    const h2 = block.match(/^##\s+(.+)$/m);
    const h3 = block.match(/^###\s+(.+)$/m);
    if (h2) {
      const label = h2[1].trim();
      const countMatch = label.match(/^(.+?)\s*[（(](\d+)\s*位[）)]$/);
      const name = countMatch ? countMatch[1].trim() : label;
      const regionId = { '🇨🇳 中国': 'china', '🇺🇸 美国': 'usa', '🇪🇺 欧洲': 'europe' }[name] || null;
      if (regionId) {
        currentRegion = { id: regionId, name: name.replace(/^[^\s]+\s+/, ''), categories: [] };
        sections.push(currentRegion);
        currentCategory = null;
      }
    }
    if (h3 && currentRegion) {
      currentCategory = { name: h3[1].trim(), people: [] };
      currentRegion.categories.push(currentCategory);
    }
    const rows = parseTableRows(block);
    if (rows.length && currentRegion) {
      if (!currentCategory) {
        currentCategory = { name: currentRegion.name, people: [] };
        currentRegion.categories.push(currentCategory);
      }
      for (const cells of rows) {
        if (cells.length < 4) continue;
        const nameCell = cells[0];
        const org = cells[1];
        const work = cells[2];
        const linkCell = cells[3];
        const href = extractLink(linkCell);
        if (!href) continue;
        const name = nameCell
          .replace(/\*\*([^*]+)\*\*/g, '$1')
          .replace(/\s*†\s*$/, '')
          .trim();
        const deceased = nameCell.includes('†');
        currentCategory.people.push({ name, org, work, href, deceased });
      }
    }
  }
  return sections;
}

function main() {
  const companiesPath = path.join(ROOT, 'companies.md');
  const peoplePath = path.join(ROOT, 'people.md');
  const outDir = path.join(ROOT, 'dist');
  const companiesContent = fs.readFileSync(companiesPath, 'utf8');
  const peopleContent = fs.readFileSync(peoplePath, 'utf8');

  const companies = parseCompanies(companiesContent);
  const people = parsePeople(peopleContent);

  const base = REPO_URL.replace(/\/$/, '');
  function toAbs(href) {
    if (href.startsWith('http')) return href;
    return `${base}/blob/main/${href}`;
  }

  const details = {};
  for (const folder of ['company', 'people']) {
    const dir = path.join(ROOT, folder);
    if (!fs.existsSync(dir)) continue;
    const walk = (d, prefix) => {
      const entries = fs.readdirSync(d, { withFileTypes: true });
      for (const e of entries) {
        const full = path.join(d, e.name);
        const rel = path.relative(ROOT, full).replace(/\\/g, '/');
        if (e.isDirectory()) walk(full, prefix);
        else if (e.name.endsWith('.md')) {
          const raw = fs.readFileSync(full, 'utf8');
          const titleMatch = raw.match(/^#\s+(.+)$/m);
          const title = titleMatch ? titleMatch[1].trim() : path.basename(e.name, '.md');
          details[rel.replace(/\.md$/, '')] = { title, body: mdToHtml(raw) };
        }
      }
    };
    walk(dir, folder);
  }

  companies.forEach((r) =>
    r.items.forEach((i) => {
      const raw = i.href;
      i.detailId = raw.startsWith('http') ? null : raw.replace(/\.md$/, '');
      i.href = toAbs(raw);
    })
  );
  people.forEach((r) =>
    r.categories.forEach((c) =>
      c.people.forEach((p) => {
        const raw = p.href;
        p.detailId = raw.startsWith('http') ? null : raw.replace(/\.md$/, '');
        p.href = toAbs(raw);
      })
    )
  );

  const data = { companies, people, repoUrl: base };
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'data.json'), JSON.stringify(data, null, 2), 'utf8');
  fs.writeFileSync(path.join(outDir, 'details.json'), JSON.stringify(details), 'utf8');

  const siteDir = path.join(ROOT, 'site');
  if (fs.existsSync(siteDir)) {
    const files = ['index.html', 'styles.css', 'app.js'];
    for (const f of files) {
      const src = path.join(siteDir, f);
      if (fs.existsSync(src)) fs.copyFileSync(src, path.join(outDir, f));
    }
  }
  console.log('Build done: dist/data.json, dist/details.json and site assets');
}

main();
