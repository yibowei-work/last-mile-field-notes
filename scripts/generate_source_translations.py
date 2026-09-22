#!/usr/bin/env python3
"""Generate static translations for the expandable source-coverage directory."""

from __future__ import annotations

import json
import re
from pathlib import Path

from generate_intelligence_translations import metadata_to_english, translate_text


ROOT = Path(__file__).resolve().parents[1]
PAGE_PATH = ROOT / "app" / "page.tsx"
OUTPUT_PATH = ROOT / "app" / "source-translations.ts"
TARGETS = ("id", "vi", "pt")

SOURCE_NAME_OVERRIDES = {
    "晚点 LatePost": "LatePost",
    "36氪未来消费": "36Kr Future Consumption",
    "36氪出海": "36Kr Global",
    "36 氪": "36Kr",
    "虎嗅 APP": "Huxiu App",
    "虎嗅": "Huxiu",
    "雷锋网": "Leiphone",
    "雷峰网 / IT之家 / TechWeb": "Leiphone / ITHome / TechWeb",
    "起点财经": "Qidian Finance",
    "创新零售社": "Innovative Retail",
    "DT商业观察": "DT Business Observer",
    "张大爷聊外卖": "Zhang Daye Talks Food Delivery",
    "陈罡Pro": "Chen Gang Pro",
    "海豚研究": "Dolphin Research",
    "海豚投研": "Dolphin Investment Research",
    "零售商业财经": "Retail Business Finance",
    "走马财经": "Zouma Finance",
    "即时刘说": "Instant Liu Talks",
    "墨腾创投": "Momentum Works",
    "剑非观点": "Jianfei Insights",
    "投研小透明": "Investment Research Observer",
    "Tech星球": "Tech Planet",
    "第三只眼看零售": "Third Eye Retail",
    "美团研究院": "Meituan Research Institute",
    "美团 Meituan": "Meituan",
    "美团外卖": "Meituan Food Delivery",
    "美团外卖推广服务平台": "Meituan Food Delivery Promotion Platform",
    "美团外卖商家中心": "Meituan Food Delivery Merchant Center",
    "美团闪购商家中心": "Meituan Instashopping Merchant Center",
    "美团餐饮观察": "Meituan Foodservice Insights",
    "美团下沉市场合作城市": "Meituan Lower-tier Market Partner Cities",
    "美团外卖智能硬件": "Meituan Food Delivery Smart Hardware",
    "美团餐饮经营宝": "Meituan Restaurant Operations",
    "美团餐饮系统": "Meituan Restaurant Systems",
    "美团骑手": "Meituan Riders",
    "美团闪电仓": "Meituan Flash Warehouses",
    "美团众包骑手 App": "Meituan Crowdsourced Rider App",
    "美团众包": "Meituan Crowdsourcing",
    "美团商家外卖课堂": "Meituan Merchant Delivery Academy",
    "美团商户外卖通": "Meituan Merchant Delivery Services",
    "美团开放平台": "Meituan Open Platform",
    "美团技术团队": "Meituan Tech",
    "美团新闻中心": "Meituan Newsroom",
    "京东黑板报": "JD.com News",
    "京东外卖": "JD Food Delivery",
    "京东秒送": "JD Instant Delivery",
    "京东外卖商家中心": "JD Food Delivery Merchant Center",
    "京东秒送商家经营小助手": "JD Instant Delivery Merchant Assistant",
    "京东到家官网": "JD Daojia",
    "京东投资者关系": "JD.com Investor Relations",
    "京东物流开放平台": "JD Logistics Open Platform",
    "京东研究院": "JD.com Research Institute",
    "京东秒送 App Store": "JD Instant Delivery App Store",
    "京东秒送 App Store（新加坡）": "JD Instant Delivery App Store (Singapore)",
    "京东零售开放平台": "JD Retail Open Platform",
    "淘宝闪购设计": "Taobao Instant Design",
    "淘宝闪购技术": "Taobao Instant Tech",
    "淘宝闪购商家课堂": "Taobao Instant Merchant Academy",
    "淘宝闪购商家中心": "Taobao Instant Merchant Center",
    "淘宝闪购城市骑士": "Taobao Instant City Riders",
    "淘宝技术": "Taobao Tech",
    "淘宝闪购商家培训": "Taobao Instant Merchant Training",
    "达达秒送骑士": "Dada Instant Delivery Riders",
    "达达开放平台": "Dada Open Platform",
    "达达集团官网": "Dada Group",
    "达达黑板报": "Dada News",
    "蜂鸟众包 App": "Fengniao Crowdsourcing App",
    "蜂鸟众包": "Fengniao Crowdsourcing",
    "蜂鸟即时配送开放平台": "Fengniao Instant Delivery Open Platform",
    "顺丰同城官网": "SF Intra-city",
    "顺丰同城投资者关系": "SF Intra-city Investor Relations",
    "闪送 App Store": "Shansong App Store",
    "闪送官网": "Shansong",
    "饿了么官网": "Ele.me",
    "UU 跑腿官网": "UU Errands",
    "千问开放平台": "Qwen Open Platform",
    "有赞帮助中心": "Youzan Help Center",
    "21 世纪经济报道": "21st Century Business Herald",
    "亿邦动力": "Ebrun",
    "联商网": "Linkshop",
    "第一财经": "Yicai",
    "界面新闻": "Jiemian News",
    "南方网": "Southcn",
    "人民网 / 新华网 / 央视网": "People's Daily Online / Xinhua / CCTV.com",
    "澎湃新闻 / 新京报": "The Paper / Beijing News",
    "每日经济新闻 / 证券时报": "National Business Daily / Securities Times",
    "财联社 / 东方财富": "CLS / Eastmoney",
    "网经社 / 亿欧": "100EC / EqualOcean",
    "新浪财经 / 新浪新闻": "Sina Finance / Sina News",
    "新浪新闻": "Sina News",
    "今日头条 / 搜狐 / 网易": "Toutiao / Sohu / NetEase",
    "百度资讯": "Baidu News",
    "小红书关键词检索": "Xiaohongshu Keyword Search",
    "华泰证券": "Huatai Securities",
    "中金公司": "CICC",
    "中信证券": "CITIC Securities",
    "国海证券": "Sealand Securities",
    "招商证券 / 招商海外": "China Merchants Securities / CMS International",
    "交银国际": "BOCOM International",
    "广发证券": "GF Securities",
    "海通证券": "Haitong Securities",
    "国泰君安证券": "Guotai Junan Securities",
    "国信证券": "Guosen Securities",
    "印尼通信与数字部": "Indonesia Ministry of Communication and Digital Affairs",
    "新加坡人力部 MOM": "Singapore Ministry of Manpower (MOM)",
    "巴西 Anvisa": "Brazil Anvisa",
    "墨西哥经济部": "Mexico Ministry of Economy",
}

