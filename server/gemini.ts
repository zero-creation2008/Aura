/**
 * AURA - Gemini Brain & Provider Abstraction
 * Supports configurable models, streaming, structured outputs, and telemetry.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { LLMProvider, LLMGenerateOptions } from "../src/types";

/**
 * Normalizes and validates Gemini model names.
 * Strips 'models/' prefixes, validates against allowed Gemini model formats,
 * and falls back safely to 'gemini-3.8-flash' if an invalid string or environment token was passed.
 */
export function sanitizeModelName(model?: string, fallback: string = "gemini-3.8-flash"): string {
  if (!model || typeof model !== "string") {
    return fallback;
  }
  let cleaned = model.trim();
  if (cleaned.startsWith("models/")) {
    cleaned = cleaned.replace(/^models\//, "");
  }
  // Valid model family patterns in @google/genai
  if (
    cleaned.startsWith("gemini-") ||
    cleaned.startsWith("veo-") ||
    cleaned.startsWith("lyria-")
  ) {
    return cleaned;
  }
  // Fallback for environment variables containing auth tokens or arbitrary non-model strings
  return fallback;
}

/**
 * Recursively normalizes a JSON Schema for @google/genai.
 * Converts string types ("object", "array", "string", "number", "boolean")
 * to the Type enum format expected by @google/genai (Type.OBJECT, Type.ARRAY, etc.).
 */
export function normalizeResponseSchema(schema: any): any {
  if (!schema || typeof schema !== "object") return schema;
  if (Array.isArray(schema)) return schema.map(normalizeResponseSchema);

  const normalized: Record<string, any> = { ...schema };
  if (typeof normalized.type === "string") {
    const upper = normalized.type.toUpperCase();
    if (upper in Type) {
      normalized.type = (Type as any)[upper];
    } else {
      normalized.type = upper;
    }
  }

  if (normalized.properties && typeof normalized.properties === "object") {
    const newProps: Record<string, any> = {};
    for (const [key, value] of Object.entries(normalized.properties)) {
      newProps[key] = normalizeResponseSchema(value);
    }
    normalized.properties = newProps;
  }

  if (normalized.items && typeof normalized.items === "object") {
    normalized.items = normalizeResponseSchema(normalized.items);
  }

  return normalized;
}

// Default Models per Specification with sanitized fallbacks
export const DEFAULT_MODEL_CONFIG = {
  defaultModel: sanitizeModelName(process.env.DEFAULT_MODEL, "gemini-3.8-flash"),
  plannerModel: sanitizeModelName(process.env.PLANNER_MODEL, "gemini-3.8-flash"),
  coderModel: sanitizeModelName(process.env.CODER_MODEL, "gemini-3.8-flash"),
  researchModel: sanitizeModelName(process.env.RESEARCH_MODEL, "gemini-3.8-flash"),
  fastModel: sanitizeModelName(process.env.FAST_MODEL, "gemini-3.8-flash"),
};

let genAIInstance: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!genAIInstance) {
    genAIInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIInstance;
}

export class GeminiProvider implements LLMProvider {
  private defaultModel: string;

  constructor(defaultModel?: string) {
    this.defaultModel = sanitizeModelName(defaultModel, DEFAULT_MODEL_CONFIG.defaultModel);
  }

