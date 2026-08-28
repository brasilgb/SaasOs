<?php

namespace App\Console\Commands;

use App\Models\App\MaintenanceContract;
use App\Services\MaintenanceContractService;
use Illuminate\Console\Command;

class ProcessMaintenanceContracts extends Command
{
    protected $signature = 'vetoros:process-maintenance-contracts';

    protected $description = 'Processa contratos de manutenção recorrente: expira contratos vencidos, gera cobranças e agendamentos automáticos de visita';

    public function __construct(private readonly MaintenanceContractService $maintenanceContractService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $expired = 0;
        $billed = 0;
        $scheduled = 0;

        MaintenanceContract::query()
            ->where('status', MaintenanceContract::STATUS_ACTIVE)
            ->whereNotNull('end_date')
            ->whereDate('end_date', '<', now()->toDateString())
            ->orderBy('id')
            ->chunkById(100, function ($contracts) use (&$expired) {
                foreach ($contracts as $contract) {
                    if ($this->maintenanceContractService->expireIfNeeded($contract)) {
                        $expired++;
                    }
                }
            });

        MaintenanceContract::query()
            ->where('status', MaintenanceContract::STATUS_ACTIVE)
            ->whereNotNull('next_billing_date')
            ->whereDate('next_billing_date', '<=', now()->toDateString())
            ->orderBy('id')
            ->chunkById(100, function ($contracts) use (&$billed) {
                foreach ($contracts as $contract) {
                    if ($this->maintenanceContractService->processBillingCycle($contract)) {
                        $billed++;
                    }
                }
            });

        MaintenanceContract::query()
            ->where('status', MaintenanceContract::STATUS_ACTIVE)
            ->whereNotNull('visit_frequency_days')
            ->whereNotNull('next_schedule_date')
            // gera com 1 dia de antecedência da visita
            ->whereDate('next_schedule_date', '<=', now()->addDay()->toDateString())
            ->orderBy('id')
            ->chunkById(100, function ($contracts) use (&$scheduled) {
                foreach ($contracts as $contract) {
                    if ($this->maintenanceContractService->processVisitGeneration($contract)) {
                        $scheduled++;
                    }
                }
            });

        $this->info("Processo concluído. Expirados: {$expired}. Cobranças geradas: {$billed}. Visitas (OS + agendamento) geradas: {$scheduled}.");

        return self::SUCCESS;
    }
}
