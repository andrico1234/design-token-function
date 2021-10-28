// server.js
const express = require("express");
const { Octokit } = require("@octokit/rest");
const bodyParser = require("body-parser");

const app = express();

require("dotenv").config();

const octokit = new Octokit({ auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/", (req, res, next) => {
  res.sendStatus(200);
});

app.post("/commit-tokens", async (req, res) => {
  let file;

  try {
    file = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
      owner: "andrico1234",
      repo: "design-tokens-test",
      path: "input/design-tokens.tokens.json",
    });
  } catch (ex) {
    console.error("--error--", ex);
    // swallow 404
  }

  const tokens = JSON.parse(req.body).client_payload.tokens;
  // done to minify the output
  const parsedTokens = JSON.parse(tokens);

  const buffer = Buffer.from(JSON.stringify(parsedTokens));
  const content = buffer.toString("base64");

  try {
    await octokit.repos.createOrUpdateFileContents({
      owner: "andrico1234",
      repo: "design-tokens-test",
      path: "input/design-tokens.tokens.json",
      message: "Update design tokens",
      content,
      sha: file && file.data && file.data.sha ? file.data.sha : null,
      committer: {
        name: `Octokit Bot`,
        email: "karoulla.andrico@gmail.com",
      },
      author: {
        name: "Octokit Bot",
        email: "karoulla.andrico@gmail.com",
      },
    });
  } catch (ex) {
    console.error("__error__", ex);
  }

  console.log("very success");

  res.sendStatus(200);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
