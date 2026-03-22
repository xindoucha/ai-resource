# CLAUDE.md

本文件为 Claude Code 在此项目中的工作规范。

---

## 项目概览

**AI Resource** — AI 大模型公司和核心人员信息收集项目。

- `company/` — 公司档案，按地区分类（`china/`、`usa/`、`europe/`）
- `people/` — 人物档案，按地区分类（`china/`、`usa/`、`europe/`）
- `site/` — 静态展示网站源文件（原生 HTML/CSS/JS）
- `scripts/build.js` — 解析 Markdown，生成 `dist/data.json` 和 `dist/details.json`
- `dist/` — 构建产物，供网站使用

---

## 公司文件规范

文件路径：`company/{region}/{company-name}.md`，文件名使用英文小写、连字符分隔。

```markdown
# 公司名称

**最后更新**: YYYY年MM月DD日 HH:MM:SS

## 基本信息
- **成立时间**: YYYY年MM月DD日
- **总部位置**:
- **官方网站**:

## 核心人员
- **[姓名]** - 职位/角色（简要介绍）

## 使命愿景
（公司的使命和愿景描述）

## 主要产品
- **产品名称**: 产品描述

## 融资情况
- **YYYY年MM月DD日**: 轮次，融资金额，投资方

## 当前估值
- **估值**: 金额

## 重要动态
- **YYYY年MM月DD日**: 动态描述

## 备注
（其他信息）
```

**填写要求**：
- `最后更新` 精确到秒，放在公司名称正下方
- 融资情况、重要动态均按**时间倒序**排列
- 日期尽量精确到 `YYYY年MM月DD日`，无法确定时可使用 `YYYY年MM月`

---

## 人物文件规范

文件路径：`people/{region}/{english-name}.md`，文件名使用英文小写、连字符分隔（如 `sam-altman.md`）。

```markdown
# 人员姓名

**最后更新**: YYYY年MM月DD日 HH:MM:SS

## 基本信息
- **姓名**: 中文名/英文名
- **出生日期**: YYYY年MM月DD日
- **国籍**:
- **教育背景**: 学位、学校、专业

## 职业经历
- **YYYY年MM月 - 至今**: 公司名称，职位
- **YYYY年MM月 - YYYY年MM月**: 公司名称，职位

## 主要成就
- 成就描述

## 技术贡献
- **技术/产品名称**: 贡献描述

## 学术成果
- **论文标题**: 发表时间、期刊/会议

## 获奖荣誉
- **YYYY年**: 奖项名称

## 社交媒体
- **Twitter**: @username
- **LinkedIn**: URL
- **个人网站**: URL

## 重要动态
- **YYYY年MM月DD日**: 动态描述

## 备注
（其他信息）
```

**填写要求**：
- `最后更新` 精确到秒，放在姓名正下方
- 职业经历、获奖荣誉、重要动态均按**时间倒序**排列
- 仅收录**公开信息**，尊重个人隐私

---

## 内容原则

- 所有信息来源须为公开资料（新闻报道、官方公告、学术论文、社交媒体等）
- 不得收录未经证实的传言或非公开信息
- 更新已有文件时，同步修改 `最后更新` 字段

---

## 本地构建

```bash
node scripts/build.js [repoUrl]
# 例如：node scripts/build.js https://github.com/owner/ai-resource
# 输出目录：dist/
```

推送到 `main` 分支后，GitHub Actions 会自动构建并部署到 GitHub Pages。
