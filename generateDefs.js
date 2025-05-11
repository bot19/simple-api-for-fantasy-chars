import { config } from "dotenv";
import { z } from "zod";
import { OpenAI } from "openai";

config();

/**
 * models:
 * "gpt-4o-mini"
 * "gpt-4.1-mini-2025-04-14"
 * "gpt-4.1-2025-04-14"
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const noContent = "no data for field";

// === Zod Validators + Types ===

const zLevel = z.object({
  rank: z.number(),
});

const zMeaning = z.object({
  partOfSpeech: z.string(),
  definition: z.string(),
  example: z.string(),
  note: z.string(),
  synonyms: z.array(z.string()).optional(),
});

const zDefinition = z.object({
  word: z.string(),
  level: zLevel,
  phonetics: z.object({
    simplified: z.string(),
  }),
  inflections: z.array(z.string()).optional(),
  meanings: z.array(zMeaning),
});

// === Utility: Call ChatGPT with Retry and Validation ===

const callWithRetry = async ({
  key,
  prompt,
  schema,
  model,
  max_tokens,
  maxRetries = 5,
}) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const res = await openai.chat.completions.create({
      model,
      max_tokens,
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    const text = res.choices[0].message.content.trim();

    // log it out
    console.log(`generate ${key} - ${attempt} = ${text}\n---`);

    // TODO: crude validation. Not proper AI structured output
    try {
      // Try to parse response
      if (schema instanceof z.ZodArray) {
        // regex: split by comma or newline, and filter out empty strings
        const parsed = text.split(/\n/).filter(Boolean);

        // clean array content; remove "- " prefix and trim whitespace
        const cleaned = parsed.map((item) => item.trim().replace(/^- /, ""));

        console.log(`schema array:`, cleaned, `\n---`);
        return schema.parse(cleaned);
      }

      // console.log(`schema text:`, text);
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

// === Generate Fields ===

// prompt: UPDATED
const getMeanings = async (word) => {
  const callParams = {
    key: "getMeanings",
    prompt: `Give me a concise list **semantically distinct** core meanings for the word "${word}", as you would find in an English-UK ESL dictionary (at least 1; can be 2, 3, 4 or max 5). Only include meanings that are genuinely different in purpose or function — do not list ones that differ only in grammar or context. If there is only one such meaning, return just that. For each meaning output in this format, keep it simple and easy to understand: partOfSpeech|meaning\n`,
    schema: z.array(z.string().min(3)),
    model: "gpt-4.1-mini-2025-04-14",
    max_tokens: 500,
  };

  const result = await callWithRetry(callParams);

  return result.map((meaning) => {
    const [partOfSpeech, defintion] = meaning.split("|").map((s) => s.trim());

    return {
      partOfSpeech,
      defintion,
    };
  });
};

// prompt: GOOD
const getRank = async (word) => {
  const callParams = {
    key: "getRank",
    prompt: `for the word: "${word}", give a rank of importance for ESL learners, 1 = most essential, 10 = least essential. Just give me a value, no explanation.`,
    schema: z.string().regex(/^[0-9]{1,2}$/),
    model: "gpt-4o-mini",
    max_tokens: 5,
  };

  const result = await callWithRetry(callParams);

  return Number(result);
};

// prompt: GOOD
const getSimplifiedPhonetic = async (word) => {
  const callParams = {
    key: "getSimplifiedPhonetic",
    prompt: `For the word "${word}": give an easy, phonetic-style rendering that mimics how native English speakers might 'sound it out' using (only) regular alphabet letters—especially useful for learners unfamiliar with IPA. Respond with only the phonetic word, no explanation.`,
    schema: z.string().min(1),
    model: "gpt-4o-mini",
    max_tokens: 20,
  };

  const result = await callWithRetry(callParams);

  return result;
};

// prompt: GOOD
const getInflectons = async (word) => {
  const callParams = {
    key: "getInflectons",
    prompt: `For the word: ${word}; provide a comma-separated list of standard, grammatically correct inflected forms in modern English. Exclude incorrect, hypothetical, or nonstandard forms. If there are no inflected forms, return: ${noContent}`,
    schema: z.string().regex(/^[a-z\-,’' ]+$/i),
    model: "gpt-4.1-mini-2025-04-14",
    max_tokens: 150,
  };

  const result = await callWithRetry(callParams);

  return result.split(",").map((w) => w.trim().toLowerCase());
};

// prompt: GOOD
const getExample = async (wordDefinition) => {
  const callParams = {
    key: "getExample",
    prompt: `For the word: ${wordDefinition}, give me a clear, English-UK ESL-friendly example phrase. Keep it simple and easy to understand. Ouput example phrase only, nothing else.`,
    schema: z.string().min(3),
    model: "gpt-4o-mini",
    max_tokens: 100,
  };

  const result = await callWithRetry(callParams);

  return result;
};

// prompt: GOOD
const getHelpfulNote = async (wordDescription) => {
  const callParams = {
    key: "getHelpfulNote",
    prompt: `For the word: ${wordDescription}, give me a (1) clear, English-UK ESL-friendly helpful note. Could be related to: usage, grammar, context or pronunciation. Just the note part, don't need to include the word and part of speech again. Keep it simple and easy to understand.`,
    schema: z.string().min(3),
    model: "gpt-4o-mini",
    max_tokens: 200,
  };

  const result = await callWithRetry(callParams);

  return result;
};

// prompt: GOOD
const getSynonyms = async (wordDescription) => {
  const callParams = {
    key: "getSynonyms",
    prompt: `Give me a list of synonyms for the word ${wordDescription}. Respond with a comma separated list of those synonyms or if there are no synonyms return: ${noContent}. Avoid punctuation (don't want phrases) except for the comma to separate the synonyms.`,
    schema: z.string().regex(/^[a-z\-,’' ]+$/i),
    model: "gpt-4o-mini",
    max_tokens: 150,
  };

  const result = await callWithRetry(callParams);

  return result.split(",").map((w) => w.trim().toLowerCase());
};

// === Generate Definition ===

export async function generateDefinition(word) {
  // get meanings/senses of word (1-many)
  const simpleMeanings = await getMeanings(word);

  const meanings = [];

  for (const simpleMeaning of simpleMeanings) {
    const meaning = {
      partOfSpeech: simpleMeaning.partOfSpeech,
      definition: simpleMeaning.defintion,
      example: await getExample(
        `${word} (${simpleMeaning.partOfSpeech}) as in "${simpleMeaning.defintion}"`
      ),
    };

    const wordDescription = `${word} (${simpleMeaning.partOfSpeech}) as in "${meaning.example}"`;

    // after: note
    meaning.note = await getHelpfulNote(wordDescription);

    // optional: synonyms
    const synonyms = await getSynonyms(wordDescription);
    if (synonyms[0] !== noContent) {
      meaning.synonyms = synonyms;
    }

    meanings.push(zMeaning.parse(meaning));
  }

  const definition = {
    word,
    level: {
      rank: await getRank(word),
    },
    phonetics: {
      simplified: await getSimplifiedPhonetic(word),
    },
    meanings,
  };

  // optional: inflections
  const rawInflections = await getInflectons(word);
  const inflections = rawInflections.filter((w) => w !== word);
  if (inflections[0] !== noContent) {
    definition.inflections = inflections;
  }

  return zDefinition.parse(definition); // Final full validation
}

// === Generate Multiple Characters ===

export async function generateDefs(words) {
  const definitions = [];

  for (const word of words) {
    try {
      const definition = await generateDefinition(word);
      definitions.push(definition);
    } catch (err) {
      console.error(
        `Fatal error generating definition for "${word}":`,
        err.message
      );
      process.exit(1); // Exit entire script
    }
  }

  return definitions;
}
