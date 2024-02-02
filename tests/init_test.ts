import { assertEquals } from "https://deno.land/std@0.207.0/assert/mod.ts";

Deno.test("Initial test", async () => {
  const req = await fetch("http://localhost:3000");
  const res = await req.json();

  assertEquals(res.success, true);
});

Deno.test("Invalid token", async () => {
  const req = await fetch("http://localhost:3000", {
    method: "post",
    headers: {
      id: "111",
      "Authorization": "872378123",
    },
  });

  const res = await req.json();

  assertEquals(res.success, false);
});
