# Context Compose

**Model Context Protocol (MCP) Server and CLI Tool for AI Development Workflows**

Context Compose is a tool that helps AI development assistants systematically manage project-specific contexts, workflows, and rules. It provides both MCP server and CLI tools in a single package, making collaboration with AI more efficient and consistent.

## ✨ Key Features

- 🤖 **MCP Server**: Direct integration with AI models like Claude, ChatGPT
- 🛠️ **CLI Tool**: Context management and workflow execution from terminal
- 📋 **Context System**: Project-specific development guidelines and rules management
- 🔄 **Workflow Engine**: Automated task flows for development, testing, deployment
- 🎯 **Role-based Development**: Apply expert personas like Dan Abramov, Martin Fowler
- 📢 **Notification System**: Work status notifications via Slack, email, and other channels

## 🚀 Quick Start

### Installation

```bash
# Install with npm
npm install -g @noanswer/context-compose

# Or install with pnpm
pnpm add -g @noanswer/context-compose
```

### Project Initialization

```bash
# Initialize context-compose settings in current project
context-compose init

# Get context
context-compose get-context default
```

### MCP Server Setup

```json
{
  "context-compose": {
    "command": "npx",
    "args": ["-y", "@noanswer/context-compose@latest"]
  }
}
```

## 📖 Core Concepts

### Context

YAML files that define project-specific development guidelines, rules, and workflows.

```yaml
version: 1
kind: task
name: 'feature-development'
description: 'Context for new feature development'

context:
  workflow: workflows/feature-workflow.yaml
  roles:
    - roles/dan-abramov.yaml
    - roles/kent-c-dodds.yaml
  rules:
    - rules/clean-code.yaml
    - rules/testing-principles.yaml
  mcps:
    - mcps/sequential-thinking.yaml
    - mcps/context7.yaml
```

### Predefined Contexts

- **default**: Basic development context
- **feature**: New feature development
- **fix**: Bug fixing
- **refactor**: Code refactoring
- **api**: API development
- **testing**: Test writing
- **documentation**: Documentation work
- **security**: Security-related work
- **performance**: Performance optimization

## 🛠️ CLI Commands

### Basic Commands

```bash
# Initialize project
context-compose init

# Get context
context-compose get-context <context-id>

# Help
context-compose --help
```

### Context Usage Examples

```bash
# Basic development context
context-compose get-context default

# Feature development context (with enhanced prompt)
context-compose get-context feature --enhanced-prompt

# API development context
context-compose get-context api

# Bug fix context
context-compose get-context fix
```

## 🔧 MCP Server

Context Compose integrates directly with AI models through the Model Context Protocol.

### Available MCP Tools

- **get-context**: Get project context
- **init**: Initialize project

### Claude Desktop Setup

1. Claude Desktop configuration file location:

   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add context-compose server to configuration file:

```json
{
  "mcpServers": {
    "context-compose": {
      "command": "context-compose-server",
      "args": [],
      "cwd": "/path/to/your/project"
    }
  }
}
```

## 📁 Project Structure

```
your-project/
├── .contextcompose/          # Context Compose configuration directory
│   ├── default-context.yaml  # Default context
│   ├── feature-context.yaml  # Feature development context
│   ├── workflows/            # Workflow definitions
│   ├── rules/               # Development rules
│   ├── roles/               # Role definitions
│   ├── mcps/                # MCP tool configurations
│   └── notify/              # Notification settings
└── your-project-files...
```

## 🎯 Usage Scenarios

### 1. New Feature Development

```bash
# Apply feature development context
context-compose get-context feature --enhanced-prompt
```

AI automatically applies:

- Development philosophy of Dan Abramov and Kent C. Dodds
- Clean code and testing principles
- Feature development workflow
- Code review and documentation guidelines

### 2. Bug Fixing

```bash
# Apply bug fix context
context-compose get-context fix
```

### 3. API Development

```bash
# Apply API development context
context-compose get-context api
```

## 🔧 Development Environment Setup

### Requirements

- Node.js 18+
- npm 8+ or pnpm 8+

### Local Development

```bash
# Clone repository
git clone https://github.com/weproud/context-compose.git
cd context-compose

# Install dependencies
pnpm install

# Run development mode
pnpm dev

# Run tests
pnpm test

# Build
pnpm build
```

## 📚 Documentation

- [Context Customization Guide](docs/context-customization.md)
- [Workflow Writing Guide](docs/workflow-guide.md)
- [MCP Server Setup](docs/mcp-server-setup.md)
- [API Reference](docs/api-reference.md)

## 🤝 Contributing

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## 📄 License

This project is distributed under the ISC License. See the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/weproud/context-compose)
- [Issue Tracker](https://github.com/weproud/context-compose/issues)
- [NPM Package](https://www.npmjs.com/package/@noanswer/context-compose)

---

**Make your AI collaboration more systematic and efficient with Context Compose! 🚀**
