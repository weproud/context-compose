# Task Action Model Context Protocol (MCP)

A comprehensive MCP server and CLI toolkit built with Node.js, TypeScript, and FastMCP.

## 📋 Overview

This project provides a complete implementation of a Model Context Protocol (MCP) server along with a corresponding CLI tool. The MCP server exposes tools, resources, and prompts for Large Language Models (LLMs) to interact with external systems, while the CLI tool mirrors the server's functionality for direct command-line usage.

### Key Features

- **🚀 FastMCP-based Server**: Scalable MCP server built with Node.js and TypeScript
- **🛠️ Rich Tool Set**: Multiple tools including project initialization, messaging, and more
- **📱 CLI Interface**: Commander.js-based CLI that mirrors MCP server functionality
- **🔒 Type Safety**: Full TypeScript support with Zod schema validation
- **🧪 Testing**: Comprehensive testing with Vitest and Playwright
- **🔍 Debugging**: Built-in MCP Inspector support for development
- **📦 Single Package**: Unified package with multiple entry points

## 🛠️ Tech Stack

### Core Technologies

- **Runtime**: Node.js with FastMCP
- **Language**: TypeScript
- **Package Manager**: pnpm
- **MCP Framework**: FastMCP (TypeScript)
- **Schema Validation**: Zod
- **CLI Framework**: Commander.js
- **Linting & Formatting**: ESLint, Prettier
- **Testing**: Vitest (unit/integration), Playwright (E2E)
- **Transports**: Stdio (local), HTTP SSE (remote)

### Dependencies

- **Core**:
  - `@modelcontextprotocol/sdk` - Official MCP SDK
  - `fastmcp` - TypeScript MCP framework
  - `zod` - Schema validation
  - `commander` - CLI framework
- **Development**:
  - `typescript`
  - `@types/node`
  - `vitest`
  - `@playwright/test`
  - `eslint`
  - `prettier`

## 📁 Project Structure

```
hello-model-context-protocol/
├── mcp-server/                  # MCP Server (FastMCP-based)
│   ├── src/                     # MCP server source code
│   │   ├── tools/               # Tool definitions
│   │   │   ├── init.ts          # Project initialization tool
│   │   │   ├── slack.ts         # Slack messaging tool
│   │   │   ├── discord.ts       # Discord messaging tool
│   │   │   └── index.ts         # Tool registration
│   │   ├── index.ts             # MCP server main class
│   │   └── logger.ts            # Logging utilities
│   └── server.ts                # MCP server entry point
├── src/                         # Shared source code
│   ├── schemas/                 # Tool-specific schema definitions
│   │   ├── init.ts              # Init tool schema
│   │   ├── slack.ts             # Slack tool schema
│   │   ├── discord.ts           # Discord tool schema
│   │   └── index.ts             # Schema exports
│   ├── core/                    # Shared utilities and business logic
│   │   ├── tools/               # Common business logic
│   │   │   ├── init.ts          # Init tool logic
│   │   │   ├── slack.ts         # Slack tool logic
│   │   │   ├── discord.ts       # Discord tool logic
│   │   │   └── index.ts         # Tool logic exports
│   │   └── utils.ts             # Common utilities
│   ├── cli/                     # CLI logic
│   │   ├── commands/            # CLI command handlers
│   │   │   ├── init.ts          # Init command
│   │   │   ├── slack.ts         # Slack command
│   │   │   └── discord.ts       # Discord command
│   │   └── index.ts             # CLI entry point
│   └── types/                   # Common TypeScript type definitions
├── tests/                       # Test code
│   ├── unit/                    # Vitest unit tests
│   └── e2e/                     # Playwright E2E tests
├── .eslintrc.json               # ESLint configuration
├── .prettierrc                  # Prettier configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Package configuration
├── vitest.config.ts             # Vitest configuration
├── playwright.config.ts         # Playwright configuration
└── README.md                    # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/weproud/hello-model-context-protocol.git
cd hello-model-context-protocol

# Install dependencies
pnpm install

# Build the project
pnpm build
```

### Quick Start

#### 1. Run MCP Server

```bash
# Development mode (TypeScript)
pnpm dev:server

# Production mode (JavaScript)
pnpm start:server
```

#### 2. Use CLI Tools

```bash
# Initialize a project
pnpm task-action init

# Send Slack message (requires SLACK_WEBHOOK_URL)
pnpm task-action send-message-slack "Hello, World!"

# Send Discord message (requires DISCORD_WEBHOOK_URL)
pnpm task-action send-message-discord "Hello, Discord!"
```

