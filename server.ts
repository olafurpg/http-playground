import Bun from "bun";
const server = Bun.serve({
  port: 3000,
  fetch: async (req) => {
    console.log("Request headers:");
    req.headers.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    console.log("Request body:");
    const body = await req.text();
    console.log(body);

    return new Response("Check your console for the request headers!");
  },
});
