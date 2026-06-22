import { describe, expect, it } from "vitest";
import { escapeHtml } from "@/lib/utils";

describe("escapeHtml", () => {
  it("escapes HTML special characters", () => {
    expect(escapeHtml(`Flat <script> & "test"`)).toBe(
      "Flat &lt;script&gt; &amp; &quot;test&quot;",
    );
  });
});