#### 3. Test with MCP Inspector

```bash
# Inspect the server
pnpm inspect
```

## 🏗️ Architecture

### Shared Business Logic

This project follows the **DRY (Don't Repeat Yourself)** principle by sharing the same business logic between CLI and MCP server implementations.

#### Structure

```
src/core/tools/
├── init.ts             # Init tool core business logic
├── slack.ts            # Slack tool core business logic
├── discord.ts          # Discord tool core business logic
└── index.ts            # All tool logic exports
```

#### Benefits

- **🚫 No Duplication**: Reuse identical logic in CLI and MCP server
- **🔧 Maintainability**: Change business logic in one place only
- **🧪 Testability**: Test core logic independently
- **📏 Consistency**: CLI and MCP server behavior always match
- **🔌 Interface Separation**: Separate business logic from interface logic

#### Usage Example

```typescript
// CLI usage
import { executeInitTool } from '@/core/tools';
const result = await executeInitTool({ configPath: '.hellomcp' });

// MCP server usage
import { executeInitTool } from '@/core/tools';
const result = await executeInitTool({ configPath: '.hellomcp' });
```

## 🔍 MCP Inspector Usage

MCP Inspector is the official tool for testing and debugging MCP servers through a web UI.

### Running MCP Inspector

#### Method 1: npm scripts (Recommended)

```bash
# Run with TypeScript source files
pnpm inspect

# Run with built JavaScript files
pnpm build
pnpm inspect:built
```

#### Method 2: Direct FastMCP usage

```bash
# Run with TypeScript files
npx fastmcp inspect mcp-server/server.ts

# Run with JavaScript files (after build)
npx fastmcp inspect dist/mcp-server/server.js
```

### How to Use MCP Inspector

1. **Start Server**: Run one of the commands above - a web browser will open automatically
2. **Test Tools**: Test tools like `init`, `send_message_slack` directly in the web UI
3. **Check Resources**: Explore available resources like `logs://application`
4. **Real-time Debugging**: Monitor server logs and request/response in real-time

### MCP Inspector Features

- **🛠️ Tool Testing**: Execute each MCP tool directly in the web UI
- **📊 Resource Exploration**: Browse server-provided resources
- **🔍 Real-time Logs**: Monitor server operation status
- **📝 Schema Validation**: Verify tool parameter schemas
- **🚀 Rapid Prototyping**: Instantly test new tools during development

### Example Test Scenarios

#### Testing Init Tool

1. Run MCP Inspector
2. Select "init" tool in the "Tools" tab
3. Enter parameters: `{"configPath": ".hellomcp", "force": false}`
4. Click "Execute" button
5. Review results: Project initialization result JSON

#### Testing Messaging Tools

1. Select "send_message_slack" tool
2. Enter parameters: `{"message": "Hello from MCP!"}`
3. Execute and check results (requires SLACK_WEBHOOK_URL in environment)

## 🖥️ CLI Usage

### Available Commands

The CLI provides the same functionality as the MCP server tools, allowing direct command-line usage.

#### Method 1: npm scripts (Recommended)

```bash
# Initialize project
pnpm task-action init

# Send Slack message
pnpm task-action send-message-slack "Hello, World!"

# Send Discord message
pnpm task-action send-message-discord "Hello, Discord!"

# Show examples
pnpm task-action examples

# Show help
pnpm task-action --help
```

#### Method 2: Direct execution

```bash
# Using tsx directly
npx tsx src/cli/index.ts init --verbose
npx tsx src/cli/index.ts examples
```

#### Method 3: Global installation (Optional)

```bash
# Link project globally
pnpm link

# Use anywhere
task-action init --verbose
task-action examples
task-action --help
```

### Command Examples

#### Init Command

```bash
# Basic usage
pnpm task-action init
# Result: Creates .hellomcp directory and hello.yaml file

# Verbose output
pnpm task-action init --verbose
# Result: Detailed initialization information

# Force overwrite
pnpm task-action init --force
# Result: Overwrites existing files
```

#### Messaging Commands

```bash
# Send Slack message (requires SLACK_WEBHOOK_URL environment variable)
SLACK_WEBHOOK_URL="your-webhook-url" pnpm task-action send-message-slack "Hello from CLI!"

# Send Discord message (requires DISCORD_WEBHOOK_URL environment variable)
DISCORD_WEBHOOK_URL="your-webhook-url" pnpm task-action send-message-discord "Hello from CLI!"
```

## 🔧 MCP Server Usage

### Integration with MCP Clients

#### Claude Desktop Integration

Add the following configuration to your Claude Desktop MCP settings:

**macOS**: `~/.claude/mcp_servers.json`
**Windows**: `%APPDATA%\Claude\mcp_servers.json`
**Linux**: `~/.config/claude/mcp_servers.json`

```json
{
  "mcpServers": {
    "task-action": {
      "command": "node",
      "args": ["path/to/task-action/mcp-server/server.js"],
      "env": {
        "SLACK_WEBHOOK_URL": "your-slack-webhook-url",
        "DISCORD_WEBHOOK_URL": "your-discord-webhook-url"
      }
    }
  }
}
```

#### Cursor Integration

Add to your Cursor MCP settings:

**macOS**: `~/.cursor/mcp_servers.json`
**Windows**: `%APPDATA%\Cursor\mcp_servers.json`
**Linux**: `~/.config/cursor/mcp_servers.json`

```json
{
  "mcpServers": {
    "hello-mcp": {
      "command": "node",
      "args": ["path/to/hello-model-context-protocol/mcp-server/server.js"],
      "env": {
        "SLACK_WEBHOOK_URL": "your-slack-webhook-url",
        "DISCORD_WEBHOOK_URL": "your-discord-webhook-url"
      }
    }
  }
}
```

### Available Tools

The MCP server exposes the following tools:

- **`init`**: Initialize a Task Action project (creates `.hellomcp` directory and `hello.yaml`)
- **`send_message_slack`**: Send messages to Slack via webhook
- **`send_message_discord`**: Send messages to Discord via webhook

### Environment Variables

Configure the following environment variables for messaging tools:

```bash
# Slack webhook URL for send_message_slack tool
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Discord webhook URL for send_message_discord tool
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/DISCORD/WEBHOOK
```

## 🧪 Testing

### Running Tests

```bash
# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run E2E tests
pnpm test:e2e

# Run all tests with coverage
pnpm test:coverage
```

### Test Structure

- **Unit Tests**: Located in `tests/unit/` using Vitest
- **E2E Tests**: Located in `tests/e2e/` using Playwright
- **Integration Tests**: Test CLI and MCP server integration

## 🛠️ Development

### Development Scripts

```bash
# Start development server
pnpm dev:server

# Start CLI in development mode
pnpm dev:cli

# Build project
pnpm build

# Type checking
pnpm type-check

# Linting
pnpm lint
pnpm lint:fix

# Formatting
pnpm format
pnpm format:check
```

### Adding New Tools

1. **Create Schema**: Add schema definition in `src/schemas/`
2. **Implement Logic**: Add business logic in `src/core/tools/`
3. **Add MCP Tool**: Register tool in `mcp-server/src/tools/`
4. **Add CLI Command**: Create CLI command in `src/cli/commands/`
5. **Write Tests**: Add unit and integration tests
6. **Update Documentation**: Update README and examples

### Project Structure Guidelines

- **Shared Logic**: Place reusable business logic in `src/core/`
- **Schema Validation**: Use Zod schemas in `src/schemas/`
- **Type Safety**: Maintain strict TypeScript types
- **Testing**: Write tests for all new functionality
- **Documentation**: Keep README and code comments updated

## 📚 Examples

### Using in Claude Desktop

```
User: "Initialize a new MCP project"
Claude: Uses the init tool to create .hellomcp directory and hello.yaml

User: "Send a message to Slack saying 'Hello team!'"
Claude: Uses send_message_slack tool to send the message
```

### Using CLI

```bash
# Initialize project
pnpm task-action init

# Send messages
SLACK_WEBHOOK_URL="..." pnpm task-action send-message-slack "Deployment complete!"
DISCORD_WEBHOOK_URL="..." pnpm task-action send-message-discord "Server is online!"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the project structure guidelines
4. Add tests for new functionality
5. Run tests and linting: `pnpm test && pnpm lint`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [FastMCP Documentation](https://github.com/jlowin/fastmcp)
- [Claude Desktop](https://claude.ai/desktop)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/weproud/hello-model-context-protocol/issues) page
2. Create a new issue with detailed information
3. Join the discussion in the repository

---

**Happy coding with Model Context Protocol! 🚀**

# task-action

# task-action
