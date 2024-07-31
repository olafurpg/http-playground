import OpenAI from "openai";

import { config } from "dotenv";
import  fetch  from 'node-fetch'
config();

const openai = new OpenAI({
  baseURL: "https://sourcegraph.test:3443/api/openai/v1",
  apiKey: process.env.SRC_ACCESS_TOKEN,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  fetch: ((url: any, options: any) => {
    return fetch(url, {
      ...options,
      // Need to reject unauthorized to test local sourcegraph instance.
      tls: {rejectUnauthorized: false}
    });
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  }) as any,
});

const response = await openai.chat.completions.create({
  model: "anthropic::unknown::claude-3-sonnet-20240229",
  messages: [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: 'Respond with "yes" and nothing else',
        },
      ],
    },
  ],
  temperature: 1,
  max_tokens: 256,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
});

console.log(JSON.stringify(response, null, 2));
