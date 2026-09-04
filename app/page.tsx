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

type SourceLink = { label: string; scope: string; url: string };
type SourceGroup = { eyebrow: string; title: string; description: string; links: SourceLink[] };

const sourceGroups: SourceGroup[] = [
  {
    eyebrow: "PRIMARY SOURCES",
    title: "平台、公司与监管",
    description: "优先确认新功能、规则、接口、运力与官方经营口径。",
    links: [
      { label: "美团新闻中心", scope: "中国", url: "https://www.meituan.com/news" },
      { label: "美团技术团队", scope: "中国", url: "https://tech.meituan.com/" },
      { label: "淘宝开放平台", scope: "中国", url: "https://developer.alibaba.com/en/index.htm" },
      { label: "顺丰同城开放平台", scope: "中国", url: "https://openic.sf-express.com/" },
      { label: "京东秒送开放平台", scope: "中国", url: "https://opendj.jd.com/" },
      { label: "Grab Press Centre", scope: "东南亚", url: "https://www.grab.com/sg/press/" },
      { label: "Mercado Libre IR", scope: "拉美", url: "https://investor.mercadolibre.com/" },
      { label: "Aramex Newsroom", scope: "中东", url: "https://www.aramex.com/ae/en/media-details/news" },
      { label: "Careem Newsroom", scope: "中东", url: "https://blog.careem.com/categories/newsroom" },
    ],
  },
  {
    eyebrow: "INDUSTRY SIGNALS",
    title: "行业媒体与研究",
    description: "用深度报道、消费趋势、平台竞争与产业研究补足官方口径之外的线索。",
    links: [
      { label: "晚点 LatePost", scope: "商业深度", url: "https://www.latepost.com/" },
      { label: "虎嗅", scope: "商业科技", url: "https://www.huxiu.com/" },
      { label: "36氪 / 未来消费", scope: "消费科技", url: "https://36kr.com/" },
      { label: "雷峰网", scope: "科技产业", url: "https://www.leiphone.com/" },
      { label: "DT商业观察", scope: "消费研究", url: "https://dt.yicai.com/" },
      { label: "亿邦动力", scope: "电商物流", url: "https://www.ebrun.com/" },
      { label: "联商网", scope: "零售商业", url: "https://www.linkshop.com.cn/" },
      { label: "钛媒体 / 亿欧", scope: "产业观察", url: "https://www.tmtpost.com/" },
      { label: "界面新闻 / 第一财经", scope: "财经新闻", url: "https://www.yicai.com/" },
    ],
  },
  {
    eyebrow: "NEWS / RESEARCH",
    title: "新闻、研报与定向检索",
    description: "追踪政策、诉讼、资本市场与行业舆情，并将券商观点作为趋势线索而非事实替代。",
    links: [
      { label: "中国政府网", scope: "政策法规", url: "https://www.gov.cn/" },
      { label: "市场监管总局", scope: "行业监管", url: "https://www.samr.gov.cn/" },
      { label: "21世纪经济报道", scope: "财经新闻", url: "https://www.21jingji.com/" },
      { label: "新京报 / 澎湃", scope: "社会新闻", url: "https://www.thepaper.cn/" },
      { label: "财联社", scope: "快讯舆情", url: "https://www.cls.cn/" },
      { label: "新浪财经", scope: "市场检索", url: "https://finance.sina.com.cn/" },
      { label: "百度资讯", scope: "全网检索", url: "https://news.baidu.com/" },
      { label: "起点财经", scope: "研报检索", url: "https://www.baidu.com/s?wd=%E8%B5%B7%E7%82%B9%E8%B4%A2%E7%BB%8F" },
      { label: "创新零售社", scope: "零售检索", url: "https://www.baidu.com/s?wd=%E5%88%9B%E6%96%B0%E9%9B%B6%E5%94%AE%E7%A4%BE" },
      { label: "海豚投研", scope: "投研检索", url: "https://www.baidu.com/s?wd=%E6%B5%B7%E8%B1%9A%E6%8A%95%E7%A0%94" },
    ],
  },
  {
    eyebrow: "GLOBAL LENS",
    title: "海外履约与供应链",
    description: "按“公司 newsroom / IR / 开发者文档 → 当地监管 → 区域行业媒体”交叉验证。",
    links: [
      { label: "ASEAN Main Portal", scope: "东南亚", url: "https://asean.org/" },
      { label: "The Loadstar", scope: "全球物流", url: "https://theloadstar.com/" },
      { label: "FreightWaves", scope: "北美物流", url: "https://www.freightwaves.com/" },
      { label: "Retail Dive", scope: "零售履约", url: "https://www.retaildive.com/" },
      { label: "Modern Retail", scope: "零售科技", url: "https://www.modernretail.co/" },
      { label: "Logistics Middle East", scope: "中东物流", url: "https://www.logisticsmiddleeast.com/" },
      { label: "Brazil Anvisa", scope: "拉美监管", url: "https://www.gov.br/anvisa/" },
      { label: "Saudi Official Gazette", scope: "中东监管", url: "https://www.uqn.gov.sa/" },
    ],
  },
];

