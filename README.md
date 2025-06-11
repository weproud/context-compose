# Context Compose

**Model Context Protocol (MCP) Server for AI Development Workflows**

## 🎯 Why Context Compose?

Modern AI development assistants like Claude, ChatGPT, and Cursor are incredibly powerful, but they often lack project-specific context and consistent development guidelines. Context Compose solves this by providing:

- **Systematic Context Management**: No more copy-pasting the same instructions repeatedly
- **Consistent Development Standards**: Apply proven patterns and expert knowledge across your team
- **Workflow Automation**: Streamline repetitive development tasks with predefined workflows
- **Expert Personas**: Leverage the wisdom of industry experts like Dan Abramov, Martin Fowler, and Kent C. Dodds
- **Seamless AI Integration**: Direct integration with AI models through Model Context Protocol (MCP)

Context Compose transforms ad-hoc AI interactions into systematic, repeatable, and efficient development workflows.

## ✨ Key Features

- 🤖 **MCP Server**: Direct integration with AI models like Claude, ChatGPT via Model Context Protocol
- 📋 **Context System**: Project-specific development guidelines, rules, and best practices management
- 🔄 **Workflow Engine**: Automated task flows for development, testing, deployment, and code review
- 🎯 **Role-based Development**: Apply expert personas and specialized knowledge domains
- 📢 **Notification System**: Work status notifications via Slack, email, and other channels
- 🛠️ **Dual Interface**: Both MCP server and CLI tools for maximum flexibility

## 🚀 MCP Registration

### Claude Desktop

Add to your Claude Desktop configuration file (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "context-compose": {
      "command": "npx",
      "args": ["-y", "@noanswer/context-compose@latest"],
      "cwd": "/path/to/your/project"
    }
  }
}
```

### Other MCP-Compatible Clients

For any MCP-compatible client, use the following configuration:

```json
{
  "context-compose": {
    "command": "context-compose-mcp",
    "args": [],
    "cwd": "/path/to/your/project"
  }
}
```

## 🔧 Usage in Cursor and Windsurf

### Cursor Integration

1. **Install Context Compose**:

   ```bash
   npm install -g @noanswer/context-compose
   ```

2. **Initialize in your project**:

   ```bash
   context-compose init
   ```

3. **Use with Cursor Rules**: Add to your `.cursor/rules` directory:

   ```markdown
   # .cursor/rules/context-compose.md

   Before starting any development task, use the MCP tool "get-context" to load appropriate project context:

   - For new features: get-context feature
   - For bug fixes: get-context fix
   - For API development: get-context api
   - For refactoring: get-context refactor
   ```

### Windsurf Integration

1. **Setup MCP Server**: Configure Context Compose as an MCP server in Windsurf settings

2. **Project Initialization**:

   ```bash
   context-compose init
   ```

3. **Context Loading**: Use the MCP tools directly in Windsurf:
   - `get-context default` - Load basic development context
   - `get-context feature --enhanced-prompt` - Load feature development context with detailed guidelines

### 💡 Pro Tip: Enhanced AI Interaction

For better AI responses, include "with context-compose" in your conversation when asking for development help:

```
"Help me build a React component with context-compose"
"Review this API code with context-compose"
"Debug this issue with context-compose"
```

This helps the AI understand that you want to leverage the loaded context and guidelines for more accurate, project-specific assistance.

## 📖 Usage Examples

### Basic Context Loading

```yaml
# Load default development context
get-context default

# Load feature development context with enhanced guidelines
get-context feature --enhanced-prompt

# Load API development context
get-context api
```

### Context Structure Example

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
    - rules/typescript-best-practices.yaml
  mcps:
    - mcps/sequential-thinking.yaml
    - mcps/context7.yaml
  notify:
    - notify/slack.yaml
```

## 🎭 User Scenarios

### 1. Frontend Developer - New Feature Development

**Scenario**: Building a new React component with TypeScript

```bash
# Load feature development context with React/TypeScript expertise
get-context feature --enhanced-prompt
```

**What you get**:

- Dan Abramov's React patterns and best practices
- TypeScript strict typing guidelines
- Component testing strategies
- Performance optimization rules
- Code review checklist

