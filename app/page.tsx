"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

// Keep the dashboard eligible for GitHub Pages static export.
export const dynamic = "force-static";

type Intelligence = {
  id: string;
  date: string;
  region: "中国" | "东南亚" | "拉美" | "中东";
  market: string;
  company: string;
  track: string;
  service: string;
  title: string;
  summary: string;
  implication: string;
  focus: boolean;
  status: "已核验" | "待复核";
  source: string;
  sourceLabel: string;
};

const seedItems: Intelligence[] = [
  { id: "cn-0801-light", date: "2026-08-01", region: "中国", market: "苏州", company: "美团 / 苏州交管", track: "运力侧", service: "即时配送 · 本地生活", title: "骑手“等灯停表”上线，覆盖 1,100 个路口", summary: "苏州公安交管支队与美团上线“等灯停表”服务，红灯等待时长通过警企数据互通自动顺延配送时效。", implication: "把合规骑行直接写进履约算法，可能成为其他城市复制的骑手安全标配。", focus: true, status: "已核验", source: "https://www.sipac.gov.cn/szgyyq/mtjj/202608/610189585dd940898eb31b456e71351c.shtml", sourceLabel: "苏州工业园区管委会" },
  { id: "cn-0801-beijing", date: "2026-08-01", region: "中国", market: "北京", company: "北京市商务局等 4 部门", track: "行业 / 监管", service: "尾程配送 · 最后一公里", title: "快递、外卖非机动车管理办法正式实施", summary: "平台需考虑交通安全设定配送时间与路线，不得推荐逆行、禁行路线，并建立车辆、人员联合监管机制。", implication: "北京的车辆合规、培训、路线与平台算法责任被放到同一监管框架，城市运营要重新检查 SOP。", focus: true, status: "已核验", source: "https://www.beijing.gov.cn/zhengce/zhengcefagui/202607/t20260729_4797100.html", sourceLabel: "首都之窗" },
  { id: "me-0805-aramex", date: "2026-08-05", region: "中东", market: "阿联酋 / 沙特 / 埃及", company: "Aramex", track: "行业变化", service: "国际物流 · 尾程配送", title: "Q2 / H1 货运代理收入创历史新高", summary: "Aramex 公布 2026 年第二季度与上半年业绩，货运代理收入达到历史最高水平，覆盖其核心市场。", implication: "跨境与干线货代增长仍在给末端网络输送增量，值得关注其数字化与网络协同对时效的反哺。", focus: true, status: "已核验", source: "https://www.aramex.com/ae/en/media-details/news", sourceLabel: "Aramex Newsroom" },
  { id: "latam-0805-meli", date: "2026-08-05", region: "拉美", market: "巴西 / 墨西哥", company: "Mercado Libre", track: "用户侧", service: "国际物流 · 最后一公里", title: "Q2 活跃买家增长 26%，物流体验继续成为增长杠杆", summary: "Mercado Libre 公布 Q2 业绩：活跃买家同比增长 26%，巴西降低免运门槛一年后，用户购买频次与留存继续改善。", implication: "免运与履约体验正在同时影响转化、频次和平台粘性，物流产品要和会员、支付一起看。", focus: true, status: "已核验", source: "https://www.nasdaq.com/press-release/mercado-libre-q2-2026-revenue-surpasses-10-billion-deepening-engagement-strengthens", sourceLabel: "Mercado Libre / Nasdaq" },
  { id: "me-0807-saudi", date: "2026-08-07", region: "中东", market: "沙特", company: "沙特公共交通总局", track: "行业 / 监管", service: "同城跑腿 · 尾程配送", title: "商业摩托车货运执行细则发布", summary: "《商业摩托车货运活动执行条例》明确，商业摩托车运货活动限定由企业经营，需取得许可，并纳入环境与安全要求。", implication: "众包骑手、个体承运与平台挂靠模式的许可边界更清晰，沙特市场需要提前做运力资质盘点。", focus: true, status: "已核验", source: "https://www.uqn.gov.sa/decisions-and-regulations/4001550", sourceLabel: "沙特官方公报 Umm Al-Qura" },
  { id: "cn-0812-weather", date: "2026-08-12", region: "中国", market: "苏州", company: "美团 / 淘宝闪购 / 京东外卖", track: "运力侧", service: "即时配送 · 闪购", title: "台风期间“超时免罚”，平台同步减负", summary: "苏州推动主要外卖平台在台风三级应急响应及以上期间，对恶劣天气造成的超时实行免责、免扣分并启动保险理赔通道。", implication: "极端天气从“临时客服处理”进入平台考核规则，运力激励、保险与应急编排需要一体化设计。", focus: false, status: "已核验", source: "https://scjgj.suzhou.gov.cn/szqts/tzgg/202608/49f5670b4a5c43419d937b7efb792c73.shtml", sourceLabel: "苏州市市场监督管理局" },
  { id: "cn-0813-algorithm", date: "2026-08-13", region: "中国", market: "北京", company: "美团 / 淘宝闪购 / 京东外卖", track: "运力侧", service: "即时配送 · 本地生活", title: "三家平台在京共议算法：从速度竞争转向质量竞争", summary: "平台与骑手代表围绕算法评估、管理引导和协商共治达成共识，推进红灯停表、转单补时、恶劣天气补时等措施。", implication: "平台考核从单一时效向安全、天气、路况和转单场景加权，骑手端产品与商家出餐协同都会受影响。", focus: true, status: "已核验", source: "https://scjgj.beijing.gov.cn/zwxx/scjgdt/202608/t20260813_4821209.html", sourceLabel: "北京市市场监督管理局" },
  { id: "cn-0813-jd", date: "2026-08-13", region: "中国", market: "全国", company: "京东 / 京东物流", track: "运力侧 / 行业变化", service: "即时零售 · 最后一公里", title: "京东物流称数千台无人车已进入常态化运营", summary: "京东 2026 年 Q2 业绩材料披露，京东物流已在全国 20 多个省份将数千台无人车投入常态化运营；Costco 京东旗舰店支持最快当日达。", implication: "无人运力正从试点叙事转向网络运营指标，需关注它在园区、校园、商圈等边界场景的成本模型。", focus: false, status: "已核验", source: "https://ir.jd.com/static-files/2f8b0fa8-16a5-4d19-a07c-ee6d656223e8", sourceLabel: "JD.com Investor Relations" },
  { id: "me-0817-careem", date: "2026-08-17", region: "中东", market: "阿联酋", company: "Careem Food", track: "商家侧", service: "本地生活 · 即时配送", title: "Careem Food 在阿联酋上线餐饮团餐服务", summary: "Careem Food 新增 catering 服务，面向更大规模的餐饮需求拓展履约场景，延展超级 App 的本地生活供给。", implication: "从单餐到多人餐饮意味着商家备餐、预订、集中配送与运力调度需要新的产品链路。", focus: false, status: "已核验", source: "https://blog.careem.com/categories/newsroom", sourceLabel: "Careem Newsroom" },
  { id: "sea-0818-indonesia", date: "2026-08-18", region: "东南亚", market: "印度尼西亚", company: "印尼通信与数字部 / Grab Indonesia", track: "行业 / 监管", service: "同城跑腿 · 即时配送", title: "网约配送货物与食品规则进入定稿", summary: "印尼政府表示将区分人运与货运规则，货物和食品配送费率由通信与数字部负责，后续规章将继续听取平台与司机意见。", implication: "货运与客运费率、责任和安全标准被拆开，平台需要准备面向骑手与商家的新计价解释。", focus: true, status: "已核验", source: "https://portal.komdigi.go.id/kanal-publik/berita-kini/10487", sourceLabel: "印尼通信与数字部" },
  { id: "latam-0819-meli-api", date: "2026-08-19", region: "拉美", market: "阿根廷 / 拉美市场", company: "Mercado Libre", track: "用户侧 / 商家侧", service: "国际物流 · 尾程配送", title: "订单状态 API 迁移至 V2，V1 将于 10 月 31 日下线", summary: "Mercado Libre 开发者文档更新：订单状态通知改用 V2 endpoint，商家与服务商需在 10 月 31 日前完成迁移。", implication: "买家看到的物流轨迹、妥投成功与失败状态都受影响，跨境商家应把接口迁移列入 9 月排期。", focus: true, status: "已核验", source: "https://developers.mercadolibre.com.ar/estados-de-ordenes-me1", sourceLabel: "Mercado Libre Developers" },
  { id: "sea-0820-malaysia", date: "2026-08-20", region: "东南亚", market: "马来西亚", company: "MCMC / 马来西亚通讯部", track: "行业 / 监管", service: "国际物流 · 尾程配送", title: "计划修订《邮政服务法》以收紧快递行业安全监管", summary: "马来西亚通讯部与 MCMC 正审查《邮政服务法》，拟把快递行业纳入更明确的法条并强化违禁品与安全监控，预计 2027 年提交。", implication: "平台、快递和 p-hailing 的寄递安全、禁运品识别与数据留痕会成为合规重点。", focus: true, status: "已核验", source: "https://mcmc.bernama.com/news.php?id=2596892", sourceLabel: "MCMC / Bernama" },
  { id: "latam-0810-anvisa", date: "2026-08-10", region: "拉美", market: "巴西", company: "Anvisa / iFood / Rappi / Mercado Livre", track: "商家侧 / 行业监管", service: "即时零售 · 本地生活", title: "药品平台销售禁令部分撤销，但合规义务未解除", summary: "巴西 Anvisa 撤销针对 iFood、Rappi、Mercado Livre 等平台的部分预防性措施，同时明确平台仍须遵守现行卫生法规，后续规则待发布。", implication: "药品即时零售的“能不能卖”与“怎么卖”仍未完全确定，平台与商家资质、广告和履约链路需留档。", focus: false, status: "已核验", source: "https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2026/sobre-revogacoes-de-resolucoes-e-medidas-preventivas-para-plataformas-digitais", sourceLabel: "巴西国家卫生监督局 Anvisa" },
  { id: "cn-0820-safety", date: "2026-08-25", region: "中国", market: "赣州", company: "外卖 / 快递平台与站点", track: "运力侧", service: "即时配送 · 尾程配送", title: "多部门压实平台交通安全主体责任", summary: "赣州召开外卖快递平台交通安全管理会议，重点排查电动车非法改装、非标电池、平台考核机制、骑手安全意识与企业隐患整改。", implication: "车辆与电池管理、站点培训、平台考核将从运营问题上升为多部门联合督办的安全责任。", focus: false, status: "已核验", source: "https://sjj.ganzhou.gov.cn/c101082/202608/eee3f6f5d6dd431eb446c9787bf50d28.shtml", sourceLabel: "赣州市市场监督管理局" },
  { id: "cn-0828-wuhan", date: "2026-08-28", region: "中国", market: "武汉", company: "武汉公安 / 商圈 / 外卖平台", track: "商家侧 / 运力侧", service: "本地生活 · 即时配送", title: "商圈采用“场内转运、场外定点取件”接力模式", summary: "武汉推动商圈设置骑手爱心接力站，由专人把商户出餐集中转运至固定取餐点，骑手无需进场即可完成取餐，并同步划定停车区。", implication: "把骑手从商场内部动线中解耦，能缩短取餐时间、降低冲突，也给商圈型即时配送带来可复制的运营模块。", focus: false, status: "已核验", source: "https://gaj.wuhan.gov.cn/hjfc/jdxw/202608/t20260828_2840286.html", sourceLabel: "武汉市公安局" },
  { id: "cn-0820-alibaba", date: "2026-08-20", region: "中国", market: "全国", company: "阿里巴巴 / 淘宝闪购", track: "行业变化", service: "即时零售 · 闪购 · 闪电仓", title: "阿里披露快商业收入同比增长 45%，规模与单位经济性同步改善", summary: "阿里巴巴 2026 年 8 月业绩材料显示，快商业收入同比增长 45%，规模扩大、单位经济性改善并加速减亏。", implication: "闪购进入效率与供给密度并重阶段，前置仓、商家网络与即时履约的经营指标需要放在同一张表里。", focus: true, status: "已核验", source: "https://www.alibabagroup.com/en-US/document-2027233133950140416", sourceLabel: "Alibaba Group" },
];

