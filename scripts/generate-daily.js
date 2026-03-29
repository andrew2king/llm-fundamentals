#!/usr/bin/env node
/**
 * AI 日报自动生成脚本
 * 用法: node scripts/generate-daily.js
 * 
 * 此脚本会:
 * 1. 从多个来源获取 AI 新闻
 * 2. 生成格式化的日报 JSON
 * 3. 调用 add-daily.js 推送到 GitHub
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const PROJECT_ROOT = path.join(__dirname, '..');
const DAILY_DIR = path.join(PROJECT_ROOT, 'app', 'public', 'data', 'daily');

// 获取今天的日期
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

// 获取相对时间描述
function getRelativeTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  return `${diffDays}天前`;
}

// 模拟新闻数据（实际使用时替换为真实 API 调用）
async function fetchNews() {
  // 这里可以替换为实际的 API 调用
  // 例如：RSS 订阅、网站抓取等
  const news = [
    {
      id: "1",
      title: "OpenAI 发布新功能",
      summary: "OpenAI 今日发布重要更新...",
      url: "https://openai.com/blog",
      source: "OpenAI",
      publishedAt: getTodayDate()
    },
    {
      id: "2",
      title: "Claude 更新",
      summary: "Anthropic 发布 Claude 新功能...",
      url: "https://anthropic.com/news",
      source: "Anthropic",
      publishedAt: getTodayDate()
    }
  ];
  
  return news;
}

// 模拟论文数据
async function fetchPapers() {
  // 这里可以替换为 arXiv API 调用
  const papers = [
    {
      id: "1",
      title: "LLM 新研究",
      summary: "关于大语言模型的最新研究...",
      url: "https://arxiv.org/abs/2501.00001",
      publishedAt: getTodayDate()
    },
    {
      id: "2",
      title: "Agent 系统综述",
      summary: "AI Agent 架构和能力综述...",
      url: "https://arxiv.org/abs/2501.00002",
      publishedAt: getTodayDate()
    }
  ];
  
  return papers;
}

// 生成日报数据
async function generateDaily() {
  const today = getTodayDate();
  const date = new Date();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  console.log(`📅 生成日报: ${today}`);
  
  // 获取新闻和论文
  const news = await fetchNews();
  const papers = await fetchPapers();
  
  // 生成摘要
  const summary = `今日要点：${news.slice(0, 3).map(n => n.title).join('、')}`;
  
  // 构建日报对象
  const daily = {
    date: today,
    title: `AI日报｜${month}月${day}日`,
    summary: summary,
    news: news,
    papers: papers
  };
  
  return daily;
}

// 主函数
async function main() {
  try {
    console.log('🚀 开始生成 AI 日报...\n');
    
    // 生成日报
    const daily = await generateDaily();
    
    console.log('✅ 日报生成完成');
    console.log(`📊 新闻: ${daily.news.length} 条`);
    console.log(`📚 论文: ${daily.papers.length} 篇`);
    console.log(`📝 标题: ${daily.title}`);
    console.log(`💬 摘要: ${daily.summary}\n`);
    
    // 转换为 JSON 字符串
    const dailyJson = JSON.stringify(daily);
    
    // 调用 add-daily.js 推送
    console.log('📤 推送到 GitHub...');
    const addDailyScript = path.join(PROJECT_ROOT, 'scripts', 'add-daily.js');
    
    // 使用单引号包裹 JSON，避免 shell 解析问题
    const command = `cd "${PROJECT_ROOT}" && node "${addDailyScript}" '${dailyJson.replace(/'/g, "\\'")}'`;
    
    execSync(command, { stdio: 'inherit' });
    
    console.log('\n🎉 日报发布完成！');
    console.log(`🔗 网站: https://llm101.vercel.app/`);
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { generateDaily };
