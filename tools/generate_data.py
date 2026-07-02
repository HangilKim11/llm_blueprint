#!/usr/bin/env python3
"""
LLM Blueprint — preset question data baker.

Usage:
    python tools/generate_data.py            # writes data/questions.data.js

Tokenizer:
  * If `tiktoken` is installed AND its BPE file can be downloaded,
    real o200k_base tokenization (GPT-4o family) is used.
  * Otherwise a deterministic GPT-style heuristic tokenizer is used
    (same logic as js/tokenizer.js, so custom-input mode matches).

Everything is deterministic (seeded per question id) so the output is
reproducible and diff-friendly.
"""

import json
import random
import re
import sys
from pathlib import Path

# ---------------------------------------------------------------- tokenizer

def _fnv1a(s: str) -> int:
    h = 0x811C9DC5
    for ch in s.encode("utf-8"):
        h ^= ch
        h = (h * 0x01000193) & 0xFFFFFFFF
    return h

def fake_id(tok: str) -> int:
    """Deterministic pseudo token id in o200k-like range."""
    return _fnv1a(tok) % 199_998 + 1

KO_SUFFIX2 = ["가요", "나요", "어요", "아요", "세요", "지요", "까요", "네요",
              "예요", "에요", "니다", "는데", "지만", "면서", "이며"]
KO_PART1 = set("은는이가을를에의도만와과로서요죠고며")
JA_PART1 = set("はがをにのとももでへやか")

RE_SPACE = re.compile(r"^\s+")
RE_LATIN = re.compile(r"^[A-Za-z]+")
RE_DIGIT = re.compile(r"^[0-9]+")
RE_PUNCT = re.compile(r"^[^\w\s぀-ヿ㐀-鿿가-힯]")
RE_HANGUL = re.compile(r"^[가-힯]+")
RE_KANJI = re.compile(r"^[㐀-鿿々]+")
RE_HIRA = re.compile(r"^[぀-ゟー]+")
RE_KATA = re.compile(r"^[゠-ヿー]+")

def _chunk(s: str, n: int):
    return [s[i:i + n] for i in range(0, len(s), n)]

def _split_hangul(run: str):
    """Split a hangul run: peel 2-char endings / 1-char particles, chunk rest by 2."""
    out = []
    for suf in KO_SUFFIX2:
        if len(run) > 2 and run.endswith(suf):
            out = _split_hangul(run[:-2]) + [suf]
            return out
    if len(run) > 1 and run[-1] in KO_PART1:
        return _split_hangul(run[:-1]) + [run[-1]]
    return _chunk(run, 2)

def _split_hira(run: str):
    out = []
    if len(run) > 1 and run[0] in JA_PART1:
        out.append(run[0])
        run = run[1:]
    out.extend(_chunk(run, 2))
    return out

def heuristic_tokenize(text: str):
    """GPT-style tokens: leading space glued to the next piece."""
    toks, pending_space, i = [], "", 0
    while i < len(text):
        rest = text[i:]
        m = RE_SPACE.match(rest)
        if m:
            pending_space = " "
            i += m.end()
            continue
        for regex, splitter in (
            (RE_LATIN, lambda s: _chunk(s, 4) if len(s) > 6 else [s]),
            (RE_DIGIT, lambda s: _chunk(s, 3)),
            (RE_HANGUL, _split_hangul),
            (RE_KANJI, lambda s: _chunk(s, 2)),
            (RE_KATA, lambda s: _chunk(s, 3)),
            (RE_HIRA, _split_hira),
            (RE_PUNCT, lambda s: [s]),
        ):
            m = regex.match(rest)
            if m:
                pieces = splitter(m.group(0))
                pieces[0] = pending_space + pieces[0]
                pending_space = ""
                toks.extend(pieces)
                i += m.end()
                break
        else:  # unknown char
            toks.append(pending_space + rest[0])
            pending_space = ""
            i += 1
    return toks

