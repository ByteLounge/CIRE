import { AIProvider } from './types';
import { GeminiProvider } from './gemini-provider';
import { OllamaProvider } from './ollama-provider';

export function getAIProvider(): AIProvider {
  const providerType = process.env.AI_PROVIDER || 'gemini';
  if (providerType.toLowerCase() === 'ollama') {
    return new OllamaProvider();
  }
  return new GeminiProvider();
}

export * from './types';
export * from './cost-tracker';
