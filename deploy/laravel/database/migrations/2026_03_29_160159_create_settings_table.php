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
        Schema::create('settings', function (Blueprint $blueprint) {
            $blueprint->id();
            $blueprint->string('key')->unique();
            $blueprint->text('value')->nullable();
            $blueprint->string('type')->default('string'); // string, boolean, json
            $blueprint->timestamps();
        });

        // Seed default settings
        \DB::table('settings')->insert([
            ['key' => 'site_name', 'value' => 'Rose Store', 'type' => 'string', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'contact_email', 'value' => 'support@rose-store.com', 'type' => 'string', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'primary_color', 'value' => '#b0004a', 'type' => 'string', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'maintenance_mode', 'value' => '0', 'type' => 'boolean', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'allow_registration', 'value' => '1', 'type' => 'boolean', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
