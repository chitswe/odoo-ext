module.exports = {
    apps : [
        {
          name: "odoo-ext",
          script: "./artifacts/server/server.js",
          watch: false,
          env: {
            "NODE_ENV": "production",
          }
        }
    ]
  }