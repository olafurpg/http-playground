POST https://codestral.mistral.ai/v1/fim/completions
Authorization: Bearer {{CODESTRAL_ACCESS_TOKEN}}
{
  "model": "codestral-2405",
  "temperature": 0.2,
  "top_p": 1,
  "max_tokens": 200,
  "min_tokens": 200,
  "stream": false,
  "stop": ["\n\n"],
  "random_seed": 0,
  "prompt": "def add(a, b):\n    ",
  "suffix": " a + b\n    return final_result"
}
