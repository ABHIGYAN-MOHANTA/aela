#!/usr/bin/env node
import OpenAI from "openai";
import * as fs from "fs";
import { exec as execCallback } from "child_process";
import { promisify } from "util";
import * as os from "os";
import * as path from "path";
import * as readline from "readline";

const exec = promisify(execCallback);

const BAT_LOGO = `
   /\\                 /\\
  / \\'._   (\\_/)   _.'/ \\
 /_.''._'--('.')--'_.''._\\
 | \\_ /  ;=/ " \\=;  \\ _/ |
  \\/__\\__| \\___/ |__/__\\/
`;

async function promptInput(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => rl.question(query, (ans) => {
    rl.close();
    resolve(ans);
  }));
}

interface Config {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  tavilyApiKey?: string;
}

function getConfigPath() {
  const configDir = path.join(os.homedir(), ".bruce");
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  return path.join(configDir, "config.json");
}

function loadConfig(): Config {
  const configFile = getConfigPath();
  if (fs.existsSync(configFile)) {
    try {
      return JSON.parse(fs.readFileSync(configFile, "utf-8"));
    } catch (e) {
      return {};
    }
  }
  return {};
}

function saveConfig(config: Config) {
  const configFile = getConfigPath();
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
}

async function getValidConfig(): Promise<Config> {
  let config = loadConfig();
  if (!config.apiKey) {
    console.log(BAT_LOGO);
    const key = await promptInput("Please enter your OpenRouter API key: ");
    config.apiKey = key.trim();
    saveConfig(config);
    console.log("API Key saved to ~/.bruce/config.json\n");
  }
  return config;
}

