import type { OrmChapter } from './types'

// 第15章「マイグレーション」。makemigrations/migrate / マイグレーションファイル / showmigrations / sqlmigrate / つまずき / RunPython。
export const ch15Migrations: OrmChapter = {
  id: 'migrations',
  num: 15,
  title: 'マイグレーション ― 設計図を DB に反映する',
  summary: 'モデル（設計図）を書いただけでは、まだ DB に表はできません。「設計図の変更を、実際のデータベースに反映する」しくみがマイグレーションです。2つのコマンドと、つまずきやすい点をやさしく解説します。',
  intro: [
    '前の2章で「モデル（テーブルの設計図）」を書きました。でも、モデルを書いただけでは DB にテーブルはまだありません。設計図と実際の DB は別物だからです。',
    'この「設計図の変更を DB に反映する」作業がマイグレーション（migration＝移行）です。Django ではたった2つのコマンドで進みます。',
  ],
  sections: [
    {
      id: 'two-commands',
      heading: '15-1. 基本は2ステップ ― makemigrations と migrate',
      body: [
        'マイグレーションは「設計図の差分を記録する」→「その記録を DB に適用する」の2段階です。それぞれ1つずつコマンドがあります。',
      ],
      table: {
        headers: ['コマンド', 'やること', 'たとえると'],
        rows: [
          ['python manage.py makemigrations', 'モデルの変更を見つけ、「変更の手順書」ファイルを作る', '工事の設計変更を「指示書」に書き起こす'],
          ['python manage.py migrate', '手順書を実際の DB に適用する（テーブルを作る/変える）', '指示書どおりに現場で工事する'],
        ],
      },
      examples: [
        {
          orm: `# 1) モデルを変えたら、まず変更を手順書にする\n$ python manage.py makemigrations\nMigrations for 'stock':\n  stock/migrations/0002_stockbalance_note.py\n    + Add field note to stockbalance\n\n# 2) その手順書を DB に反映する\n$ python manage.py migrate\nApplying stock.0002_stockbalance_note... OK`,
          note: 'モデルを変えるたびに、この2つをセットで実行する、と覚えておけば基本は回ります。makemigrations だけでは DB は変わりません（手順書を書いただけ）。',
        },
      ],
      callouts: [
        {
          kind: 'note',
          text: 'ことば：migration（マイグレーション）＝「移行」。データベースの構造を、今の設計図に合わせて少しずつ移行していく、という意味です。',
        },
      ],
    },
    {
      id: 'migration-file',
      heading: '15-2. マイグレーションファイルって何が書いてあるの？',
      body: [
        'makemigrations が作るのは、migrations/ フォルダの中の Python ファイル（0001_initial.py、0002_… と番号が付く）です。中身は「何をどう変えるか」の手順そのものです。',
        '番号順に積み重なっていき、「前のどのファイルに続くか（dependencies）」も記録されます。これにより、まっさらな DB でも 0001 から順に適用すれば、今と同じ構造を再現できます。',
      ],
      examples: [
        {
          orm: `# stock/migrations/0002_stockbalance_note.py（自動生成・抜粋）\nclass Migration(migrations.Migration):\n    dependencies = [\n        ('stock', '0001_initial'),   # この手順書の前提\n    ]\n    operations = [\n        migrations.AddField(\n            model_name='stockbalance',\n            name='note',\n            field=models.TextField(blank=True),\n        ),\n    ]`,
          note: 'operations が「やること」のリストです。AddField（カラム追加）、CreateModel（テーブル作成）、AlterField（型変更）などが並びます。基本は自動生成なので、最初は中身を読めれば十分で、手書きする必要はありません。',
        },
      ],
      callouts: [
        {
          kind: 'warn',
          text: 'マイグレーションファイルは Git で必ずコミットします。これがあるおかげで、他の人や本番サーバーでも同じ手順で DB を再現できます。「自動生成だから消していい」ものではありません。',
        },
      ],
    },
    {
      id: 'inspect',
      heading: '15-3. 状態を確かめる ― showmigrations / sqlmigrate',
      body: [
        '「どこまで適用済みか」「この手順書はどんな SQL になるのか」を確認するコマンドもあります。トラブル時に役立ちます。',
      ],
      table: {
        headers: ['コマンド', '分かること'],
        rows: [
          ['python manage.py showmigrations', '各マイグレーションが適用済み([X])か未適用([ ])か'],
          ['python manage.py sqlmigrate stock 0002', 'その手順書が実際に流す SQL を表示（実行はしない）'],
          ['python manage.py migrate stock 0001', '指定の番号まで戻す（ロールバック）'],
        ],
      },
      examples: [
        {
          orm: `$ python manage.py showmigrations stock\nstock\n [X] 0001_initial\n [X] 0002_stockbalance_note\n [ ] 0003_add_index        # ← まだ適用していない`,
          note: '[X] が適用済み、[ ] が未適用です。「migrate を流したのに変わらない？」というときは、まずこれで状態を見ます。',
        },
      ],
    },
    {
      id: 'pitfalls',
      heading: '15-4. つまずきやすいところ',
      body: [
        'マイグレーションで初心者がよくつまずく点を2つだけ。先に知っておくと落ち着いて対処できます。',
      ],
      table: {
        headers: ['場面', '何が起きる', '対処'],
        rows: [
          ['既存テーブルに必須カラムを追加', '「既存の行に何を入れる？」と Django が質問してくる', '一度きりの初期値を答えるか、モデルに default を付ける'],
          ['null=False のまま追加', '既存行を埋められず失敗しがち', 'まず null=True か default で追加 → 後で必須化'],
          ['手順書を作り忘れて migrate', 'モデルと DB がズレたまま', 'makemigrations → migrate を必ずセットで'],
        ],
      },
      callouts: [
        {
          kind: 'tip',
          text: '迷ったら「python manage.py makemigrations --check」で「未作成の変更が残っていないか」を確認できます。CI（自動チェック）に入れておくと、手順書の作り忘れを防げます。',
        },
      ],
    },
    {
      id: 'data-migration',
      heading: '15-5. データの移行 ― RunPython（発展）',
      body: [
        'マイグレーションは「テーブルの形」だけでなく「中のデータ」も移せます。たとえば「新しく足した区分カラムを、既存データから埋める」ようなとき、RunPython で Python のコードを手順書に組み込みます。',
        'これは少し発展的なので、「形だけでなくデータも手順書で移せる」と知っておく程度で十分です。',
      ],
      examples: [
        {
          orm: `def fill_default_status(apps, schema_editor):\n    PickingList = apps.get_model('outbound', 'PickingList')\n    PickingList.objects.filter(status='').update(status='pending')\n\nclass Migration(migrations.Migration):\n    dependencies = [('outbound', '0005_...')]\n    operations = [\n        migrations.RunPython(fill_default_status, migrations.RunPython.noop),\n    ]`,
          note: 'apps.get_model でその時点のモデルを取り出して使うのがコツ（直接 import しない）。第2引数の noop は「巻き戻すときは何もしない」という意味です。',
        },
      ],
    },
    {
      id: 'summary',
      heading: '15-6. この章のまとめ',
      body: [
        'モデルを変えたら makemigrations（手順書を作る）→ migrate（DB に反映）のセット。makemigrations だけでは DB は変わらない。',
        '手順書（migrations/ の番号付きファイル）は Git にコミットして共有・再現する。showmigrations で適用状況、sqlmigrate で実際の SQL を確認できる。必須カラム追加は default や「まず null=True」で安全に。データの移行は RunPython。',
        '第13〜15章で「テーブルを作る」一連の流れがそろいました。次の章からは、クエリの表現力をさらに上げるテクニックに戻ります。',
      ],
    },
  ],
}
