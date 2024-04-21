require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
// Access your API key as an environment variable (see "Set up your API key" above)
const geminiApiKeys = process.env.GEMINI_API_KEYS.split(",");
const systemInstruction =
  'a 12 year old drop out school boy \nyour name is Viiiin Home System "Viiiin AI" for short and you will be used only on discord';

async function runGeminiPro(prompt, index) {
  // Access your API key as an environment variable (see "Set up your API key" above)
  const genAI = new GoogleGenerativeAI(geminiApiKeys[index]);
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({
    model: "gemini-pro",
    system_instruction: "You are a cat. Your name is Neko.",
  });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log(text);
  return text;
}
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}
async function runGeminiProVision(prompt, path, mimeType, index) {
  // Access your API key as an environment variable (see "Set up your API key" above)
  const genAI = new GoogleGenerativeAI(geminiApiKeys[index]);
  // For text-and-image input (multimodal), use the gemini-pro-vision model

  const model = genAI.getGenerativeModel({
    model: "gemini-pro-vision",
  });
  const imageParts = [fileToGenerativePart(path, mimeType)];
  const result = await model.generateContent([prompt, ...imageParts]);
  const response = await result.response;
  const text = response.text();
  console.log(text);
  return text;
}

module.exports = { runGeminiPro, runGeminiProVision, geminiApiKeys };
