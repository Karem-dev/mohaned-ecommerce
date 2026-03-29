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
        Schema::create('notifications', function (Blueprint $blueprint) {
            $blueprint->id();
            $blueprint->string('type'); // order, user, review, inventory
            $blueprint->text('message');
            $blueprint->string('link')->nullable(); // Route to relevant page
            $blueprint->boolean('read')->default(false);
            $blueprint->unsignedBigInteger('reference_id')->nullable(); // Order ID, User ID, etc.
            $blueprint->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
