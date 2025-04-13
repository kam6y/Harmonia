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
        Schema::create('staff_identity', function (Blueprint $table) {
            // 自動増分の主キー
            $table->id();

            // 所属するテナントのID。外部キー制約（tenants テーブル参照）
            $table->unsignedBigInteger('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');

            // 所属部門のID。外部キー（departments テーブル参照）
            $table->unsignedBigInteger('department_id');
            $table->foreign('department_id')->references('id')->on('departments')->onDelete('cascade');

            // サブ部門（NULL許容）。外部キー（departments テーブル参照）
            $table->unsignedBigInteger('sub_department_id')->nullable();
            $table->foreign('sub_department_id')->references('id')->on('departments')->onDelete('set null');

            // メールアドレス（100文字以内、一意推奨）
            $table->string('mail_address', 100)->unique();
            // パスワードハッシュ（255文字以内）
            $table->string('password_hash', 255);
            // メール認証済み日時（任意）
            $table->timestamp('email_verified_at')->nullable();
            // リメンバートークン（ログイン状態の維持用）
            $table->rememberToken();

            // 追加情報：人事担当かどうか、管理職かどうか、役職名、氏名
            $table->boolean('is_personnel')->default(false);
            $table->boolean('is_manager')->default(false);
            $table->string('role_name', 255)->nullable();
            $table->string('name', 100)->nullable();

            // 作成日時と更新日時
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_identity');
    }
};