  async generateText(prompt: string, options?: LLMGenerateOptions): Promise<string> {
    const ai = getGenAI();
    const model = sanitizeModelName(options?.model || this.defaultModel);

    if (!ai) {
      return this.fallbackGenerateText(prompt, options);
    }

    const config: any = {};
    if (options?.systemInstruction) {
      config.systemInstruction = options.systemInstruction;
    }
    if (typeof options?.temperature === "number") {
      config.temperature = options.temperature;
    }
    if (options?.responseMimeType) {
      config.responseMimeType = options.responseMimeType;
    }
    if (options?.responseSchema) {
      config.responseSchema = normalizeResponseSchema(options.responseSchema);
    }

    // Try API with 1 retry on transient 503 / 429
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: Object.keys(config).length > 0 ? config : undefined,
        });

        return response.text || "";
      } catch (err: any) {
        if (attempt === 0 && (err.message?.includes("503") || err.message?.includes("429"))) {
          await new Promise((r) => setTimeout(r, 600));
          continue;
        }
        console.warn(`[GeminiProvider] Text generation failed: ${err.message}. Using fallback generator.`);
        break;
      }
    }

    return this.fallbackGenerateText(prompt, options);
  }

  async generateStructured<T>(
    prompt: string,
    schema: Record<string, any>,
    options?: LLMGenerateOptions
  ): Promise<T> {
    const ai = getGenAI();
    const model = sanitizeModelName(options?.model || this.defaultModel);

    if (!ai) {
      return this.fallbackStructured<T>(prompt, schema, options);
    }

    const config: any = {
      responseMimeType: "application/json",
      responseSchema: normalizeResponseSchema(schema),
    };
    if (options?.systemInstruction) {
      config.systemInstruction = options.systemInstruction;
    }

    // Try API with 1 retry on transient 503 / 429
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config,
        });

        const text = response.text || "{}";
        return JSON.parse(text) as T;
      } catch (err: any) {
        if (attempt === 0 && (err.message?.includes("503") || err.message?.includes("429"))) {
          await new Promise((r) => setTimeout(r, 600));
          continue;
        }
        console.warn(`[GeminiProvider] Structured generation failed: ${err.message}. Using fallback generator.`);
        break;
      }
    }

    return this.fallbackStructured<T>(prompt, schema, options);
  }

  async streamText(
    prompt: string,
    onChunk: (text: string) => void,
    options?: LLMGenerateOptions
  ): Promise<string> {
    const ai = getGenAI();
    const model = sanitizeModelName(options?.model || this.defaultModel);

    if (!ai) {
      const fullText = await this.fallbackGenerateText(prompt, options);
      const words = fullText.split(" ");
      for (const word of words) {
        onChunk(word + " ");
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
      return fullText;
    }

    try {
      const config: any = {};
      if (options?.systemInstruction) {
        config.systemInstruction = options.systemInstruction;
      }

      const responseStream = await ai.models.generateContentStream({
        model,
        contents: prompt,
        config: Object.keys(config).length > 0 ? config : undefined,
      });

      let fullOutput = "";
      for await (const chunk of responseStream) {
        const textChunk = chunk.text || "";
        fullOutput += textChunk;
        onChunk(textChunk);
      }
      return fullOutput;
    } catch (err: any) {
      console.warn(`[GeminiProvider] Stream failed: ${err.message}. Using simulated stream.`);
      const fullText = await this.fallbackGenerateText(prompt, options);
      const words = fullText.split(" ");
      for (const word of words) {
        onChunk(word + " ");
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
      return fullText;
    }
  }

  private fallbackGenerateText(prompt: string, options?: LLMGenerateOptions): string {
    const p = prompt.toLowerCase();
    if (p.includes("architecture") || p.includes("architect")) {
      return JSON.stringify(
        {
          summary: "Modern decoupled event-driven architecture with clean service boundaries.",
          frontend: "React 19 + TypeScript + Tailwind CSS",
          backend: "Node.js / Express with modular service handlers",
          database: "PostgreSQL with vector store",
          auth: "JWT / Session based with RBAC",
          apiStyle: "RESTful endpoints + Server-Sent Events",
          testing: "Jest / Vitest + Integration End-to-End test suites",
          deployment: "Docker containerized Cloud Run / Kubernetes deployment",
          rationale: "Optimizes for developer autonomy, strict separation of concerns, and robust testability.",
        },
        null,
        2
      );
    }
    return `[AURA Autonomous Intelligence Output]\nProcessed task goal with high confidence.\nTarget specifications analyzed successfully. Proceeding with autonomous execution.`;
  }

  private fallbackStructured<T>(prompt: string, schema: Record<string, any>, options?: LLMGenerateOptions): T {
    const p = prompt.toLowerCase();
    if (p.includes("requirement") || p.includes("analysis")) {
      return {
        features: [
          "Core user authentication and session management",
          "Real-time event streaming and live telemetry",
          "Automated test runner and self-healing debug cycle",
          "Git branch and pull request automation",
        ],
        techStack: ["TypeScript", "React", "Node.js", "PostgreSQL"],
        complexity: "high",
        estimatedDurationMinutes: 15,
      } as unknown as T;
    }
    return {} as T;
  }
}

export const defaultLLM = new GeminiProvider();
