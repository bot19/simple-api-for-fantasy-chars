import express from "express";

const app = express();
const PORT = 3000;

let server;

// Simulated async task: returns name with delay
const asyncTask = async (name) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Processed: ${name}`);
    }, 500); // simulate 500ms delay
  });
};

app.get("/fantasy", async (req, res) => {
  const namesParam = req.query.names;

  // error handling: missing query parameters
  if (!namesParam) {
    return res.status(400).send('Missing "names" query parameter.');
  }

  const names = namesParam.split(",").map((name) => name.trim());

  try {
    const results = await Promise.all(names.map(asyncTask));
    console.log("Results:", results);
    res.json(results); // responds with a JSON array
  } catch (error) {
    // error handling: async task failure
    console.error("Error processing names:", error);
    res.status(500).send("Server error");
  }
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
