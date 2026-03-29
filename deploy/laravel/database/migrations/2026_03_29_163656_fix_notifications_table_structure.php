<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->string('title')->after('type');
            $table->json('data')->nullable()->after('message');
            $table->boolean('is_read')->default(false)->after('data');
            
            // Drop old columns if they exist
            if (Schema::hasColumn('notifications', 'read')) {
                $table->dropColumn('read');
            }
            if (Schema::hasColumn('notifications', 'link')) {
                $table->dropColumn('link');
            }
            if (Schema::hasColumn('notifications', 'reference_id')) {
                $table->dropColumn('reference_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropColumn(['title', 'data', 'is_read']);
            $table->boolean('read')->default(false);
            $table->string('link')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
        });
    }
};
