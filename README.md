# 環境構築手順

## 事前準備

1. **`.env` ファイルの作成**
   ```shell
   # api/web フォルダ直下で
   cp .env.example .env
   ```
   ```plaintext
   api/web
   ├── .env ← このファイルを作成する
   └── .env.example
   ```

2. **`.env` の内容を変更**
   ```dotenv
   DB_CONNECTION=pgsql
   DB_HOST=postgresql
   DB_PORT=5432
   DB_DATABASE=ph4
   DB_USERNAME=posse
   DB_PASSWORD=password
   ```
   <details>
   <summary>.env の詳細</summary>
   <pre>
   ```dotenv
    APP_NAME=Laravel
    APP_ENV=local
    APP_KEY=
    APP_DEBUG=true
    APP_URL=http://localhost
    
    LOG_CHANNEL=stack
    LOG_DEPRECATIONS_CHANNEL=null
    LOG_LEVEL=debug
    
    DB_CONNECTION=pgsql
    DB_HOST=postgresql
    DB_PORT=5432
    DB_DATABASE=ph4
    DB_USERNAME=posse
    DB_PASSWORD=password
    
    BROADCAST_DRIVER=log
    CACHE_DRIVER=file
    FILESYSTEM_DISK=local
    QUEUE_CONNECTION=sync
    SESSION_DRIVER=cookie
    SESSION_LIFETIME=120
    
    MEMCACHED_HOST=127.0.0.1
    
    REDIS_HOST=127.0.0.1
    REDIS_PASSWORD=null
    REDIS_PORT=6379
    
    MAIL_MAILER=smtp
    MAIL_HOST=mailhog
    MAIL_PORT=1025
    MAIL_USERNAME=null
    MAIL_PASSWORD=null
    MAIL_ENCRYPTION=null
    MAIL_FROM_ADDRESS="hello@example.com"
    MAIL_FROM_NAME="${APP_NAME}"
    
    AWS_ACCESS_KEY_ID=
    AWS_SECRET_ACCESS_KEY=
    AWS_DEFAULT_REGION=us-east-1
    AWS_BUCKET=
    AWS_USE_PATH_STYLE_ENDPOINT=false
    
    PUSHER_APP_ID=
    PUSHER_APP_KEY=
    PUSHER_APP_SECRET=
    PUSHER_HOST=
    PUSHER_PORT=443
    PUSHER_SCHEME=https
    PUSHER_APP_CLUSTER=mt1
    
    VITE_APP_NAME="${APP_NAME}"
    VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
    VITE_PUSHER_HOST="${PUSHER_HOST}"
    VITE_PUSHER_PORT="${PUSHER_PORT}"
    VITE_PUSHER_SCHEME="${PUSHER_SCHEME}"
    VITE_PUSHER_APP_CLUSTER="${VITE_PUSHER_APP_CLUSTER}"
    
    SESSION_DOMAIN=localhost
    SANCTUM_STATEFUL_DOMAINS=localhost:3000
    
    GOOGLE_DEVELOPER_KEY=
    SPOTIFY_CLIENT_ID=
    SPOTIFY_CLIENT_SECRET=

```
   </pre>
   </details>

3. **ビルド**
   ```shell
   docker compose build --no-cache
   ```

4. **コンテナ起動**
   ```shell
   docker compose up -d
   ```

5. **Laravel のインストール**
   ```shell
   # app コンテナに入る
docker compose exec app sh
   
   # Composer インストール
   composer install
   ```

6. **アプリケーションキー生成**
   ```shell
   # （すでにコンテナ内なら不要）
   docker compose exec app sh
   
   php artisan key:generate
   ```

7. **動作確認**
   ブラウザで `http://localhost` にアクセスし、Laravel ロゴ入りトップページが表示されたら成功。

---

# migration の実行

1. **マイグレーション実行**
   ```shell
   php artisan migrate:fresh --seed
   ```

2. **成功例**
   ```shell
   # php artisan migrate:fresh --seed

     Dropping all tables ........................................................................ 180ms DONE
   
      INFO  Preparing database.
   
     Creating migration table .................................................................... 47ms DONE
   
      INFO  Running migrations.
   
     2014_10_12_000000_create_users_table ....................................................... 154ms DONE
     2014_10_12_100000_create_password_reset_tokens_table ........................................ 55ms DONE
     2019_08_19_000000_create_failed_jobs_table .................................................. 82ms DONE
     2019_12_14_000001_create_personal_access_tokens_table ...................................... 112ms DONE
     2024_09_23_090341_create_posses_table ....................................................... 39ms DONE
   
      INFO  Seeding database.
   
     Database\Seeders\PosseTableSeeder ............................................................. RUNNING
     Database\Seeders\PosseTableSeeder .......................................................... 10 ms DONE
   ```

3. **PgAdmin ログイン**
   - URL: `http://localhost:5050`
   - メール: `admin@example.com`
   - パスワード: `password`