def get_tokenizer():
    try:
        import tiktoken
        enc = tiktoken.get_encoding("o200k_base")
        enc.encode("test")  # force BPE download now

        def tok(text):
            ids = enc.encode(text)
            return [{"t": enc.decode([tid]), "id": tid} for tid in ids]
        return tok, "tiktoken/o200k_base"
    except Exception as e:
        print(f"[info] tiktoken unavailable ({type(e).__name__}) -> heuristic tokenizer")

        def tok(text):
            return [{"t": t, "id": fake_id(t)} for t in heuristic_tokenize(text)]
        return tok, "heuristic-v1"

# ---------------------------------------------------------------- content

# Distractor pools for top-k candidates (plausible "next word" alternatives).
POOL = {
    "ko": ["그리고", "하지만", "왜냐하면", "빛", "공기", "물", "우리", "아주",
           "조금", "이렇게", "때문에", "다른", "사람", "여러", "가장", "다시"],
    "ja": ["そして", "しかし", "なぜなら", "光", "空気", "水", "私たち", "とても",
           "少し", "このように", "ため", "他の", "人", "色々", "最も", "また"],
    "en": [" and", " but", " because", " light", " air", " water", " the", " very",
           " some", " this", " so", " other", " people", " many", " most", " then"],
}

QUESTIONS = [
    # ---- Korean -----------------------------------------------------------
    dict(
        id="sky-ko", lang="ko", group="sky",
        question="하늘은 왜 파란가요?",
        answer="햇빛이 공기 분자에 부딪히면 파장이 짧은 파란빛이 사방으로 훨씬 많이 흩어져요. 그래서 낮 하늘은 어디를 봐도 파랗게 보여요.",
        att=[("파란", "하늘", "형용사가 주어를 참조"), ("왜", "파란", "의문사가 서술어에 주목")],
        notes={
            "ko": "조사 '은'이 별도 토큰으로 잘리는 것에 주목하세요. 한국어는 교착어라 조사·어미가 자주 독립 토큰이 됩니다.",
            "ja": "助詞「은」が独立したトークンに分かれる点に注目。韓国語は膠着語なので助詞・語尾が別トークンになりがちです.",
            "en": "Notice how the particle '은' becomes its own token — Korean is agglutinative, so particles and endings often split off.",
        },
    ),
    dict(
        id="kimchi-ko", lang="ko", group=None,
        question="김치는 왜 시어지나요?",
        answer="김치 속 유산균이 배추의 당분을 먹고 젖산을 만들기 때문이에요. 젖산이 쌓일수록 김치는 점점 더 시어져요.",
        att=[("시어", "김치", "서술어가 주어를 참조"), ("왜", "시어", "의문사가 서술어에 주목")],
        notes={
            "ko": "'시어지나요'처럼 어미가 여러 토큰으로 쪼개지는 모습을 볼 수 있어요.",
            "ja": "「시어지나요」のように語尾が複数トークンに分割される様子が見られます。",
            "en": "Watch the verb ending '시어지나요' fragment into multiple tokens.",
        },
    ),
    dict(
        id="ai-ko", lang="ko", group=None,
        question="AI는 어떻게 글을 쓰나요?",
        answer="수많은 글에서 배운 패턴으로 다음에 올 단어를 확률로 예측해요. 그 단어를 하나씩 이어 붙이면 문장이 완성돼요.",
        att=[("쓰", "AI", "동사가 주어를 참조"), ("어떻게", "쓰", "의문사가 동사에 주목")],
        notes={
            "ko": "이 질문의 답은 지금 이 페이지가 보여주는 과정 그 자체예요. 메타 질문!",
            "ja": "この質問の答えは、まさにこのページが見せている過程そのものです。メタな質問！",
            "en": "The answer to this one is literally the process this page is showing you. How meta!",
        },
    ),
    # ---- Japanese ---------------------------------------------------------
    dict(
        id="sky-ja", lang="ja", group="sky",
        question="空はなぜ青いの？",
        answer="太陽の光が空気の分子にぶつかると、波長の短い青い光がいちばん強く散らばります。だから昼の空はどこを見ても青く見えるのです。",
        att=[("青い", "空", "形容詞が主語を参照"), ("なぜ", "青い", "疑問詞が述語に注目")],
        notes={
            "ko": "일본어는 띄어쓰기가 없어서 모델이 토큰 단위로 단어 경계를 스스로 찾아야 해요.",
            "ja": "日本語には分かち書きがないため、モデルはトークン単位で単語の境界を自ら見つける必要があります。",
            "en": "Japanese has no spaces — the model must discover word boundaries through tokens alone.",
        },
    ),
    dict(
        id="cat-ja", lang="ja", group=None,
        question="猫はなぜ喉を鳴らすの？",
        answer="猫は喉の筋肉を細かく震わせてゴロゴロと音を出します。安心しているときや甘えたいときのサインだと考えられています。",
        att=[("鳴らす", "猫", "動詞が主語を参照"), ("喉", "鳴らす", "目的語が動詞と結合")],
        notes={
            "ko": "'ゴロゴロ' 같은 의성어가 어떻게 토큰화되는지 살펴보세요.",
            "ja": "「ゴロゴロ」のようなオノマトペがどうトークン化されるか見てみましょう。",
            "en": "See how the onomatopoeia 'ゴロゴロ' (purring) gets tokenized.",
        },
    ),
    dict(
        id="ai-ja", lang="ja", group=None,
        question="AIはどうやって文章を書くの？",
        answer="大量の文章から学んだパターンで、次に来る言葉を確率で予測します。その言葉を一つずつつなげると文章ができあがります。",
        att=[("書く", "AI", "動詞が主語を参照"), ("どうやって", "書く", "疑問詞が動詞に注目")],
        notes={
            "ko": "답변이 곧 이 페이지의 작동 원리예요.",
            "ja": "答えがそのままこのページの仕組みです。",
            "en": "The answer describes exactly what this page is doing.",
        },
    ),
    # ---- English ----------------------------------------------------------
    dict(
        id="sky-en", lang="en", group="sky",
        question="Why is the sky blue?",
        answer="Sunlight scatters when it hits air molecules, and short blue wavelengths scatter far more than red ones. That is why the daytime sky looks blue everywhere.",
        att=[("blue", "sky", "adjective refers to subject"), ("Why", "blue", "question word focuses the predicate")],
        notes={
            "ko": "영어는 대체로 '한 단어 ≈ 한 토큰'이라 셋 중 토큰 수가 가장 적어요. 언어별 비교를 확인해 보세요.",
            "ja": "英語はほぼ「1単語 ≈ 1トークン」なので、3言語の中でトークン数が最少。言語比較をチェック！",
            "en": "English mostly maps one word to one token — the fewest tokens of the three languages. Check the comparison!",
        },
    ),
    dict(
        id="plane-en", lang="en", group=None,
        question="How do planes fly?",
        answer="A wing is shaped so air moves faster over its top, creating lower pressure above it. That pressure difference produces lift that holds the plane up.",
        att=[("fly", "planes", "verb refers to subject"), ("How", "fly", "question word focuses the verb")],
        notes={
            "ko": "짧은 영어 단어들은 거의 1:1로 토큰이 되는 것을 볼 수 있어요.",
            "ja": "短い英単語はほぼ1対1でトークンになることが分かります。",
            "en": "Short common English words map almost one-to-one onto tokens.",
        },
    ),
    dict(
        id="ai-en", lang="en", group=None,
        question="How does AI write text?",
        answer="It predicts the most likely next token from patterns learned across huge amounts of text. Repeating that prediction one token at a time builds a full answer.",
        att=[("write", "AI", "verb refers to subject"), ("How", "write", "question word focuses the verb")],
        notes={
            "ko": "답변 속 'token'이라는 단어가 실제로 하나의 토큰이 되는 재귀적 순간을 즐겨 보세요.",
            "ja": "答えの中の「token」という単語が実際に1トークンになる再帰的な瞬間をお楽しみください。",
            "en": "Enjoy the recursion: the word 'token' in the answer is itself a single token.",
        },
    ),
]

