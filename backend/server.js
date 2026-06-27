const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const Validator = require("./validate");
const Utility = require("./utility");
const config = require("./config");

const app = express();
const PORT = config.server.port;

app.use(cors());
app.use(bodyParser.json({ limit: config.api.maxPayloadSize }));
app.use(bodyParser.urlencoded({ limit: config.api.maxPayloadSize, extended: true }));

app.get("/apiCheck", (req, res) => {
  res.json({ status: "OK", message: "API is running" });
});

app.post("/bfhl", (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ error: "Missing required field: data", example: { data: ["A->B", "A->C", "B->D"] } });
    }

    if (!Array.isArray(data)) {
      return res.status(400).json({ error: 'Field "data" must be an array' });
    }

    const validator = new Validator(data);
    const { validEdges, invalidEntries, duplicateEdges } = validator.validateEntries();

    const utility = new Utility(validEdges);
    const hierarchies = utility.processHierarchies();
    const summary = utility.generateSummary(hierarchies);

    const response = {
      user_id: config.user.user_id,
      email_id: config.user.email_id,
      college_roll_number: config.user.college_roll_number,
      hierarchies,
      invalid_entries: invalidEntries,
      duplicate_edges: duplicateEdges,
      summary,
    };

    res.json(response);
  } catch (error) {
    console.error("Error processing /bfhl request:", error);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
});

app.use((req, res) => res.status(404).json({ error: "Not Found", message: "The requested endpoint does not exist" }));
app.use((err, req, res, next) => res.status(500).json({ error: "Internal Server Error", message: err.message }));

// Export the app for Vercel Deployment
module.exports = app;

app.listen(PORT, () => {
  console.log(`🚀 Backend API running on http://localhost:${PORT}`);
});

