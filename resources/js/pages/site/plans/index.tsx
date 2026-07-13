import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { maskPhone } from '@/Utils/mask';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { FormEventHandler } from 'react';
import { Footer } from '../components/footer';
import { Header } from '../components/header';
import { Pricing } from '../components/pricing';

type Lead = {
    name: string;
    whatsapp: string;
    email: string;
};

export default function Plans({ showPlans = false, lead }: { showPlans?: boolean; lead?: Lead | null }) {
    const { data, setData, post, processing, errors } = useForm<Lead>({
        name: '',
        whatsapp: '',
        email: '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post('/planos');
    };

    return (
        <main className="min-h-screen bg-[#0B1220] text-white">
            <Head title="Planos" />
            <Header />

            {!showPlans ? (
                <section className="relative overflow-hidden px-4 py-20 sm:py-28">
                    <div className="absolute top-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#00E59B]/10 blur-3xl" />
                    <div className="relative mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-[1fr_0.9fr]">
                        <div>
                            <span className="inline-flex rounded-full border border-white/12 bg-white/6 px-4 py-1 text-xs font-semibold tracking-[0.22em] text-[#7ee7ff] uppercase">
                                Veja nossos planos
                            </span>
                            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">Escolha a melhor forma de usar o VetorOS</h1>
                            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/82">
                                Tenha controle financeiro, vendas, prestação de serviços, ordens de serviço e relacionamento com clientes em um só lugar.
                            </p>
                            <p className="mt-3 max-w-xl leading-relaxed text-white/58">
                                Preencha seus dados para conhecer as opções mensal e anual e liberar seu acesso gratuito por 14 dias.
                            </p>
                            <ul className="mt-8 space-y-4 text-white/82">
                                {['Sem cartão de crédito', 'Acesso completo durante o teste', 'Cancele quando quiser'].map((item) => (
                                    <li key={item} className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-[#00E59B]" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <form onSubmit={submit} className="rounded-3xl border border-white/12 bg-white/[0.06] p-6 shadow-2xl backdrop-blur sm:p-8">
                            <h2 className="text-2xl font-bold">Conheça os planos</h2>
                            <p className="mt-2 text-sm text-white/58">Informe seus dados para continuar.</p>

                            <div className="mt-7 space-y-5">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nome</Label>
                                    <Input id="name" autoFocus value={data.name} onChange={(event) => setData('name', event.target.value)} disabled={processing} />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="whatsapp">WhatsApp</Label>
                                    <Input
                                        id="whatsapp"
                                        inputMode="tel"
                                        maxLength={15}
                                        value={maskPhone(data.whatsapp)}
                                        onChange={(event) => setData('whatsapp', event.target.value)}
                                        disabled={processing}
                                        placeholder="(00) 00000-0000"
                                    />
                                    <InputError message={errors.whatsapp} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">E-mail</Label>
                                    <Input id="email" type="email" value={data.email} onChange={(event) => setData('email', event.target.value)} disabled={processing} />
                                    <InputError message={errors.email} />
                                </div>
                            </div>

                            <Button type="submit" size="lg" disabled={processing} className="mt-7 w-full bg-[#00E59B] font-semibold text-slate-950 hover:bg-[#2ff0b1]">
                                {processing ? 'Carregando...' : 'Ver planos'}
                                {!processing && <ArrowRight className="ml-2 h-4 w-4" />}
                            </Button>

                            <p className="mt-4 text-center text-xs leading-relaxed text-white/48">
                                Ao continuar o cadastro, você está ciente de que receberá comunicações conforme nossa{' '}
                                <Link href="/privacidade" className="text-white/72 underline underline-offset-4 hover:text-white">
                                    política de privacidade
                                </Link>
                                .
                            </p>
                        </form>
                    </div>
                </section>
            ) : (
                <>
                    <section className="px-4 pt-16 text-center sm:pt-24">
                        <div className="mx-auto max-w-3xl">
                            <span className="text-sm font-semibold tracking-[0.2em] text-[#00E59B] uppercase">Tudo pronto{lead?.name ? `, ${lead.name.split(' ')[0]}` : ''}</span>
                            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Acesse e faça seu acesso gratuito</h1>
                            <p className="mt-5 text-lg text-white/68">Teste todos os recursos por 14 dias. Não é necessário cartão de crédito.</p>
                            <Button asChild size="lg" className="mt-8 bg-[#00E59B] font-semibold text-slate-950 hover:bg-[#2ff0b1]">
                                <Link href={route('register', { name: lead?.name, email: lead?.email, whatsapp: lead?.whatsapp })}>Criar meu acesso grátis</Link>
                            </Button>
                        </div>
                    </section>
                    <Pricing />
                </>
            )}

            <Footer />
        </main>
    );
}