# ---------------------------------------------------------------- builders

def find_token_index(tokens, substr, from_end=False):
    rng = range(len(tokens) - 1, -1, -1) if from_end else range(len(tokens))
    for i in rng:
        if substr in tokens[i]["t"] or tokens[i]["t"].strip() in substr and tokens[i]["t"].strip():
            if substr.startswith(tokens[i]["t"].strip()) or tokens[i]["t"].strip() in substr or substr in tokens[i]["t"]:
                return i
    return None

def build_attention(tokens, att_specs):
    highlights = []
    for a, b, label in att_specs:
        ia = find_token_index(tokens, a, from_end=True)
        ib = find_token_index(tokens, b)
        if ia is not None and ib is not None and ia != ib:
            highlights.append({"from": ia, "to": ib, "w": 0.85, "label": label})
    return highlights

def build_steps(answer_tokens, lang, rng):
    """Per answer token: top-5 candidates (chosen + 4 distractors) + 'others' mass."""
    steps = []
    pool = POOL[lang]
    texts = [t["t"] for t in answer_tokens]
    for i, tok in enumerate(answer_tokens):
        chosen_p = round(rng.uniform(0.34, 0.78), 2)
        distract = []
        cand_pool = [c for c in pool if c != tok["t"]] + \
                    [t for j, t in enumerate(texts) if j != i and t.strip() and t != tok["t"]]
        rng.shuffle(cand_pool)
        seen = {tok["t"].strip()}
        for c in cand_pool:
            k = c.strip()
            if k and k not in seen:
                distract.append(c)
                seen.add(k)
            if len(distract) == 4:
                break
        remain = round(1.0 - chosen_p, 4)
        weights = sorted([rng.random() for _ in distract], reverse=True)
        wsum = sum(weights) or 1.0
        ps = [round(remain * 0.72 * w / wsum, 3) for w in weights]
        top = [{"t": tok["t"], "p": chosen_p}] + \
              [{"t": d, "p": p} for d, p in zip(distract, ps)]
        others = round(max(0.0, 1.0 - sum(x["p"] for x in top)), 3)
        steps.append({"topK": top, "others": others})
    return steps

