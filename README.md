# 🦇 Bruce: The Mini Claude Code

> An agentic, terminal-based AI assistant powered by OpenRouter.

Bruce is a lightweight but powerful CLI tool inspired by Claude Code. It brings autonomous AI capabilities directly into your terminal, allowing you to converse with LLMs that can read your local files, write code, and execute bash commands on your behalf. 

Whether you need to analyze a Git repository, refactor an entire directory, or scaffold a new project, Bruce acts as your personal terminal sidekick.

## ✨ Features

- **Agentic Capabilities:** Bruce doesn't just chat. He has direct access to read/write files and execute bash commands to autonomously accomplish complex tasks.
- **Model Agnostic:** Powered by OpenRouter, you can instantly switch between the best models (e.g., GPT-4, Claude 3.5 Sonnet, Llama 3) directly from the CLI.
- **Zero-Friction Setup:** Automatically prompts and securely stores your API keys locally (`~/.bruce/config.json`) on first run. No messy environment variables required.
- **Lightweight & Fast:** Built entirely in TypeScript with a minimal footprint.

## 🚀 Installation

You can install Bruce globally on your system using npm:

```bash
npm install -g .
```

*Note: You may need to run `npm run build` if the `dist/` directory is not already compiled.*

## 💻 Usage

Simply type `bruce` followed by your prompt. No flags necessary.

```bash
# Read files and summarize
bruce "read package.json and summarize what this project does"

# Search and analyze codebase
bruce "find all TODO comments in my codebase"

# Write code and scaffold
bruce "create a new python script that scrapes a website"
```

To see the interactive welcome screen and all available commands, simply run:
```bash
bruce help
```

## ⚙️ Configuration

Bruce allows you to easily configure your preferences on the fly. 

- **Select Model:** Fetch and choose from a dynamic list of available OpenRouter models:
  ```bash
  bruce config model
  ```
- **Set API Key:**
  ```bash
  bruce config apiKey <your-key>
  ```
- **Set Max Tokens:** (Useful to prevent OpenRouter 402 Credit limit errors)
  ```bash
  bruce config maxTokens 4000
  ```

## 🛠️ Built With
- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/)
- [OpenAI Node SDK](https://github.com/openai/openai-node) (configured for OpenRouter)

---
*Built as a lightweight alternative to full-scale agentic terminal environments.*
