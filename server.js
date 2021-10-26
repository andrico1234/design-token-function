// server.js
const express = require("express");
const { Octokit } = require("@octokit/core");
const bodyParser = require("body-parser");

const app = express();

const octokit = new Octokit({ auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN });

app.use(bodyParser);
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.text());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/", (req, res, next) => {
  console.log('sjsjsj');
  
  res.sendStatus(200);
})

app.post("/commit-tokens", async (req, res) => {
  let file;

  try {
    file = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
      owner: "michaelmang",
      repo: "style-dictionary",
      path: "input/design-tokens.json"
    });
  } catch (ex) {
    // swallow 404
  }

  const body = JSON.parse(req.body);
  const buffer = Buffer.from(body.client_payload.tokens);
  const content = buffer.toString("base64");

  await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
    owner: "andrico1234",
    repo: "design-tokens-test",
    path: "input/design-tokens.json",
    message: "Update design tokens",
    content,
    sha: file && file.data && file.data.sha ? file.data.sha : null
  });
  
  res.sendStatus(200);
});

const listener = app.listen(process.env.PORT, () => {
  console.log('hiii');
  console.log("Your app is listening on port " + listener.address().port);
});
