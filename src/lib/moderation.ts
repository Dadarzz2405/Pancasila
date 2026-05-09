import OpenAI from "openai";

const blockedPatterns = [
  /\bbodoh\b/i,
  /\bgoblok\b/i,
  /\bbenci\b/i,
  /\bkafir\b/i,
  /\bhoaks\b.*\bsebarkan\b/i,
  /\bfitnah\b/i,
  /\bserang\b/i,
];

function heuristicModeration(content: string) {
  const trimmed = content.trim();

  if (trimmed.length < 12) {
    return {
      valid: false,
      reason: "Tulis pendapat yang lebih lengkap agar bisa dipahami dan didiskusikan.",
    };
  }

  if (blockedPatterns.some((pattern) => pattern.test(trimmed))) {
    return {
      valid: false,
      reason: "Bahasannya perlu dibuat lebih etis dan tidak menyerang pihak tertentu.",
    };
  }

  return { valid: true, reason: "" };
}

export async function moderateContent(content: string) {
  const apiKey = process.env.ETHICS_API_KEY;
  const baseURL = process.env.ETHICS_API_URL;
  const model = process.env.ETHICS_MODEL ?? "llama-3.1-70b-versatile";

  if (!apiKey) {
    return heuristicModeration(content);
  }

  try {
    const client = new OpenAI({
      apiKey,
      ...(baseURL ? { baseURL } : {}),
    });
    const response = await client.chat.completions.create({
      model,
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            "You are a Pancasila moderator. Assess whether the text is truthful, ethical, and relevant for civic discussion. Respond ONLY as JSON: {\"valid\": boolean, \"reason\": string}.",
        },
        { role: "user", content: content.trim() },
      ],
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as { reason: string; valid: boolean };

    return parsed;
  } catch {
    return heuristicModeration(content);
  }
}
