<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMeasuresCommentsTable extends Migration
{
    public function up()
    {
        Schema::create('measures_comments', function (Blueprint $table) {
            // コメントの一意な識別子。自動増分
            $table->increments('id');

            // 対象の施策。外部キーとして measures を参照
            $table->unsignedInteger('measure_id');
            $table->foreign('measure_id')->references('id')->on('measures')->onDelete('cascade');

            // 管理者ID（admin_id）。NULL 許容。外部キーとして admin_identity を参照
            $table->unsignedInteger('admin_id')->nullable();
            $table->foreign('admin_id')->references('id')->on('admin_identity')->onDelete('set null');

            // スタッフID（staff_id）。NULL 許容。外部キーとして staff_identity を参照
            $table->unsignedInteger('staff_id')->nullable();
            $table->foreign('staff_id')->references('id')->on('staff_identity')->onDelete('set null');

            // コメント内容。2000文字まで保存可能
            $table->string('comment_text', 2000);

            // メンションされたユーザーが人事職員であるか（true/false）
            $table->boolean('mention_is_personnel')->default(false);

            // メンションされたユーザーが管理者であるか（true/false）
            $table->boolean('mention_is_admin')->default(false);

            // メンションされたユーザーが管理職であるか（true/false）
            $table->boolean('mention_is_manager')->default(false);

            // 作成日時、更新日時を自動管理。更新時は CURRENT_TIMESTAMP に自動更新
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down()
    {
        Schema::dropIfExists('measures_comments');
    }
}