async function main() {
  const isConfigCommand = process.argv[2] === "config";

  if (isConfigCommand) {
    const key = process.argv[3] as keyof Config;
    let value: any = process.argv[4];

    if (!key) {
      console.log("Usage: bruce config <key> [value]");
      console.log("Supported keys: apiKey, model, maxTokens, tavilyApiKey");
      return;
    }

    if (key === "model" && !value) {
      console.log("Fetching available models from OpenRouter...");
      const configObj = await getValidConfig();
      const apiKey = configObj.apiKey;

      try {
        const response = await fetch("https://openrouter.ai/api/v1/models", {
          headers: {
            "Authorization": `Bearer ${apiKey}`
          }
        });
        const data = await response.json();
        const models = data.data.map((m: any) => m.id);

        console.log("Select a model:");
        models.forEach((m: string, i: number) => console.log(`${i + 1}. ${m}`));
        const choice = await promptInput("Enter the number of the model: ");
        const index = parseInt(choice, 10) - 1;
        if (index >= 0 && index < models.length) {
          value = models[index];
        } else {
          console.log("Invalid choice.");
          return;
        }
      } catch (e: any) {
        console.error("Failed to fetch models from OpenRouter.", e.message);
        return;
      }
    } else if (!value) {
      console.log(`Value is required for ${key}`);
      return;
    }

    if (key === "maxTokens") {
      value = parseInt(value, 10);
    }

    const config = loadConfig();
    (config as any)[key] = value;
    saveConfig(config);
    console.log(`Successfully updated ${key} to ${value} in ~/.bruce/config.json`);
    return;
  }

  const prompt = process.argv.slice(2).join(" ").trim();

  if (process.argv.length <= 2 || prompt === "" || prompt === "help" || prompt === "--help" || prompt === "-h") {
    console.log(BAT_LOGO);
    console.log("Welcome to Bruce!");
    console.log("\nAvailable Commands:");
    console.log("  bruce <your prompt>              - Chat with Bruce");
    console.log("  bruce config model               - Select from a dropdown of available OpenRouter models");
    console.log("  bruce config maxTokens <number>  - Set max completion tokens (e.g. 4000)");
    console.log("  bruce config apiKey <key>        - Set your OpenRouter API key");
    console.log("  bruce config tavilyApiKey <key>  - Set your Tavily API key for web search");
    console.log("  bruce help                       - Show this help message");
    console.log("\nExample Usage:");
    console.log("  bruce read package.json and summarize what this project does");
    console.log("  bruce find all TODO comments in my codebase");
    console.log("  bruce create a new python script that scrapes a website");
    console.log("  bruce config model");
    return;
  }

  const config = await getValidConfig();
  const apiKey = config.apiKey;
  const modelName = config.model || "anthropic/claude-haiku-4.5";
  const maxTokens = config.maxTokens || 7000;
  const baseURL = process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
  });

  const systemPrompt = `You are Bruce, a helpful terminal-based AI assistant.
The current date and time is: ${new Date().toLocaleString()}.
You are running on: ${os.type()} ${os.release()} (${os.arch()}).
Use your tools to help the user. If they ask about current time or dates, you can use the time provided above.`;

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt }
  ];

  const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [{
    "type": "function",
    "function": {
      "name": "Read",
      "description": "Read and return the contents of a file",
      "parameters": {
        "type": "object",
        "properties": {
          "file_path": {
            "type": "string",
            "description": "The path to the file to read"
          }
        },
        "required": ["file_path"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "Write",
      "description": "Write content to a file",
      "parameters": {
        "type": "object",
        "required": ["file_path", "content"],
        "properties": {
          "file_path": {
            "type": "string",
            "description": "The path of the file to write to"
          },
          "content": {
            "type": "string",
            "description": "The content to write to the file"
          }
        }
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "Bash",
      "description": "Execute a shell command",
      "parameters": {
        "type": "object",
        "required": ["command"],
        "properties": {
          "command": {
            "type": "string",
            "description": "The command to execute"
          }
        }
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "SearchWeb",
      "description": "Search the web for information using Tavily API. Useful for current events, facts, and finding documentation.",
      "parameters": {
        "type": "object",
        "required": ["query"],
        "properties": {
          "query": {
            "type": "string",
            "description": "The search query"
          }
        }
      }
    }
  }];

  while (true) {
    let response;
    try {
      response = await client.chat.completions.create({
        model: modelName,
        messages: messages,
        max_completion_tokens: maxTokens,
        tools: tools
      });
    } catch (e: any) {
      if (e.status === 402) {
        console.error(`\nError: Not enough credits for this request.`);
        console.error(`You requested up to ${maxTokens} max_tokens, which exceeds your available balance.`);
        console.error(`Try lowering your maxTokens limit by running:`);
        console.error(`  bruce config maxTokens <number>\n`);
        process.exit(1);
      }
      throw e;
    }

    if (!response.choices || response.choices.length === 0) {
      throw new Error("no choices in response");
    }

    const message = response.choices[0].message;
    messages.push(message);

    if (!message.tool_calls || message.tool_calls.length === 0) {
      if (message.content) {
        console.log(message.content);
      }
      break;
    }

    for (const toolCall of message.tool_calls) {
      if (toolCall.type === "function" && toolCall.function.name === "Read") {
        const args = JSON.parse(toolCall.function.arguments);
        let content = "";
        try {
          content = fs.readFileSync(args.file_path, "utf-8");
        } catch (err: any) {
          content = `Error reading file: ${err.message}`;
        }
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: content
        });
      } else if (toolCall.type === "function" && toolCall.function.name === "Write") {
        const args = JSON.parse(toolCall.function.arguments);
        try {
          fs.writeFileSync(args.file_path, args.content);
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: "File written successfully"
          });
        } catch (err: any) {
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: `Error writing file: ${err.message}`
          });
        }
      } else if (toolCall.type === "function" && toolCall.function.name === "Bash") {
        const args = JSON.parse(toolCall.function.arguments);
        try {
          const { stdout, stderr } = await exec(args.command);
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: stdout || stderr || "Command executed successfully"
          });
        } catch (err: any) {
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: `Error executing command: ${err.message}`
          });
        }
      } else if (toolCall.type === "function" && toolCall.function.name === "SearchWeb") {
        const args = JSON.parse(toolCall.function.arguments);
        if (!config.tavilyApiKey) {
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: "Error: tavilyApiKey is not configured. Please tell the user to run 'bruce config tavilyApiKey <their-tavily-api-key>' to enable web search."
          });
        } else {
          try {
            const searchResponse = await fetch("https://api.tavily.com/search", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                api_key: config.tavilyApiKey,
                query: args.query,
                search_depth: "basic",
                include_answer: true
              })
            });
            const searchData = await searchResponse.json();
            
            let content = "";
            if (searchData.answer) {
              content += `Answer: ${searchData.answer}\n\n`;
            }
            if (searchData.results && searchData.results.length > 0) {
              content += "Sources:\n" + searchData.results.map((r: any) => `- ${r.title} (${r.url}): ${r.content}`).join("\n");
            } else {
              content += "No search results found.";
            }

            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: content || "No relevant info found."
            });
          } catch (err: any) {
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: `Error executing web search: ${err.message}`
            });
          }
        }
      }
    }
  }
}

main();
