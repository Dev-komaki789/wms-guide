import type { TechNote } from './types'

// 技術メモ3: カメラでバーコード読取（BarcodeDetector）。
export const note3Camera: TechNote = {
  id: 'camera',
  num: 3,
  title: 'カメラでバーコードを読む ― BarcodeDetector',
  summary: '専用のハンディスキャナが無くても、スマホのカメラでバーコードを読めるようにした仕組みです。外部ライブラリを使わず、ブラウザ標準の機能だけで実装しました。',
  source: 'static/js/camera_scan.js / templates/a/handheld_base.html',
  intro: [
    '倉庫の作業は、棚や商品のバーコードを「ピッ」と読み取って進みます。本来は専用のハンディスキャナを使いますが、WMS ではスマホのカメラでも読めるようにしました。',
    'ポイントは「重い外部ライブラリを入れず、ブラウザに最初から入っている BarcodeDetector という機能を使った」ことです。',
  ],
  sections: [
    {
      id: 'idea',
      heading: '3-1. 基本のアイデア ― 既存の入力欄に“乗せる”',
      body: [
        'もともと WMS のハンディ画面は、専用スキャナの「バーコードを読む＝テキストを入力して Enter」という動きに合わせて作ってあります。つまり「入力欄に文字が入って Enter が押される」と処理が進む作りです。',
        'そこでカメラ機能は、この仕組みをそっくり再利用しました。カメラで読み取った値を入力欄に入れて、プログラムから Enter を押す（イベントを発火する）だけ。既存の処理ルートにそのまま乗るので、画面ごとの作り直しが不要です。',
      ],
      mermaid: `flowchart LR\n  A["カメラでバーコードを読む"] --> B["読み取った値を<br/>入力欄に入れる"]\n  B --> C["Enter キーを<br/>プログラムから発火"]\n  C --> D["既存のスキャン処理が動く"]`,
    },
    {
      id: 'barcodedetector',
      heading: '3-2. BarcodeDetector ― ブラウザ標準の読取機能',
      body: [
        'バーコードの読み取りには BarcodeDetector を使います。これは一部のブラウザ（Android の Chrome / Edge など）に最初から入っている機能で、画像やカメラ映像からバーコードを見つけて文字に変換してくれます。',
        '流れは「カメラ映像をもらう → 一定間隔でフレームを BarcodeDetector に渡す → 見つかったら値を取り出す」だけ。WMS ではアプリが印刷する Code 128 という形式に絞って読み取っています。',
      ],
      code: [
        {
          label: 'JavaScript（考え方の骨子）',
          code: `// 1) この機能が使えるか確認（無ければカメラボタン自体を出さない）\nif ('BarcodeDetector' in window) {\n  const detector = new BarcodeDetector({ formats: ['code_128'] });\n\n  // 2) カメラ映像をもらう（背面カメラ優先）\n  const stream = await navigator.mediaDevices.getUserMedia({\n    video: { facingMode: 'environment' },\n  });\n  video.srcObject = stream;\n\n  // 3) 映像から繰り返しバーコードを探す\n  const codes = await detector.detect(video);\n  if (codes.length > 0) {\n    input.value = codes[0].rawValue;          // 入力欄に値を入れて\n    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' })); // Enter\n  }\n}`,
          note: '実物（camera_scan.js）はこれに、全画面プレビューや同じ値の連続読み取り防止などを足したものです。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：getUserMedia は「カメラやマイクの映像・音声をもらう」ブラウザの機能。facingMode: "environment" は「背面カメラを使う」指定です。',
        },
      ],
    },
    {
      id: 'fallback',
      heading: '3-3. 使えない端末への配慮',
      body: [
        'BarcodeDetector は、まだすべてのブラウザにはありません（iOS の Safari には無い）。そこで「機能が無いブラウザでは、カメラボタンそのものを出さない」ようにしています。ボタンが無ければ、これまでどおり専用スキャナで入力すればよく、画面が壊れることはありません。',
        '将来 iOS にも対応する場合は、ZXing-js という読取ライブラリをフォールバック（代替）として足す想定です。',
      ],
      callouts: [
        {
          kind: 'warn',
          text: 'カメラ（getUserMedia）は、安全な接続でしか動きません。具体的には HTTPS か localhost のときだけ。開発中は端末を USB でつないで localhost として見る（ADB Reverse）ことで動かしています。',
        },
      ],
    },
    {
      id: 'why',
      heading: '3-4. なぜ外部ライブラリを使わなかった？',
      body: [
        '読取ライブラリ（ZXing など）を入れる手もありましたが、対応端末（業務で使う Android）では BarcodeDetector で十分でした。標準機能だけで済めば、読み込むファイルが軽く、動きも速く、メンテナンスもラクです。',
        '「必要十分な範囲で、いちばんシンプルに作る」――これも立派な設計判断です。',
      ],
    },
  ],
}
