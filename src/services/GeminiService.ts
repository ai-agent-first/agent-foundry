import { GeminiProvider } from './providers/GeminiProvider';
import { OllamaProvider } from './providers/OllamaProvider';
import { OpenAIProvider } from './providers/OpenAIProvider';
import { LLMService } from './LLMService';

// Initialize providers
LLMService.registerProvider('gemini', new GeminiProvider());
LLMService.registerProvider('ollama', new OllamaProvider());
LLMService.registerProvider('openai', new OpenAIProvider());

export { LLMService };
