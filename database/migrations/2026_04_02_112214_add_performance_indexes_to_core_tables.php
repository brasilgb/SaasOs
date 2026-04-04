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
        Schema::table('plans', function (Blueprint $table) {
            $table->index('slug', 'plans_slug_idx');
        });

        Schema::table('tenants', function (Blueprint $table) {
            $table->index(['subscription_status', 'expires_at'], 'tenants_subscription_expires_idx');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->index(['tenant_id', 'roles', 'status'], 'users_tenant_roles_status_idx');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->index(['tenant_id', 'customer_number'], 'customers_tenant_number_idx');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->index(['tenant_id', 'service_status', 'created_at'], 'orders_tenant_status_created_idx');
            $table->index(['tenant_id', 'customer_id', 'created_at'], 'orders_tenant_customer_created_idx');
            $table->index(['tenant_id', 'created_at'], 'orders_tenant_created_idx');
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->index(['recipient_id', 'status', 'id'], 'messages_recipient_status_id_idx');
            $table->index(['sender_id', 'id'], 'messages_sender_id_idx');
        });

        Schema::table('schedules', function (Blueprint $table) {
            $table->index(['tenant_id', 'status', 'id'], 'schedules_tenant_status_id_idx');
            $table->index(['tenant_id', 'schedules'], 'schedules_tenant_datetime_idx');
        });

        Schema::table('budgets', function (Blueprint $table) {
            $table->index(['tenant_id', 'budget_number'], 'budgets_tenant_number_idx');
        });

        Schema::table('checklists', function (Blueprint $table) {
            $table->index(['tenant_id', 'checklist_number'], 'checklists_tenant_number_idx');
        });

        Schema::table('parts', function (Blueprint $table) {
            $table->index(['tenant_id', 'type', 'created_at'], 'parts_tenant_type_created_idx');
            $table->index(['tenant_id', 'is_sellable'], 'parts_tenant_sellable_idx');
        });

        Schema::table('part_movements', function (Blueprint $table) {
            $table->index(['tenant_id', 'part_id', 'created_at'], 'part_movements_tenant_part_created_idx');
            $table->index(['order_id', 'created_at'], 'part_movements_order_created_idx');
        });

        Schema::table('sales', function (Blueprint $table) {
            $table->index(['tenant_id', 'sales_number'], 'sales_tenant_number_idx');
            $table->index(['tenant_id', 'status', 'created_at'], 'sales_tenant_status_created_idx');
        });

        Schema::table('sale_items', function (Blueprint $table) {
            $table->index(['sale_id', 'part_id'], 'sale_items_sale_part_idx');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->index(['tenant_id', 'status', 'created_at'], 'payments_tenant_status_created_idx');
            $table->index(['gateway', 'status'], 'payments_gateway_status_idx');
            $table->index('expires_at', 'payments_expires_at_idx');
        });

        Schema::table('order_status_history', function (Blueprint $table) {
            $table->index(['order_id', 'created_at'], 'order_status_history_order_created_idx');
        });

        Schema::table('order_payments', function (Blueprint $table) {
            $table->index(['order_id', 'paid_at'], 'order_payments_order_paid_at_idx');
        });

        Schema::table('order_logs', function (Blueprint $table) {
            $table->index(['order_id', 'created_at'], 'order_logs_order_created_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropIndex('plans_slug_idx');
        });

        Schema::table('tenants', function (Blueprint $table) {
            $table->dropIndex('tenants_subscription_expires_idx');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_tenant_roles_status_idx');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndex('customers_tenant_number_idx');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('orders_tenant_status_created_idx');
            $table->dropIndex('orders_tenant_customer_created_idx');
            $table->dropIndex('orders_tenant_created_idx');
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex('messages_recipient_status_id_idx');
            $table->dropIndex('messages_sender_id_idx');
        });

        Schema::table('schedules', function (Blueprint $table) {
            $table->dropIndex('schedules_tenant_status_id_idx');
            $table->dropIndex('schedules_tenant_datetime_idx');
        });

        Schema::table('budgets', function (Blueprint $table) {
            $table->dropIndex('budgets_tenant_number_idx');
        });

        Schema::table('checklists', function (Blueprint $table) {
            $table->dropIndex('checklists_tenant_number_idx');
        });

        Schema::table('parts', function (Blueprint $table) {
            $table->dropIndex('parts_tenant_type_created_idx');
            $table->dropIndex('parts_tenant_sellable_idx');
        });

        Schema::table('part_movements', function (Blueprint $table) {
            $table->dropIndex('part_movements_tenant_part_created_idx');
            $table->dropIndex('part_movements_order_created_idx');
        });

        Schema::table('sales', function (Blueprint $table) {
            $table->dropIndex('sales_tenant_number_idx');
            $table->dropIndex('sales_tenant_status_created_idx');
        });

        Schema::table('sale_items', function (Blueprint $table) {
            $table->dropIndex('sale_items_sale_part_idx');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex('payments_tenant_status_created_idx');
            $table->dropIndex('payments_gateway_status_idx');
            $table->dropIndex('payments_expires_at_idx');
        });

        Schema::table('order_status_history', function (Blueprint $table) {
            $table->dropIndex('order_status_history_order_created_idx');
        });

        Schema::table('order_payments', function (Blueprint $table) {
            $table->dropIndex('order_payments_order_paid_at_idx');
        });

        Schema::table('order_logs', function (Blueprint $table) {
            $table->dropIndex('order_logs_order_created_idx');
        });
    }
};
