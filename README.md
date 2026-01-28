# AI Resource

AI 大模型公司和核心人员信息收集项目

## 项目简介

本项目致力于收集和整理 AI 大模型公司及其核心人员的信息，为关注 AI 行业发展的研究者和从业者提供及时、准确的信息参考。

## 快速导航

- **[公司名单](companies.md)** — 重要公司一览（含 Logo）
- **[人物名单](people.md)** — 重要人物一览（48 位）
- **展示网站** — 每次 push 到 `main` 后会通过 GitHub Actions 自动构建并部署到 GitHub Pages，可在仓库 **Settings → Pages** 中查看站点地址（需将 Source 选为 **GitHub Actions**）

---

## 主要内容

### 公司信息
公司信息按地区分类，位于 `company/` 目录下：
- **中国** (`company/china/`): 阶跃星辰、MiniMax、智谱AI、百川智能、月之暗面、通义千问、SEED等
- **美国** (`company/usa/`): OpenAI、Anthropic、Google DeepMind、xAI、SSI等
- **欧洲** (`company/europe/`): AMI Labs等

每个公司文件包含：
- 公司简介
- 主要人员
- 人员变动
- 融资情况
- 产品发布情况

### 人员信息
人员信息按地区分类，位于 `people/` 目录下，共计**48位**AI领域重要人物：

#### 中国（24位）
**ResNet团队**：何恺明、张祥雨、任少卿、孙剑（已故）

**学术界领军人物**：周志华、邱锡鹏、崔鹏、马毅

**计算机视觉**：汤晓鸥（已故）、林达华、周博磊、朱俊彦、黄高、张拳石

**产业界创始人/高管**：余凯、周畅、杨植麟、王小川、唐杰、姜大昕、颜水成、李开复、张潼、李沐

#### 美国（22位）
**华裔学术领袖**：李飞飞（斯坦福）、吴恩达（斯坦福）

**大模型公司领袖**：Sam Altman（OpenAI）、Ilya Sutskever（SSI）、Dario Amodei（Anthropic）、Elon Musk（xAI）

**深度学习三巨头**：Geoffrey Hinton（图灵奖）、Yoshua Bengio（图灵奖）

**Google/DeepMind**：Jeff Dean、Demis Hassabis（诺贝尔奖）、David Silver

**Transformer作者**：Ashish Vaswani、Noam Shazeer、Łukasz Kaiser、Aidan Gomez（Cohere）

**重要研究者**：Alec Radford（GPT/CLIP）、Jacob Devlin（BERT）、Ian Goodfellow（GAN）、Ross Girshick（R-CNN）、Andrej Karpathy、Pieter Abbeel、Sergey Levine

#### 欧洲（2位）
**深度学习先驱**：Yann LeCun（法国，图灵奖）

**DeepMind研究者**：Oriol Vinyals（西班牙）

每个人员文件包含：
- 基本信息（姓名、出生日期、国籍、教育背景）
- 职业经历
- 主要成就
- 技术贡献
- 学术成果
- 获奖荣誉
- 社交媒体
- 重要动态

### 网站与部署

项目包含静态展示页（`site/` 与 `scripts/build.js`），用于在网页上展示公司与学者列表。推送到 `main` 分支时，GitHub Actions 会执行构建并将结果部署到 GitHub Pages。

- **本地构建**：`node scripts/build.js [repoUrl]`，生成目录为 `dist/`，其中 `repoUrl` 可选，用于详情链接（如 `https://github.com/owner/ai-resource`）。
- **启用 Pages**：在仓库 **Settings → Pages → Build and deployment** 中，将 Source 选为 **GitHub Actions** 后，每次 push 到 `main` 的构建产物会自动发布为站点。

### 更新计划

本项目会不定时更新 AI 公司的相关信息，包括但不限于：
- 人员变动
- 融资情况
- 产品发布情况
- 其他重要动态

## 贡献

欢迎提交 Issue 或 Pull Request 来补充和更新信息。

## 许可证

详见 [LICENSE](LICENSE) 文件。
