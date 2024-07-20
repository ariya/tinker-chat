# tinker-chat

![Screenshot](public/screenshot.png)

This chat app supports GPT from OpenAI or your own local LLM.

### GPT from OpenAI

To use GPT from OpenAI, set the environment variable `OPENAI_API_KEY` to your [API key](https://platform.openai.com/account/api-keys).

### Local LLM

To utilize [llama.cpp](https://github.com/ggerganov/llama.cpp) locally with its inference engine, first load a quantized model such as [Phi-3 Mini](https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf), e.g.:
```bash
/path/to/llama.cpp/server -m Phi-3-mini-4k-instruct-q4.gguf
```

Before launching the demo, set the environment variable `OPENAI_API_BASE`:
```bash
export OPENAI_API_BASE=http://127.0.0.1:8080
```

## Demo

With [Node.js](https://nodejs.org) >= v18:

```
npm install
npm start
```

and open `localhost:5000` with a web browser.
