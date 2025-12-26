import { useState, useEffect, useCallback } from "react";
import type { ToolOutput, OpenAIWidgetAPI } from "../types/openai";

export function useOpenAI() {
    const [toolOutput, setToolOutput] = useState<ToolOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Initial load from window.openai
        if (window.openai?.toolOutput) {
            setToolOutput(window.openai.toolOutput);
        }

        // Listen for updates from ChatGPT
        const handleSetGlobals = (event: CustomEvent) => {
            const globals = event.detail?.globals as OpenAIWidgetAPI | undefined;
            if (globals?.toolOutput) {
                setToolOutput(globals.toolOutput);
            }
        };

        window.addEventListener("openai:set_globals", handleSetGlobals as EventListener);
        return () => window.removeEventListener("openai:set_globals", handleSetGlobals as EventListener);
    }, []);

    const callTool = useCallback(async (name: string, args: Record<string, unknown>) => {
        if (!window.openai?.callTool) {
            console.warn("window.openai.callTool not available");
            return null;
        }

        setIsLoading(true);
        try {
            const response = await window.openai.callTool(name, args);
            setToolOutput(response);
            return response;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const sendMessage = useCallback((message: string) => {
        window.openai?.sendFollowUpMessage?.(message);
    }, []);

    const view = toolOutput?._meta?.view || "doctors-list";
    const meta = toolOutput?._meta;
    const data = toolOutput?.structuredContent;
    const theme = window.openai?.theme || "light";

    return {
        toolOutput,
        view,
        meta,
        data,
        theme,
        isLoading,
        callTool,
        sendMessage,
    };
}
