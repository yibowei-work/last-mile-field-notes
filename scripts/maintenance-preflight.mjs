import { execFileSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Diagnose the current run; never change Codex permissions or GitHub credentials.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repository = "yibowei-work/last-mile-field-notes";
const failures = [];

async function check(label, action) {
  try {
    await action();
    console.log(`PASS ${label}`);
  } catch (error) {
    const detail = String(error.stderr || error.message || error).trim();
    failures.push(label);
    console.error(`FAIL ${label}: ${detail}`);
  }
}

for (const [label, directory] of [["project write permission", root], ["project .git write permission", join(root, ".git")]]) {
  await check(label, async () => {
    const probe = await mkdtemp(join(directory, "codex-permission-check-"));
    await rm(probe, { recursive: true });
  });
}

await check("Git remote", () => {
  const remote = execFileSync("git", ["remote", "get-url", "origin"], { cwd: root, encoding: "utf8" }).trim();
  if (!/^https:\/\/github\.com\/yibowei-work\/last-mile-field-notes(?:\.git)?\/?$|^git@github\.com:yibowei-work\/last-mile-field-notes(?:\.git)?$/.test(remote)) {
    throw new Error("origin does not match the intelligence website; inspect it before publishing.");
  }
});

await check("GitHub connection and repository access", () => {
  try {
    const canPush = execFileSync("gh", ["api", `repos/${repository}`, "--jq", ".permissions.push"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 30000 }).trim();
    if (canPush !== "true") throw new Error("The current GitHub account cannot push to this repository.");
  } catch (error) {
    const detail = String(error.stderr || error.message || error);
    if (/resolve|ENOTFOUND|EAI_AGAIN|connect to|network|TLS|timed out/i.test(detail)) {
      throw new Error("GitHub network access failed. Check this run's network permission and connection; this does not establish that GitHub login expired.");
    }
    throw error;
  }
});

if (failures.length) {
  console.error("Maintenance stopped before collecting or editing data. Allow this project (including .git) and networking, then retry. Do not grant global Codex configuration access or change credentials merely because a network check failed.");
  process.exitCode = 1;
} else {
  console.log("Preflight passed for this run only. This does not verify the permissions of future scheduled runs. Run npm test and npm run lint before publishing.");
}