4. **新しいサーバー追加**
   - 名前: `postgresql`
   - 接続設定:
     ```plaintext
     ホスト名 / アドレス: postgresql
     ポート: 5432
     ユーザー名: posse
     パスワード: password
     ```
5. **接続確認**
6. `postgresql → データベース → Ph4 → スキーマ → public → tables` を選択
7. `users` を右クリックし、「データを閲覧/編集」でデータ確認

---

## フロント環境構築

1. **ディレクトリ移動**
   ```shell
   cd front
   ```
2. **依存パッケージインストール**
   ```shell
   npm install
   ```
3. **開発サーバー起動**
   ```shell
   npm run dev
   ```
4. ブラウザで `http://localhost:3000` にアクセスし、画面表示を確認

---

## ログアウト方法について
   - ヘッダーに表示されているアイコンをクリックし、ログアウトを選択する。

## Personnel 画面について

1. **ログイン方法**
   - URL: `https://localhost:3000/auth/login`
   - メール: `tenant1_dept4_staff2@example.com`
   - パスワード: `password123`

2. **分析ダッシュボード**
   - 会社全体のサーベイ結果を閲覧できます

3. **改善ダッシュボード**
   - 会社全体の施策一覧を閲覧できます
   - 施策の絞り込み検索が可能

4. **設定画面**
   - ヘッダーから遷移
   - **組織メンバー:** 編集ボタンで組織メンバーの追加処理が可能
   - **組織構造:** 履歴追加ボタンで組織の追加（適用開始日より前は編集・削除可能）
   - **サーベイ設定:** エンゲージメントサーベイとパルスサーベイの設定を編集可能

---

## Manager 画面について

1. **ログイン方法**
   - URL: `https://localhost:3000/auth/login`
   - メール: `tenant1_dept8_staff1@example.com`
   - パスワード: `password123`

2. **分析ダッシュボード**
   - 自分の配下の組織のサーベイ結果を閲覧できます
   - 以下の部署名をクリックすると各組織詳細画面に遷移できます
   ![image](https://github.com/user-attachments/assets/8361a364-e98c-4706-bfd6-93f4287a236a)

3. **各組織詳細画面**
   - 特定の組織サーベイ結果が閲覧できます
   - 以下の部分で新規の課題登録・編集・削除が可能
   ![image](https://github.com/user-attachments/assets/d4999485-f551-429b-bd3a-205971752ff0)

5. **改善ダッシュボード**
   - 組織タブをクリックして表示切替
   - 新しい施策登録ボタンで施策登録ページに遷移
   ![image](https://github.com/user-attachments/assets/a1227f19-81d8-4616-bcb8-ae713ae4d7f7)
   ![image](https://github.com/user-attachments/assets/628117be-9d49-4353-b25d-1c0b77d162d3)

4. **施策登録画面**
   - 登録した課題に紐づいて、新しい施策を登録可能ができます。

---

## ADMIN 画面について

1. **ログイン方法**
   - URL: `https://localhost:3000/auth/login`
   - メール: `admin2@example.com`
   - パスワード: `password123`

2. **テナント一覧画面**
   - テナントを一覧できます
   - テナント追加ボタンから、テナントの追加が行えます
   - 詳細ボタンから、各テナントの分析・改善ダッシュボードに遷移できます

3. **サーベイ設定画面**
   - 全テナントに適応される、サーベイの設定の閲覧・編集ができます

   
## アンケート配布処理

1. **事前準備**
   - `.env` に以下を追加
     ```dotenv
     MAIL_MAILER=smtp
     MAIL_HOST=smtp.gmail.com
     MAIL_PORT=587
     MAIL_USERNAME="harmonia.pomeranian@gmail.com"
     MAIL_PASSWORD="jnlm bzzr bdqq ycza"
     MAIL_ENCRYPTION=tls
     MAIL_FROM_ADDRESS="harmonia.pomeranian@gmail.com"
     MAIL_FROM_NAME="株式会社ポメラニアン"
     ```
   - ターミナルで以下を実行
     ```shell
     docker compose exec app sh
     php artisan queue:table
     php artisan migrate
     ```

2. **メール送信設定**
   - ログイン画面で人事としてログインする
   - 以下二つの画面でサーベイ設定とメールアドレスを登録
     - 人事部の組織メンバー登録画面(https://localhost:3000/personnel/organization_members)において自身のメールアドレスを持つユーザーを作成してください
     - 人事部のサーベイ設定画面(https://localhost:3000/personnel/settinfs)において、サーベイ送信日程、リマインド送信日程を編集してください
   - `Console/Kernel.php` の 22 行目と 28 行目を、メール送信したい時間に設定
   ```php
   protected function schedule(Schedule $schedule)
   {
       // php artisan schedule:run で実行
       $schedule->command('survey:send')->dailyAt('12:39');
   }
   ```
   - ターミナルで実行
   ```shell
   php artisan schedule:run
   ```

