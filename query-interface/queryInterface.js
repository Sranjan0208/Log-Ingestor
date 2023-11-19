const express = require("express");
const { Client } = require("@elastic/elasticsearch");

const app = express();
const port = 3001;

// Initialize Elasticsearch client
const esClient = new Client({ node: "http://localhost:9200" });

// Query logs via HTTP GET
app.get("/logs", async (req, res) => {
  try {
    const {
      level,
      message,
      resourceId,
      timestampFrom,
      timestampTo,
      traceId,
      spanId,
      commit,
      parentResourceId,
    } = req.query;

    // Build Elasticsearch query
    const query = {
      bool: {
        must: [
          level && { term: { level } },
          message && { match: { message } },
          resourceId && { term: { resourceId } },
          timestampFrom &&
            timestampTo && {
              range: {
                timestamp: {
                  gte: new Date(timestampFrom),
                  lte: new Date(timestampTo),
                },
              },
            },
          traceId && { term: { traceId } },
          spanId && { term: { spanId } },
          commit && { term: { commit } },
          parentResourceId && {
            term: { "metadata.parentResourceId": parentResourceId },
          },
        ].filter(Boolean),
      },
    };

    // Search logs in Elasticsearch
    const body = await esClient.search({
      index: "logs",
      body: {
        query,
      },
    });

    const hits = body.hits.hits.map((hit) => hit._source);

    if (hits.length > 0) {
      res.status(200).json({ success: true, logs: hits });
    } else {
      res
        .status(404)
        .json({ success: false, message: "No matching logs found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Start the HTTP server for the query interface
app.listen(port, () => {
  console.log(`Query Interface listening at http://localhost:${port}`);
});
