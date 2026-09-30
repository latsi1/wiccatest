export type RecipeCard = { id: string; title: string; url: string; image?: string; ingredients?: string[] };
export type ChatMessage = { role: "user" | "assistant"; content: string; recipes?: RecipeCard[]; mode?: "ai" | "local" | "recipe"; profileUrl?: string };
