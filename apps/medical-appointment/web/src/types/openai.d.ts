// Types for window.openai - ChatGPT Widget Runtime API

export interface Doctor {
    id: string;
    name: string;
    specialty: string;
    address?: string;
    city?: string;
    state?: string;
    imageUrl?: string;
    coordinates?: { lat: number; lng: number };
}

export interface Slot {
    id: string;
    time: string;
    formattedTime?: string;
}

export interface Appointment {
    id: string;
    doctor: Doctor;
    scheduledAt: string;
    formattedDate: string;
    patient: {
        name: string;
        phone: string;
    };
}

export interface ToolOutput {
    structuredContent?: {
        success: boolean;
        count?: number;
        doctors?: Doctor[];
        doctor?: Doctor;
        slots?: Slot[];
        appointment?: Appointment;
        ambiguous?: boolean;
        matches?: Doctor[];
        error?: string;
    };
    _meta?: {
        view?: "doctors-list" | "slots-list" | "confirmation" | "disambiguation";
        doctors?: Doctor[];
        doctor?: Doctor;
        slots?: Slot[];
        appointment?: Appointment;
        matches?: Doctor[];
    };
}

export interface OpenAIWidgetAPI {
    toolOutput?: ToolOutput;
    toolInput?: Record<string, unknown>;
    widgetState?: Record<string, unknown>;
    theme?: "light" | "dark";
    locale?: string;

    callTool?: (name: string, args: Record<string, unknown>) => Promise<ToolOutput>;
    setWidgetState?: (state: Record<string, unknown>) => void;
    sendFollowUpMessage?: (message: string) => void;
    requestDisplayMode?: (mode: "inline" | "fullscreen") => void;
}

declare global {
    interface Window {
        openai?: OpenAIWidgetAPI;
    }
}

export {};
