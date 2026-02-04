import { Agent } from '../../types';
import { LLMProvider, LLMResponse, LLMService } from '../LLMService';

export class OllamaProvider implements LLMProvider {
    async sendMessage(prompt: string, agent: Agent): Promise<LLMResponse> {
        const trace = [
            LLMService.createStep('Local Ollama Initialized', 'init', `Connecting to localhost:11434 with model: ${agent.model}`)
        ];

        try {
            // 1. Fetch Request-Scope Tools & Skills (Dynamic)
            const { ToolRegistry } = await import('../tools/ToolRegistry');
            const { SKILL_LIBRARY } = await import('../../constants');

            const gatewayTools = ToolRegistry.getAllTools();
            const enabledTools = gatewayTools.filter(t => agent.tools.includes(t.name));

            // 2. Build Tool & Skill System Prompt
            let systemInstructions = "";

            // A. Inject Skill SOPs
            const activeSkills = SKILL_LIBRARY.filter(s => agent.skills.includes(s.id));
            if (activeSkills.length > 0) {
                console.log('[OllamaProvider] Injecting SOPs for skills:', activeSkills.map(s => s.name));
                const skillInstructions = activeSkills
                    .filter(s => s.instruction)
                    .map(s => `- [${s.name} Protocol]: ${s.instruction}`)
                    .join('\n');

                if (skillInstructions) {
                    systemInstructions += `\n[CRITICAL OPERATIONAL PROTOCOLS]\n${skillInstructions}\n`;
                }
            }

            // B. Inject Tools
            if (enabledTools.length > 0) {
                const toolDescriptions = enabledTools.map(t => {
                    return `- ${t.name}: ${JSON.stringify(t.parameters)}`;
                }).join('\n');

                systemInstructions += `
[SYSTEM] You have access to the following tools. 
To invoke a tool, output a JSON object in this format: {"tool": "tool_name", "args": { ... }}


[CRITICAL INSTRUCTION]
1. You may converse with the user normally.
2. ONLY output the JSON when you are fully ready to execute the action.
3. If an SOP requires you to Show a Draft or Ask Confirmation, do that using normal text first. DO NOT output JSON until the user confirms.

[DECISION PROCESS]
When handling complex tasks, you MUST display your reasoning process before taking action.
Format your reasoning like this:
[Thought] Analyzing user request...
[Plan] 1. Check data... 2. Use tool...
[Action] outputting JSON...

CRITICAL: Do not stop after the Plan. You MUST immediately generate the Tool JSON.
 
Available Tools:
${toolDescriptions}

[EXAMPLES]
// ... (existing examples) ...
`;
            }

            // 3. Construct Final Prompt
            let finalPrompt = `${agent.personality}\n${systemInstructions}\n\nUser: ${prompt}`;

            // 4. Call Ollama
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: agent.model || 'llama3.1',
                    prompt: finalPrompt,
                    stream: false,
                    format: enabledTools.length > 0 ? "json" : undefined
                })
            });

            if (!response.ok) throw new Error('Ollama connection failed');
            const data = await response.json();

            // 5. Parse and Execute
            let finalContent = data.response;
            const usage = {
                input: data.prompt_eval_count || 0,
                output: data.eval_count || 0,
                total: (data.prompt_eval_count || 0) + (data.eval_count || 0)
            };

            if (enabledTools.length > 0) {
                try {
                    // Robust JSON Extraction
                    let jsonStr = finalContent;
                    const jsonMatch = finalContent.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        jsonStr = jsonMatch[0];
                    }

                    const parsed = JSON.parse(jsonStr);

                    if (parsed.tool && parsed.args) {
                        let toolName = parsed.tool;
                        const toolArgs = parsed.args;
                        let matchedTool = null;

                        // Heuristic Matching
                        matchedTool = enabledTools.find(t => t.name === toolName);
                        if (!matchedTool) {
                            const normalized = toolName.replace(/_/g, '.');
                            matchedTool = enabledTools.find(t => t.name === normalized);
                        }
                        if (!matchedTool) {
                            matchedTool = enabledTools.find(t => {
                                const coreName = t.name.split('.')[0];
                                if (toolName.includes(coreName)) return true;
                                if (coreName === 'email' && toolName.includes('mail')) return true;
                                return false;
                            });
                        }

                        // Apply Correction
                        if (matchedTool && toolName !== matchedTool.name) {
                            console.log(`[OllamaProvider] Auto-correcting tool name: ${toolName} -> ${matchedTool.name}`);
                            toolName = matchedTool.name;
                        }

                        // Gateway Safety Check (Force Block web_search)
                        let isWebSearch = (toolName === 'web_search');

                        if (isWebSearch) {
                            const result = { error: "Web search is currently unavailable. Please ask the user." };
                            finalContent = `[System] ${JSON.stringify(result)}`;
                            trace.push(LLMService.createStep('Tool Blocked', 'tool', `Blocked web_search`));
                        } else {
                            // Execute Valid Tool
                            const validTool = matchedTool || enabledTools.find(t => t.name === toolName);

                            if (validTool) {
                                trace.push(LLMService.createStep('Tool Invocation', 'tool', `Model calling: ${toolName}`));
                                const result = await LLMService.executeTool(toolName, toolArgs);
                                trace.push(LLMService.createStep('Tool Execution', 'tool', `Result: ${JSON.stringify(result).substring(0, 100)}...`));
                                finalContent = `[Tool Result] ${JSON.stringify(result, null, 2)}`;
                            } else {
                                console.warn(`[Ollama] Unknown tool ${toolName}, execution skipped.`);
                            }
                        }
                    }
                } catch (e) {
                    console.warn('[OllamaProvider] JSON parse error', e);
                }
            }

            trace.push(LLMService.createStep('Output Generated', 'final'));

            return {
                content: typeof finalContent === 'string' ? finalContent : JSON.stringify(finalContent),
                trace,
                usage
            };
        } catch (e: any) {
            throw new Error(`Ollama Error: ${e.message}`);
        }
    }
}
