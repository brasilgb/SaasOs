import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ArrowRight, ChartNoAxesCombined, CheckCircle2, ClipboardCheck, Smartphone, Users } from 'lucide-react';

const stats = [
    { label: 'Ordens abertas', value: '24', tone: 'text-blue-300' },
    { label: 'Em andamento', value: '11', tone: 'text-cyan-300' },
    { label: 'Concluídas', value: '86', tone: 'text-emerald-300' },
];

export function Hero() {
    return (
        <section className="relative overflow-hidden border-b border-slate-200 bg-white pt-20">
            <div className="absolute inset-x-0 top-0 -z-0 h-[44rem] bg-linear-to-b from-blue-50 via-white to-white" />
            <div className="absolute top-36 -right-48 -z-0 size-[34rem] rounded-full bg-cyan-100/60 blur-3xl" />

            <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.04fr_0.96fr] lg:px-12">
                <div className="text-slate-950">
                    <Badge
                        variant="outline"
                        className="inline-flex max-w-full gap-2 rounded-full border-blue-200 bg-white px-4 py-2 text-xs font-bold text-blue-700 shadow-sm"
                    >
                        <CheckCircle2 className="size-4" />
                        Gestão simples para assistências técnicas
                    </Badge>

                    <h1 className="mt-7 max-w-3xl text-5xl leading-[1.04] font-bold tracking-[-0.05em] text-balance sm:text-7xl">
                        Sua assistência mais organizada, produtiva e<span className="text-blue-700"> lucrativa.</span>
                    </h1>

                    <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                        Centralize ordens de serviço, clientes, estoque, vendas e financeiro. Acompanhe a operação no sistema web e mantenha sua
                        equipe conectada pelos apps móveis.
                    </p>

                    <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                        <Button
                            size="lg"
                            className="h-13 w-full rounded-lg bg-blue-700 px-6 text-sm font-bold text-white shadow-lg shadow-blue-700/15 transition hover:-translate-y-0.5 hover:bg-blue-800 sm:w-auto"
                            asChild
                        >
                            <Link href={route('plans.index')}>
                                Testar grátis por 14 dias
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </Button>

                        <Button
                            size="lg"
                            variant="outline"
                            className="h-13 w-full rounded-lg border-slate-300 bg-white px-6 text-sm font-bold text-slate-700 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950 sm:w-auto"
                            asChild
                        >
                            <a href="#recursos">Ver recursos</a>
                        </Button>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
                        {['Sem cartão de crédito', 'Ativação imediata', 'Suporte em português'].map((item) => (
                            <span key={item} className="inline-flex items-center gap-2">
                                <CheckCircle2 className="size-4 text-emerald-600" />
                                {item}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="relative mx-auto w-full max-w-xl">
                    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10 sm:p-6">
                        <div className="rounded-2xl bg-slate-950 p-6 text-white sm:p-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-blue-300">Visão da operação</p>
                                    <p className="mt-1 text-xl font-bold">Tudo em um só lugar</p>
                                </div>
                                <ChartNoAxesCombined className="size-7 text-blue-300" />
                            </div>

                            <div className="mt-8 grid grid-cols-3 gap-3">
                                {stats.map((stat) => (
                                    <div key={stat.label} className="rounded-xl bg-white/8 p-3">
                                        <p className={`text-xl font-bold sm:text-2xl ${stat.tone}`}>{stat.value}</p>
                                        <p className="mt-1 text-[0.65rem] leading-tight text-slate-400 sm:text-xs">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 rounded-xl bg-white/8 p-4">
                                <div className="flex h-28 items-end gap-2" aria-hidden="true">
                                    {[32, 45, 38, 62, 55, 78, 90, 72, 88, 100].map((height, index) => (
                                        <div key={index} className="flex-1 rounded-t bg-blue-500/80" style={{ height: `${height}%` }} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-slate-950">
                            <div className="rounded-xl border border-slate-200 p-4">
                                <Smartphone className="size-5 text-blue-700" />
                                <p className="mt-3 text-sm font-bold">Acesse de onde estiver</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 p-4">
                                <Users className="size-5 text-emerald-600" />
                                <p className="mt-3 text-sm font-bold">Equipe conectada</p>
                            </div>
                        </div>
                    </div>

                    <div className="absolute -right-3 -bottom-5 hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:flex">
                        <span className="grid size-10 place-items-center rounded-xl bg-emerald-50">
                            <ClipboardCheck className="size-5 text-emerald-600" />
                        </span>
                        <div>
                            <p className="text-xs text-slate-500">Ordem atualizada</p>
                            <p className="text-sm font-bold text-slate-950">Cliente notificado</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
