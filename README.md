# Context Compose

**Model Context Protocol (MCP) Server for AI Development Workflows**

## 🎯 Why Context Compose?

While PRDs (Product Requirements Documents) provide overall project descriptions, they lack the detailed context needed for specific development tasks. Each development unit (feature, fix, refactor, docs, etc.) requires its own contextual guidance to maintain consistency and quality.

Context Compose was born from the idea of creating a composable system - like Docker Compose or GitHub Actions - where you can mix and match only the components you need for each specific task.

**The Problem:**

- PRDs are too high-level for granular development work
- Developers constantly switch between different types of tasks requiring different mindsets
- Inconsistent approaches across team members for similar tasks
- Repetitive context-setting for AI assistants

**The Solution:**
Context Compose provides task-specific contexts that can be composed together, ensuring consistent, high-quality development practices across your entire team.

## ✨ Key Features

- 🎯 **Task-Specific Contexts**: Maintain consistent context for each development unit (feature, fix, refactor, etc.)
- 🔧 **Fully Customizable**: Extend and customize contexts to match your team's specific needs
- 🤖 **MCP Integration**: Direct integration with AI models via Model Context Protocol
- 📋 **Composable Architecture**: Mix and match components like Docker Compose
- 🔄 **Workflow Engine**: Automated task flows for different development scenarios
- � **Role-based Development**: Apply expert personas and specialized knowledge domains
- 📢 **Notification System**: Work status notifications via Slack, email, and other channels

## 🚀 MCP Registration

```json
{
  "mcpServers": {
    "context-compose": {
      "command": "npx",
      "args": ["-y", "@noanswer/context-compose@latest"]
    }
  }
}
```

## 📖 Usage Examples

### Initialize Project

```
(prompt) initialize project with context-compose
```

### Basic Context Loading

#### Load default development context
```
(prompt) get-context default with context-compose
```

#### Load feature development context with enhanced guidelines
```
(prompt) get-context feature --enhanced-prompt with context-compose
```

#### Load API development context
```
(prompt) get-context api with context-compose
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
(prompt) get-context feature --enhanced-prompt with context-compose
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
(prompt) get-context api with context-compose
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
(prompt) get-context performance with context-compose
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
(prompt) get-context review with context-compose
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
(prompt) get-context fix with context-compose
```

**What you get**:

- Systematic debugging approaches
- Root cause analysis frameworks
- Testing strategies for fixes
- Regression prevention guidelines
- Documentation requirements

## � Built-in Assets Structure

Context Compose comes with a comprehensive set of pre-built components organized in the `assets/` directory:

### 🎭 **Roles** (`assets/roles/`)

Expert personas that provide specialized knowledge and perspectives:

- **Frontend Experts**: Dan Abramov (React), Evan You (Vue), Rich Harris (Svelte)
- **Backend Experts**: DHH (Rails), Ryan Dahl (Node.js), Linus Torvalds (Systems)
- **Architecture Experts**: Martin Fowler (Patterns), Uncle Bob (Clean Code), John Carmack (Performance)
- **Testing Experts**: Kent C. Dodds (Testing), Sindre Sorhus (Open Source)

### 📋 **Rules** (`assets/rules/`)

Development guidelines and best practices:

- **Code Quality**: Clean code principles, SOLID principles, refactoring guidelines
- **Security**: Security guidelines, error handling patterns
- **Performance**: Performance optimization, accessibility guidelines
- **Process**: Git workflow, testing principles, documentation standards
- **API Design**: RESTful API patterns, API documentation standards

### ⚡ **Actions** (`assets/actions/`)

Automated workflow steps for common development tasks:

- **Development**: Code implementation, testing, linting, building
- **Git Operations**: Branch creation, commits, pull requests, merging
- **Deployment**: Environment setup, deployment, rollback procedures
- **Quality Assurance**: Code review, security audit, performance optimization
- **Communication**: Status updates, documentation generation

### 🔧 **MCPs** (`assets/mcps/`)

Model Context Protocol integrations for enhanced AI capabilities:

- **sequential-thinking**: Systematic problem-solving framework
- **context7**: Advanced context management and retrieval
- **github-api**: GitHub integration for repository operations
- **playwright**: Browser automation and testing
- **web-search**: Web search and information gathering

### 📢 **Notify** (`assets/notify/`)

Communication channels for status updates and notifications:

- **Slack**: Rich message formatting with attachments and status indicators
- **Discord**: Community notifications with embed support
- **Email**: Professional email notifications with templates

### 🔄 **Workflows** (`assets/workflows/`)

Complete workflow orchestrations for different development scenarios:

- **feature-workflow**: End-to-end feature development process
- **hotfix-workflow**: Emergency bug fix procedures
- **release-workflow**: Release preparation and deployment

### 📝 **Custom** (`assets/custom/`)

Template directory for creating your own custom components and extensions.

## �🛠️ Customization

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