### 2. Backend Developer - API Development

**Scenario**: Creating RESTful APIs with proper error handling

```bash
# Load API development context
get-context api
```

**What you get**:

- RESTful API design principles
- Error handling patterns
- Security best practices
- Database optimization guidelines
- API documentation standards

### 3. DevOps Engineer - Performance Optimization

**Scenario**: Optimizing application performance and deployment

```bash
# Load performance optimization context
get-context performance
```

**What you get**:

- Performance monitoring strategies
- Caching patterns
- Database query optimization
- Infrastructure scaling guidelines
- Deployment automation workflows

### 4. Team Lead - Code Review

**Scenario**: Conducting thorough code reviews

```bash
# Load code review context
get-context review
```

**What you get**:

- Code quality checklist
- Security vulnerability patterns
- Performance bottleneck identification
- Best practice validation
- Mentoring guidelines

### 5. Bug Hunter - Issue Resolution

**Scenario**: Debugging and fixing production issues

```bash
# Load bug fixing context
get-context fix
```

**What you get**:

- Systematic debugging approaches
- Root cause analysis frameworks
- Testing strategies for fixes
- Regression prevention guidelines
- Documentation requirements

## 🛠️ Customization

### Creating Custom Contexts

1. **Create a new context file** in `.contextcompose/`:

```yaml
# .contextcompose/my-custom-context.yaml
version: 1
kind: task
name: 'my-custom-workflow'
description: 'Custom context for specific project needs'

context:
  workflow: workflows/custom-workflow.yaml
  roles:
    - roles/domain-expert.yaml
  rules:
    - rules/project-specific.yaml
    - rules/company-standards.yaml
  mcps:
    - mcps/custom-tools.yaml
prompt: |
  Custom instructions for this specific context...
```

2. **Create supporting files**:

```yaml
# .contextcompose/roles/domain-expert.yaml
version: 1
kind: role
name: domain-expert
description: Domain-specific expertise

prompt: |
  You are a domain expert with deep knowledge of:
  - Industry-specific patterns
  - Regulatory requirements
  - Business logic constraints
```

```yaml
# .contextcompose/rules/project-specific.yaml
version: 1
kind: rule
name: project-specific-rules
description: Project-specific development rules

prompt: |
  ## Project-Specific Guidelines

  1. **Architecture Patterns**:
     - Use hexagonal architecture
     - Implement CQRS for complex domains

  2. **Code Standards**:
     - Follow company naming conventions
     - Use specific logging formats
```

### Customizing Existing Contexts

1. **Override default contexts** by creating files with the same name:

```yaml
# .contextcompose/default-context.yaml
version: 1
kind: task
name: default
description: Customized default context for our team

context:
  workflow: workflows/team-workflow.yaml
  roles:
    - roles/senior-developer.yaml
  rules:
    - rules/team-standards.yaml
    - rules/security-first.yaml
```

2. **Extend contexts** by referencing base contexts:

```yaml
# .contextcompose/extended-feature-context.yaml
version: 1
kind: task
name: extended-feature
description: Feature development with additional constraints

extends: feature-context.yaml

context:
  rules:
    - rules/compliance-requirements.yaml
    - rules/accessibility-standards.yaml
```

### Environment-Specific Configurations

```yaml
# .contextcompose/environments/production.yaml
version: 1
kind: environment
name: production
description: Production deployment context

context:
  rules:
    - rules/production-safety.yaml
    - rules/monitoring-requirements.yaml
  notify:
    - notify/ops-team.yaml
```

### Team Collaboration

1. **Share contexts via version control**:

   - Commit `.contextcompose/` directory to your repository
   - Team members automatically get consistent contexts

2. **Organization-wide contexts**:

   - Create organization templates
   - Distribute via npm packages or git submodules

3. **Role-based access**:
   - Different contexts for different team roles
   - Junior vs senior developer contexts
   - Specialized domain contexts

---

**Transform your AI development workflow with Context Compose! 🚀**

## 📄 License

This project is distributed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/weproud/context-compose)
- [Issue Tracker](https://github.com/weproud/context-compose/issues)
- [NPM Package](https://www.npmjs.com/package/@noanswer/context-compose)
