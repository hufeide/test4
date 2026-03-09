# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## 项目概述

在此描述你的项目。

## 技术栈

- 前端：...
- 后端：...
- 数据库：...

## 开发命令

```bash
# 安装依赖
npm install

# 运行开发服务器
npm run dev

# 运行测试
npm test

# 运行 lint
npm run lint
```

## 项目结构

```
src/
├── components/   # React 组件
├── pages/        # 页面
├── utils/        # 工具函数
└── styles/       # 样式文件
```

## 强制工作流程

**重要：** 必须按照以下顺序执行，不可跳过任何步骤：

### 阶段 1: 需求探索（必须首先执行）
```
/brainstorming
```
- 与用户讨论需求
- 确定功能列表
- 确认技术选型

### 阶段 2: 创建计划（必须在写代码前执行）
```
/writing-plans
```
- 创建详细的实施计划文档
- 计划文档保存在 `docs/plans/` 目录
- **没有 plan 文档，不允许开始写代码**

### 阶段 3: 创建分支
```
/using-git-worktrees
```
- 为功能创建独立的工作分支

### 阶段 4: 实现功能
- 根据 plan 文档逐步实现
- 使用 `/test-driven-development` 编写测试

### 阶段 5: 验证完成
```
/verification-before-completion
```
- 验证所有功能正常工作
- 确保测试通过

### 阶段 6: 合并代码
```
/finishing-a-development-branch
```
- 创建 Pull Request
- 完成代码审查
