# AI Resource — Claude Code 工作规范

AI 大模型公司和核心人员信息收集项目。

## 目录结构

- `company/{region}/` — 公司档案（`china/`、`usa/`、`europe/`）
- `people/{region}/` — 人物档案（`china/`、`usa/`、`europe/`）
- `site/` — 静态展示网站（原生 HTML/CSS/JS，无框架）
- `scripts/build.js` — 解析 Markdown，生成 `dist/data.json` / `dist/details.json`
- `dist/` — 构建产物

## 本地构建

```bash
node scripts/build.js https://github.com/owner/ai-resource
# 输出目录：dist/
```

push 到 `main` 后，GitHub Actions 自动构建并部署到 GitHub Pages。

## 内容原则

- 仅收录**公开信息**（新闻报道、官方公告、学术论文、社交媒体等）
- 不得收录未经证实的传言或非公开信息
- 更新文件时必须同步修改 `最后更新` 字段（精确到秒）
- 时间相关列表（融资、动态、经历等）一律按**时间倒序**排列
