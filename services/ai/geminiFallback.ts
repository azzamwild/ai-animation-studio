type GenerateJsonWithGeminiFallbackParams = {
  prompt: string;
  schema: unknown;
  model?: string;
  label?: string;
};

type GenerateJsonWithGeminiFallbackResult<T> = {
  data: T;
  keyIndex: number;
  model: string;
};

function getNumberEnv(name: string, defaultValue: number) {
  const value = Number(process.env[name]);

  if (Number.isFinite(value) && value > 0) {
    return value;
  }

  return defaultValue;
}

function getGeminiApiKeys() {
  const numberedKeys = Object.entries(process.env)
    .filter(([key, value]) => {
      return /^GEMINI_API_KEY_\d+$/.test(key) && Boolean(value?.trim());
    })
    .sort(([keyA], [keyB]) => {
      const numberA = Number(keyA.replace("GEMINI_API_KEY_", ""));
      const numberB = Number(keyB.replace("GEMINI_API_KEY_", ""));

      return numberA - numberB;
    })
    .map(([, value]) => value?.trim())
    .filter(Boolean) as string[];

  const multiKeys = process.env.GEMINI_API_KEYS
    ? process.env.GEMINI_API_KEYS.split(",")
        .map((key) => key.trim())
        .filter(Boolean)
    : [];

  const singleKey = process.env.GEMINI_API_KEY?.trim()
    ? [process.env.GEMINI_API_KEY.trim()]
    : [];

  const keys = [...numberedKeys, ...multiKeys, ...singleKey];
  const uniqueKeys = Array.from(new Set(keys));

  console.log("🔐 Gemini API keys loaded:", uniqueKeys.length);

  return uniqueKeys;
}

function getErrorStatus(error: any) {
  return (
    error?.status ||
    error?.statusCode ||
    error?.error?.code ||
    error?.error?.httpMeta?.response?.status ||
    error?.cause?.statusCode ||
    error?.cause?.status
  );
}

function getErrorMessage(error: any) {
  return (
    error?.message ||
    error?.error?.message ||
    error?.body ||
    error?.cause?.message ||
    "Unknown Gemini error"
  );
}

function isRetryableGeminiError(error: any) {
  const status = Number(getErrorStatus(error));
  const message = String(getErrorMessage(error)).toLowerCase();

  if ([408, 429, 500, 502, 503, 504].includes(status)) {
    return true;
  }

  if (error?.isTimeout) return true;
  if (error?.isInvalidJson) return true;
  if (message.includes("timeout")) return true;
  if (message.includes("quota")) return true;
  if (message.includes("too many requests")) return true;
  if (message.includes("overloaded")) return true;
  if (message.includes("rate limit")) return true;
  if (message.includes("high demand")) return true;

  return false;
}

function cleanJsonText(text: string) {
  const cleaned = text
    .trim()
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "")
    .trim();

  const firstObject = cleaned.indexOf("{");
  const lastObject = cleaned.lastIndexOf("}");

  if (firstObject !== -1 && lastObject !== -1 && lastObject > firstObject) {
    return cleaned.slice(firstObject, lastObject + 1);
  }

  return cleaned;
}

function sanitizeGeminiSchema(schema: unknown): unknown {
  if (Array.isArray(schema)) {
    return schema.map((item) => sanitizeGeminiSchema(item));
  }

  if (!schema || typeof schema !== "object") {
    return schema;
  }

  const source = schema as Record<string, unknown>;
  const cleaned: Record<string, unknown> = {};

  const unsupportedKeys = new Set([
    "additionalProperties",
    "description",
    "$schema",
    "default",
    "examples",
    "title",
  ]);

  for (const [key, value] of Object.entries(source)) {
    if (unsupportedKeys.has(key)) {
      continue;
    }

    cleaned[key] = sanitizeGeminiSchema(value);
  }

  return cleaned;
}

