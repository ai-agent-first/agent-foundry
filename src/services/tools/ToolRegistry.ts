export interface ToolParameter {
    type: string;
    description?: string;
    default?: any;
}

export interface GatewayTool {
    id: string;
    name: string;
    description: string;
    parameters: {
        type: 'object';
        properties: Record<string, any>;
        required?: string[];
    };
}

export class ToolRegistry {
    private static tools: Record<string, GatewayTool> = {};
    private static gatewayUrl = 'http://localhost:8020';

    static async fetchTools(): Promise<void> {
        try {
            const response = await fetch(`${this.gatewayUrl}/tool_gateway/discover?tenant_id=20dbb818-6802-46f5-aa9e-8352fba88f1c`, {
                headers: {
                    // Use Discovery Key for listing tools
                    'x-api-key': import.meta.env.VITE_DISCOVERY_API_KEY || 'dev_api_key_123'
                }
            });
            if (!response.ok) throw new Error('Failed to discover tools');
            const data = await response.json();

            // Assuming data.tools is the list, based on standard response structures
            // If the API returns a dict, we adapt. The OpenAPI said: "tools: 工具列表..."
            const toolList = data.tools || [];

            this.tools = {};
            toolList.forEach((tool: any) => {
                this.tools[tool.name] = {
                    id: tool.name, // Use name as ID for UI compatibility
                    name: tool.name,
                    description: tool.description,
                    parameters: tool.parameters || { type: 'object', properties: {} }
                };
            });
            console.log(`[ToolRegistry] Discovered ${Object.keys(this.tools).length} tools from Gateway.`);
        } catch (e) {
            console.error('[ToolRegistry] Discovery failed:', e);
            // Fallback or empty
        }
    }

    static getTool(name: string): GatewayTool | undefined {
        return this.tools[name];
    }

    static getAllTools(): GatewayTool[] {
        return Object.values(this.tools);
    }

    static async execute(toolName: string, args: any): Promise<any> {
        console.log(`[ToolRegistry] Invoking ${toolName} via Gateway...`, args);
        try {
            const payload = {
                request_id: `req_${Date.now()}`,
                tenant_id: "20dbb818-6802-46f5-aa9e-8352fba88f1c",
                agent_id: "agent_foundry_user",
                tool: toolName,
                arguments: args
            };

            const response = await fetch(`${this.gatewayUrl}/tool_gateway/invoke`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': import.meta.env.VITE_GATEWAY_API_KEY || 'kyx_dev_s-wX2vB1J6I4tgAp', // Updated User Key
                    'x-tenant-id': '20dbb818-6802-46f5-aa9e-8352fba88f1c'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Gateway Error: ${response.status} ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            return data.result || data; // Return the 'result' field if standard wrap, else full data
        } catch (e: any) {
            return { error: e.message };
        }
    }
}
