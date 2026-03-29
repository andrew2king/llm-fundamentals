#!/usr/bin/env node
/**
 * OpenClaw 调用此脚本添加日报
 * 用法: node scripts/add-daily.js '<json_content>'
 * 
 * 此脚本会:
 * 1. 保存日报 JSON 到 public/data/daily/
 * 2. 可选: git add, commit, push
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const PROJECT_ROOT = path.join(__dirname, '..');
const DAILY_DIR = path.join(PROJECT_ROOT, 'app', 'public', 'data', 'daily');

function main() {
  // 从命令行参数获取日报 JSON
  const dailyJson = process.argv[2];
  if (!dailyJson) {
    console.error('❌ 用法: node add-daily.js \'<daily_json>\'');
    console.error('   示例: node add-daily.js \'{"date":"2026-03-29",...}\'');
    process.exit(1);
  }
  
  let daily;
  try {
    daily = JSON.parse(dailyJson);
  } catch (err) {
    console.error('❌ JSON 解析失败:', err.message);
    process.exit(1);
  }
  
  const date = daily.date || new Date().toISOString().split('T')[0];
  
  // 确保目录存在
  if (!fs.existsSync(DAILY_DIR)) {
    fs.mkdirSync(DAILY_DIR, { recursive: true });
    console.log(`✅ 创建目录: ${DAILY_DIR}`);
  }
  
  // 保存文件
  const filePath = path.join(DAILY_DIR, `${date}.json`);
  fs.writeFileSync(filePath, JSON.stringify(daily, null, 2));
  console.log(`✅ 日报已保存: ${filePath}`);
  
  // Git 操作（如果当前目录是 git 仓库）
  try {
    // 检查是否在 git 仓库中
    execSync('git rev-parse --git-dir', { cwd: PROJECT_ROOT, stdio: 'pipe' });
    
    // 检查是否有变更
    const status = execSync('git status --porcelain', { cwd: PROJECT_ROOT, encoding: 'utf-8' });
    
    if (status.includes('data/daily')) {
      console.log('📦 检测到变更，执行 git 操作...');
      
      execSync('git add app/public/data/daily/', { cwd: PROJECT_ROOT, stdio: 'inherit' });
      execSync(`git commit -m "📰 Add AI daily news for ${date}"`, { cwd: PROJECT_ROOT, stdio: 'inherit' });
      execSync('git push origin main', { cwd: PROJECT_ROOT, stdio: 'inherit' });
      
      console.log('✅ 已推送到 GitHub，Vercel 将自动部署');
    } else {
      console.log('ℹ️  没有需要提交的变更');
    }
  } catch (err) {
    console.log('⚠️  Git 操作失败或不是 git 仓库:', err.message);
    console.log('   请手动提交变更');
  }
  
  console.log('\n🎉 完成！日报已更新。');
}

main();
