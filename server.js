import express from "express";
import { generateCharacters } from "./generateChars.js";
import { generateDefs } from "./generateDefs.js";

const app = express();
const PORT = 3001;

let server;

const handleRequest = async (req, res, generator) => {
  const listParam = req.query.list;

  // error handling: missing query parameters
  if (!listParam) {
    return res.status(400).send('Missing "list" query parameter.');
  }

  const list = listParam.split(",").map((name) => name.trim());

  try {
    // const results = await Promise.all(list.map(asyncTask));
    console.log("List to process:", list, `\n---`);

    const result = await generator(list);

    // TODO: this log outputs weird data sometimes, no idea why
    console.log("Results:", JSON.stringify(result, null, 2));

    res.json(result); // responds with a JSON array = works GOOD
  } catch (error) {
    // error handling: async task failure
    console.error("Error processing list:", error);
    res.status(500).send("Server error");
  }
};

app.get("/naruto", async (req, res) => {
  return await handleRequest(req, res, generateCharacters);
});

app.get("/words", async (req, res) => {
  return await handleRequest(req, res, generateDefs);
});

// Assign the server instance
server = app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

// Graceful shutdown on Ctrl+C or SIGINT
process.on("SIGINT", () => {
  console.log("\n🛑 Gracefully shutting down...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});
