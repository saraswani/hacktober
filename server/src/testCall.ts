import { config } from './config.js';
import { GoogleGenAI } from '@google/genai';

async function testGemma4Connection() {
  console.log('====================================================');
  console.log('VERDICT - Gemma 4 Backend Connection Test');
  console.log('====================================================');
  console.log(`Target Model: ${config.modelName}`);
  console.log(`API Key Value Detected: ${config.geminiApiKey ? `${config.geminiApiKey.substring(0, 10)}...` : 'EMPTY'}`);

  if (!config.geminiApiKey || config.geminiApiKey.trim().length === 0) {
    console.log('\n[!] GEMINI_API_KEY is empty in server/.env.');
    console.log('Please set GEMINI_API_KEY in server/.env');
    console.log('Get a key from: https://aistudio.google.com/\n');
    process.exit(1);
  }

  console.log('\nDispatching test prompt to Gemma 4 via official @google/genai SDK...');

  try {
    const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
    const startTime = Date.now();

    const response = await ai.models.generateContent({
      model: config.modelName,
      contents: 'Respond with exactly: "Gemma 4 is online and operational for VERDICT."'
    });

    const elapsed = Date.now() - startTime;
    console.log(`\n[SUCCESS] Gemma 4 responded in ${elapsed}ms:`);
    console.log('----------------------------------------------------');
    console.log(response.text?.trim());
    console.log('----------------------------------------------------');
    console.log('Gemma 4 connection test passed successfully!\n');
    process.exit(0);
  } catch (error: any) {
    console.error('\n[ERROR] Gemma 4 API call failed:');
    console.error(error?.message || error);
    if (config.geminiApiKey.includes('PASTE_MY_GOOGLE_AI_STUDIO_API_KEY_HERE')) {
      console.log('\n[NOTE] The key is currently set to the literal placeholder "PASTE_MY_GOOGLE_AI_STUDIO_API_KEY_HERE".');
      console.log('Please replace it in server/.env with your genuine Google AI Studio API key.');
    }
    process.exit(1);
  }
}

testGemma4Connection();
