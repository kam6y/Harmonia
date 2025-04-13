<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('admin_identity', function (Blueprint $table) {
            // 自動増分の主キー。Laravel 8 以降では $table->id() を推奨
            $table->id();
            // メールアドレス。320文字以内、一意かつNULL不可
            $table->string('mail_address', 320)->unique();
            // パスワードハッシュ。512文字以内
            $table->string('password_hash', 512);
            // メール認証済み日時（任意で設定）
            $table->timestamp('email_verified_at')->nullable();
            // ログイン状態維持のためのリメンバートークン
            $table->rememberToken();
            // 作成日時、更新日時。CURRENT_TIMESTAMP が自動設定される
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_identity');
    }
};
