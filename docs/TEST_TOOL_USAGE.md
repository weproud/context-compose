# Task Action Test Tool Usage Guide

## Overview

Task Action Test Tool is a tool that allows AI coding tools (Cursor, Windsurf, etc.) to test individual actions and notifications of task-action in a real environment.

## 🎯 Key Features

### 1. **Use as MCP Tool**

- `task-action-test`: Execute individual action/notification tests
- `task-action-list-tests`: Query available test list
- `task-action-check-test-env`: Check test environment settings

### 2. **Use as CLI Tool**

- `task-action test <target>`: Direct test execution
- `task-action test list`: Available test list
- `task-action test check`: Environment settings check

## 🚀 Usage

### **Using MCP Tool (in AI Coding Tools)**

#### 1. Action Test

```json
{
  "tool": "task-action-test",
  "parameters": {
    "testTarget": "actions/create-branch"
  }
}
```

#### 2. Notification Test

```json
{
  "tool": "task-action-test",
  "parameters": {
    "testTarget": "notify/slack-send-message"
  }
}
```

#### 3. Detailed Options

```json
{
  "tool": "task-action-test",
  "parameters": {
    "testTarget": "actions/git-commit",
    "verbose": true,
    "dryRun": false,
    "workingDirectory": "/path/to/project"
  }
}
```

### **CLI Usage**

#### 1. Basic Test Execution

```bash
# Git branch creation test
task-action test actions/create-branch

# Slack message sending test
task-action test notify/slack-send-message

# Discord message sending test
task-action test notify/discord-send-message
```

#### 2. Using Options

```bash
# Specify working directory
task-action test actions/git-commit --working-dir /path/to/project
```

#### 3. Help Commands

```bash
# Available test list
task-action test list

# Environment settings check
task-action test check

# Check specific environment only
task-action test check --type slack
```

## 📋 Supported Tests

### **Actions**

- `create-branch`: Git branch creation test
- `git-commit`: Git commit creation test
- `git-push`: Git push test (dry-run)
- `create-pull-request`: Pull Request creation test
- `development`: Development workflow test
- `task-done`: Task completion handling test

### **Notifications**

- `slack-send-message`: Slack message sending test
- `discord-send-message`: Discord message sending test

## 🔧 Environment Setup

### **Required Environment Variables**

```bash
# For Slack notifications
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"

# For Discord notifications
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/YOUR/DISCORD/WEBHOOK"
```

### **Optional Environment Variables**

```bash
# Specify Slack channel (default: #general)
export SLACK_CHANNEL="#development"

# For GitHub operations
export GITHUB_TOKEN="your_github_token"
```

## 🎯 AI Coding Tool Usage Examples

### **Using in Cursor**

```
User: "Please test task-action test actions/create-branch"

MCP tool to be executed by AI:
{
  "tool": "task-action-test",
  "parameters": {
    "testTarget": "actions/create-branch"
  }
}
```

### **Using in Windsurf**

```
User: "Please test sending a test message to Slack"

MCP tool to be executed by AI:
{
  "tool": "task-action-test",
  "parameters": {
    "testTarget": "notify/slack-send-message",
    "verbose": true
  }
}
```

## 📊 Test Result Examples

### **Success Case**

```json
{
  "success": true,
  "message": "✅ Action 'Create Branch' executed successfully",
  "testTarget": "actions/create-branch",
  "executionTime": "1.2s",
  "details": {
    "branch": "test-branch-1704110400000",
    "output": "Created and cleaned up test branch: test-branch-1704110400000"
  }
}
```

### **Failure Case**

```json
{
  "success": false,
  "message": "❌ Notification 'slack-send-message' failed",
  "testTarget": "notify/slack-send-message",
  "executionTime": "0.5s",
  "details": {
    "error": "SLACK_WEBHOOK_URL environment variable not set"
  }
}
```

## 🔍 Troubleshooting

### **Common Errors**

#### 1. Missing Environment Variables

```
Error: SLACK_WEBHOOK_URL environment variable not set
```

**Solution**: Set the required environment variables.

#### 2. Git Configuration Error

```
Error: Git not found or not configured
```

**Solution**: Install and configure Git.

#### 3. Permission Error

```
Error: Permission denied
```

**Solution**: Set appropriate permissions or use sudo.

### **Environment Check Commands**

```bash
# Check entire environment
task-action test check

# Check specific service only
task-action test check --type slack
task-action test check --type discord
task-action test check --type git
```

## 🎉 Real Usage Scenarios

### **Development Workflow Testing**

1. New feature branch creation test
2. Code change and commit test
3. Slack progress notification test
4. Pull Request creation test

```bash
# 1. Branch creation test
task-action test actions/create-branch

# 2. Commit test
task-action test actions/git-commit

# 3. Slack notification test
task-action test notify/slack-send-message

# 4. PR creation test
task-action test actions/create-pull-request
```

### **CI/CD Pipeline Testing**

```bash
# Deployment success notification test
task-action test notify/slack-send-message --verbose

# Discord team notification test
task-action test notify/discord-send-message --verbose
```

This tool allows AI coding tools to safely and efficiently test all features of task-action.
