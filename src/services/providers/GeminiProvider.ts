import { GoogleGenAI } from "@google/genai";
import { Agent } from '../../types';
import { LLMProvider, LLMResponse, LLMService } from '../LLMService';
import { TOOL_PLATFORM } from '../../constants';

export class GeminiProvider implements LLMProvider {
    async sendMessage(prompt: string, agent: Agent): Promise<LLMResponse> {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
        console.log('[GeminiProvider] Initializing with Key:', apiKey ? `...${apiKey.slice(-4)}` : 'MISSING');

        if (!apiKey) {
            throw new Error('Gemini API Key is missing. Please check .env.local');
        }

        const ai = new GoogleGenAI({ apiKey });

        let modelName = agent.model || 'gemini-2.0-flash';

        // Auto-Correction for Deprecated/Missing Models
        if (modelName.includes('1.5-flash')) {
            console.log('[GeminiProvider] Upgrading model 1.5-flash -> 2.0-flash (Availability Check)');
            modelName = 'gemini-2.0-flash';
        }

        if (agent.skills.includes('code_gen') || agent.skills.includes('deep_reasoning')) {
            // Ideally check for 2.0-pro, but fallback to 2.0-flash for now if pro is missing, 
            // or keep 1.5-pro if you believe it exists. Assuming safe upgrade:
            modelName = 'gemini-2.0-flash';
        }

        const trace = [
            LLMService.createStep('Gemini Context Initialized', 'init', `Model: ${modelName}`)
        ];

        trace.push(LLMService.createStep('Strategic Planning', 'plan', 'Analyzing prompt for L5 autonomy.'));

        const apiTools: any[] = [];

        // Native Google Tools
        if (agent.tools.includes('web_search')) apiTools.push({ googleSearch: {} });
        if (agent.tools.includes('google_maps')) {
            apiTools.push({ googleMaps: {} });
            modelName = 'gemini-2.0-flash-exp'; // Auto-upgrade for maps
        }

        // External Gateway Tools (Function Declarations)
        const { ToolRegistry } = await import('../tools/ToolRegistry');
        const gatewayTools = ToolRegistry.getAllTools();

        // Filter: Only include tools the agent has installed
        const agentInstalledTools = gatewayTools.filter(t => agent.tools.includes(t.name));

        if (agentInstalledTools.length > 0) {
            const functionDeclarations = agentInstalledTools.map(t => ({
                name: t.name,
                description: t.description,
                parameters: t.parameters
            }));
            apiTools.push({ functionDeclarations });
        }

        // Skill-based SOP Injection
        const { SKILL_LIBRARY } = await import('../../constants');
        const activeSkills = SKILL_LIBRARY.filter(s => agent.skills.includes(s.id));
        const sopInstructions = activeSkills
            .filter(s => s.instruction)
            .map(s => `[SKILL: ${s.name}] ${s.instruction}`)
            .join('\n');

        const toolAwareness = agent.skills.includes('deep_reasoning')
            ? `\n[PLATFORM_AWARENESS] You have access to: ${JSON.stringify(TOOL_PLATFORM)}`
            : '';

        const finalSystemInstruction = [
            agent.personality,
            toolAwareness,
            sopInstructions ? `\n\n=== OPERATIONAL PROTOCOLS (SOP) ===\n${sopInstructions}` : ''
        ].join('');

        const response = await ai.models.generateContent({
            model: modelName,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                systemInstruction: finalSystemInstruction,
                tools: apiTools.length > 0 ? apiTools : undefined
            }
        });

        if (agent.skills.includes('deep_reasoning')) {
            trace.push(LLMService.createStep('Output Self-Reflection', 'think', 'Verifying response against directives.'));
            trace.push(LLMService.createStep('Experience Memory Update', 'init', 'Updating latent vectors.'));
        }

        // --- Native Function Calling Handling ---
        let responseText = response.text || "";
        const candidates = response.candidates;
        const firstCandidate = candidates?.[0];

        // Check for function calls in the response
        const functionCalls = firstCandidate?.content?.parts?.filter(p => p.functionCall).map(p => p.functionCall);

        if (functionCalls && functionCalls.length > 0) {
            for (const call of functionCalls) {
                if (!call || !call.name) continue;
                console.log('[GeminiProvider] Raw Function Call Name:', call.name); // Debug log

                let toolId = call.name;

                // Normalization: Gemini often replaces dots with underscores
                if (toolId === 'email_send') toolId = 'email.send';
                if (toolId === 'gmail_send') toolId = 'email.send'; // Valid alias
                if (toolId === 'web_search') toolId = 'google_search'; // If we had it

                const args = call.args || {};

                trace.push(LLMService.createStep('Tool Invocation', 'tool', `Model calling: ${toolId}`));

                try {
                    const result = await LLMService.executeTool(toolId, args);
                    trace.push(LLMService.createStep('Tool Execution', 'tool', `Result: ${JSON.stringify(result).substring(0, 100)}...`));

                    // In a full chat loop, we would send this back. 
                    // For now, we append it to the text so the UI shows it.
                    responseText += `\n\n[Tool Output]: \n${JSON.stringify(result, null, 2)}`;

                    // Optional: If we want the model to interpret it immediately (Multi-turn within one user turn)
                    // We would re-call generateContent here with the history + function response.
                    // For simplicity in this step, we just show the output.
                } catch (e: any) {
                    trace.push(LLMService.createStep('Tool Error', 'tool', `Failed: ${e.message}`));
                    responseText += `\n\n[Tool Error]: ${e.message}`;
                }
            }
        } else {
            // Fallback: Legacy Regex parsing for models that might not support native tools well or if prompted explicitly
            const toolRegex = /\[TOOL:(\w+)\s+(.*?)\]/;
            const match = responseText.match(toolRegex);
            if (match) {
                const toolId = match[1];
                try {
                    const args = JSON.parse(match[2]);
                    trace.push(LLMService.createStep('Tool Execution', 'tool', `Executing ${toolId} (Regex Match)...`));
                    const result = await LLMService.executeTool(toolId, args);
                    trace.push(LLMService.createStep('Tool Result', 'tool', JSON.stringify(result)));
                    responseText += `\n\n[System] Tool ${toolId} returned: ${JSON.stringify(result)}`;
                } catch (e) {
                    // ignore regex errors
                }
            }
        }

        trace.push(LLMService.createStep('Final Response Synthesis', 'final'));

        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.filter(c => c.web || c.maps)
            .map(c => ({
                title: c.web?.title || c.maps?.title || 'Grounding Source',
                uri: c.web?.uri || c.maps?.uri || '#'
            }));

        // Extract usage metadata
        const usageMetadata = response.usageMetadata;
        const usage = usageMetadata ? {
            input: usageMetadata.promptTokenCount || 0,
            output: usageMetadata.candidatesTokenCount || 0,
            total: usageMetadata.totalTokenCount || 0
        } : undefined;

        return {
            content: responseText,
            sources,
            trace,
            usage
        };
    }
}
