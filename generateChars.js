import { config } from "dotenv";
import { z } from "zod";
import { OpenAI } from "openai";

config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// === Individual Zod Validators ===

const zNickname = z.string().min(3);
const zRank = z.string();
const zVillage = z.string();
const zNatureAffinity = z.array(z.string().min(2));
const zUniqueAbilities = z.array(z.string().min(2));
const zFeats = z.array(z.string().min(2));
const zBackground = z.string().min(10);

// === Combined Zod Schema ===

const CharacterSchema = z.object({
  name: z.string(),
  nickname: zNickname,
  rank: zRank,
  village: zVillage,
  natureAffinity: zNatureAffinity,
  uniqueAbilities: zUniqueAbilities,
  feats: zFeats,
  background: zBackground,
});

// === Internal Config Per Query ===

const QUERY_CONFIG_INITIAL = {
  nickname: {
    prompt: (name) =>
      `Give a cool, impressive Naruto-style nickname for a character named "${name}".`,
    schema: zNickname,
    model: "gpt-4o-mini",
    max_tokens: 50,
  },
  rank: {
    prompt: (name) =>
      `What would be the Naruto-style ninja rank of a character named "${name}"?`,
    schema: zRank,
    model: "gpt-4o-mini",
    max_tokens: 10,
  },
};

// charDescription = `${name} ("${result.nickname}", of rank ${result.rank})`
const QUERY_CONFIG = {
  village: {
    prompt: (charDescription) =>
      `What Naruto village would suit the character: ${charDescription}?`,
    schema: zVillage,
    model: "gpt-4o-mini",
    max_tokens: 20,
  },
  natureAffinity: {
    prompt: (charDescription) =>
      `What Naruto-style chakra nature affinities would ${charDescription} have? Return as a comma separated list. Low rank characters should have 1-2 affinities, while high rank characters can have 3-4 affinities.`,
    schema: zNatureAffinity,
    model: "gpt-4o-mini",
    max_tokens: 100,
  },
  uniqueAbilities: {
    prompt: (charDescription) =>
      `List unique jutsus or abilities that ${charDescription} would have in the Naruto world. Return as a comma separated list. Low rank characters should have 1-2 abilities, while high rank characters can have 3-4 abilities.`,
    schema: zUniqueAbilities,
    model: "gpt-4o-mini",
    max_tokens: 100,
  },
  feats: {
    prompt: (charDescription) =>
      `Describe notable feats or accomplishments of ${charDescription} in the Naruto world. Return as a list, where each feat/accomplishment is separated by a newline. Low rank characters should have 1-2 feats, while high rank characters can have 3-4 feats.`,
    schema: zFeats,
    model: "gpt-4o-mini",
    max_tokens: 200,
  },
  background: {
    prompt: (charDescription) =>
      `Write a short backstory for the Naruto character: ${charDescription}. Keep it to around 50 words.`,
    schema: zBackground,
    model: "gpt-4o-mini",
    max_tokens: 200,
  },
};

// === Utility: Call ChatGPT with Retry and Validation ===

const callWithRetry = async (
  key,
  prompt,
  schema,
  model,
  max_tokens,
  maxRetries = 5
) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const res = await openai.chat.completions.create({
      model,
      max_tokens,
      messages: [{ role: "user", content: prompt }],
    });

    const text = res.choices[0].message.content.trim();

    // log it out
    console.log(`generate ${key} - ${attempt} = ${text}`);

    try {
      // Try to parse response
      if (schema === z.array(z.string())) {
        // regex: split by comma or newline, and filter out empty strings
        const parsed = text.split(/,\s*|\n/).filter(Boolean);
        return schema.parse(parsed);
      }
      return schema.parse(text);
    } catch (e) {
      console.warn(`Validation failed (attempt ${attempt}):`, e.message);
      if (attempt === maxRetries) {
        throw new Error(
          `Failed after ${maxRetries} attempts for prompt: "${prompt}"`
        );
      }
    }
  }
};

// === Generate Character ===

export async function generateCharacter(name) {
  const result = { name };

  // get nickname and rank first - enable build richer char profile
  for (const [key, config] of Object.entries(QUERY_CONFIG_INITIAL)) {
    const prompt = config.prompt(name);
    const value = await callWithRetry(
      key,
      prompt,
      config.schema,
      config.model,
      config.max_tokens
    );
    result[key] = value;
  }

  const charDescription = `${name} ("${result.nickname}", of rank ${result.rank})`;

  for (const [key, config] of Object.entries(QUERY_CONFIG)) {
    const prompt = config.prompt(charDescription);
    const value = await callWithRetry(
      key,
      prompt,
      config.schema,
      config.model,
      config.max_tokens
    );
    result[key] = value;
  }

  return CharacterSchema.parse(result); // Final full validation
}

// === Generate Multiple Characters ===

export async function generateCharacters(names) {
  const characters = [];

  for (const name of names) {
    try {
      const character = await generateCharacter(name);
      characters.push(character);
    } catch (err) {
      console.error(
        `Fatal error generating character for "${name}":`,
        err.message
      );
      process.exit(1); // Exit entire script
    }
  }

  return characters;
}
