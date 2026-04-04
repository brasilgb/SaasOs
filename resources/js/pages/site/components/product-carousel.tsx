import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Product {
    id: number;
    title: string;
    description: string;
    image: string;
}

const products: Product[] = [
    {
        id: 1,
        title: 'Dashboard de ordens de serviço',
        description: 'Acompanhe rapidamente o andamento das ordens, status dos serviços e indicadores operacionais em um único painel.',
        image: '/images/slide/1.png',
    },
    {
        id: 2,
        title: 'Dashboard do Financeiro',
        description: 'Visualize faturamento, vendas e indicadores financeiros de forma clara para acompanhar o desempenho da empresa.',
        image: '/images/slide/2.png',
    },
    {
        id: 3,
        title: 'Gestão de clientes',
        description: 'Organize sua base de clientes e acesse rapidamente histórico de serviços, contatos e informações importantes.',
        image: '/images/slide/3.png',
    },
    {
        id: 4,
        title: 'Cadastro completo de clientes',
        description: 'Registre dados detalhados dos clientes para facilitar atendimentos, histórico de serviços e comunicação.',
        image: '/images/slide/4.png',
    },
    {
        id: 5,
        title: 'Ordens de serviço',
        description: 'Controle todo o fluxo de atendimento, desde a entrada do equipamento até a entrega ao cliente.',
        image: '/images/slide/5.png',
    },
    {
        id: 6,
        title: 'Cadastro de ordens',
        description: 'Crie novas ordens de serviço de forma rápida, registrando equipamentos, problemas relatados e observações.',
        image: '/images/slide/6.png',
    },
];

export function ProductCarousel() {
    const [current, setCurrent] = useState(0);
    const [isAutoplay, setIsAutoplay] = useState(true);

    useEffect(() => {
        if (!isAutoplay) return;

        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % products.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [isAutoplay]);

    const goToSlide = (index: number) => {
        setCurrent(index);
        setIsAutoplay(false);
    };

    const nextSlide = () => {
        setCurrent((prev) => (prev + 1) % products.length);
        setIsAutoplay(false);
    };

    const prevSlide = () => {
        setCurrent((prev) => (prev - 1 + products.length) % products.length);
        setIsAutoplay(false);
    };

    return (
        <div className="mx-auto w-full" onMouseEnter={() => setIsAutoplay(false)} onMouseLeave={() => setIsAutoplay(true)}>
            {/* Carousel */}
            <div className="bg-muted group relative overflow-hidden rounded-lg">
                {/* Slides */}
                <div className="relative aspect-video w-full">
                    {products.map((product, index) => (
                        <div
                            key={product.id}
                            className={`absolute inset-0 transition-opacity duration-700 ${index === current ? 'opacity-100' : 'opacity-0'}`}
                        >
                            <img src={product.image} alt={product.title} className="h-full w-full object-contain" />

                            {/* Overlay */}
                            <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/70 via-black/30 to-transparent p-6 sm:p-8">
                                <h2 className="mb-2 text-xl font-bold text-white sm:text-2xl lg:text-3xl">{product.title}</h2>

                                <p className="max-w-xl text-sm text-gray-200 sm:text-base">{product.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation */}

                <button
                    onClick={prevSlide}
                    className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/80 p-2 transition hover:bg-white"
                    aria-label="Slide anterior"
                >
                    <ChevronLeft className="h-6 w-6 text-black" />
                </button>

                <button
                    onClick={nextSlide}
                    className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/80 p-2 transition hover:bg-white"
                    aria-label="Próximo slide"
                >
                    <ChevronRight className="h-6 w-6 text-black" />
                </button>
            </div>

            {/* Dots */}

            <div className="mt-6 flex justify-center gap-3">
                {products.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-3 rounded-full transition-all duration-300 ${
                            index === current ? 'bg-primary w-8' : 'bg-muted-foreground/40 hover:bg-muted-foreground/70 w-3'
                        }`}
                        aria-label={`Ir para slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
