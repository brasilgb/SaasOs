<?php

namespace App\Services;

use App\Models\App\Order;
use App\Models\User;
use Carbon\Carbon;

class FollowUpTaskService
{
    public function scopeColumns(string $scope): array
    {
        return match ($scope) {
            'budget' => [
                'paused_at' => 'budget_follow_up_paused_at',
                'paused_by' => 'budget_follow_up_paused_by',
                'reason' => 'budget_follow_up_pause_reason',
                'snoozed_until' => 'budget_follow_up_snoozed_until',
                'assigned_to' => 'budget_follow_up_assigned_to',
                'response_status' => 'budget_follow_up_response_status',
                'response_at' => 'budget_follow_up_response_at',
                'log_pause' => 'budget_follow_up_paused',
                'log_resume' => 'budget_follow_up_resumed',
                'log_response' => 'budget_follow_up_response_marked',
                'log_task_completed' => 'budget_follow_up_task_completed',
                'log_task_snoozed' => 'budget_follow_up_task_snoozed',
                'log_task_assigned' => 'budget_follow_up_task_assigned',
            ],
            'payment' => [
                'paused_at' => 'payment_follow_up_paused_at',
                'paused_by' => 'payment_follow_up_paused_by',
                'reason' => 'payment_follow_up_pause_reason',
                'snoozed_until' => 'payment_follow_up_snoozed_until',
                'assigned_to' => 'payment_follow_up_assigned_to',
                'response_status' => 'payment_follow_up_response_status',
                'response_at' => 'payment_follow_up_response_at',
                'log_pause' => 'payment_follow_up_paused',
                'log_resume' => 'payment_follow_up_resumed',
                'log_response' => 'payment_follow_up_response_marked',
                'log_task_completed' => 'payment_follow_up_task_completed',
                'log_task_snoozed' => 'payment_follow_up_task_snoozed',
                'log_task_assigned' => 'payment_follow_up_task_assigned',
            ],
            default => abort(422, 'Escopo de follow-up inválido.'),
        };
    }

    public function pause(Order $order, string $scope, string $reason, ?int $userId): void
    {
        if ($scope === 'feedback') {
            $order->update([
                'customer_feedback_recovery_status' => 'resolved',
                'customer_feedback_recovery_notes' => trim($reason),
                'customer_feedback_recovery_updated_at' => now(),
            ]);

            return;
        }

        $columns = $this->scopeColumns($scope);

        $order->update([
            $columns['paused_at'] => now(),
            $columns['paused_by'] => $userId,
            $columns['reason'] => trim($reason),
        ]);
    }

    public function resume(Order $order, string $scope): void
    {
        $columns = $this->scopeColumns($scope);

        $order->update([
            $columns['paused_at'] => null,
            $columns['paused_by'] => null,
            $columns['reason'] => null,
        ]);
    }

    public function respond(Order $order, string $scope, string $status, string $label, ?int $userId): void
    {
        $columns = $this->scopeColumns($scope);

        $order->update([
            $columns['response_status'] => $status,
            $columns['response_at'] => now(),
            $columns['paused_at'] => now(),
            $columns['paused_by'] => $userId,
            $columns['reason'] => $label,
        ]);
    }

    public function completeTask(Order $order, string $scope): void
    {
        if ($scope === 'feedback') {
            $order->update([
                'customer_feedback_recovery_status' => 'resolved',
                'customer_feedback_recovery_updated_at' => now(),
            ]);

            return;
        }

        $columns = $this->scopeColumns($scope);

        $order->update([
            $columns['snoozed_until'] => null,
        ]);
    }

    public function snoozeTask(Order $order, string $scope, int $days): Carbon
    {
        $columns = $this->scopeColumns($scope);
        $snoozedUntil = now()->addDays($days)->endOfDay();

        $order->update([
            $columns['snoozed_until'] => $snoozedUntil,
        ]);

        return $snoozedUntil;
    }

    public function assignTask(Order $order, string $scope, ?User $assignee): void
    {
        if ($scope === 'feedback') {
            $order->update([
                'customer_feedback_recovery_assigned_to' => $assignee?->id,
                'customer_feedback_recovery_status' => $assignee ? 'in_progress' : ($order->customer_feedback_recovery_status ?: 'pending'),
                'customer_feedback_recovery_updated_at' => now(),
            ]);

            return;
        }

        $columns = $this->scopeColumns($scope);

        $order->update([
            $columns['assigned_to'] => $assignee?->id,
        ]);
    }
}
