#!/usr/bin/env python3
"""
解析 companies.md 和 people.md，生成 site 可用的 data.json 与 details.json
用法: python3 scripts/build.py [repoUrl]
repoUrl 可选，如 https://github.com/owner/ai-resource，用于详情链接
"""

import os
import sys
import re
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).parent.parent
REPO_URL = sys.argv[1] if len(sys.argv) > 1 else 'https://github.com'

try:
    import markdown
    def md_to_html(text):
        return markdown.markdown(text, extensions=['extra', 'nl2br'])
except ImportError:
    def md_to_html(text):
        # 简单转换：## 标题、列表、加粗、链接
        out = []
        in_list = False
        for line in text.split('\n'):
            line = line.rstrip()
            if re.match(r'^#+\s', line):
                if in_list:
                    out.append('</ul>')
                    in_list = False
                level = len(re.match(r'^(#+)', line).group(1))
                content = re.sub(r'^#+\s+', '', line)
                content = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', content)
                content = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2" target="_blank" rel="noopener">\1</a>', content)
                out.append(f'<h{min(level, 6)}>{content}</h{min(level, 6)}>')
            elif re.match(r'^-\s', line):
                if not in_list:
                    out.append('<ul>')
                    in_list = True
                content = line[2:]
                content = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', content)
                content = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2" target="_blank" rel="noopener">\1</a>', content)
                out.append(f'<li>{content}</li>')
            else:
                if in_list:
                    out.append('</ul>')
                    in_list = False
                if line.strip():
                    content = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', line)
                    content = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2" target="_blank" rel="noopener">\1</a>', content)
                    out.append(f'<p>{content}</p>')
        if in_list:
            out.append('</ul>')
        return '\n'.join(out)


def parse_table_rows(text):
    lines = [l for l in text.split('\n') if l.strip().startswith('|')]
    if len(lines) < 2:
        return []
    rows = []
    for line in lines[2:]:
        cells = [c.strip() for c in line.split('|')[1:-1]]
        rows.append(cells)
    return rows


def extract_link(md_cell):
    m = re.search(r'\]\(([^)]+)\)', md_cell)
    return m.group(1) if m else None


def parse_companies(content):
    regions = []
    region_blocks = re.split(r'(?=^##\s)', content, flags=re.MULTILINE)
    region_names = {
        '🇨🇳 中国': {'id': 'china', 'name': '中国'},
        '🇺🇸 美国': {'id': 'usa', 'name': '美国'},
        '🇪🇺 欧洲': {'id': 'europe', 'name': '欧洲'},
    }
    for block in region_blocks:
        if not block.strip():
            continue
        header_match = re.match(r'^##\s+(.+)$', block, re.MULTILINE)
        if not header_match:
            continue
        region_label = header_match.group(1).strip()
        meta = region_names.get(region_label)
        if not meta:
            continue
        rows = parse_table_rows(block)
        items = []
        for cells in rows:
            if len(cells) < 5:
                continue
            logo_cell = cells[0]
            name_cell = cells[1]
            location = cells[2]
            products = cells[3]
            link_cell = cells[4]
            href = extract_link(link_cell)
            if not href:
                continue
            logo = None
            img_match = re.search(r'<img\s+src="([^"]+)"', logo_cell)
            if img_match:
                logo = img_match.group(1)
            name = re.sub(r'\*\*([^*]+)\*\*', r'\1', name_cell)
            name = re.sub(r'<br\s*/?>', ' / ', name, flags=re.IGNORECASE)
            name = name.strip()
            items.append({'logo': logo, 'name': name, 'location': location, 'products': products, 'href': href})
        regions.append({'id': meta['id'], 'name': meta['name'], 'items': items})
    return regions


