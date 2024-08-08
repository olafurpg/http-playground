import fs from "node:fs";
import path from "node:path";
import { config } from "dotenv";

config();

interface Benchmark {
  filepath: string;
  pattern: string;
  preservedPrefix: string;
  preservedSuffix: string;
}

const benchmarks: Benchmark[] = [
  {
    filepath: path.resolve(
      "/Users/olafurpg/dev/sourcegraph/cody/agent/src/cli/scip-codegen/scip.ts"
    ),
    pattern: "const writer =",
    preservedPrefix: "const ",
    preservedSuffix: "=",
  },
  {
    filepath: path.resolve(
      "/Users/olafurpg/dev/sourcegraph/sourcegraph/internal/database/dbmocks/mocks_temp.go"
    ),
    pattern: "\thistory :=",
    preservedPrefix: "\this",
    preservedSuffix: " :=",
  },
];

const maxMatches = 20;

for (const {
  filepath,
  pattern,
  preservedPrefix,
  preservedSuffix,
} of benchmarks) {
  if (filepath.endsWith(".go")) {
    continue;
  }
  const code = fs.readFileSync(filepath);
  const codeString = code.toString();
  const regex = new RegExp(pattern, "g");
  let match;
  const results = [];

  let matches = 0;
  while ((match = regex.exec(codeString)) !== null) {
    matches++;

    if (matches > maxMatches) {
      break;
    }
    const prefix = codeString.slice(0, match.index + preservedPrefix.length);
    const matchedString = match.join("");
    const suffix = codeString
      .slice(match.index + matchedString.length - preservedSuffix.length)
      .slice(0, 1000);
    results.push({ prefix, suffix });
    const start = performance.now();
    const prompt = prefix;
    // console.log("sending request", {
    //   promptSize: prompt.length,
    //   estimatedTokens: Math.ceil(prompt.length / 4),
    //   prefix: prefix.slice(-20),
    //   matchedString,
    //   matchLength: match.length,
    //   suffix: suffix.slice(0, 20),
    // });
    // if (prompt) {
    //   continue;
    // }

    const response = await fetch(
      "https://codestral.mistral.ai/v1/fim/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CODESTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: "codestral-2405",
          prompt,
          suffix,
          temperature: 0.2,
          //   top_p: 1,
          max_tokens: 200,
          //   min_tokens: 0,
          stream: false,
          stop: ["\n"],
          //   random_seed: 0,
        }),
      }
    );
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    const duration = performance.now() - start;
    // console.log({
    //   duration,
    //   prefixSize: prefix.length,
    //   content,
    //   prefix: prefix.slice(-20),
    //   suffix: suffix.slice(0, 20),
    //   // response: data,
    // });
    const basename = path.basename(filepath);
    const estimatedTokens = Math.ceil((prefix.length + suffix.length) / 4);

    const tsvLine = `${duration}\t${estimatedTokens}\t${basename}\t${content}\t\n`;
    fs.writeFileSync("latencies.tsv", tsvLine, { flag: "a" });
    process.stdout.write(tsvLine);
  }

  // console.log(results);
}