SOURCE_SCOPE_ENGLISH = {
    "AI / 产品": "AI / Product",
    "AI / 接入": "AI / Integration",
    "App 搜索 / 运力端": "App search / Delivery workforce",
    "东南亚平台": "Southeast Asia platforms",
    "东南亚监管": "Southeast Asia regulation",
    "中东 / 货代": "Middle East / Freight forwarding",
    "中东交通 / 骑手安全": "Middle East transport / Rider safety",
    "中东劳动 / 安全": "Middle East labor / Safety",
    "中东平台 / 骑手": "Middle East platforms / Riders",
    "中东配送 API": "Middle East delivery API",
    "产业 / 政策": "Industry / Policy",
    "产品 / 供应链": "Product / Supply chain",
    "公众号 / 商家侧": "WeChat official accounts / Merchants",
    "公众号 / 平台侧": "WeChat official accounts / Platforms",
    "公众号 / 研究": "WeChat official accounts / Research",
    "公众号 / 行业媒体": "WeChat official accounts / Industry media",
    "公众号 / 运力与行业": "WeChat official accounts / Delivery and industry",
    "公众号 / 运力端": "WeChat official accounts / Delivery workforce",
    "公司 / 快讯": "Companies / Breaking news",
    "公司 / 消费": "Companies / Consumer",
    "公司 / 资本市场": "Companies / Capital markets",
    "关键词监测": "Keyword monitoring",
    "券商研报": "Broker research",
    "北欧物流 API": "Nordic logistics API",
    "即时配送": "On-demand delivery",
    "即时零售": "Instant retail",
    "可视化 / API": "Visibility / API",
    "商家 / 订单 API": "Merchants / Order API",
    "商家系统 / 渠道接入": "Merchant systems / Channel integration",
    "商家规则": "Merchant rules",
    "商家运营": "Merchant operations",
    "国际物流 API": "International logistics API",
    "地方 / 民生": "Local / Public services",
    "巴西本地生活": "Brazil local services",
    "平台 / 用户侧舆情": "Platforms / Consumer sentiment",
    "平台公告": "Platform announcements",
    "开放平台 / 东南亚服务": "Open platform / Southeast Asia services",
    "开放平台 / 全球服务": "Open platform / Global services",
    "开放平台 / 即时配送 API": "Open platform / On-demand delivery API",
    "开放平台 / 履约 API": "Open platform / Fulfillment API",
    "开放平台 / 巴西服务": "Open platform / Brazil services",
    "开放平台 / 服务接入": "Open platform / Service integration",
    "开放平台 / 物流服务": "Open platform / Logistics services",
    "开放平台": "Open platform",
    "急送 / 产品": "Express delivery / Product",
    "扩展检索": "Extended search",
    "技术 / 履约": "Technology / Fulfillment",
    "拉美 / 订单 API": "Latin America / Order API",
    "拉美即时零售": "Latin America instant retail",
    "拉美政策": "Latin America policy",
    "拉美监管": "Latin America regulation",
    "政策 / 监管": "Policy / Regulation",
    "新闻检索": "News search",
    "本地生活": "Local services",
    "治理 / 民生": "Governance / Public services",
    "海外研报": "International research",
    "海运 / 中东": "Ocean freight / Middle East",
    "消费 / 公司": "Consumer / Companies",
    "版本 / 东南亚用户端": "App releases / Southeast Asia consumers",
    "版本 / 中东用户端": "App releases / Middle East consumers",
    "版本 / 中国用户端": "App releases / China consumers",
    "版本 / 产品": "App releases / Product",
    "版本 / 拉美用户端": "App releases / Latin America consumers",
    "版本 / 欧洲用户端": "App releases / Europe consumers",
    "电商 / 平台": "E-commerce / Platforms",
    "电商 / 零售": "E-commerce / Retail",
    "竞争 / 监管": "Competition / Regulation",
    "算法 / AI": "Algorithms / AI",
    "经营 / 战略": "Operations / Strategy",
    "行业研究": "Industry research",
    "财报 / 即时零售": "Financial results / Instant retail",
    "财报 / 战略": "Financial results / Strategy",
    "跑腿 / 服务": "Errands / Services",
    "转载 / 快讯": "Syndication / Breaking news",
    "配送 / 合作": "Delivery / Partnerships",
    "配送服务": "Delivery services",
    "零售供给": "Retail supply",
}

