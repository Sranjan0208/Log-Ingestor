const express = require("express");
const bodyParser = require("body-parser");
const { Client } = require("@elastic/elasticsearch");
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
  },
});

const app = express();
const port = 3000;

// Initialize Elasticsearch client
const esClient = new Client({
  node: "http://localhost:9200",
  maxRetries: 3,
  requestTimeout: 60000, // Set a higher timeout value (e.g., 60 seconds)
});

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Ingest logs via HTTP POST
app.post("/logs", async (req, res) => {
  try {
    // Directly destructure logs from req.body
    const logs = req.body;

    console.log(req.body);
    console.log(logs);

    // Index logs into Elasticsearch
    try {
      await esClient.bulk({
        body: logs.flatMap((log) => [
          { index: { _index: "logs" } },
          {
            id: log.id,
            level: log.level,
            message: log.message,
            resourceId: log.resourceId,
            timestamp: new Date(log.timestamp),
            traceId: log.traceId,
            spanId: log.spanId,
            commit: log.commit,
            parentResourceId: log.metadata
              ? log.metadata.parentResourceId
              : null,
          },
        ]),
      });
    } catch (error) {
      console.error("Elasticsearch error:", error);
    }

    // Insert logs into PostgreSQL individually
    for (const log of logs) {
      await pool.query(
        "INSERT INTO logs(id, level, message, resourceId, timestamp, traceId, spanId, commit, parentResourceId) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)",
        [
          log.id,
          log.level,
          log.message,
          log.resourceId,
          new Date(log.timestamp),
          log.traceId,
          log.spanId,
          log.commit,
          log.metadata ? log.metadata.parentResourceId : null,
        ]
      );
    }

    res
      .status(200)
      .json({ success: true, message: "Logs ingested successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Start the HTTP server
app.listen(port, () => {
  console.log(`Log Ingestor listening at http://localhost:${port}`);
});