async function createGeminiRequestWithTimeout({
  apiKey,
  model,
  prompt,
  schema,
  timeoutMs,
  maxOutputTokens,
}: {
  apiKey: string;
  model: string;
  prompt: string;
  schema: unknown;
  timeoutMs: number;
  maxOutputTokens: number;
}) {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens,
          responseMimeType: "application/json",
          responseSchema: sanitizeGeminiSchema(schema),
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(
        data?.error?.message || `${response.status} ${response.statusText}`
      );

      (error as any).statusCode = response.status;
      (error as any).error = data?.error;

      throw error;
    }

    const rawText =
      data?.candidates?.[0]?.content?.parts
        ?.map((part: any) => part.text || "")
        .join("") || "";

    if (!rawText) {
      throw new Error("Gemini tidak mengembalikan output text.");
    }

    return rawText;
  } catch (error: any) {
    if (error?.name === "AbortError") {
      const timeoutError = new Error(
        `Gemini timeout setelah ${Math.round(timeoutMs / 1000)} detik`
      );

      (timeoutError as any).statusCode = 408;
      (timeoutError as any).isTimeout = true;

      throw timeoutError;
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function generateJsonWithGeminiFallback<T>({
  prompt,
  schema,
  model,
  label = "Gemini request",
}: GenerateJsonWithGeminiFallbackParams): Promise<
  GenerateJsonWithGeminiFallbackResult<T>
> {
  const allApiKeys = getGeminiApiKeys();

  if (allApiKeys.length === 0) {
    throw new Error(
      "API key Gemini belum ada. Isi GEMINI_API_KEY_1, GEMINI_API_KEY_2, dan seterusnya di .env.local"
    );
  }

  const selectedModel =
    model || process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const timeoutMs = getNumberEnv("GEMINI_REQUEST_TIMEOUT_MS", 120000);

  const maxAttempts = getNumberEnv(
    "GEMINI_MAX_KEY_ATTEMPTS",
    allApiKeys.length
  );

  const maxOutputTokens = getNumberEnv("GEMINI_MAX_OUTPUT_TOKENS", 4096);

  const apiKeys = allApiKeys.slice(0, maxAttempts);

  console.log(
    `⏱️ ${label}: timeout ${Math.round(timeoutMs / 1000)}s per key`
  );

  console.log(
    `🔁 ${label}: max attempts ${apiKeys.length}/${allApiKeys.length}`
  );

  console.log(`📦 ${label}: max output tokens ${maxOutputTokens}`);

  let lastError: any = null;

  for (let index = 0; index < apiKeys.length; index++) {
    const apiKey = apiKeys[index];
    const startTime = Date.now();

    try {
      console.log(
        `🔑 ${label}: trying Gemini key ${index + 1}/${apiKeys.length}`
      );

      const rawText = await createGeminiRequestWithTimeout({
        apiKey,
        model: selectedModel,
        prompt,
        schema,
        timeoutMs,
        maxOutputTokens,
      });

      const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(1);

      let parsed: T;

      try {
        parsed = JSON.parse(cleanJsonText(rawText)) as T;
      } catch (parseError: any) {
        console.error(`❌ ${label}: invalid JSON from Gemini`);
        console.error(rawText.slice(0, 1000));

        const error = new Error(
          "Gemini mengembalikan JSON tidak valid atau kepotong. Coba regenerate lagi atau naikkan GEMINI_MAX_OUTPUT_TOKENS."
        );

        (error as any).statusCode = 502;
        (error as any).isInvalidJson = true;

        throw error;
      }

      console.log(
        `✅ ${label}: success with Gemini key ${
          index + 1
        }/${apiKeys.length} in ${durationSeconds}s`
      );

      return {
        data: parsed,
        keyIndex: index,
        model: selectedModel,
      };
    } catch (error: any) {
      lastError = error;

      const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
      const status = getErrorStatus(error);
      const message = getErrorMessage(error);

      console.warn(
        `⚠️ ${label}: Gemini key ${
          index + 1
        } failed in ${durationSeconds}s`,
        {
          status,
          message,
        }
      );

      if (!isRetryableGeminiError(error)) {
        throw error;
      }
    }
  }

  const finalError = new Error(
    `Semua Gemini API key gagal. Last error: ${getErrorMessage(lastError)}`
  );

  (finalError as any).statusCode = getErrorStatus(lastError) || 500;

  throw finalError;
}