def parse_people(content):
    sections = []
    blocks = re.split(r'(?=^#{2,3}\s)', content, flags=re.MULTILINE)
    current_region = None
    current_category = None
    for block in blocks:
        if not block.strip():
            continue
        h2_match = re.match(r'^##\s+(.+)$', block, re.MULTILINE)
        h3_match = re.match(r'^###\s+(.+)$', block, re.MULTILINE)
        if h2_match:
            label = h2_match.group(1).strip()
            count_match = re.match(r'^(.+?)\s*[（(](\d+)\s*位[）)]$', label)
            name = count_match.group(1).strip() if count_match else label
            region_id_map = {'🇨🇳 中国': 'china', '🇺🇸 美国': 'usa', '🇪🇺 欧洲': 'europe'}
            region_id = region_id_map.get(name)
            if region_id:
                region_name = re.sub(r'^[^\s]+\s+', '', name)
                current_region = {'id': region_id, 'name': region_name, 'categories': []}
                sections.append(current_region)
                current_category = None
        if h3_match and current_region:
            current_category = {'name': h3_match.group(1).strip(), 'people': []}
            current_region['categories'].append(current_category)
        rows = parse_table_rows(block)
        if rows and current_region:
            if not current_category:
                current_category = {'name': current_region['name'], 'people': []}
                current_region['categories'].append(current_category)
            for cells in rows:
                if len(cells) < 4:
                    continue
                name_cell = cells[0]
                org = cells[1]
                work = cells[2]
                link_cell = cells[3]
                href = extract_link(link_cell)
                if not href:
                    continue
                name = re.sub(r'\*\*([^*]+)\*\*', r'\1', name_cell)
                name = re.sub(r'\s*†\s*$', '', name)
                name = name.strip()
                deceased = '†' in name_cell
                current_category['people'].append({'name': name, 'org': org, 'work': work, 'href': href, 'deceased': deceased})
    return sections


def main():
    companies_path = ROOT / 'companies.md'
    people_path = ROOT / 'people.md'
    out_dir = ROOT / 'dist'
    companies_content = companies_path.read_text(encoding='utf-8')
    people_content = people_path.read_text(encoding='utf-8')

    companies = parse_companies(companies_content)
    people = parse_people(people_content)

    base = REPO_URL.rstrip('/')
    def to_abs(href):
        if href.startswith('http'):
            return href
        return f'{base}/blob/main/{href}'

    # 详情页数据：读取 company/ 与 people/ 下所有 .md，转 HTML
    details = {}
    for folder, prefix in [(ROOT / 'company', 'company'), (ROOT / 'people', 'people')]:
        if not folder.exists():
            continue
        for md_path in folder.rglob('*.md'):
            rel = md_path.relative_to(ROOT)
            detail_id = str(rel).replace('\\', '/').replace('.md', '')
            raw = md_path.read_text(encoding='utf-8')
            title_match = re.match(r'^#\s+(.+)$', raw, re.MULTILINE)
            title = title_match.group(1).strip() if title_match else rel.stem
            body = md_to_html(raw)
            details[detail_id] = {'title': title, 'body': body}

    for region in companies:
        for item in region['items']:
            raw_href = item['href']
            item['detailId'] = raw_href.replace('.md', '') if not raw_href.startswith('http') else None
            item['href'] = to_abs(raw_href)
    for region in people:
        for category in region['categories']:
            for person in category['people']:
                raw_href = person['href']
                person['detailId'] = raw_href.replace('.md', '') if not raw_href.startswith('http') else None
                person['href'] = to_abs(raw_href)

    data = {'companies': companies, 'people': people, 'repoUrl': base}
    out_dir.mkdir(exist_ok=True)
    (out_dir / 'data.json').write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    (out_dir / 'details.json').write_text(json.dumps(details, ensure_ascii=False), encoding='utf-8')

    # 复制 site 下的静态资源到 dist
    site_dir = ROOT / 'site'
    if site_dir.exists():
        for fname in ['index.html', 'styles.css', 'app.js']:
            src = site_dir / fname
            if src.exists():
                shutil.copy2(src, out_dir / fname)

    print('Build done: dist/data.json, dist/details.json and site assets')


if __name__ == '__main__':
    main()