def main():
    root = Path(__file__).resolve().parent.parent
    out_path = root / "data" / "questions.data.js"
    tok, tok_name = get_tokenizer()

    questions = []
    for q in QUESTIONS:
        rng = random.Random(_fnv1a(q["id"]))
        tokens = tok(q["question"])
        answer_tokens = tok(q["answer"])
        questions.append({
            "id": q["id"], "lang": q["lang"], "group": q["group"],
            "question": q["question"], "answer": q["answer"],
            "tokens": tokens, "answerTokens": answer_tokens,
            "attention": {"highlights": build_attention(tokens, q["att"]),
                          "procedural": "distance-decay"},
            "steps": build_steps(answer_tokens, q["lang"], rng),
            "notes": q["notes"],
        })
        print(f"  {q['id']:>10}: {len(tokens):>2} q-tokens, {len(answer_tokens):>2} a-tokens")

    payload = {"meta": {"tokenizer": tok_name, "version": 1}, "questions": questions}
    js = ("// AUTO-GENERATED by tools/generate_data.py — do not edit by hand.\n"
          "// Re-run the script (with tiktoken installed for real o200k ids).\n"
          "window.LLMBP_DATA = "
          + json.dumps(payload, ensure_ascii=False, indent=1)
          + ";\n")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(js, encoding="utf-8")
    print(f"[ok] tokenizer={tok_name} -> {out_path}")

if __name__ == "__main__":
    sys.exit(main())