const julyItems: Intelligence[] = [
  { id: "cn-0717-meituan-light", date: "2026-07-17", region: "中国", market: "苏州", company: "美团 / 苏州交管", track: "运力侧 / 用户侧", service: "即时配送 · 本地生活", title: "美团披露“等灯停表”进入苏州交互测试", summary: "7月16日美团披露，已与苏州交管完成数据对接与测试准备：骑手等红灯时暂停配送计时，并把等灯时长顺延到订单截止时间。", implication: "红绿灯状态进入履约计时与用户沟通，安全治理开始从倡议变成可感知的产品机制。", focus: true, status: "已核验", source: "https://www.meituan.com/news/NN260717198006386", sourceLabel: "美团新闻中心 / 央广网" },
  { id: "cn-0715-meituan-tsinghua", date: "2026-07-15", region: "中国", market: "全国 / 深圳", company: "美团 / 清华大学", track: "运力侧 / 行业变化", service: "即时配送 · 最后一公里", title: "清华—美团数智生活联合研究中心启动，智能调度与无人配送继续落地", summary: "双方启动新一期合作；智能调度技术已结合距离、天气与商圈等因素优化外卖路线，无人机和无人车技术也在真实城市场景持续运营。", implication: "调度、无人机、无人车与人才培训被放到同一条技术链上，运力产品将更依赖算法与安全能力协同。", focus: false, status: "已核验", source: "https://www.meituan.com/news/NN260717250004882", sourceLabel: "美团新闻中心" },
  { id: "cn-0727-catpaw", date: "2026-07-27", region: "中国", market: "全国", company: "美团", track: "商家侧", service: "本地生活 · 即时配送", title: "美团 CatPaw 上线，商家可用 AI 处理经营与异常", summary: "美团上线全场景 AI Agent 平台 CatPaw，提供 AI 工作台及企业级 Agent 开发、托管能力，帮助商家汇总销售、评价与营销数据并标记异常。", implication: "商家侧 AI 从营销文案转向经营数据、异常识别和日报，平台服务商的运营作业方式可能随之变化。", focus: true, status: "已核验", source: "https://www.meituan.com/news/NN260727239005651", sourceLabel: "美团新闻中心 / 经济观察网" },
  { id: "sea-0721-grab-partners", date: "2026-07-21", region: "东南亚", market: "东南亚 / 中国台湾", company: "Grab", track: "运力侧 / 行业变化", service: "即时配送 · 同城跑腿", title: "Grab 回应工会联合声明，重申改善配送伙伴工作环境", summary: "Grab 在7月公开回应多家工会联合声明，重申将与配送伙伴和工会持续沟通，推进更安全、更可持续的工作环境。", implication: "平台与运力关系从单纯激励管理转向持续协商，收入、申诉、安全与培训机制会成为区域化运营的共同议题。", focus: false, status: "已核验", source: "https://www.grab.com/inside-grab/inside-scoop/news/", sourceLabel: "Grab Inside Scoop" },
  { id: "sea-0723-singapore-safety", date: "2026-07-23", region: "东南亚", market: "新加坡", company: "新加坡人力部 / 平台工人", track: "运力侧 / 行业 / 监管", service: "即时配送 · 同城跑腿", title: "新加坡上半年工作相关交通死亡事故达7起，平台工人占4起", summary: "新加坡人力部在工作安全与健康大会披露，上半年已有7起工作相关交通死亡事故，其中4起涉及平台工人，并表示将进一步强化安全保障。", implication: "平台配送安全不再只是企业内部培训问题，路线、休息、激励与风险管理都可能进入更严格的外部治理。", focus: true, status: "已核验", source: "https://www.channelnewsasia.com/singapore/workplace-safety-traffic-accidents-platform-workers-6272506", sourceLabel: "CNA" },
  { id: "sea-0728-singapore-mast", date: "2026-07-28", region: "东南亚", market: "新加坡", company: "新加坡 MAST / 平台工人安全工作组", track: "运力侧 / 行业 / 监管", service: "即时配送 · 同城跑腿", title: "新加坡多部门要求加强平台工人道路安全治理", summary: "MAST 在7月27日会议上指出，今年工作相关交通死亡事故已超过上一整年，并发布加强道路安全措施的行业提示，强调平台、雇主、工人与道路使用者共同负责。", implication: "运力平台需要把安全提醒、车辆风险、事故复盘与平台工人工作组协同，形成可审计的安全运营闭环。", focus: true, status: "已核验", source: "https://www.mom.gov.sg/newsroom/press-releases/2026/0728-mast-calls-for-greater-vigilance", sourceLabel: "新加坡人力部 MOM" },
  { id: "sea-0729-indonesia-rules", date: "2026-07-29", region: "东南亚", market: "印度尼西亚", company: "印尼通信与数字部 / Grab Indonesia", track: "行业 / 监管", service: "同城跑腿 · 即时配送", title: "印尼将把数字货物 / 食品配送与载客网约车分开制定规则", summary: "印尼政府进入数字货物与食品配送规章定稿阶段，明确其业务特征不同于载客服务，并与 Grab Indonesia 等平台沟通规则落地。", implication: "货运与客运的运价、责任、安全与平台解释将被拆开，区域运营需要准备独立的规则和计价口径。", focus: true, status: "已核验", source: "https://portal.komdigi.go.id/kanal-publik/berita-kini/10429", sourceLabel: "印尼通信与数字部" },
  { id: "sea-0716-foodpanda", date: "2026-07-16", region: "东南亚", market: "新加坡", company: "foodpanda", track: "运力侧", service: "即时配送", title: "foodpanda Rider Hub 更新新加入骑手激励，覆盖 Amazon Flex 转入骑手", summary: "Rider Hub 公告显示，新加入骑手可自动获得基础激励与额外专属激励，相关补贴从入职日开始计算，但不一定直接显示在骑手 App 中。", implication: "平台通过定向奖励补充运力供给，激励透明度、到账可见性和新老骑手公平会影响转化与留存。", focus: false, status: "已核验", source: "https://www.pandariders.sg/joining-the-pandariders-from-amazon-flex/", sourceLabel: "foodpanda Rider Hub" },
  { id: "latam-0714-project44", date: "2026-07-14", region: "拉美", market: "全球 / 拉美可关注", company: "project44 / LSP44", track: "行业变化 / 运力侧", service: "国际物流 · 尾程配送", title: "project44 拆分 LSP44，推出面向物流服务商的 AI Agent 与 API 基础设施", summary: "project44 宣布拆分为面向货主的决策智能平台 project44 与面向 3PL、货代和经纪商的 LSP44，后者提供嵌入式 AI Agent 和 API 基础设施。", implication: "物流科技可能从可视化工具走向嵌入式调度与执行基础设施，值得关注其对跨境履约编排和数据接入的影响。", focus: true, status: "已核验", source: "https://www.globenewswire.com/news-release/2026/07/14/3326916/0/en/project44-Creates-Two-Businesses-and-Launches-LSP44-the-AI-Agent-and-API-Infrastructure-That-9-of-the-World-s-10-Largest-Logistics-Providers-Already-Run.html", sourceLabel: "project44 / GlobeNewswire" },
  { id: "latam-0727-move-brasil", date: "2026-07-27", region: "拉美", market: "巴西", company: "巴西 MDIC / Move Brasil", track: "运力侧 / 行业 / 监管", service: "同城跑腿 · 最后一公里", title: "Move Brasil 信贷项目启动，支持配送员购置摩托与电动自行车", summary: "面向配送员和摩托车手的 Move Brasil 低息融资项目将启动时间调整至7月27日，以完成银行系统与参与平台之间的技术和运营测试。", implication: "运力设备金融支持有机会降低车辆更新门槛，改善车况与接单能力，也会影响骑手留存和运力结构。", focus: true, status: "已核验", source: "https://exame.com/brasil/inicio-do-credito-do-move-brasil-a-entregadores-e-adiado-para-27-de-julho/", sourceLabel: "Exame / 巴西 MDIC" },
  { id: "latam-0728-99-compras", date: "2026-07-28", region: "拉美", market: "巴西 / 圣保罗", company: "99 / Rappi / iFood", track: "用户侧 / 商家侧 / 行业变化", service: "即时零售 · 闪购 · 即时配送", title: "99Compras 在圣保罗上线，投入 1 亿雷亚尔争夺杂货即时配送", summary: "99 在圣保罗推出 99Compras，计划投入 1 亿雷亚尔发展超市即时配送，进入由 Rappi、iFood 等平台共同竞争的日常消费场景。", implication: "出行平台向即时零售延展，将同时争夺用户频次、商家供给与配送运力，平台间的跨场景补贴值得跟踪。", focus: true, status: "已核验", source: "https://exame.com/negocios/99-investe-r-100-milhoes-para-disputar-entregas-de-supermercado-em-sao-paulo//", sourceLabel: "Exame" },
  { id: "latam-0731-argentina-cost", date: "2026-07-31", region: "拉美", market: "阿根廷", company: "CEDOL / AECAUM", track: "行业变化", service: "尾程配送 · 最后一公里", title: "阿根廷 7 月末端配送成本环比上涨 2.16%", summary: "7月统计数据显示，阿根廷末端配送成本环比上涨2.16%，前7个月累计上涨26.50%；相关数据于8月5日发布，主要受人工、能源与安保成本影响。", implication: "末端履约成本压力会反向影响配送费、免运门槛与商家履约策略，拉美市场需要把成本指数纳入月度跟踪。", focus: false, status: "已核验", source: "https://www.infobae.com/movant/2026/08/05/la-logistica-sin-transporte-subio-229-en-julio-impulsada-por-energia-y-seguridad/?outputType=amp-type", sourceLabel: "Infobae / CEDOL / AECAUM" },
  { id: "me-0708-maersk", date: "2026-07-08", region: "中东", market: "海湾地区", company: "Maersk", track: "行业变化", service: "国际物流 · 尾程配送", title: "中东局势扰动下马士基调整海运与陆路接驳安排", summary: "马士基发布7月8日运营更新，针对中东局势变化调整部分海运订舱与陆路运输安排，并继续提供海湾地区多式联运替代方案。", implication: "跨境干线变化会传导到清关、仓配衔接和客户时效承诺，区域履约需要预设替代路线与异常通知机制。", focus: true, status: "已核验", source: "https://www.maersk.com/news/articles/2026/07/08/middle-east-operational-update-38", sourceLabel: "Maersk Operational Update" },
  { id: "me-0712-anzama", date: "2026-07-12", region: "中东", market: "沙特 / 阿联酋 / 阿曼 / 巴林 / 科威特 / 卡塔尔", company: "ANZAMA Logistics", track: "行业变化", service: "国际物流 · 尾程配送", title: "GCC 陆运快线扩充，新增海湾跨境班次", summary: "ANZAMA 宣布扩充海湾地区陆运网络，在沙特、阿联酋、阿曼、巴林、科威特和卡塔尔之间提供更高频的跨境班次与多式联运方案。", implication: "海湾陆桥在不确定时期的重要性上升，跨境履约网络需要同时管理线路、清关与末端交接能力。", focus: false, status: "已核验", source: "https://anzama.com/news", sourceLabel: "ANZAMA Logistics" },
  { id: "me-0721-uae-heat", date: "2026-07-21", region: "中东", market: "阿联酋", company: "Careem / Talabat / UAE MoHRE", track: "运力侧 / 行业 / 监管", service: "即时配送 · 本地生活", title: "阿联酋高温时段限制配送：平台限单并启用冷却站", summary: "阿联酋高温禁工时段内，Careem、Talabat 等平台设置每名骑手最多3单、总配送时间不超过60分钟，并通过 App 引导骑手寻找冷却站。", implication: "极端天气将直接改变派单上限、用户 ETA、骑手休息与站点运营，平台需要把安全约束写进调度系统。", focus: true, status: "已核验", source: "https://www.khaleejtimes.com/uae/uae-delivery-platforms-summer-heat-midday-break-rules-cooling-stations-health?amp=1", sourceLabel: "Khaleej Times / UAE MoHRE" },
];

