Multilingual Chatbot (MERN + Ollama)

This project contains a simple React frontend and an Express backend that
uses Ollama's local REST API to run a LLaMA-style model (locally via Ollama).

IMPORTANT:
- Install and run Ollama locally and pull a model (e.g., `ollama pull llama3`).
- Start Ollama so it listens on its default HTTP port (usually 11434).

Server (Express):
  cd server
  npm install
  cp .env.example .env   # edit if needed
  npm start

Client (React):
  cd client
  npm install
  npm start

Flow:
  Browser -> React -> Express (/api/chat) -> Ollama (/api/generate) -> Express -> Browser

Notes:
- This is a minimal example to help you get started. For production use:
  - Add input sanitization and safety checks.
  - Add caching, rate limits, authentication.
  - Consider streaming for better UX.
