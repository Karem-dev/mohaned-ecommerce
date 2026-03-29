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
        Schema::table('cart_items', function (Blueprint $table) {
            $table->json('variant_ids')->nullable()->after('variant_id');
            $table->string('variant_label')->nullable()->after('variant_ids');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->json('variant_ids')->nullable()->after('variant_id');
            $table->string('variant_label')->nullable()->after('variant_ids');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropColumn(['variant_ids', 'variant_label']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['variant_ids', 'variant_label']);
        });
    }
};
