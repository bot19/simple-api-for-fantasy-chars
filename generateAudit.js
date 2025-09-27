import { config } from "dotenv";
import { z } from "zod";
import { OpenAI } from "openai";

config();

// config
const CONCURRENCY_LIMIT = 5;
const CHAT_MODEL = "gpt-5-mini";
const PROMPT = `
  You are an expert in ESL word evaluation (e.g., Oxford 3000).
  For a given word, rate its importance to ESL learners:
  0 = Not essential (remove; give short reason)
  1 = Essential (top 5000)
  2 = Very essential (top 3000;core for conversation/travel)
  3 = Absolutely essential (top 1000; survival level)
  Remove if slang, jargon, sexual, offensive, or includes punctuation (except hyphen).
  Respond in this format:
  rating|reason (if rating = 0)
  Examples:
  3
  0|Slang, not useful for ESL learners

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
  const results = new Array(tasks.length);
  let currentIndex = 0;

  const getNextTask = () => {
    if (currentIndex >= tasks.length) {
      return null;
    }
    return currentIndex++;
  };

  const run = async () => {
    while (true) {
      const taskIndex = getNextTask();
      if (taskIndex === null) {
        break;
      }

      try {
        const result = await worker(tasks[taskIndex]);
        const resultEval = result.choices[0].message.content.split("|");
        const resultObj = {
          word: tasks[taskIndex],
          rating: parseInt(resultEval[0]),
        };

        if (resultObj.rating === 0) {
          resultObj.why = resultEval[1];
        }

        // log out
        console.log(`${JSON.stringify(resultObj)}`);
        results[taskIndex] = zAudit.parse(resultObj);
      } catch (err) {
        console.error(`error: ${err}\n`);
        results[taskIndex] = {
          word: tasks[taskIndex],
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

// processor; audit words; entry & exit
export const generateAudit = async (inputData) => {
  try {
    const words = JSON.parse(inputData);
    const audit = await processWithConcurrencyLimit(
      words,
      CONCURRENCY_LIMIT,
      worker
    );

    console.log(`audit completed`);
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
