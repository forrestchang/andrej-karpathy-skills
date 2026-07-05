#!/usr/bin/env python3
"""農產品分類查詢工具。

用法：
    python3 lookup.py <作物名稱關鍵字>          # 查單一作物的分類
    python3 lookup.py --family <科名>           # 列出某科的作物
    python3 lookup.py --cat <大分類名稱>        # 列出某大分類下的次分類

範例：
    python3 lookup.py 甜椒
    python3 lookup.py 番茄
    python3 lookup.py --family 茄科
    python3 lookup.py --cat 蔬菜類

分類階層（由大到小）：
    大分類(PLV1) > 次分類(PLV2) > 科(PLV5) > 作物(PLV3) > 品種(PLV4)
"""
import json
import os
import sys

DATA = os.path.join(os.path.dirname(__file__), "..", "data", "crop-classification.json")


def load():
    with open(DATA, encoding="utf-8") as f:
        return json.load(f)


def path(d):
    parts = [d["PLV1_NAME"], d["PLV2_NAME"], d["PLV5_NAME"], d["PLV3_NAME"], d["PLV4_NAME"]]
    return " > ".join(p for p in parts if p)


def lookup_crop(data, kw):
    hits = [d for d in data
            if kw in d["CNAME"] or kw in d["PLV3_NAME"] or kw in d["ALIAS_CNAME"]]
    if not hits:
        print(f"查無「{kw}」相關作物")
        return
    # 以「作物(PLV3) + 大分類」去重，呈現分類歸屬
    seen = {}
    for d in hits:
        key = (d["PLV3_NAME"], d["PLV1_NAME"], d["PLV2_NAME"], d["PLV5_NAME"])
        seen.setdefault(key, d)
    print(f"「{kw}」共 {len(hits)} 筆，歸屬分類：")
    for (crop, c1, c2, fam), d in seen.items():
        line = f"  ● {crop or '(未指定)'}：{c1} > {c2}"
        if fam:
            line += f" > {fam}"
        print(line)


def list_family(data, fam):
    crops = sorted({d["PLV3_NAME"] for d in data if d["PLV5_NAME"] == fam and d["PLV3_NAME"]})
    if not crops:
        print(f"查無「{fam}」這個科")
        return
    print(f"{fam} 共含 {len(crops)} 種作物：")
    print("  " + "、".join(crops))


def list_cat(data, cat):
    subs = sorted({d["PLV2_NAME"] for d in data if d["PLV1_NAME"] == cat and d["PLV2_NAME"]})
    if not subs:
        print(f"查無「{cat}」這個大分類")
        return
    print(f"{cat} 下的次分類：")
    print("  " + "、".join(subs))


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        return
    data = load()
    if args[0] == "--family":
        list_family(data, args[1])
    elif args[0] == "--cat":
        list_cat(data, args[1])
    else:
        lookup_crop(data, args[0])


if __name__ == "__main__":
    main()
