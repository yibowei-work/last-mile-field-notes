#!/usr/bin/env python3
"""Generate static Indonesian, Vietnamese and Portuguese intelligence copy.

This script uses locally installed Argos Translate models. It never sends site
content to a translation API. Install the zh->en, en->id, en->vi and en->pt
models before running it.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from argostranslate import translate


ROOT = Path(__file__).resolve().parents[1]
PAGE_PATH = ROOT / "app" / "page.tsx"
OUTPUT_PATH = ROOT / "app" / "intelligence-translations.ts"
FIELDS = ("title", "summary", "implication", "company", "market", "sourceLabel")
CONTENT_FIELDS = ("title", "summary", "implication")
TARGETS = ("id", "vi", "pt")

MANUAL_CORRECTIONS = {
    "vi": {
        "cn-0904-fedex": {"market": "Trung Quốc đại lục / vận chuyển xuyên biên giới"},
        "cn-0813-jd-night-autonomous": {"market": "Thâm Quyến / hơn 20 tỉnh trên toàn quốc"},
        "sea-0907-flash-express-ph": {"company": "Flash Express Philippines"},
        "sea-0910-lec-eu-spain": {
            "company": "Hành lang Kinh tế Luzon của Philippines / Liên minh châu Âu / Tây Ban Nha",
            "market": "Philippines / Subic–Clark–Manila–Batangas",
        },
        "sea-0910-easyparcel-app": {
            "company": "EasyParcel",
            "market": "Malaysia / người dùng đa quốc gia",
            "sourceLabel": "Cập nhật sản phẩm chính thức của EasyParcel",
        },
        "latam-0910-dpworld-byd-chile": {"company": "DP World / BYD"},
        "sea-0914-cathay-maintenance": {
            "title": "Cathay Cargo thông báo bảo trì hệ thống, tạm dừng Track & Trace, Click & Ship và Manage Booking",
            "company": "Cathay Cargo",
        },
        "sea-0906-anak-krakatau": {"company": "Sân bay Soekarno–Hatta / mạng lưới hàng không và logistics Indonesia"},
        "latam-0819-amazon-br": {"title": "Amazon SP-API bổ sung cập nhật hóa đơn Brazil và môi trường thử nghiệm hoàn tất đơn hàng"},
        "eu-0701-amazon-fbm": {"title": "Amazon SP-API cập nhật yêu cầu FBM tại EU và trạng thái lô hàng MFN"},
        "sea-0909-grab-99": {"sourceLabel": "Trang chiến dịch chính thức của Grab Indonesia"},
        "eu-0910-here-ai-routing": {"sourceLabel": "Thông báo chính thức của HERE Technologies"},
        "me-0910-toku-talabat": {"summary": "TNGlobal đưa tin ngày 10 tháng 9 rằng công ty trải nghiệm khách hàng Toku đã thành lập công ty con tại UAE. Việc triển khai cho Talabat hiện bao phủ tám thị trường Trung Đông và hơn 8.000 người dùng, bổ sung thoại, phương ngữ Ả Rập vùng Vịnh và năng lực AI đa ngôn ngữ."},
        "cn-0909-jd-physical-ai": {"sourceLabel": "Blog doanh nghiệp JD.com"},
        "me-0914-careem-rahma": {"sourceLabel": "Careem Newsroom"},
        "sea-0921-grab-payday": {"sourceLabel": "Trang hoạt động chính thức của Grab Indonesia"},
        "me-0807-saudi": {"sourceLabel": "Công báo chính thức Saudi Umm Al-Qura"},
        "me-0817-careem": {"title": "Careem Food ra mắt dịch vụ tiệc tại UAE"},
    }
}


def read_string_field(line: str, field: str) -> str | None:
    match = re.search(rf'"?{re.escape(field)}"?\s*:\s*("(?:\\.|[^"\\])*")', line)
    return json.loads(match.group(1)) if match else None


def read_records(source: str) -> list[dict[str, str]]:
    records: list[dict[str, str]] = []
    for line in source.splitlines():
        if not re.search(r'"?id"?\s*:\s*"', line):
            continue
        record = {field: read_string_field(line, field) for field in ("id", *FIELDS)}
        if record["id"] and all(record[field] for field in FIELDS):
            records.append(record)  # type: ignore[arg-type]
    ids = [record["id"] for record in records]
    duplicates = sorted({item_id for item_id in ids if ids.count(item_id) > 1})
    if duplicates:
        raise RuntimeError(f"Duplicate intelligence IDs: {', '.join(duplicates)}")
    if not records:
        raise RuntimeError("No intelligence records found in app/page.tsx")
    return records


def read_english_copies(source: str) -> dict[str, dict[str, str]]:
    start = source.index("const englishItemCopies")
    end = source.index("\n};", start)
    copies: dict[str, dict[str, str]] = {}
    for line in source[start:end].splitlines():
        id_match = re.match(r'^\s*"([^"]+)"\s*:', line)
        if not id_match:
            continue
        copy = {field: read_string_field(line, field) for field in CONTENT_FIELDS}
        if all(copy.values()):
            copies[id_match.group(1)] = copy  # type: ignore[assignment]
    return copies


PROTECTED_ENTITIES = {
    "美团": "Meituan",
    "淘宝闪购": "Taobao Instant",
    "淘宝": "Taobao",
    "京东秒送": "JD Instant Delivery",
    "京东物流": "JD Logistics",
    "京东外卖": "JD Food",
    "京东": "JD.com",
    "阿里巴巴": "Alibaba",
    "盒马": "Freshippo",
    "千问": "Qwen",
    "饿了么": "Ele.me",
    "蜂鸟众包": "Fengniao Crowdsourcing",
    "达达秒送": "Dada Instant Delivery",
    "达达": "Dada",
    "顺丰同城": "SF Intra-city",
    "闪送": "Shansong",
    "滴滴": "DiDi",
    "有赞零售": "Youzan Retail",
    "钛牛数码": "Tainiu Digital",
    "抖音": "Douyin",
    "小米": "Xiaomi",
    "华为": "Huawei",
    "苏州交管": "Suzhou Traffic Police",
    "美团新闻中心": "Meituan Newsroom",
    "央广网": "China National Radio",
    "首都之窗": "Beijing Government Portal",
    "中国就业网": "China Employment",
    "人力资源和社会保障部": "China Ministry of Human Resources and Social Security",
    "北京市市场监督管理局": "Beijing Administration for Market Regulation",
    "苏州市市场监督管理局": "Suzhou Administration for Market Regulation",
    "印度尼西亚": "Indonesia",
    "新加坡": "Singapore",
    "马来西亚": "Malaysia",
    "中国": "China",
}

PROTECTED_CONTENT_ENTITIES = (
    "China Ministry of Human Resources and Social Security",
    "Indonesia Ministry of Communication and Digital Affairs",
    "European Transport Safety Council",
    "Soekarno–Hatta",
    "Ruta Logística MX",
    "JD Instant Delivery",
    "SF Intra-city",
    "Fengniao Crowdsourcing",
    "Dada Instant Delivery",
    "China National Radio",
    "Beijing Government Portal",
    "GrabMerchant AI Assistant",
    "ZIM Falcon Service",
    "Swift Logistics",
    "APM Terminals Maasvlakte II",
    "FLS Group Philippines",
    "Envision Energy",
    "PortCalls Asia",
    "Mercado Libre",
    "Taobao Instant",
    "JD Logistics",
    "JD.com",
    "Amazon Flex",
    "GrabFood",
    "KartaDashcam",
    "Konecranes",
    "Dynalogic",
    "Umm Al-Qura",
    "The Jakarta Post",
    "Anak Krakatau",
    "Grupo Abra",
    "Move Brasil",
    "99Compras",
    "project44",
    "LSP44",
    "foodpanda",
    "Freshippo",
    "Meituan",
    "Alibaba",
    "CatPaw",
    "Lalamove",
    "TikTok",
    "Tokgistic",
    "Careem",
    "talabat",
    "Talabat",
    "Maersk",
    "Aramex",
    "FedEx",
    "SEKO",
    "Avianca",
    "ANZAMA",
    "Costco",
    "Rappi",
    "iFood",
    "inDrive",
    "Deliveroo",
    "Grab",
    "Wolt",
    "REWE",
    "Uber",
    "Amazon",
    "DHL",
    "Bring",
    "HERE",
    "Qwen",
    "OVO",
    "PIF",
    "NCMF",
    "ASEAN",
    "ATIGA",
    "AFTA",
    "AEO",
    "ETSC",
    "MAST",
    "MOM",
    "MoHRE",
    "MDIC",
    "MCMC",
    "Anvisa",
    "NCMF",
)


PROTECTED_ENTITY_PATTERN = re.compile(
    "(" + "|".join(re.escape(entity) for entity in sorted(set(PROTECTED_CONTENT_ENTITIES), key=len, reverse=True)) + ")"
)


def split_entities(text: str) -> list[str]:
    return [part for part in PROTECTED_ENTITY_PATTERN.split(text) if part]


def translate_fragment(text: str, source: str, target: str) -> str:
    if not text.strip():
        return text
    leading = text[: len(text) - len(text.lstrip())]
    trailing = text[len(text.rstrip()):]
    return leading + translate.translate(text.strip(), source, target).strip() + trailing


def prepare_english(text: str) -> str:
    replacements = (
        (r"\briders\b", "delivery workers"),
        (r"\brider\b", "delivery worker"),
        (r"\bdispatch\b", "order assignment"),
        (r"\bfulfillment\b", "order fulfillment"),
        (r"\bPlatforms\b", "Digital platforms"),
        (r"\bplatforms\b", "digital platforms"),
    )
    for pattern, replacement in replacements:
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
    return text


def metadata_to_english(text: str) -> str:
    for source, target in sorted(PROTECTED_ENTITIES.items(), key=lambda item: -len(item[0])):
        text = text.replace(source, target)
    return "".join(
        part if part in PROTECTED_CONTENT_ENTITIES or not re.search(r"[\u3400-\u9fff]", part) else translate_fragment(part, "zh", "en")
        for part in split_entities(text)
    )


def translate_text(text: str, target: str, cache: dict[tuple[str, str], str]) -> str:
    key = (text, target)
    if key not in cache:
        cache[key] = "".join(
            part if part in PROTECTED_CONTENT_ENTITIES else translate_fragment(part, "en", target)
            for part in split_entities(prepare_english(text))
        )
    return cache[key]


def main() -> None:
    source = PAGE_PATH.read_text(encoding="utf-8")
    records = read_records(source)
    english_copies = read_english_copies(source)
    missing_english = [record["id"] for record in records if record["id"] not in english_copies]
    if missing_english:
        raise RuntimeError(f"Missing curated English copy: {', '.join(missing_english)}")

    metadata_english = {
        record["id"]: {
            field: metadata_to_english(record[field])
            for field in ("company", "market", "sourceLabel")
        }
        for record in records
    }
    cache: dict[tuple[str, str], str] = {}
    localized: dict[str, dict[str, dict[str, str]]] = {
        "en": {
            record["id"]: {
                **english_copies[record["id"]],
                **metadata_english[record["id"]],
            }
            for record in records
        }
    }
    for target in TARGETS:
        localized[target] = {}
        for index, record in enumerate(records, start=1):
            item_id = record["id"]
            localized[target][item_id] = {
                field: translate_text(
                    english_copies[item_id][field] if field in CONTENT_FIELDS else metadata_english[item_id][field],
                    target,
                    cache,
                )
                for field in FIELDS
            }
            print(f"{target}: {index}/{len(records)}", end="\r", flush=True)
        print()

    for language, records_by_id in MANUAL_CORRECTIONS.items():
        for item_id, corrections in records_by_id.items():
            localized[language][item_id].update(corrections)

    output = (
        "// Generated locally by scripts/generate_intelligence_translations.py.\n"
        "// Static translations only: the website never calls a translation service.\n\n"
        "export type LocalizedItemCopy = {\n"
        "  title: string;\n"
        "  summary: string;\n"
        "  implication: string;\n"
        "  company: string;\n"
        "  market: string;\n"
        "  sourceLabel: string;\n"
        "};\n\n"
        f"export const localizedItemCopies = {json.dumps(localized, ensure_ascii=False, indent=2)} as const;\n"
    )
    OUTPUT_PATH.write_text(output, encoding="utf-8")
    (ROOT / ":memory:.ses").unlink(missing_ok=True)
    print(f"Wrote {len(records)} records × {len(TARGETS) + 1} languages to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
