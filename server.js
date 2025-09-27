import express from "express";
import { generateCharacters } from "./generateChars.js";
import { generateDefs } from "./generateDefs.js";
import { generateDefsFast } from "./generateDefsFast.js";
import { generateAudit } from "./generateAudit.js";
import { generateSpelling } from "./generateSpelling.js";
import fs from "fs";

// define server + details
const app = express();
const PORT = 3001;

let server;

// request handler
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

// request handler for files
const handleFileRequest = async (req, res, processor) => {
  const fileInPath = req.query.in;
  const fileOutPath = req.query.out;

  if (!fileInPath || !fileOutPath) {
    return res.status(400).send('Missing "in" or "out" query parameters.');
  }

  try {
    // read file; limit to text data (not binary data)
    const fileIn = fs.readFileSync(fileInPath, "utf8");

    // process file
    const processedFile = await processor(fileIn);

    // write file; output JSON for easy js parsing
    fs.writeFileSync(fileOutPath, processedFile);

    res.send("File processed successfully");
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).send("Server error");
  }
};

// define routes
app.get("/naruto", async (req, res) => {
  return await handleRequest(req, res, generateCharacters);
});

app.get("/words", async (req, res) => {
  return await handleRequest(req, res, generateDefs);
});

app.get("/wordsfast", async (req, res) => {
  return await handleRequest(req, res, generateDefsFast);
});

app.get("/audit", async (req, res) => {
  return await handleFileRequest(req, res, generateAudit);
});

app.get("/spelling", async (req, res) => {
  return await handleFileRequest(req, res, generateSpelling);
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