SOURCE_SCOPE_TRANSLATIONS = {
    "id": {
        "AI / 产品": "AI / Produk", "AI / 接入": "AI / Integrasi", "App 搜索 / 运力端": "Pencarian aplikasi / Mitra pengiriman",
        "东南亚平台": "Platform Asia Tenggara", "东南亚监管": "Regulasi Asia Tenggara", "中东 / 货代": "Timur Tengah / Jasa pengiriman barang",
        "中东交通 / 骑手安全": "Transportasi Timur Tengah / Keselamatan kurir", "中东劳动 / 安全": "Ketenagakerjaan Timur Tengah / Keselamatan",
        "中东平台 / 骑手": "Platform Timur Tengah / Kurir", "中东配送 API": "API pengiriman Timur Tengah", "产业 / 政策": "Industri / Kebijakan",
        "产品 / 供应链": "Produk / Rantai pasok", "全球平台": "Platform global", "公众号 / 商家侧": "Akun resmi WeChat / Merchant",
        "公众号 / 平台侧": "Akun resmi WeChat / Platform", "公众号 / 研究": "Akun resmi WeChat / Riset", "公众号 / 行业媒体": "Akun resmi WeChat / Media industri",
        "公众号 / 运力与行业": "Akun resmi WeChat / Pengiriman dan industri", "公众号 / 运力端": "Akun resmi WeChat / Mitra pengiriman",
        "公司 / 快讯": "Perusahaan / Berita singkat", "公司 / 消费": "Perusahaan / Konsumen", "公司 / 资本市场": "Perusahaan / Pasar modal",
        "关键词监测": "Pemantauan kata kunci", "券商研报": "Riset sekuritas", "北欧物流 API": "API logistik Nordik",
        "即时配送": "Pengiriman on-demand", "即时零售": "Ritel instan", "可视化 / API": "Visibilitas / API", "商家 / 订单 API": "Merchant / API pesanan",
        "商家系统 / 渠道接入": "Sistem merchant / Integrasi kanal", "商家规则": "Aturan merchant", "商家运营": "Operasional merchant",
        "国际物流 API": "API logistik internasional", "地方 / 民生": "Lokal / Layanan publik", "巴西本地生活": "Layanan lokal Brasil",
        "平台 / 用户侧舆情": "Platform / Sentimen konsumen", "平台公告": "Pengumuman platform", "开放平台": "Platform terbuka",
        "开放平台 / 东南亚服务": "Platform terbuka / Layanan Asia Tenggara", "开放平台 / 全球服务": "Platform terbuka / Layanan global",
        "开放平台 / 即时配送 API": "Platform terbuka / API pengiriman on-demand", "开放平台 / 履约 API": "Platform terbuka / API fulfillment",
        "开放平台 / 巴西服务": "Platform terbuka / Layanan Brasil", "开放平台 / 服务接入": "Platform terbuka / Integrasi layanan",
        "开放平台 / 物流服务": "Platform terbuka / Layanan logistik", "急送 / 产品": "Pengiriman ekspres / Produk", "扩展检索": "Pencarian lanjutan",
        "技术 / 履约": "Teknologi / Fulfillment", "拉美 / 订单 API": "Amerika Latin / API pesanan", "拉美即时零售": "Ritel instan Amerika Latin",
        "拉美政策": "Kebijakan Amerika Latin", "拉美监管": "Regulasi Amerika Latin", "政策 / 监管": "Kebijakan / Regulasi", "新闻检索": "Pencarian berita",
        "本地生活": "Layanan lokal", "欧洲即时配送": "Pengiriman on-demand Eropa", "治理 / 民生": "Tata kelola / Layanan publik",
        "海外研报": "Riset internasional", "海运 / 中东": "Angkutan laut / Timur Tengah", "消费 / 公司": "Konsumen / Perusahaan",
        "版本 / 东南亚用户端": "Rilis aplikasi / Konsumen Asia Tenggara", "版本 / 中东用户端": "Rilis aplikasi / Konsumen Timur Tengah",
        "版本 / 中国用户端": "Rilis aplikasi / Konsumen Tiongkok", "版本 / 产品": "Rilis aplikasi / Produk",
        "版本 / 拉美用户端": "Rilis aplikasi / Konsumen Amerika Latin", "版本 / 欧洲用户端": "Rilis aplikasi / Konsumen Eropa",
        "电商 / 平台": "E-commerce / Platform", "电商 / 零售": "E-commerce / Ritel", "竞争 / 监管": "Persaingan / Regulasi",
        "算法 / AI": "Algoritma / AI", "经营 / 战略": "Operasional / Strategi", "行业研究": "Riset industri",
        "财报 / 即时零售": "Laporan keuangan / Ritel instan", "财报 / 战略": "Laporan keuangan / Strategi", "跑腿 / 服务": "Jasa titip / Layanan",
        "转载 / 快讯": "Sindikasi / Berita singkat", "配送 / 合作": "Pengiriman / Kemitraan", "配送服务": "Layanan pengiriman", "零售供给": "Pasokan ritel",
    },
    "vi": {
        "AI / 产品": "AI / Sản phẩm", "AI / 接入": "AI / Tích hợp", "App 搜索 / 运力端": "Tìm kiếm ứng dụng / Lực lượng giao hàng",
        "东南亚平台": "Nền tảng Đông Nam Á", "东南亚监管": "Quy định Đông Nam Á", "中东 / 货代": "Trung Đông / Giao nhận vận tải",
        "中东交通 / 骑手安全": "Giao thông Trung Đông / An toàn tài xế", "中东劳动 / 安全": "Lao động Trung Đông / An toàn",
        "中东平台 / 骑手": "Nền tảng Trung Đông / Tài xế", "中东配送 API": "API giao hàng Trung Đông", "产业 / 政策": "Ngành / Chính sách",
        "产品 / 供应链": "Sản phẩm / Chuỗi cung ứng", "全球平台": "Nền tảng toàn cầu", "公众号 / 商家侧": "Tài khoản chính thức WeChat / Nhà bán hàng",
        "公众号 / 平台侧": "Tài khoản chính thức WeChat / Nền tảng", "公众号 / 研究": "Tài khoản chính thức WeChat / Nghiên cứu",
        "公众号 / 行业媒体": "Tài khoản chính thức WeChat / Truyền thông ngành", "公众号 / 运力与行业": "Tài khoản chính thức WeChat / Giao hàng và ngành",
        "公众号 / 运力端": "Tài khoản chính thức WeChat / Lực lượng giao hàng", "公司 / 快讯": "Doanh nghiệp / Tin nhanh",
        "公司 / 消费": "Doanh nghiệp / Tiêu dùng", "公司 / 资本市场": "Doanh nghiệp / Thị trường vốn", "关键词监测": "Theo dõi từ khóa",
        "券商研报": "Báo cáo công ty chứng khoán", "北欧物流 API": "API logistics Bắc Âu", "即时配送": "Giao hàng theo nhu cầu",
        "即时零售": "Bán lẻ tức thời", "可视化 / API": "Khả năng hiển thị / API", "商家 / 订单 API": "Nhà bán hàng / API đơn hàng",
        "商家系统 / 渠道接入": "Hệ thống nhà bán hàng / Tích hợp kênh", "商家规则": "Quy định nhà bán hàng", "商家运营": "Vận hành nhà bán hàng",
        "国际物流 API": "API logistics quốc tế", "地方 / 民生": "Địa phương / Dịch vụ công", "巴西本地生活": "Dịch vụ địa phương Brazil",
        "平台 / 用户侧舆情": "Nền tảng / Ý kiến người tiêu dùng", "平台公告": "Thông báo nền tảng", "开放平台": "Nền tảng mở",
        "开放平台 / 东南亚服务": "Nền tảng mở / Dịch vụ Đông Nam Á", "开放平台 / 全球服务": "Nền tảng mở / Dịch vụ toàn cầu",
        "开放平台 / 即时配送 API": "Nền tảng mở / API giao hàng theo nhu cầu", "开放平台 / 履约 API": "Nền tảng mở / API thực hiện đơn hàng",
        "开放平台 / 巴西服务": "Nền tảng mở / Dịch vụ Brazil", "开放平台 / 服务接入": "Nền tảng mở / Tích hợp dịch vụ",
        "开放平台 / 物流服务": "Nền tảng mở / Dịch vụ logistics", "急送 / 产品": "Giao nhanh / Sản phẩm", "扩展检索": "Tìm kiếm mở rộng",
        "技术 / 履约": "Công nghệ / Thực hiện đơn hàng", "拉美 / 订单 API": "Mỹ Latinh / API đơn hàng", "拉美即时零售": "Bán lẻ tức thời Mỹ Latinh",
        "拉美政策": "Chính sách Mỹ Latinh", "拉美监管": "Quy định Mỹ Latinh", "政策 / 监管": "Chính sách / Quy định", "新闻检索": "Tìm kiếm tin tức",
        "本地生活": "Dịch vụ địa phương", "欧洲即时配送": "Giao hàng theo nhu cầu tại châu Âu", "治理 / 民生": "Quản trị / Dịch vụ công",
        "海外研报": "Nghiên cứu quốc tế", "海运 / 中东": "Vận tải biển / Trung Đông", "消费 / 公司": "Tiêu dùng / Doanh nghiệp",
        "版本 / 东南亚用户端": "Bản phát hành ứng dụng / Người dùng Đông Nam Á", "版本 / 中东用户端": "Bản phát hành ứng dụng / Người dùng Trung Đông",
        "版本 / 中国用户端": "Bản phát hành ứng dụng / Người dùng Trung Quốc", "版本 / 产品": "Bản phát hành ứng dụng / Sản phẩm",
        "版本 / 拉美用户端": "Bản phát hành ứng dụng / Người dùng Mỹ Latinh", "版本 / 欧洲用户端": "Bản phát hành ứng dụng / Người dùng châu Âu",
        "电商 / 平台": "Thương mại điện tử / Nền tảng", "电商 / 零售": "Thương mại điện tử / Bán lẻ", "竞争 / 监管": "Cạnh tranh / Quy định",
        "算法 / AI": "Thuật toán / AI", "经营 / 战略": "Vận hành / Chiến lược", "行业研究": "Nghiên cứu ngành",
        "财报 / 即时零售": "Báo cáo tài chính / Bán lẻ tức thời", "财报 / 战略": "Báo cáo tài chính / Chiến lược", "跑腿 / 服务": "Dịch vụ chạy việc / Dịch vụ",
        "转载 / 快讯": "Tin đăng lại / Tin nhanh", "配送 / 合作": "Giao hàng / Đối tác", "配送服务": "Dịch vụ giao hàng", "零售供给": "Nguồn cung bán lẻ",
    },
    "pt": {
        "AI / 产品": "IA / Produto", "AI / 接入": "IA / Integração", "App 搜索 / 运力端": "Pesquisa de apps / Força de entrega",
        "东南亚平台": "Plataformas do Sudeste Asiático", "东南亚监管": "Regulação do Sudeste Asiático", "中东 / 货代": "Oriente Médio / Agenciamento de cargas",
        "中东交通 / 骑手安全": "Transporte no Oriente Médio / Segurança dos entregadores", "中东劳动 / 安全": "Trabalho no Oriente Médio / Segurança",
        "中东平台 / 骑手": "Plataformas do Oriente Médio / Entregadores", "中东配送 API": "API de entrega do Oriente Médio", "产业 / 政策": "Setor / Política",
        "产品 / 供应链": "Produto / Cadeia de suprimentos", "全球平台": "Plataformas globais", "公众号 / 商家侧": "Contas oficiais do WeChat / Comerciantes",
        "公众号 / 平台侧": "Contas oficiais do WeChat / Plataformas", "公众号 / 研究": "Contas oficiais do WeChat / Pesquisa",
        "公众号 / 行业媒体": "Contas oficiais do WeChat / Mídia setorial", "公众号 / 运力与行业": "Contas oficiais do WeChat / Entrega e setor",
        "公众号 / 运力端": "Contas oficiais do WeChat / Força de entrega", "公司 / 快讯": "Empresas / Notícias rápidas",
        "公司 / 消费": "Empresas / Consumo", "公司 / 资本市场": "Empresas / Mercado de capitais", "关键词监测": "Monitoramento de palavras-chave",
        "券商研报": "Relatórios de corretoras", "北欧物流 API": "API de logística nórdica", "即时配送": "Entrega sob demanda",
        "即时零售": "Varejo instantâneo", "可视化 / API": "Visibilidade / API", "商家 / 订单 API": "Comerciantes / API de pedidos",
        "商家系统 / 渠道接入": "Sistemas de comerciantes / Integração de canais", "商家规则": "Regras para comerciantes", "商家运营": "Operações de comerciantes",
        "国际物流 API": "API de logística internacional", "地方 / 民生": "Local / Serviços públicos", "巴西本地生活": "Serviços locais do Brasil",
        "平台 / 用户侧舆情": "Plataformas / Opinião do consumidor", "平台公告": "Anúncios de plataformas", "开放平台": "Plataforma aberta",
        "开放平台 / 东南亚服务": "Plataforma aberta / Serviços do Sudeste Asiático", "开放平台 / 全球服务": "Plataforma aberta / Serviços globais",
        "开放平台 / 即时配送 API": "Plataforma aberta / API de entrega sob demanda", "开放平台 / 履约 API": "Plataforma aberta / API de fulfillment",
        "开放平台 / 巴西服务": "Plataforma aberta / Serviços do Brasil", "开放平台 / 服务接入": "Plataforma aberta / Integração de serviços",
        "开放平台 / 物流服务": "Plataforma aberta / Serviços logísticos", "急送 / 产品": "Entrega expressa / Produto", "扩展检索": "Pesquisa ampliada",
        "技术 / 履约": "Tecnologia / Fulfillment", "拉美 / 订单 API": "América Latina / API de pedidos", "拉美即时零售": "Varejo instantâneo na América Latina",
        "拉美政策": "Política da América Latina", "拉美监管": "Regulação da América Latina", "政策 / 监管": "Política / Regulação", "新闻检索": "Pesquisa de notícias",
        "本地生活": "Serviços locais", "欧洲即时配送": "Entrega sob demanda na Europa", "治理 / 民生": "Governança / Serviços públicos",
        "海外研报": "Pesquisa internacional", "海运 / 中东": "Frete marítimo / Oriente Médio", "消费 / 公司": "Consumo / Empresas",
        "版本 / 东南亚用户端": "Lançamentos de apps / Consumidores do Sudeste Asiático", "版本 / 中东用户端": "Lançamentos de apps / Consumidores do Oriente Médio",
        "版本 / 中国用户端": "Lançamentos de apps / Consumidores da China", "版本 / 产品": "Lançamentos de apps / Produto",
        "版本 / 拉美用户端": "Lançamentos de apps / Consumidores da América Latina", "版本 / 欧洲用户端": "Lançamentos de apps / Consumidores da Europa",
        "电商 / 平台": "E-commerce / Plataformas", "电商 / 零售": "E-commerce / Varejo", "竞争 / 监管": "Concorrência / Regulação",
        "算法 / AI": "Algoritmos / IA", "经营 / 战略": "Operações / Estratégia", "行业研究": "Pesquisa setorial",
        "财报 / 即时零售": "Resultados financeiros / Varejo instantâneo", "财报 / 战略": "Resultados financeiros / Estratégia", "跑腿 / 服务": "Serviços de recados / Serviços",
        "转载 / 快讯": "Republicação / Notícias rápidas", "配送 / 合作": "Entrega / Parcerias", "配送服务": "Serviços de entrega", "零售供给": "Oferta de varejo",
    },
}


