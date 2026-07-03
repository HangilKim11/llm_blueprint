/* ============================================================
 * LLM Blueprint — all UI strings & educational copy (ko/ja/en)
 * ============================================================ */
window.LLMBP_CAPTIONS = {

  /* ---------------- UI strings ---------------- */
  ui: {
    introKicker: {
      ko: "교육용 도면 · EDUCATIONAL DRAWING",
      ja: "教育用図面 · EDUCATIONAL DRAWING",
      en: "EDUCATIONAL DRAWING",
    },
    introSub: {
      ko: "당신의 질문이 답이 되기까지 — 대규모 언어 모델의 내부를 한 장의 설계도로 펼쳐봅니다.",
      ja: "あなたの質問が答えになるまで ― 大規模言語モデルの内部を一枚の設計図として広げます。",
      en: "From your question to its answer — the inside of a large language model, unrolled as a blueprint.",
    },
    introPick: {
      ko: "질문을 하나 고르세요",
      ja: "質問を一つ選んでください",
      en: "Pick a question",
    },
    introPickSub: {
      ko: "아래로 스크롤하면 이 질문이 잘리고, 숫자가 되고, 계산되어 답변이 되는 전 과정을 따라갑니다.",
      ja: "下にスクロールすると、この質問が刻まれ、数値になり、計算されて答えになる全過程をたどります。",
      en: "Scroll down to follow it as it is cut apart, turned into numbers, computed on, and assembled into an answer.",
    },
    chatLabel: { ko: "선택된 질문", ja: "選択された質問", en: "Selected question" },
    scrollHint: { ko: "스크롤하여 공정 시작", ja: "スクロールして工程開始", en: "Scroll to start the process" },
    tokens: { ko: "토큰", ja: "トークン", en: "TOKENS" },
    compareTitle: {
      ko: "같은 질문, 세 가지 언어",
      ja: "同じ質問、三つの言語",
      en: "Same question, three languages",
    },
    compareNote: {
      ko: "일반적으로 같은 내용이라도 한국어·일본어는 영어보다 많은 토큰을 사용합니다 — 비용과 속도에 직결돼요.",
      ja: "一般に同じ内容でも日本語・韓国語は英語より多くのトークンを使います ― コストと速度に直結します。",
      en: "For the same meaning, Korean and Japanese typically spend more tokens than English — which affects cost and speed.",
    },
    matrixLab: {
      ko: "문장이 숫자 행렬이 되었습니다",
      ja: "文が数値の行列になりました",
      en: "the sentence is now a matrix of numbers",
    },
    semTitle: { ko: "의미 공간 (개념도)", ja: "意味空間（概念図）", en: "Meaning space (conceptual)" },
    semWords: { ko: "하늘,바다,구름,버스", ja: "空,海,雲,バス", en: "sky,sea,cloud,bus" },
    semNote: {
      ko: "뜻이 비슷한 토큰일수록 서로 가까운 좌표를 갖습니다.",
      ja: "意味が近いトークンほど、互いに近い座標を持ちます。",
      en: "Tokens with similar meanings sit close to each other.",
    },
    posNote: {
      ko: "같은 단어라도 문장 속 위치가 다르면 서로 다른 신호가 됩니다.",
      ja: "同じ単語でも文中の位置が違えば、異なる信号になります。",
      en: "The same word at a different position becomes a different signal.",
    },
    ffnNote: {
      ko: "어텐션이 '모아오기'라면, FFN은 토큰 하나하나가 혼자 정보를 소화하는 단계입니다.",
      ja: "アテンションが「集める」段階なら、FFNは各トークンが単独で情報を消化する段階です。",
      en: "If attention gathers, the FFN is where each token digests on its own.",
    },
    ffnStep1: { ko: "① 4배로 펼치기", ja: "① 4倍に広げる", en: "① expand ×4" },
    ffnStep2: { ko: "② 활성화 — 신호 거르기", ja: "② 活性化 — 信号を濾す", en: "② activation — filter" },
    ffnStep3: { ko: "③ 다시 접기", ja: "③ 畳み直す", en: "③ fold back" },
    ffnAll: { ko: "모든 토큰에 동일 적용", ja: "全トークンに同様に適用", en: "applied to every token" },
    recapLoop: {
      ko: "뽑은 토큰을 입력 끝에 붙여, 처음부터 다시 반복",
      ja: "選んだトークンを入力の末尾に付けて、最初から繰り返す",
      en: "append the sampled token, then run the whole pipeline again",
    },
    stackLab: {
      ko: "층을 반복 통과하는 중",
      ja: "層を繰り返し通過中",
      en: "passing through the layers",
    },
    gaugeTitle: { ko: "다음 토큰 후보", ja: "次トークン候補", en: "next-token candidates" },
    others: { ko: "나머지 후보 전체", ja: "残りの候補すべて", en: "all other candidates" },
    loopGauge: { ko: "후보", ja: "候補", en: "candidates" },
    loopCount: { ko: "생성됨", ja: "生成済み", en: "generated" },
    customOpen: { ko: "＋ 직접 질문 입력 (실험실)", ja: "＋ 質問を直接入力（実験室）", en: "＋ Type your own question (lab)" },
    customQPh: { ko: "질문을 입력하세요…", ja: "質問を入力してください…", en: "Type a question…" },
    customAPh: {
      ko: "(선택) 시각화에 사용할 답변 — 비워두면 데모 문장이 사용됩니다",
      ja: "（任意）可視化に使う回答 ― 空欄ならデモ文が使われます",
      en: "(optional) answer to visualize — leave empty for a demo sentence",
    },
    customGo: { ko: "이 질문으로 보기", ja: "この質問で見る", en: "Run with this question" },
    customLoading: { ko: "모델 실행 중…", ja: "モデル実行中…", en: "Running the model…" },
    customHint: {
      ko: "근사 토큰화 사용 · 실제 모델 출력이 아님",
      ja: "近似トークン化 · 実際のモデル出力ではありません",
      en: "approximate tokenization · not a real model output",
    },
    customHintReal: {
      ko: "실제 모델 답변·확률 사용 · 어텐션은 개념도",
      ja: "実際のモデル回答・確率を使用 · アテンションは概念図",
      en: "real model answer & probabilities · attention stays conceptual",
    },
    tryAnother: { ko: "다른 질문으로 다시 보기 ↑", ja: "別の質問でもう一度 ↑", en: "Run another question ↑" },
    viewSource: { ko: "GitHub에서 코드 보기", ja: "GitHubでコードを見る", en: "View source on GitHub" },
    disclaimer: {
      ko: "이 페이지의 어텐션 가중치·확률값은 교육을 위한 개념적 재구성이며, 실제 모델 내부 값이 아닙니다. 토큰 분할은 근사이며, tools/generate_data.py를 tiktoken과 함께 실행하면 실제 o200k 토큰화로 교체됩니다.",
      ja: "本ページのアテンション重み・確率値は教育目的の概念的な再構成であり、実際のモデル内部の値ではありません。トークン分割は近似で、tools/generate_data.py を tiktoken 付きで実行すると実際の o200k トークン化に置き換わります。",
      en: "Attention weights and probabilities on this page are conceptual reconstructions for teaching, not real model internals. Token splits are approximate; run tools/generate_data.py with tiktoken installed to bake real o200k tokenization.",
    },
  },

  /* ---------------- progress rail (kept in English — drawing labels) ---------------- */
  rail: {
    s01: "INPUT", s02: "TOKENIZE", s03: "EMBED", s04: "POSITION",
    s05: "ATTENTION", s06: "FFN", s07: "LAYERS", s08: "SOFTMAX",
    s09: "LOOP", s10: "OUTPUT", s11: "RECAP",
  },

  /* ---------------- scene captions ---------------- */
  s01: {
    tag: "SEC.01 — INPUT",
    title: { ko: "질문이 기계로 들어갑니다", ja: "質問が機械に入ります", en: "Your question enters the machine" },
    body: {
      ko: "전송 버튼을 누른 순간, 문장은 대화 상대가 아니라 <em>원자재</em>가 됩니다. 모델에게 이 문장은 아직 아무 의미 없는 글자들의 나열일 뿐이에요.",
      ja: "送信ボタンを押した瞬間、文は会話相手ではなく<em>原材料</em>になります。モデルにとってこの文は、まだ意味を持たない文字の並びに過ぎません。",
      en: "The moment you hit send, your sentence stops being conversation and becomes <em>raw material</em>. To the model it is still just a string of characters with no meaning at all.",
    },
    deep: {
      ko: "실제 서비스에서는 당신의 질문만 들어가는 게 아니라, 시스템 프롬프트와 이전 대화가 함께 하나의 긴 입력으로 이어집니다. 모델이 한 번에 받아들일 수 있는 최대 길이를 <code>컨텍스트 윈도우</code>라고 하며, 요즘 모델은 수만~수십만 토큰에 달합니다.",
      ja: "実際のサービスでは質問だけでなく、システムプロンプトや過去の対話が一つの長い入力として連結されます。モデルが一度に受け取れる最大長を<code>コンテキストウィンドウ</code>と呼び、最近のモデルでは数万〜数十万トークンに達します。",
      en: "In a real service your question is concatenated with a system prompt and the previous conversation into one long input. The maximum the model can take at once is its <code>context window</code> — tens of thousands to hundreds of thousands of tokens in modern models.",
    },
  },

  s02: {
    tag: "SEC.02 — TOKENIZER",
    title: { ko: "문장을 부품으로 자르기", ja: "文を部品に切り分ける", en: "Cutting the sentence into parts" },
    body: {
      ko: "LLM은 단어가 아니라 <em>토큰</em>이라는 조각 단위로 읽습니다. 자주 함께 쓰이는 글자 묶음일수록 하나의 토큰이 되고, 각 토큰은 사전 속 자기 번호(ID)를 갖습니다.",
      ja: "LLMは単語ではなく<em>トークン</em>という断片単位で読みます。よく一緒に使われる文字のまとまりほど一つのトークンになり、各トークンは辞書内の自分の番号（ID）を持ちます。",
      en: "An LLM reads not in words but in pieces called <em>tokens</em>. Frequently co-occurring character chunks earn their own token, and every token has its number (ID) in the vocabulary.",
    },
    deep: {
      ko: "분할 규칙은 <code>BPE(Byte Pair Encoding)</code>로 학습됩니다: 말뭉치에서 가장 자주 붙어 나오는 쌍을 반복적으로 병합해 어휘를 만들어요. GPT-4o 계열의 어휘(o200k)는 약 20만 개. 어휘가 영어 중심으로 학습되면 한국어·일본어는 더 잘게 쪼개져 같은 내용에 더 많은 토큰 — 즉 더 많은 비용과 시간이 듭니다.",
      ja: "分割規則は<code>BPE（Byte Pair Encoding）</code>で学習されます。コーパスで最も頻繁に隣り合うペアを繰り返し併合して語彙を作ります。GPT-4o系の語彙（o200k）は約20万。語彙が英語中心だと日本語・韓国語は細かく割れ、同じ内容でもトークン数 ― つまりコストと時間が増えます。",
      en: "The splitting rules are learned with <code>BPE (Byte Pair Encoding)</code>: repeatedly merge the most frequent adjacent pairs in a corpus to build a vocabulary. The GPT-4o family vocabulary (o200k) has ~200k entries. When the vocabulary is English-heavy, Korean and Japanese fragment finer — more tokens, more cost, more latency for the same content.",
    },
  },

  s03: {
    tag: "SEC.03 — EMBEDDING",
    title: { ko: "번호가 좌표가 되다", ja: "番号が座標になる", en: "Numbers become coordinates" },
    body: {
      ko: "토큰 ID는 거대한 <em>임베딩 표</em>에서 자기 행을 찾아, 수백~수천 개의 숫자 배열(벡터)로 바뀝니다. 이 숫자들이 곧 그 토큰의 <em>의미 좌표</em> — 비슷한 말은 가까운 곳에 놓입니다.",
      ja: "トークンIDは巨大な<em>埋め込み表</em>で自分の行を見つけ、数百〜数千個の数値の配列（ベクトル）に変わります。この数値こそがそのトークンの<em>意味の座標</em> ― 似た言葉は近くに置かれます。",
      en: "Each token ID looks up its row in a giant <em>embedding table</em> and becomes an array of hundreds to thousands of numbers — a vector. Those numbers are the token's <em>coordinates of meaning</em>: similar words sit close together.",
    },
    deep: {
      ko: "임베딩 행렬의 크기는 <code>어휘 수 × 차원 수</code>. 예컨대 20만 × 4,096이면 이 표 하나가 8억 개의 학습된 숫자입니다. 값은 사람이 정하지 않고 학습 과정에서 저절로 형성돼요. 화면의 히트맵과 산점도는 개념을 보여주기 위한 재구성이며 실제 값이 아닙니다.",
      ja: "埋め込み行列の大きさは<code>語彙数 × 次元数</code>。例えば20万 × 4,096なら、この表一つで8億個の学習された数値です。値は人が決めるのではなく学習の過程で自然に形成されます。画面のヒートマップと散布図は概念を示すための再構成で、実際の値ではありません。",
      en: "The embedding matrix is <code>vocabulary × dimensions</code> — say 200k × 4,096, i.e. 800 million learned numbers in this one table. Nobody sets these values by hand; they emerge during training. The heatmaps and scatter here are conceptual reconstructions, not real values.",
    },
  },

  s04: {
    tag: "SEC.04 — POSITION",
    title: { ko: "순서를 새겨 넣다", ja: "順序を刻み込む", en: "Stamping in the order" },
    body: {
      ko: "벡터 묶음만으로는 <em>\"개가 사람을 문다\"</em>와 <em>\"사람이 개를 문다\"</em>를 구분할 수 없어요. 그래서 각 토큰에 자기 위치를 나타내는 신호를 더해, 순서 정보를 새깁니다.",
      ja: "ベクトルの集まりだけでは<em>「犬が人を噛む」</em>と<em>「人が犬を噛む」</em>を区別できません。そこで各トークンに自分の位置を表す信号を加え、順序の情報を刻みます。",
      en: "A bag of vectors cannot tell <em>\"dog bites man\"</em> from <em>\"man bites dog\"</em>. So each token gets a positional signal mixed in, engraving word order into the numbers.",
    },
    deep: {
      ko: "고전적 방법은 위치마다 다른 주기의 <code>sin/cos</code> 파형을 더하는 것(sinusoidal PE). 최신 모델 다수는 벡터를 위치만큼 '회전'시키는 <code>RoPE(Rotary Position Embedding)</code>를 써서 상대적 거리를 자연스럽게 다룹니다.",
      ja: "古典的な方法は位置ごとに周期の異なる<code>sin/cos</code>波形を加えること（sinusoidal PE）。最近のモデルの多くはベクトルを位置分だけ「回転」させる<code>RoPE（Rotary Position Embedding）</code>を使い、相対距離を自然に扱います。",
      en: "The classic method adds <code>sin/cos</code> waves of different frequencies per position (sinusoidal PE). Most recent models instead use <code>RoPE (Rotary Position Embedding)</code>, rotating each vector by its position so relative distances fall out naturally.",
    },
  },

  s05: {
    tag: "SEC.05 — SELF-ATTENTION",
    title: { ko: "토큰들이 서로를 바라보다", ja: "トークン同士が見つめ合う", en: "Tokens look at each other" },
    body: {
      ko: "각 토큰은 <em>자기보다 앞에 온</em> 토큰들을 둘러보고, 관련이 깊은 토큰의 정보를 끌어옵니다. 선이 굵을수록 강하게 주목(attention)하고 있다는 뜻이에요. 문맥을 이해하는 심장부입니다.",
      ja: "各トークンは<em>自分より前に来た</em>トークンを見回し、関連の深いトークンの情報を引き寄せます。線が太いほど強く注目（attention）しているという意味。文脈理解の心臓部です。",
      en: "Each token surveys the tokens <em>before it</em> and pulls in information from the most relevant ones. Thicker wires mean stronger attention. This is the heart of understanding context.",
    },
    deep: {
      ko: "각 토큰은 세 벡터를 만듭니다: 무엇을 찾는지(<code>Query</code>), 자신이 무엇인지(<code>Key</code>), 전달할 내용(<code>Value</code>). 점수는 <code>softmax(QKᵀ/√d)·V</code>로 계산되고, 이런 '시선'이 헤드마다 다른 관점으로 수십 개 병렬 실행됩니다(멀티헤드). GPT류는 미래 토큰을 못 보게 가리는 <code>causal mask</code>를 씁니다. 화면의 연결선은 개념적 예시입니다.",
      ja: "各トークンは三つのベクトルを作ります。何を探すか（<code>Query</code>）、自分は何か（<code>Key</code>）、渡す内容（<code>Value</code>）。スコアは<code>softmax(QKᵀ/√d)·V</code>で計算され、この「視線」がヘッドごとに異なる観点で数十個並列に走ります（マルチヘッド）。GPT系は未来のトークンを隠す<code>causal mask</code>を使います。画面の接続線は概念的な例示です。",
      en: "Every token produces three vectors: what it seeks (<code>Query</code>), what it is (<code>Key</code>), and what it carries (<code>Value</code>). Scores follow <code>softmax(QKᵀ/√d)·V</code>, and dozens of such gazes run in parallel with different perspectives (multi-head). GPT-style models add a <code>causal mask</code> hiding future tokens. The wires shown here are conceptual examples.",
    },
  },

  s06: {
    tag: "SEC.06 — FEED-FORWARD",
    title: { ko: "한 토큰씩, 깊이 생각하기", ja: "一トークンずつ、深く考える", en: "Each token thinks it over" },
    body: {
      ko: "어텐션으로 모아온 정보를 이번엔 각 토큰이 <em>혼자서</em> 소화합니다. 벡터를 4배 넓게 펼쳤다가 다시 접으며, 배워둔 패턴으로 정보를 걸러내고 변형해요.",
      ja: "アテンションで集めた情報を、今度は各トークンが<em>単独で</em>消化します。ベクトルを4倍に広げてまた畳み、学習済みのパターンで情報を濾過・変形します。",
      en: "Now each token digests what attention gathered — <em>alone</em>. Its vector is expanded about 4× wide, filtered through learned patterns, and folded back down.",
    },
    deep: {
      ko: "구조는 단순합니다: 선형층 → 활성함수(<code>GELU</code>/<code>SwiGLU</code>) → 선형층. 하지만 모델 파라미터의 약 3분의 2가 여기에 살고, 학습된 '지식'의 상당 부분이 FFN에 저장된다는 연구들이 있습니다.",
      ja: "構造は単純です：線形層 → 活性化関数（<code>GELU</code>/<code>SwiGLU</code>）→ 線形層。しかしモデルのパラメータの約3分の2がここにあり、学習された「知識」の多くがFFNに保存されるという研究があります。",
      en: "The structure is simple: linear layer → activation (<code>GELU</code>/<code>SwiGLU</code>) → linear layer. Yet roughly two-thirds of the model's parameters live here, and studies suggest much of a model's stored \"knowledge\" resides in these FFNs.",
    },
  },

  s07: {
    tag: "SEC.07 — LAYER STACK",
    title: { ko: "같은 공정을 수십 번", ja: "同じ工程を数十回", en: "The same process, dozens of times" },
    body: {
      ko: "방금 본 <em>어텐션 + FFN</em> 한 세트가 '층(layer)' 하나입니다. 이 층을 수십 번 통과할 때마다 벡터는 문장 전체의 뜻을 점점 더 깊게 담은 표현으로 정제됩니다.",
      ja: "先ほど見た<em>アテンション + FFN</em>の1セットが「層（layer）」です。この層を数十回通過するたびに、ベクトルは文全体の意味をより深く含んだ表現へと精製されます。",
      en: "One <em>attention + FFN</em> pair is a single layer. Passing through dozens of them, the vectors are progressively refined into representations that carry the meaning of the whole sentence.",
    },
    deep: {
      ko: "규모 감각: GPT-2는 12~48층·차원 768~1600, 7B급 오픈 모델은 32층·4096차원, 최전선 모델은 100층 이상으로 추정됩니다. 각 층의 출력은 <code>residual connection</code>으로 입력에 더해지고 <code>layer norm</code>으로 안정화되어, 이렇게 깊어도 학습이 가능합니다.",
      ja: "規模の感覚：GPT-2は12〜48層・次元768〜1600、7B級オープンモデルは32層・4096次元、最前線のモデルは100層以上と推定されます。各層の出力は<code>residual connection</code>で入力に加算され、<code>layer norm</code>で安定化されるため、これほど深くても学習できます。",
      en: "For scale: GPT-2 had 12–48 layers at 768–1600 dims; 7B-class open models run 32 layers × 4096 dims; frontier models are estimated at 100+ layers. Each layer's output is added back via <code>residual connections</code> and stabilized by <code>layer norm</code> — that's what makes such depth trainable.",
    },
  },

  s08: {
    tag: "SEC.08 — OUTPUT HEAD",
    title: { ko: "다음 토큰의 오디션", ja: "次トークンのオーディション", en: "The next-token audition" },
    body: {
      ko: "모든 층을 통과한 <em>마지막 토큰의 벡터</em>를 어휘 전체(약 20만 후보)와 대조해 점수를 매깁니다. 이 점수(logit)를 softmax로 확률로 바꾸면 — '다음 토큰' 후보 순위표가 완성됩니다.",
      ja: "全ての層を通過した<em>最後のトークンのベクトル</em>を語彙全体（約20万候補）と照合し、スコアを付けます。このスコア（logit）をsoftmaxで確率に変えると ― 「次トークン」候補ランキングの完成です。",
      en: "The <em>final token's vector</em>, after all the layers, is scored against the entire vocabulary (~200k candidates). Softmax turns those scores (logits) into probabilities — a ranked shortlist for the next token.",
    },
    deep: {
      ko: "<code>pᵢ = e^(zᵢ/T) / Σⱼ e^(zⱼ/T)</code>. 온도 <code>T</code>를 낮추면 1등에 몰빵(결정적), 높이면 하위 후보에게도 기회(다양성)가 갑니다. 챗봇의 '창의성' 설정이 바로 이 값이에요.",
      ja: "<code>pᵢ = e^(zᵢ/T) / Σⱼ e^(zⱼ/T)</code>。温度<code>T</code>を下げると1位に集中（決定的）、上げると下位候補にもチャンス（多様性）が回ります。チャットボットの「創造性」設定はまさにこの値です。",
      en: "<code>pᵢ = e^(zᵢ/T) / Σⱼ e^(zⱼ/T)</code>. Lower the temperature <code>T</code> and probability piles onto the winner (deterministic); raise it and lower-ranked candidates get a chance (diversity). A chatbot's \"creativity\" dial is exactly this.",
    },
  },

  s09: {
    tag: "SEC.09 — AUTOREGRESSIVE LOOP",
    title: { ko: "하나 뽑고, 처음부터 다시", ja: "一つ選んで、最初からもう一度", en: "Pick one, then start over" },
    body: {
      ko: "확률표에서 토큰을 <em>하나</em> 뽑아 문장 끝에 붙입니다. 그리고 한 토큰만큼 길어진 문장으로 방금 그 공정 전체를 <em>다시</em> 돌려요. 답변은 이렇게 한 조각씩 자라납니다.",
      ja: "確率表からトークンを<em>一つ</em>選び、文末に付け加えます。そして1トークン分長くなった文で、先ほどの工程全体を<em>もう一度</em>回します。答えはこうして一欠片ずつ育っていきます。",
      en: "One token is sampled from the table and appended to the sequence. Then the <em>entire</em> process runs again on the now slightly-longer input. The answer grows one piece at a time.",
    },
    deep: {
      ko: "이 방식을 <code>자기회귀(autoregressive)</code> 생성이라 합니다. 항상 1등만 뽑으면 greedy, 확률대로 추첨하면 sampling, 상위 누적 p%에서만 뽑으면 <code>top-p</code>. 챗봇 답변이 타자 치듯 흘러나오는 건 연출이 아니라 실제로 이렇게 하나씩 만들어지기 때문입니다. 매번 전체를 다시 계산하는 대신 이전 계산을 재활용하는 <code>KV cache</code>로 속도를 법니다.",
      ja: "この方式を<code>自己回帰（autoregressive）</code>生成と呼びます。常に1位だけ選べばgreedy、確率通りに抽選すればsampling、上位累積p%からだけ選べば<code>top-p</code>。チャットボットの答えがタイプするように流れ出るのは演出ではなく、実際にこうして一つずつ作られているからです。毎回全体を再計算する代わりに、以前の計算を再利用する<code>KV cache</code>で速度を稼ぎます。",
      en: "This is <code>autoregressive</code> generation. Always taking the winner is greedy decoding; drawing by probability is sampling; restricting to the top cumulative p% is <code>top-p</code>. Chatbot answers stream out word-by-word not for show — they really are built one token at a time. A <code>KV cache</code> reuses previous computations so each new token doesn't recompute everything.",
    },
  },

  s10: {
    tag: "SEC.10 — OUTPUT",
    title: { ko: "답변 완성", ja: "回答完成", en: "The answer, assembled" },
    body: {
      ko: "모델이 <em>EOS(end-of-sequence)</em> 토큰을 뽑는 순간 생성이 멈춥니다. 지금까지 쌓인 조각들을 이어 붙인 것 — 그게 바로 당신이 화면에서 보는 답변입니다.",
      ja: "モデルが<em>EOS（end-of-sequence）</em>トークンを選んだ瞬間、生成は止まります。ここまで積み上げた欠片をつなぎ合わせたもの ― それがあなたが画面で見る答えです。",
      en: "The moment the model samples the <em>EOS (end-of-sequence)</em> token, generation stops. The accumulated pieces, joined together — that is the answer you see on screen.",
    },
    deep: {
      ko: "EOS 외에도 서비스가 지정한 <code>stop sequence</code>를 만나거나 최대 길이에 닿으면 멈춥니다. 스트리밍 UI는 이 토큰 생성 과정을 실시간으로 중계하는 것뿐이에요. 참고로 이 페이지가 다룬 것은 <em>추론(inference)</em>이고, 모델이 애초에 어떻게 이런 능력을 갖추게 되는지는 <em>학습(training)</em>이라는 별도의 도면이 필요합니다.",
      ja: "EOS以外にも、サービスが指定した<code>stop sequence</code>に出会うか最大長に達すると停止します。ストリーミングUIはこのトークン生成過程をリアルタイムで中継しているだけです。なお本ページが扱ったのは<em>推論（inference）</em>であり、モデルがそもそもどうやってこの能力を得るのかは<em>学習（training）</em>という別の図面が必要です。",
      en: "Generation also stops at service-defined <code>stop sequences</code> or a length limit. A streaming UI is simply broadcasting this token-by-token process live. Note this page covered <em>inference</em> — how the model came to have these abilities is <em>training</em>, a blueprint for another day.",
    },
  },

  recap: {
    title: { ko: "전체 도면", ja: "全体図面", en: "The full drawing" },
    body: {
      ko: "방금 지나온 모든 공정입니다. 노드를 클릭하면 해당 구간으로 돌아갑니다.",
      ja: "先ほど通ってきた全工程です。ノードをクリックするとその区間に戻ります。",
      en: "Every stage you just travelled. Click a node to revisit it.",
    },
  },
};
