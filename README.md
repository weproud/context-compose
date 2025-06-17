# Context Compose

**Composable Contexts for High-Quality, AI-Powered Development**

## Why Context Compose?

While high-level requirements documents (like PRDs) provide overall project goals, they often lack the detailed, task-specific context needed for day-to-day development. Each unit of work—be it a new feature, a bug fix, or a refactor—requires its own focused set of rules, expert perspectives, and guidelines to ensure consistency and quality.

Context Compose provides a simple yet powerful system for defining, composing, and managing these granular contexts. It's like Docker Compose, but for your AI development workflow.

**The Problem:**

- High-level documents are too broad for specific coding tasks.
- Developers constantly switch between tasks that require different mindsets and rules.
- Inconsistent approaches across team members for similar tasks lead to quality issues.
- Repetitive and manual context-setting for AI assistants is time-consuming.

**The Solution:**
Context Compose allows you to define reusable, task-specific contexts that can be composed on demand. This ensures every task is approached with the right expertise and standards, leading to consistent, high-quality results across your entire team.

## Key Features

- 🎯 **Task-Specific Contexts**: Create dedicated contexts for features, bug fixes, refactoring, API design, and more.
- 🧩 **Composable Architecture**: Mix and match components—like expert personas, coding rules, and specialized tools—to build the perfect context for any task.
- 🔧 **Fully Customizable**: The system is built on a simple directory structure. You can override existing assets or create entirely new categories (e.g., `security`, `testing-philosophy`) to fit your project's unique needs.
- ⌨️ **Simple CLI**: A straightforward command-line interface (`start-context`) makes it easy to load contexts and integrate with your existing workflows.
- 📂 **Clear File-Based Structure**: All contexts and assets are managed as simple YAML files, making them easy to version control, share, and edit.

## MCP Server Integration

To integrate Context Compose with an MCP-compatible client (like an IDE extension), you can register it as an MCP server.

For integration with automated tools, use the following configuration in your settings file:

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

This configuration tells the client how to start the `context-compose` server, ensuring it runs non-interactively.

## Project Initialization

Before using contexts, you need to initialize your project. This sets up the necessary `.contextcompose` directory and default assets.

Copy and paste the following into your prompt to run it.

```
initialize my project using context-compose
```

**What happens**:

- The `init` command runs.
- A `.contextcompose` directory is created in your project root.
- Default assets (personas, rules, etc.) are copied into it, ready for you to use or customize.

## How It Works

Context Compose works by reading a main context file and dynamically assembling a final, detailed prompt from various component files. The entire system is driven by a special directory in your project root: `.contextcompose/`.

1.  **The `.contextcompose/` Directory**: When you start a task, you tell Context Compose which context to use (e.g., `feature`).
2.  **Main Context File**: It looks for a corresponding file, like `.contextcompose/feature-context.yaml`.
3.  **The `context` Block**: Inside this file, a `context` block lists all the components to include. It references other YAML files organized by category (e.g., `personas`, `rules`).
4.  **Dynamic Composition**: The tool reads each referenced file, extracts its prompt, and combines everything into a single, comprehensive prompt.

**The best part? It's fully extensible.** You can create any category you want. If you add a `security:` section to your context file, the tool will automatically look for files in a `.contextcompose/security/` directory.

### Context Structure Example

Here is an example of what a `.contextcompose/api-context.yaml` file might look like. It defines the context for building a new API endpoint.

```yaml
# .contextcompose/api-context.yaml
version: 1
kind: context
name: 'api-development'
description: 'Context for creating new API endpoints.'

# This is the base prompt for the main context file itself.
prompt: 'You are building a new API endpoint. Follow all the guidelines provided.'
enhanced-prompt: 'Your mission is to construct a robust, secure, and well-documented API endpoint. Pay close attention to the expert advice from the persona, adhere strictly to all specified rules, and utilize the recommended tools (MCPs).'

# Here we compose the context from other files.
context:
  personas:
    - personas/uncle-bob.yaml
  rules:
    - rules/api-design.yaml
    - rules/clean-code.yaml
  # This is a custom category!
  security:
    - security/owasp-top-10.yaml
  mcps:
    - mcps/sequential-thinking.yaml
```

## 🛠️ Customization in Detail