def source_texts(source: str) -> list[str]:
    start = source.index("const supplementalSourceChannels")
    end = source.index("\ntype BusinessSubject", start)
    section = source[start:end]
    values = [json.loads(match.group(0)) for match in re.finditer(r'"(?:\\.|[^"\\])*"', section)]
    return sorted({value for value in values if re.search(r"[\u3400-\u9fff]", value)})


def source_scopes(source: str) -> set[str]:
    start = source.index("const supplementalSourceChannels")
    end = source.index("\ntype BusinessSubject", start)
    return set(re.findall(r'scope:\s*"([^"]+)"', source[start:end]))


def main() -> None:
    source = PAGE_PATH.read_text(encoding="utf-8")
    values = source_texts(source)
    scopes = source_scopes(source)
    for language, translations in SOURCE_SCOPE_TRANSLATIONS.items():
        missing = sorted(scopes - translations.keys())
        if missing:
            raise RuntimeError(f"Missing {language} source-scope translations: {', '.join(missing)}")
    cache: dict[tuple[str, str], str] = {}
    english = {
        value: SOURCE_NAME_OVERRIDES.get(value, SOURCE_SCOPE_ENGLISH.get(value, metadata_to_english(value)))
        for value in values
    }
    localized: dict[str, dict[str, str]] = {"en": english}

    for target in TARGETS:
        localized[target] = {
            value: (
                english_copy
                if value in SOURCE_NAME_OVERRIDES
                else SOURCE_SCOPE_TRANSLATIONS[target][value]
                if value in SOURCE_SCOPE_TRANSLATIONS[target]
                else translate_text(english_copy, target, cache)
            )
            for value, english_copy in english.items()
        }

    output = (
        "// Generated locally by scripts/generate_source_translations.py.\n"
        "// Official brand and product names may remain in their established form.\n\n"
        f"export const localizedSourceText = {json.dumps(localized, ensure_ascii=False, indent=2)} as const;\n"
    )
    OUTPUT_PATH.write_text(output, encoding="utf-8")
    (ROOT / ":memory:.ses").unlink(missing_ok=True)
    print(f"Wrote {len(values)} source-directory labels × {len(TARGETS) + 1} languages to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
