import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the intelligence dashboard in English by default", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="en">/i);
  assert.match(html, /Instant Fulfillment Intelligence/);
  assert.match(html, /Capture fulfillment signals, drive precise decisions/);
  assert.match(html, /Instant Delivery Brief/);
  assert.match(html, /Intelligence Flow/);
  assert.match(html, />EN<\/button>/);
  assert.match(html, />中文<\/button>/);
  assert.match(html, />ID<\/button>/);
  assert.match(html, />VI<\/button>/);
  assert.match(html, />PT<\/button>/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("server-renders localized intelligence metadata without Chinese fallback in English", async () => {
  const response = await render();
  const html = await response.text();
  const brief = html.match(/<section class="brief-grid">([\s\S]*?)<\/section>/)?.[1] ?? "";
  const feed = html.match(/<section class="feed-list">([\s\S]*?)<\/section>/)?.[1] ?? "";

  assert.match(html, /Grab Philippines and NCMF add verified halal discovery/);
  assert.match(html, /China Ministry of Human Resources and Social Security/);
  assert.match(html, /GrabFood Indonesia \/ OVO/);
  assert.match(html, /MeituanDrone \/ McDonald/);
  assert.match(html, /Meituan Newsroom/);
  assert.doesNotMatch(`${brief}${feed}`, /Meituan无人机|麦当劳|京东物流|美团新闻中心/);
});

test("publishes the November backfill newest first and keeps excluded regions out of the brief", async () => {
  const response = await render();
  const html = await response.text();
  const feed = html.match(/<section class="feed-list">([\s\S]*?)<\/section>/)?.[1] ?? "";
  const brief = html.match(/<section class="brief-grid">([\s\S]*?)<\/section>/)?.[1] ?? "";
  const latestSource = "https://mercadoeconsumo.com.br/08/11/2026/foodservice/99food-lanca-bag-inspirada-em-origami-para-proteger-pedidos-durante-o-delivery/";
  const earlierSource = "https://www.broadcast.com.br/news/ifood-processa-keeta-em-sp-por-preco-predatorio-concorrente-contesta/";
  assert.ok(feed.indexOf(latestSource) >= 0, "November 8 record must be present in the published feed");
  assert.ok(feed.indexOf(earlierSource) > feed.indexOf(latestSource), "November 6 must follow November 8");
  assert.match(feed, /Bag Rara/);
  assert.doesNotMatch(brief, /Expeditors|DPD|NZ Post/);
  assert.match(html, /11:00 Shenzhen time/);
});
