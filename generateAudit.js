import { config } from "dotenv";
import { z } from "zod";
import { OpenAI } from "openai";

config();

// config
const CONCURRENCY_LIMIT = 5;
const CHAT_MODEL = "gpt-5-mini";
const PROMPT = `
  You are an expert in English language learning (think: The Oxford 3000).
  For the given word, evaluate it's importance to ESL learners.
  You need to return a rating between 0 and 3.
  0 = not essential (to be removed from list), must give brief reason.
  1 = essential = should know as part of your first 5000 essential English words.
  2 = very essential = key/essential words for conversation and getting around.
  3 = absolutely essential = first 1000 essential English words. To survive in English-speaking country.
  other reasons to remove: slang, jargon, offensive, sexual, has punctuation that's not a "-", etc.
  you only need to give the reason if the rating is 0.

  Format your response exactly like this:
  rating|why(if rating is 0)

  Example:
  3
  0|Slang word, not useful for ESL learners

  Evaluate word:
  `;

// setup zod schema
const zAudit = z.object({
  word: z.string(),
  rating: z.number().min(0).max(3),
  why: z.string().optional(),
});

// setup openai
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// each word, ask AI to evaluate
const worker = async (word) => {
  const audit = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages: [{ role: "user", content: PROMPT.trim() + word }],
  });
  return audit;
};

// loop through words
// run in parallel x5 - log output
const processWithConcurrencyLimit = async (tasks, limit, worker) => {
  const results = [];
  let index = 0;

  const run = async () => {
    while (index < tasks.length) {
      const currentIndex = index++;
      try {
        const result = await worker(tasks[currentIndex]);
        const resultEval = result.choices[0].message.content.split("|");
        const resultObj = {
          word: tasks[currentIndex],
          rating: parseInt(resultEval[0]),
        };

        if (resultObj.rating === 0) {
          resultObj.why = resultEval[1];
        }

        // log out
        console.log(`${JSON.stringify(resultObj)}\n`);
        results[currentIndex] = zAudit.parse(resultObj);
      } catch (err) {
        console.error(`error: ${err}\n`);
        results[currentIndex] = { error: err };
      }
    }
  };

  // Start `limit` number of workers in parallel
  const workers = Array.from({ length: limit }, run);
  await Promise.all(workers);

  // sort results alphabetically
  results.sort((a, b) => a.word.localeCompare(b.word));

  return JSON.stringify(results, null, 2);
};

// processor; audit words; entry & exit
export const generateAudit = async (inputData) => {
  try {
    const words = JSON.parse(inputData);
    const audit = await processWithConcurrencyLimit(
      words,
      CONCURRENCY_LIMIT,
      worker
    );
    return audit;
  } catch (error) {
    console.error("Error in generateAudit:", error);
    throw new Error(`Failed to process words: ${error.message}`);
  }
};

/**
 * takes a JSON file of words
 * outputs a JSON file of words with essential rating & why
 *
 * localhost:3001/audit?in=words.json&out=words-audit.json
 * for DIRs, ./output-audit/words.json, etc
 *
 * in: [word1, word2, word3, ...]
 * out:
 * [
 *  { word: word1, rating: 3 },
 *  { word: word2, rating: 0, why: "reason..." },
 *  ...
 * ]
 */
