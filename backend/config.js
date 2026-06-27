
module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    host: "0.0.0.0",
  },

  // User information
  user: {
    user_id: "bhavesh_15112004",
    email_id: "bhavesh1553.be23@chitkara.edu.in",
    college_roll_number: "2310991553",
  },

  // API configuration
  api: {
    corsEnabled: true,
    requestTimeout: 30000,
    maxPayloadSize: "10mb",
  }
};
