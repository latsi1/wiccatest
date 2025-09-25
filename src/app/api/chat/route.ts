import { NextRequest, NextResponse } from "next/server";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

// Simple system prompt to bias answers toward Wicca topics
const SYSTEM_PROMPT =
  "You are a friendly Wicca helper. Answer concisely, kindly, and avoid medical or legal claims. If asked for unsafe acts, refuse. If off-topic, steer gently back to Wicca, nature-based spirituality, sabbats, esbats, rituals, ethics, etc.";

export async function POST(req: NextRequest) {
  try {
    const { messages } = (await req.json()) as { messages: ChatMessage[] };
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No messages" }, { status: 400 });
    }

    const hfToken = process.env.HF_API_TOKEN;
    if (!hfToken) {
      return NextResponse.json(
        { error: "Missing HF_API_TOKEN on server" },
        { status: 500 }
      );
    }

    // Choose a free-inference friendly text generation model with fallbacks
    const modelCandidates = [
      process.env.HF_MODEL,
      "deepseek-ai/DeepSeek-V3.1-Terminus",
      "HuggingFaceH4/zephyr-7b-beta",
      "mistralai/Mistral-7B-Instruct-v0.2",
      "bigscience/bloomz-560m",
      "google/flan-t5-large",
    ].filter(Boolean) as string[];

    const userContent = messages
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join("\n\n");

    const prompt = `${SYSTEM_PROMPT}\n\nUser: ${userContent}\nAssistant:`;

    const errors: string[] = [];
    for (const model of modelCandidates) {
      const res = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${hfToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 256,
              temperature: 0.7,
              top_p: 0.95,
              return_full_text: false,
            },
            options: { use_cache: true, wait_for_model: true },
          }),
        }
      );

      const raw = await res.text();
      if (!res.ok) {
        errors.push(`${model}: ${res.status} ${raw}`);
        continue;
      }

      let data: unknown = {};
      try {
        data = JSON.parse(raw) as unknown;
      } catch {
        errors.push(`${model}: invalid JSON response`);
        continue;
      }

      let answer = "";
      if (
        Array.isArray(data) &&
        data.length > 0 &&
        typeof (data as any)[0] === "object" &&
        (data as any)[0]?.generated_text
      ) {
        answer = String((data as any)[0].generated_text).trim();
      } else if (
        data !== null &&
        typeof data === "object" &&
        (data as Record<string, unknown>).generated_text
      ) {
        answer = String((data as Record<string, unknown>).generated_text).trim();
      } else if (
        Array.isArray(data) &&
        data.length > 0 &&
        typeof (data as any)[0] === "object" &&
        (data as any)[0].summary_text
      ) {
        answer = String((data as any)[0].summary_text).trim();
      }

      if (!answer) {
        errors.push(`${model}: no generated_text in response`);
        continue;
      }

      answer = answer.replace(/^Assistant:\s*/i, "").trim();
      return NextResponse.json({ answer, model });
    }

    return NextResponse.json(
      { error: `HF request failed. Tried: ${errors.join(" | ")}` },
      { status: 500 }
    );
  } catch {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
