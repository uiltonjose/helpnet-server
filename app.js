const app = require("./src/app_config.js");

app.get("/", (req, res) => {
  res.send(JSON.stringify("HelpNet - Webservice alive! Ready to work."));
});

app.use("/api/content", require("./src/routes/api/content"));

app.use("/api/customer", require("./src/routes/api/customer"));

app.use("/api/user", require("./src/routes/api/user"));

app.use("/api/os", require("./src/routes/api/os"));

app.use("/api/provider", require("./src/routes/api/provider"));

app.use("/api/notification", require("./src/routes/api/notification"));

app.use("/api/util", require("./src/routes/api/util"));

module.exports = app;