const seedItems: Intelligence[] = [...julyItems,
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
const serviceOptions = ["全部服务", "即时零售", "国际物流", "尾程配送", "即时配送", "本地生活", "同城跑腿", "闪购", "闪电仓", "最后一公里", "COD"] as const;

function displayDate(date: string) { return date.slice(5).replace("-", "."); }
function monthLabel(month: string) { return `${month.slice(0, 4)} 年 ${month.slice(5)} 月`; }
function sortByOccurredAt(items: Intelligence[]) { return [...items].sort((left, right) => right.date.localeCompare(left.date)); }

export default function Home() {
  const [items, setItems] = useState(seedItems);
  const [view, setView] = useState<"brief" | "table">("brief");
  const [draftMonths, setDraftMonths] = useState<string[]>(["2026-07"]);
  const [activeMonths, setActiveMonths] = useState<string[]>(["2026-07"]);
  const [draftRegions, setDraftRegions] = useState<string[]>([]);
  const [activeRegions, setActiveRegions] = useState<string[]>([]);
  const [draftTracks, setDraftTracks] = useState<string[]>([]);
  const [activeTracks, setActiveTracks] = useState<string[]>([]);
  const [draftServices, setDraftServices] = useState<string[]>([]);
  const [activeServices, setActiveServices] = useState<string[]>([]);
  const [draftQuery, setDraftQuery] = useState("");
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showAllBrief, setShowAllBrief] = useState(false);
  const [lastRefresh, setLastRefresh] = useState("2026.08.01 08:30");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("lm-field-notes-items");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Intelligence[];
        const storedManualItems = parsed.filter((item) => !seedItems.some((seed) => seed.id === item.id));
        const timer = window.setTimeout(() => setItems([...seedItems, ...storedManualItems]), 0);
        return () => window.clearTimeout(timer);
      } catch { /* keep seed data */ }
    }
  }, []);

  const monthOptions = useMemo(() => Array.from(new Set(items.map((item) => item.date.slice(0, 7)))).sort().reverse(), [items]);
  const orderedItems = useMemo(() => sortByOccurredAt(items), [items]);
  const filteredItems = useMemo(() => orderedItems.filter((item) => {
    const haystack = `${item.title} ${item.company} ${item.summary} ${item.implication} ${item.market}`.toLowerCase();
    const matchesQuery = !query.trim() || haystack.includes(query.trim().toLowerCase());
    const matchesMonth = activeMonths.length === 0 || activeMonths.includes(item.date.slice(0, 7));
    const matchesRegion = activeRegions.length === 0 || activeRegions.includes(item.region);
    const matchesTrack = activeTracks.length === 0 || activeTracks.some((track) => item.track.includes(track === "行业 / 监管" ? "行业" : track));
    const matchesService = activeServices.length === 0 || activeServices.some((service) => item.service.includes(service));
    return matchesQuery && matchesMonth && matchesRegion && matchesTrack && matchesService;
  }), [activeMonths, activeRegions, activeServices, activeTracks, orderedItems, query]);

  const focusItems = filteredItems.filter((item) => item.focus);
  const visibleFocus = showAllBrief ? focusItems : focusItems.slice(0, 5);
  const regionCount = new Set(filteredItems.map((item) => item.region)).size;
  const regulationCount = filteredItems.filter((item) => item.track.includes("监管") || item.track.includes("行业")).length;
  const periodLabel = activeMonths.length === 0 ? "全部年月" : activeMonths.length === 1 ? monthLabel(activeMonths[0]) : `${activeMonths.length} 个年月`;

  function applyFilters() {
    setActiveMonths(draftMonths);
    setActiveRegions(draftRegions);
    setActiveTracks(draftTracks);
    setActiveServices(draftServices);
    setQuery(draftQuery);
    setNotice("筛选条件已应用，列表已按发生时间倒序更新。");
    window.setTimeout(() => setNotice(""), 3000);
  }

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
    link.href = url; link.download = "last-mile-field-notes-2026-07.csv"; link.click(); URL.revokeObjectURL(url);
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
        <div className="topbar-right"><span className="live-label"><span /> LIVE MONITOR</span><span>首期整理 · 2026 年 7 月</span></div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <h1>把每一天的末端变化，<em>变成可用判断。</em></h1>
          <p className="hero-text">聚合中国、东南亚、拉美与中东的即时零售、同城配送、国际物流和运力监管动态。</p>
          <div className="hero-actions"><button className="button button-dark" onClick={() => { setView("brief"); document.querySelector("#brief")?.scrollIntoView(); }}>查看物流履约简报 <span>↓</span></button><button className="text-link" onClick={() => { setView("table"); document.querySelector("#feed")?.scrollIntoView(); }}>浏览所有情报 <span>→</span></button></div>
        </div>
        <aside className="hero-note"><div className="hero-motif" aria-hidden="true"><span className="motif-square motif-orange" /><span className="motif-square motif-blue" /><span className="motif-orb" /><span className="motif-ring" /><span className="motif-sticker">08:30</span><span className="motif-dots">•••••</span></div><div className="hero-note-copy"><div className="status-dot"><span /></div><div><div className="eyebrow">DAILY PULSE</div><strong>每日刷新入口已就绪</strong><p>上次检查 {lastRefresh} · 每天 08:30（深圳时间）检查前一天内容。</p><button className="mini-button" onClick={refreshRecords}>刷新记录 ↻</button></div></div></aside>
      </section>

      <section className="metric-row" aria-label="月度概览">
        <div className="metric-card metric-accent"><span className="metric-label">已收录情报</span><strong>{filteredItems.length}</strong><span className="metric-foot">当前筛选 · {periodLabel}</span></div>
        <div className="metric-card"><span className="metric-label">重点关注</span><strong>{focusItems.length}</strong><span className="metric-foot">可直接进入 PPT</span></div>
        <div className="metric-card"><span className="metric-label">监管 / 制度</span><strong>{regulationCount}</strong><span className="metric-foot">需要持续跟踪</span></div>
        <div className="metric-card"><span className="metric-label">覆盖市场</span><strong>{regionCount}</strong><span className="metric-foot">中国 · SEA · LatAm · ME</span></div>
      </section>

      <section className="section-head" id="brief"><div><span className="section-index">01</span><h2>物流履约简报</h2></div><span className="section-caption">用户、商家、运力、系统与监管的全链路变化</span></section>
      <section className="brief-grid">
        {visibleFocus.map((item, index) => <article className={`brief-card brief-${(index % 3) + 1}`} key={item.id}><div className="card-topline"><span className="pill">重点关注</span><span>{displayDate(item.date)}</span></div><div className="card-region">{item.region} <span>·</span> {item.company}</div><h3>{item.title}</h3><p>{item.summary}</p><div className="brief-bottom"><span className="signal-sticker">PPT PICK</span><span className="source-count">{item.track}</span></div><a className="source-link" href={item.source} target="_blank" rel="noreferrer">查看原文 <span>↗</span></a></article>)}
      </section>
      <div className="section-action"><button className="outline-button" onClick={() => setShowAllBrief((current) => !current)}>{showAllBrief ? "收起" : `查看全部（${focusItems.length}）`} <span>{showAllBrief ? "↑" : "↓"}</span></button></div>

      <section className="section-head feed-heading" id="feed"><div><span className="section-index">02</span><h2>情报流</h2></div><div className="view-switch"><button className={view === "brief" ? "active" : ""} onClick={() => setView("brief")}>看板</button><button className={view === "table" ? "active" : ""} onClick={() => setView("table")}>表格</button></div></section>
      <section className="control-panel" aria-label="情报筛选与操作"><div className="search-wrap"><span>⌕</span><input value={draftQuery} onChange={(event) => setDraftQuery(event.target.value)} placeholder="搜索公司、市场、关键词" aria-label="搜索公司、市场、关键词" /></div><div className="select-row"><label>年月（多选）<select className="multi-select" multiple size={2} value={draftMonths} onChange={(event) => setDraftMonths(Array.from(event.currentTarget.selectedOptions, (option) => option.value))} aria-label="按年月多选">{monthOptions.map((month) => <option key={month} value={month}>{monthLabel(month)}</option>)}</select><small>不选 = 全部年月</small></label><label>地区（多选）<select className="multi-select" multiple size={4} value={draftRegions} onChange={(event) => setDraftRegions(Array.from(event.currentTarget.selectedOptions, (option) => option.value))} aria-label="按地区多选">{regionOptions.slice(1).map((region) => <option key={region} value={region}>{region}</option>)}</select><small>不选 = 全部地区</small></label><label>涉及端（多选）<select className="multi-select" multiple size={4} value={draftTracks} onChange={(event) => setDraftTracks(Array.from(event.currentTarget.selectedOptions, (option) => option.value))} aria-label="按涉及端多选">{trackOptions.slice(1).map((track) => <option key={track} value={track}>{track}</option>)}</select><small>不选 = 全部涉及端</small></label><label>服务（多选）<select className="multi-select" multiple size={5} value={draftServices} onChange={(event) => setDraftServices(Array.from(event.currentTarget.selectedOptions, (option) => option.value))} aria-label="按服务多选">{serviceOptions.slice(1).map((service) => <option key={service} value={service}>{service}</option>)}</select><small>不选 = 全部服务</small></label></div><div className="control-actions"><button className="button button-dark query-button" onClick={applyFilters}>查询 <span>→</span></button><button className="outline-button" onClick={() => setShowAdd(true)}>＋ 新增情报</button><button className="export-button" onClick={exportCsv}>导出 CSV <span>↓</span></button></div></section>

      {view === "brief" ? <section className="feed-list"><div className="feed-list-head"><span>{filteredItems.length} 条记录</span><span>按发生时间倒序 · 越新的变化越靠前</span></div>{filteredItems.map((item) => <article className="feed-item" key={item.id}><div className="feed-date"><strong>{displayDate(item.date)}</strong><span>{item.date.slice(0, 4)}</span></div><div className="feed-main"><div className="feed-meta"><span className={`status status-${item.status === "已核验" ? "verified" : "review"}`}>{item.status}</span><span>{item.region} · {item.market}</span><span>{item.track}</span><span>{item.service}</span><span className="source-label">{item.sourceLabel}</span></div><h3>{item.title}</h3><p>{item.summary}</p><div className="feed-implication"><span>→ 产品影响</span>{item.implication}</div></div><div className="feed-side"><span>{item.company}</span><a href={item.source} target="_blank" rel="noreferrer">资料 ↗</a></div></article>)}</section> : <section className="table-wrap"><table><thead><tr><th>时间</th><th>地区 / 市场</th><th>公司</th><th>涉及端</th><th>服务</th><th>改动内容</th><th>来源</th><th>状态</th><th>资料</th></tr></thead><tbody>{filteredItems.map((item) => <tr key={item.id}><td className="table-date">{item.date}</td><td><strong>{item.region}</strong><small>{item.market}</small></td><td>{item.company}</td><td><span className="table-tag">{item.track}</span></td><td>{item.service}</td><td><strong>{item.title}</strong><small>{item.summary}</small></td><td><small className="source-label">{item.sourceLabel}</small></td><td><span className={`status status-${item.status === "已核验" ? "verified" : "review"}`}>{item.status}</span></td><td><a href={item.source} target="_blank" rel="noreferrer">打开 ↗</a></td></tr>)}</tbody></table></section>}

      <section className="sources-section" id="sources"><div className="section-head sources-heading"><div><span className="section-index">03</span><h2>来源池</h2></div><span className="section-caption">官方口径 + 行业媒体 + 研报与区域监管</span></div><div className="sources-grid">{sourceGroups.map((group) => <article className="source-group" key={group.title}><div className="source-group-head"><span className="eyebrow">{group.eyebrow}</span><h3>{group.title}</h3><p>{group.description}</p></div><div className="source-links">{group.links.map((source) => <a className="source-chip" href={source.url} key={source.label} target="_blank" rel="noreferrer"><span>{source.label}</span><small>{source.scope}</small><b>↗</b></a>)}</div></article>)}</div><div className="source-method"><span className="eyebrow">COLLECTION RULE</span><p>每条情报优先保留原始资料链接；国内按“平台官方 → 监管公告 → 行业媒体 → 研报 / 舆情”交叉验证，海外按“公司官方 → 当地监管 → 区域行业媒体”补齐区域差异。</p></div></section>

      <footer className="footer"><div><span className="eyebrow">RESEARCH LOG / JUL 2026</span><p>来源以政府、公司公告、开发者文档、权威媒体与区域监管资料为主。手工新增记录默认标为“待复核”。</p></div><div className="footer-right"><span>覆盖 {regionCount} 个区域</span><span>每日刷新 · UTC+8</span></div></footer>

      {notice && <div className="toast" role="status">{notice}</div>}
      {showAdd && <div className="modal-backdrop"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="add-title"><div className="modal-head"><div><span className="eyebrow">QUICK CAPTURE</span><h2 id="add-title">新增一条情报</h2></div><button className="close-button" onClick={() => setShowAdd(false)} aria-label="关闭">×</button></div><form onSubmit={addItem}><div className="form-grid"><label>发生时间<input name="date" type="date" defaultValue="2026-09-04" required /></label><label>公司 / 机构<input name="company" placeholder="例如：Grab / 交通部" required /></label><label>地区<select name="region" defaultValue="中国">{regionOptions.slice(1).map((region) => <option key={region}>{region}</option>)}</select></label><label>国家 / 城市<input name="market" placeholder="例如：印尼 / 雅加达" required /></label><label>涉及端<select name="track" defaultValue="行业 / 监管">{trackOptions.slice(1).map((track) => <option key={track}>{track}</option>)}</select></label><label>服务<input name="service" placeholder="即时配送 / COD" required /></label></div><label>标题<input name="title" placeholder="这条变化发生了什么？" required /></label><label>改动内容<textarea name="summary" rows={3} placeholder="用 1-2 句话记录改动内容" required /></label><label>资料链接<input name="source" type="url" placeholder="https://" required /></label><div className="modal-actions"><button type="button" className="outline-button" onClick={() => setShowAdd(false)}>取消</button><button type="submit" className="button button-dark">保存记录 <span>→</span></button></div></form></section></div>}
    </main>
  );
}
