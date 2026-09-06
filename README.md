# 🦇 Aela: The Mini Claude Code

> An agentic, terminal-based AI assistant powered by OpenRouter.

Aela is a lightweight but powerful CLI tool inspired by Claude Code. It brings autonomous AI capabilities directly into your terminal, allowing you to converse with LLMs that can read your local files, write code, and execute bash commands on your behalf. 

Whether you need to analyze a Git repository, refactor an entire directory, or scaffold a new project, Aela acts as your personal terminal sidekick.

## ✨ Features

- **Agentic Capabilities:** Aela doesn't just chat. He has direct access to read/write files, execute bash commands, fetch full webpages, search the web (via Tavily), and even pause to ask you for clarification mid-task.
- **Interactive REPL Mode:** Drop into a continuous, multi-turn chat session with persistent memory (`aela repl`).
- **Beautiful Theming:** A polished, color-coded terminal UX built with `picocolors`.
- **Model Agnostic:** Powered by OpenRouter, you can instantly switch between the best models (e.g., GPT-4, Claude 3.5 Sonnet, Llama 3) directly from the CLI.
- **Zero-Friction Setup:** Automatically prompts and securely stores your API keys locally (`~/.aela/config.json`) on first run. No messy environment variables required.
- **Lightweight & Fast:** Built entirely in TypeScript with a minimal footprint.

## 🚀 Installation

You can install Aela globally on your system using npm:

```bash
npm install -g .
```

*Note: You may need to run `npm run build` if the `dist/` directory is not already compiled.*

## 💻 Usage

Simply type `aela` followed by your prompt for one-shot execution, or type `aela repl` to drop into a continuous chat session with persistent memory. No flags necessary.

```bash
# Start an interactive REPL session
aela repl

# Read files and summarize
aela "read package.json and summarize what this project does"

# Search and analyze codebase
aela "find all TODO comments in my codebase"

# Write code and scaffold
aela "create a new python script that scrapes a website"

# Search the Web
aela "Search the web for the latest news about OpenAI"

# Fetch and Read Webpages
aela "Go to https://news.ycombinator.com and list the top 3 stories right now"
```

To see the interactive welcome screen and all available commands, simply run:
```bash
aela help
```

## ⚙️ Configuration

Aela allows you to easily configure your preferences on the fly. 

- **Select Model:** Fetch and choose from a dynamic list of available OpenRouter models:
  ```bash
  aela config model
  ```
- **Set API Key (OpenRouter):**
  ```bash
  aela config apiKey <your-key>
  ```
- **Set Web Search API Key (Tavily):**
  ```bash
  aela config tavilyApiKey <your-key>
  ```
- **Set Max Tokens:** (Useful to prevent OpenRouter 402 Credit limit errors)
  ```bash
  aela config maxTokens 4000
  ```

## 🛠️ Built With
- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/)
- [OpenAI Node SDK](https://github.com/openai/openai-node) (configured for OpenRouter)

---
*Built as a lightweight alternative to full-scale agentic terminal environments.*
