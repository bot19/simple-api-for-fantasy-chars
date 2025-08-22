import { config } from "dotenv";
import { z } from "zod";
import { OpenAI } from "openai";

config();

// setup config
const CHAT_MODEL = "gpt-5-mini";
const WORKER_LIMIT = 5;
const PROMPT = `
  You are a UK English spelling expert. Given a word, check if it is spelled correctly. If correct, return "true". If incorrect, you must give the reason why, return "false|reason why it is spelt incorrectly".
  For word:[word]
  `;

// setup zod schema
const zSpelling = z.object({
  word: z.string(),
  correctSpelling: z.boolean(),
  why: z.string().optional(),
});

// setup openai
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// entry & exit; receive file text, return file text
export const generateSpelling = async (words) => {
  try {
    const wordsArr = JSON.parse(words);
    const wordsChecked = await processWithConcurrencyLimit(
      wordsArr,
      WORKER_LIMIT,
      worker
    );

    console.log(`spelling completed`);
    return wordsChecked;
  } catch (error) {
    console.error("Error in generateSpelling:", error);
    throw new Error(`Failed to process words: ${error.message}`);
  }
};

// each word, ask AI to evaluate
const worker = async (word) => {
  const response = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages: [{ role: "user", content: PROMPT.replace("[word]", word) }],
  });
  return response;
};

// concurrent processor
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
          correctSpelling: resultEval[0] === "true",
        };

        if (!resultObj.correctSpelling) {
          resultObj.why = resultEval[1];
        }

        // log out
        console.log(`${JSON.stringify(resultObj)}`);
        results[currentIndex] = zSpelling.parse(resultObj);
      } catch (err) {
        console.error(`error: ${err}\n`);
        results[currentIndex] = {
          word: tasks[currentIndex],
          error: err,
        };
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

/**
 * takes a JSON file of words
 * outputs a JSON file of words with spell checked & why
 *
 * localhost:3001/spelling?in=words.json&out=words-spelling.json
 * for DIRs, ./output-spelling/words.json, etc
 *
 * in: [word1, word2, word3, ...]
 * out:
 * [
 *  { word: word1, correctSpelling: true },
 *  { word: word2, correctSpelling: false, why: "reason..." },
 *  ...
 * ]
 */
