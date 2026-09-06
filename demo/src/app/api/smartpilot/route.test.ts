import test from "node:test";
import assert from "node:assert/strict";

import { POST } from "./route";

test("fallback response stays in the requested language when Groq is unavailable", async () => {
  const response = await POST(
    new Request("http://localhost/api/smartpilot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: "कौन सा स्टॉक सबसे ज़रूरी है?",
        language: "hi",
      }),
    }),
  );

  const data = await response.json() as {
    language?: string;
    title?: string;
    body?: string;
  };

  assert.equal(data.language, "hi");
  assert.match(data.title ?? "", /[\u0900-\u097F]/);
  assert.match(data.body ?? "", /[\u0900-\u097F]/);
});

test("Marathi questions are detected as Marathi instead of defaulting to English", async () => {
  const response = await POST(
    new Request("http://localhost/api/smartpilot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: "कोणता स्टॉक महत्त्वाचा आहे?",
      }),
    }),
  );

  const data = await response.json() as { language?: string; title?: string; body?: string };

  assert.equal(data.language, "mr");
  assert.match(data.title ?? "", /[\u0900-\u097F]/);
  assert.match(data.body ?? "", /[\u0900-\u097F]/);
});
