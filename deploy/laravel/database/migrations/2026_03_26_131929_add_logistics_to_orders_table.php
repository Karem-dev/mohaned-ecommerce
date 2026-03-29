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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('carrier_name')->nullable()->after('tracking_number');
            $table->dateTime('estimated_delivery')->nullable()->after('carrier_name');
            $table->string('current_location_desc')->nullable()->after('estimated_delivery');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['carrier_name', 'estimated_delivery', 'current_location_desc']);
        });
    }
};