const regionOptions = ["全部地区", "中国", "东南亚", "拉美", "中东"] as const;
const trackOptions = ["全部端", "用户侧", "商家侧", "运力侧", "行业 / 监管"] as const;
const serviceOptions = ["全部服务", "即时零售", "国际物流", "尾程配送", "即时配送", "本地生活", "同城跑腿", "闪购", "闪电仓", "最后一公里"] as const;

function displayDate(date: string) { return date.slice(5).replace("-", "."); }

export default function Home() {
  const [items, setItems] = useState(seedItems);
  const [view, setView] = useState<"brief" | "table">("brief");
  const [activeRegion, setActiveRegion] = useState<(typeof regionOptions)[number]>("全部地区");
  const [activeTrack, setActiveTrack] = useState<(typeof trackOptions)[number]>("全部端");
  const [activeService, setActiveService] = useState<(typeof serviceOptions)[number]>("全部服务");
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showAllBrief, setShowAllBrief] = useState(false);
  const [lastRefresh, setLastRefresh] = useState("2026.09.04 08:30");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("lm-field-notes-items");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Intelligence[];
        const timer = window.setTimeout(() => setItems(parsed), 0);
        return () => window.clearTimeout(timer);
      } catch { /* keep seed data */ }
    }
  }, []);

  const filteredItems = useMemo(() => items.filter((item) => {
    const haystack = `${item.title} ${item.company} ${item.summary} ${item.implication} ${item.market}`.toLowerCase();
    const matchesQuery = !query.trim() || haystack.includes(query.trim().toLowerCase());
    const matchesRegion = activeRegion === "全部地区" || item.region === activeRegion;
    const matchesTrack = activeTrack === "全部端" || item.track.includes(activeTrack.replace("行业 / 监管", "行业"));
    const matchesService = activeService === "全部服务" || item.service.includes(activeService);
    return matchesQuery && matchesRegion && matchesTrack && matchesService;
  }), [activeRegion, activeService, activeTrack, items, query]);

  const focusItems = items.filter((item) => item.focus);
  const visibleFocus = showAllBrief ? focusItems : focusItems.slice(0, 5);
  const regionCount = new Set(items.map((item) => item.region)).size;
  const regulationCount = items.filter((item) => item.track.includes("监管") || item.track.includes("行业")).length;

  function refreshRecords() {
    const now = new Date();
    const stamp = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setLastRefresh(stamp);
    setNotice("已完成本地记录检查；新消息可通过“新增情报”补录。");
    window.setTimeout(() => setNotice(""), 3800);
  }

  function exportCsv() {
    const headers = ["发生时间", "地区", "市场", "公司", "涉及端", "服务", "标题", "改动内容", "产品影响", "状态", "资料链接"];
    const rows = filteredItems.map((item) => [item.date, item.region, item.market, item.company, item.track, item.service, item.title, item.summary, item.implication, item.status, item.source]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "last-mile-field-notes-2026-08.csv"; link.click(); URL.revokeObjectURL(url);
    setNotice(`已导出 ${filteredItems.length} 条明细。`);
    window.setTimeout(() => setNotice(""), 3000);
  }

  function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const newItem: Intelligence = {
      id: `manual-${Date.now()}`,
      date: String(form.get("date") || "2026-09-04"),
      region: String(form.get("region") || "中国") as Intelligence["region"],
      market: String(form.get("market") || "待补充"),
      company: String(form.get("company") || "待补充"),
      track: String(form.get("track") || "行业 / 监管"),
      service: String(form.get("service") || "即时配送"),
      title: String(form.get("title") || "未命名情报"),
      summary: String(form.get("summary") || "待补充"),
      implication: "待补充产品影响判断。",
      focus: false,
      status: "待复核",
      source: String(form.get("source") || "#"),
      sourceLabel: "手工补录",
    };
    const next = [newItem, ...items];
    setItems(next);
    window.localStorage.setItem("lm-field-notes-items", JSON.stringify(next));
    setShowAdd(false);
    setNotice("已新增 1 条情报，状态为“待复核”。");
    window.setTimeout(() => setNotice(""), 3000);
  }

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand-lockup" href="#top" aria-label="返回顶部">
          <div className="brand-mark shopee-mark" role="img" aria-label="Shopee 风格图标"><span className="shopee-mark-handle" /><span className="shopee-mark-face">S</span></div>
          <div><div className="eyebrow">INSTANT SERVICE / FIELD NOTES</div><div className="brand-name">即时履约情报台</div></div>
        </a>
        <div className="topbar-right"><span className="live-label"><span /> LIVE MONITOR</span><span>首期整理 · 2026 年 8 月</span></div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <h1>把每一天的末端变化，<em>变成可用判断。</em></h1>
          <p className="hero-text">聚合中国、东南亚、拉美与中东的即时零售、同城配送、国际物流和运力监管动态。</p>
          <div className="hero-actions"><button className="button button-dark" onClick={() => { setView("brief"); document.querySelector("#brief")?.scrollIntoView(); }}>查看老板简报 <span>↓</span></button><button className="text-link" onClick={() => { setView("table"); document.querySelector("#feed")?.scrollIntoView(); }}>浏览明细表 <span>→</span></button></div>
        </div>
        <aside className="hero-note"><div className="hero-motif" aria-hidden="true"><span className="motif-square motif-orange" /><span className="motif-square motif-blue" /><span className="motif-orb" /><span className="motif-ring" /><span className="motif-sticker">08:30</span><span className="motif-dots">•••••</span></div><div className="hero-note-copy"><div className="status-dot"><span /></div><div><div className="eyebrow">DAILY PULSE</div><strong>每日刷新入口已就绪</strong><p>上次检查 {lastRefresh} · 每天 08:30（深圳时间）检查前一天内容。</p><button className="mini-button" onClick={refreshRecords}>刷新记录 ↻</button></div></div></aside>
      </section>

      <section className="metric-row" aria-label="月度概览">
        <div className="metric-card metric-accent"><span className="metric-label">已收录情报</span><strong>{items.length}</strong><span className="metric-foot">2026.08.01 — 08.31</span></div>
        <div className="metric-card"><span className="metric-label">重点关注</span><strong>{focusItems.length}</strong><span className="metric-foot">可直接进入 PPT</span></div>
        <div className="metric-card"><span className="metric-label">监管 / 制度</span><strong>{regulationCount}</strong><span className="metric-foot">需要持续跟踪</span></div>
        <div className="metric-card"><span className="metric-label">覆盖市场</span><strong>{regionCount}</strong><span className="metric-foot">中国 · SEA · LatAm · ME</span></div>
      </section>

      <section className="section-head" id="brief"><div><span className="section-index">01</span><h2>老板简报</h2></div><span className="section-caption">本月最值得放大的一组变化</span></section>
      <section className="brief-grid">
        {visibleFocus.map((item, index) => <article className={`brief-card brief-${(index % 3) + 1}`} key={item.id}><div className="card-topline"><span className="pill">重点关注</span><span>{displayDate(item.date)}</span></div><div className="card-region">{item.region} <span>·</span> {item.company}</div><h3>{item.title}</h3><p>{item.summary}</p><div className="brief-bottom"><span className="signal-sticker">PPT PICK</span><span className="source-count">{item.track}</span></div><a className="source-link" href={item.source} target="_blank" rel="noreferrer">查看原文 <span>↗</span></a></article>)}
      </section>
      <div className="section-action"><button className="outline-button" onClick={() => setShowAllBrief((current) => !current)}>{showAllBrief ? "收起重点" : `查看全部重点（${focusItems.length}）`} <span>{showAllBrief ? "↑" : "↓"}</span></button></div>

      <section className="section-head feed-heading" id="feed"><div><span className="section-index">02</span><h2>情报流</h2></div><div className="view-switch"><button className={view === "brief" ? "active" : ""} onClick={() => setView("brief")}>看板</button><button className={view === "table" ? "active" : ""} onClick={() => setView("table")}>表格</button></div></section>
      <section className="control-panel" aria-label="情报筛选与操作"><div className="search-wrap"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索公司、市场、关键词" aria-label="搜索公司、市场、关键词" /></div><div className="select-row"><label>地区<select value={activeRegion} onChange={(event) => setActiveRegion(event.target.value as (typeof regionOptions)[number])}>{regionOptions.map((region) => <option key={region}>{region}</option>)}</select></label><label>涉及端<select value={activeTrack} onChange={(event) => setActiveTrack(event.target.value as (typeof trackOptions)[number])}>{trackOptions.map((track) => <option key={track}>{track}</option>)}</select></label><label>服务<select value={activeService} onChange={(event) => setActiveService(event.target.value as (typeof serviceOptions)[number])}>{serviceOptions.map((service) => <option key={service}>{service}</option>)}</select></label></div><div className="control-actions"><button className="outline-button" onClick={() => setShowAdd(true)}>＋ 新增情报</button><button className="export-button" onClick={exportCsv}>导出 CSV <span>↓</span></button></div></section>

      {view === "brief" ? <section className="feed-list"><div className="feed-list-head"><span>{filteredItems.length} 条记录</span><span>按发生时间倒序 · 点击“资料”阅读原文</span></div>{filteredItems.map((item) => <article className="feed-item" key={item.id}><div className="feed-date"><strong>{displayDate(item.date)}</strong><span>{item.date.slice(0, 4)}</span></div><div className="feed-main"><div className="feed-meta"><span className={`status status-${item.status === "已核验" ? "verified" : "review"}`}>{item.status}</span><span>{item.region} · {item.market}</span><span>{item.track}</span><span>{item.service}</span></div><h3>{item.title}</h3><p>{item.summary}</p><div className="feed-implication"><span>→ 产品影响</span>{item.implication}</div></div><div className="feed-side"><span>{item.company}</span><a href={item.source} target="_blank" rel="noreferrer">资料 ↗</a></div></article>)}</section> : <section className="table-wrap"><table><thead><tr><th>时间</th><th>地区 / 市场</th><th>公司</th><th>涉及端</th><th>服务</th><th>改动内容</th><th>状态</th><th>资料</th></tr></thead><tbody>{filteredItems.map((item) => <tr key={item.id}><td className="table-date">{item.date}</td><td><strong>{item.region}</strong><small>{item.market}</small></td><td>{item.company}</td><td><span className="table-tag">{item.track}</span></td><td>{item.service}</td><td><strong>{item.title}</strong><small>{item.summary}</small></td><td><span className={`status status-${item.status === "已核验" ? "verified" : "review"}`}>{item.status}</span></td><td><a href={item.source} target="_blank" rel="noreferrer">打开 ↗</a></td></tr>)}</tbody></table></section>}

      <footer className="footer"><div><span className="eyebrow">RESEARCH LOG / AUG 2026</span><p>来源以政府、公司公告、开发者文档与权威媒体为主。手工新增记录默认标为“待复核”。</p></div><div className="footer-right"><span>覆盖 {regionCount} 个区域</span><span>每日刷新 · UTC+8</span></div></footer>

      {notice && <div className="toast" role="status">{notice}</div>}
      {showAdd && <div className="modal-backdrop"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="add-title"><div className="modal-head"><div><span className="eyebrow">QUICK CAPTURE</span><h2 id="add-title">新增一条情报</h2></div><button className="close-button" onClick={() => setShowAdd(false)} aria-label="关闭">×</button></div><form onSubmit={addItem}><div className="form-grid"><label>发生时间<input name="date" type="date" defaultValue="2026-09-04" required /></label><label>公司 / 机构<input name="company" placeholder="例如：Grab / 交通部" required /></label><label>地区<select name="region" defaultValue="中国">{regionOptions.slice(1).map((region) => <option key={region}>{region}</option>)}</select></label><label>国家 / 城市<input name="market" placeholder="例如：印尼 / 雅加达" required /></label><label>涉及端<select name="track" defaultValue="行业 / 监管">{trackOptions.slice(1).map((track) => <option key={track}>{track}</option>)}</select></label><label>服务<input name="service" placeholder="即时配送 / COD" required /></label></div><label>标题<input name="title" placeholder="这条变化发生了什么？" required /></label><label>改动内容<textarea name="summary" rows={3} placeholder="用 1-2 句话记录改动内容" required /></label><label>资料链接<input name="source" type="url" placeholder="https://" required /></label><div className="modal-actions"><button type="button" className="outline-button" onClick={() => setShowAdd(false)}>取消</button><button type="submit" className="button button-dark">保存记录 <span>→</span></button></div></form></section></div>}
    </main>
  );
}
