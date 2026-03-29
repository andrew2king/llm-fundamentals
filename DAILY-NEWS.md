# AI 日报自动发布系统

## 概述

此系统实现每天自动生成 AI 日报并发布到网站。

## 文件结构

```
website/
├── app/
│   ├── public/data/daily/        # 日报 JSON 数据
│   │   └── 2026-03-29.json
│   ├── src/
│   │   ├── sections/
│   │   │   └── DailyNews.tsx     # 日报展示组件
│   │   ├── types/
│   │   │   └── daily.ts          # TypeScript 类型定义
│   │   └── lib/
│   │       └── daily.ts          # 数据操作工具
│   └── src/App.tsx               # 已集成 DailyNews 组件
├── scripts/
│   └── add-daily.js              # OpenClaw 调用脚本
├── cron-daily-news.yaml          # Cron 任务配置示例
└── DAILY-NEWS.md                 # 本文档
```

## 数据格式

### 日报 JSON 结构

```json
{
  "date": "2026-03-29",
  "title": "AI日报｜3月29日",
  "summary": "今日要点概述",
  "news": [
    {
      "id": "1",
      "title": "新闻标题",
      "summary": "新闻摘要",
      "url": "https://...",
      "source": "来源",
      "publishedAt": "2026-03-29"
    }
  ],
  "papers": [
    {
      "id": "1",
      "title": "论文标题",
      "summary": "论文摘要",
      "url": "https://arxiv.org/abs/...",
      "publishedAt": "2026-03-29"
    }
  ]
}
```

## 自动化流程

### 方式一：OpenClaw Cron（推荐）

1. 将 `cron-daily-news.yaml` 中的配置添加到 OpenClaw 配置
2. 每天 8:00 自动执行：
   - 生成日报内容
   - 保存到 `app/public/data/daily/`
   - Git commit & push
   - Vercel 自动部署

### 方式二：手动执行

```bash
# 生成日报 JSON 后手动推送
cd /Users/long/Downloads/AICode/website
node scripts/add-daily.js '{"date":"2026-03-29",...}'
```

## 本地开发

```bash
cd app
npm run dev        # 启动开发服务器
npm run build      # 构建生产版本
```

访问 http://localhost:5173 查看效果

## 网站展示

- 日报展示在首页 Hero 下方
- 包含：行业新闻、arXiv 论文两个板块
- 支持响应式布局
- 深色主题，与网站风格一致

## 注意事项

1. **Git 提交**：脚本会自动检测变更并提交，确保在 git 仓库中运行
2. **Vercel 部署**：推送后 Vercel 会自动重新构建部署
3. **数据备份**：所有日报保存在 `public/data/daily/`，建议定期备份
4. **失败处理**：如果自动化失败，可手动运行脚本或提交数据文件

## 故障排查

### 日报不显示

1. 检查 `public/data/daily/` 是否有 JSON 文件
2. 检查浏览器控制台是否有加载错误
3. 确认 JSON 格式正确

### Git 推送失败

1. 检查 git 配置和远程仓库
2. 检查网络连接
3. 手动执行：`git add app/public/data/daily/ && git commit -m "Add daily news" && git push`

### 构建失败

1. 检查 TypeScript 类型是否正确
2. 检查是否有语法错误
3. 运行 `npm run build` 查看详细错误信息
