# Log Ingestion System

## Introduction

This project is a Log Ingestion System designed to ingest logs into both Elasticsearch and PostgreSQL databases. It provides a simple HTTP API for log ingestion and a query interface to search and retrieve logs.

## System Design

The system is designed with the following components:

- **Log Ingestor:** An Express.js server that receives logs via HTTP POST requests, ingests them into Elasticsearch, and stores them in PostgreSQL.

- **Query Interface:** Another Express.js server that allows querying logs based on various parameters like level, message, timestamp, and more.

- **Elasticsearch:** Used as the primary storage for logs.

- **PostgreSQL:** Used as a secondary storage for logs.

## Features

- Ingest logs via HTTP POST requests.
- Search logs based on different parameters using the query interface.

## Getting Started

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Sranjan0208/Log-Ingestor.git
   cd log-ingestion
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Setup environment variables:**

   Create a `.env` file in the log-ingestor directory and add the following:

   ```env
   # PostgreSQL Configuration
   DATABASE_URL=postgres://alex:AbC123dEf@ep-cool-darkness-123456.us-east-2.aws.neon.tech/dbname

   ```

4. **Run the Log Ingestor:**

   ```bash
   cd log-ingestor
   npm install
   node logIngestor.js
   ```

5. **Run the Query Interface:**

   ```bash
   cd query-interface
   npm install
   node queryInterface.js
   ```

## Usage

- Ingest logs:

  ```bash
  curl -X POST -H "Content-Type: application/json" -d @common/sampleLogs.json http://localhost:3000/logs
  ```

- Query logs:

  ```bash
  curl "http://localhost:3001/logs?level=error"
  ```

## Identified Issues

- **No Shard Available:** If Elasticsearch shows "No shard available" issues, you might need to allocate the primary shard to a node. Refer to Elasticsearch documentation for solutions.