Customizing Context Compose is its core strength. You can override built-in assets or create new ones from scratch.

**Scenario**: Let's add a new category for "Company-Wide Principles".

1.  **Create a New Directory**: Inside your project's `.contextcompose/` directory, create a new folder named `principles`.

    ```
    .contextcompose/
    ├── principles/
    └── ...
    ```

2.  **Create Your Asset File**: Inside the new directory, create a YAML file. The `kind` should match the singular version of the directory name.

    ```yaml
    # .contextcompose/principles/team-values.yaml
    version: 1
    kind: principle # Matches the 'principles' directory
    name: 'team-values'
    description: 'The core values our engineering team follows.'
    prompt: |
      - Always prioritize clarity over cleverness.
      - Leave code better than you found it.
      - Communicate proactively.
    ```

3.  **Reference it in Your Context**: Now, you can add `principles` to any `*-context.yaml` file.

    ```yaml

    # .contextcompose/feature-context.yaml

    version: 1
    kind: context
    name: 'feature'

    # ...

    context:
      personas: - personas/frontend-expert.yaml
      rules: - rules/typescript-best-practices.yaml

      # Your new custom category is now part of the context!

      principles: - principles/team-values.yaml
      `When you run`context-compose start-context feature`, the content of `team-values.yaml` will be automatically included in the final prompt.

    ```

4.  **Validate Your Assets**

    After creating or modifying asset files, it's a good practice to validate them. Context Compose provides a `validate` command to check for common errors.

    ```bash
    npx @noanswer/context-compose validate
    ```

    This command will check all your asset files inside the `.contextcompose` directory and verify that:

    - The YAML syntax is correct.
    - All required fields (`version`, `kind`, `name`, `description`, `prompt`) are present.

    This helps you catch errors early and ensures your contexts are correctly structured.

## 🎭 User Scenarios

### 1. Project Initialization

Before using contexts, you need to initialize your project. This sets up the necessary `.contextcompose` directory and default assets.

> initialize my project using context-compose

**What happens**:

- The `init` command runs.
- A `.contextcompose` directory is created in your project root.
- Default assets (personas, rules, etc.) are copied into it, ready for you to use or customize.

### 2. Frontend Developer: Building a New React Component

A developer is tasked with building a new search component using React and TypeScript. They would start by telling their AI assistant:

> start-context react-feature -e using context-compose

**What they get**:

- Guidance from a **React Expert Persona** on component structure and state management.
- Strict **TypeScript Rules** for type safety and best practices.
- Checklists from **Testing Rules** to ensure Jest/RTL coverage.
- A **Sequential Thinking** framework to break down the task.

### 3. Backend Developer: Creating a Secure API Endpoint

A developer needs to create a new RESTful API endpoint for user authentication. They would start by telling their AI assistant:

> start-context secure-api using context-compose

**What they get**:

- Principles from **API Design Rules** for RESTful patterns.
- Critical reminders from custom **Security Rules** based on OWASP guidelines.
- Best practices from **Clean Code Rules** for maintainability.

### 4. Team Lead: Performing a Code Review

A team lead wants to ensure a consistent and thorough code review process. They would start by telling their AI assistant:

> start-context code-review using context-compose

**What they get**:

- A **Code Quality Checklist** from the rules to standardize the review.
- The perspective of an **Architecture Expert Persona** to check for anti-patterns.
- Guidelines on providing constructive feedback.

## 📦 Built-in Assets Structure

Context Compose comes with a set of pre-built assets to get you started. You can use them as is or override them by creating files with the same name in your project's `.contextcompose/` directory.

- **`assets/personas/`**: Expert personas providing specialized knowledge (e.g., `frontend-expert`, `backend-expert`, `devops-expert`).
- **`assets/rules/`**: Development guidelines and best practices (e.g., `clean-code`, `api-design`, `testing-principles`).
- **`assets/actions/`**: Definitions for specific AI tasks and operations.
- **`assets/mcps/`**: Integrations with Model Context Protocols for enhanced AI capabilities (e.g., `sequential-thinking`, `web-search`).

## 🔗 Links

- [GitHub Repository](https://github.com/weproud/context-compose)
- [Issue Tracker](https://github.com/weproud/context-compose/issues)
- [NPM Package](https://www.npmjs.com/package/@noanswer/context-compose)
