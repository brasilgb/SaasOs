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
        Schema::create('eqmodels', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary()->index();
            $table->foreignId('tenant_id')->nullable()->constrained('tenants');
            $table->foreignId('brand_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('model');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('eqmodels');
    }
};
