import { config } from "dotenv";
import { z } from "zod";
import { OpenAI } from "openai";

config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// === Individual Zod Validators ===

// TODO: can improve validation
const zNickname = z.string().min(3);
const zRank = z.string();
const zVillage = z.string();
const zNatureAffinity = z.array(z.string().min(2));
const zUniqueAbilities = z.array(z.string().min(2));
const zFeats = z.array(z.string().min(2));
// const zBackground = z.string().min(10);

const zArray = [zNatureAffinity, zUniqueAbilities, zFeats];

// === Combined Zod Schema ===

const CharacterSchema = z.object({
  name: z.string(),
  nickname: zNickname,
  rank: zRank,
  village: zVillage,
  natureAffinity: zNatureAffinity,
  uniqueAbilities: zUniqueAbilities,
  feats: zFeats,
  // background: zBackground,
});

// === Internal Config Per Query ===

const QUERY_CONFIG_INITIAL = {
  rank: {
    prompt: `Pick a rank from the following list: "Genin", "Chunin", "Special Jonin", "Jonin", "Anbu", "Kage", "Sage". Just the rank (without quotes), no other text or explanation.`,
    schema: zRank,
    model: "gpt-4o-mini",
    max_tokens: 20,
  },
  village: {
    prompt: `Pick a village from the following list: "Village Hidden in the Leaves, Konohagakure", "Village Hidden in the Sand, Sunagakure", "Village Hidden in the Mist, Kirigakure", "Village Hidden in the Cloud, Kumogakure", "Village Hidden in the Stones, Iwagakure", "Village Hidden in the Rain, Amegakure", "Village Hidden in the Sound, Otogakure". Include no other text or explanation, exclude the quotes.`,
    schema: zVillage,
    model: "gpt-4o-mini",
    max_tokens: 25,
  },
};

// doing unique things with these promps
const QUERY_CONFIG_UNIQUE = {
  nickname: {
    prompt: (charDescription) =>
      `Give a Naruto-style nickname for a character: ${charDescription}. The higher their rank, the more impressive the nickname should be; going from lowest to highest rank: "Genin", "Chunin", "Special Jonin", "Jonin", "Anbu", "Kage", "Sage". Their nickname should reflect their village or characters/affinities/abilities from that village. The nickname should be short and catchy, ideally 2-5 words. Return only the nickname. No other text or explanation. Don't need to include their name again.`,
    schema: zNickname,
    model: "gpt-4o-mini",
    max_tokens: 50,
  },
};

// charDescription = `${name} ("${result.nickname}", of rank ${result.rank})`
const QUERY_CONFIG = {
  natureAffinity: {
    prompt: (charDescription) =>
      `What Naruto-style chakra nature affinities would ${charDescription} have? Going from lowest to highest rank: If they are ranked Genin they should have 1 affinity, If they are ranked Chunin or Special Jonin they should have 1-2 affinities, If they are ranked Jonin or Anbu they should have 1-3 affinities, If they are ranked Kage or Sage they should have 2-5 affinities. However, you should take their nickname into consideration. For example: even if they are a Kage or Sage, if their nickname has the world "flame" they might only need 1-2 affinities related to "fire" or "lava". If their nickname is more affinity agnostic, feel free to give them multiple affinities. Return as a list with each on a new line. No other text or explanation. Pick from: "Fire, Wind, Lightning, Earth, Water" or more advanced (for higher ranks): "Wood, Ice, Lava, Steel, Sand"`,
    schema: zNatureAffinity,
    model: "gpt-4o-mini",
    max_tokens: 100,
  },
  // TODO: abilities + feats should take into account affinities.
  uniqueAbilities: {
    prompt: (charDescription) =>
      `List unique jutsus or abilities that ${charDescription} would have in the Naruto world. If they are ranked Genin they should have 1-2 abilities, If they are ranked Chunin or Special Jonin they should have 2-3 abilities, If they are ranked Jonin or Anbu they should have 3-5 abilities, If they are ranked Kage or Sage they should have 5-10 abilities. Return as a list with each on a new line. No other text or explanation.`,
    schema: zUniqueAbilities,
    model: "gpt-4o-mini",
    max_tokens: 250,
  },
  feats: {
    prompt: (charDescription) =>
      `Describe notable feats or accomplishments of ${charDescription} in the Naruto world. If they are ranked Genin they should have 1 feat, If they are ranked Chunin or Special Jonin they should have 2 feats, If they are ranked Jonin or Anbu they should have 3-4 feats, If they are ranked Kage or Sage they should have 5-8 feats. Return as a list with each on a new line. No other text or explanation.`,
    schema: zFeats,
    model: "gpt-4o-mini",
    max_tokens: 400,
  },
  // TODO: for accuracy would need context of all previous fields, do later.
  // background: {
  //   prompt: (charDescription) =>
  //     `Write a short backstory for the Naruto character: ${charDescription}. Keep it to around 50-75 words.`,
  //   schema: zBackground,
  //   model: "gpt-4o-mini",
  //   max_tokens: 300,
  // },
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
    console.log(`generate ${key} - ${attempt} = ${text}\n---`);

    try {
      // Try to parse response
      if (zArray.includes(schema)) {
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

// === Generate Character ===

export async function generateCharacter(name) {
  const result = { name };

  // (1) get rank + village - enable build richer char profile
  for (const [key, config] of Object.entries(QUERY_CONFIG_INITIAL)) {
    const value = await callWithRetry(
      key,
      config.prompt,
      config.schema,
      config.model,
      config.max_tokens
    );
    result[key] = value;
  }

  const charRankVillage = `${name} (rank: ${result.rank}, from: ${result.village})`;

  // (2) from rank + village, get nickname
  // rank affects nickname impressiveness + village - affinities
  const key = "nickname";
  const config = QUERY_CONFIG_UNIQUE[key];
  result[key] = await callWithRetry(
    key,
    config.prompt(charRankVillage),
    config.schema,
    config.model,
    config.max_tokens
  );

  // (3) get nature affinities to pass into abilities + feats

  const charDescription = `${name} (nickname: "${result.nickname}", rank: ${result.rank}, from: ${result.village})`;

  console.log(`charDescription:`, charDescription, `\n---`);

  // (4) finally, from all details so far, get abilities + feats
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
