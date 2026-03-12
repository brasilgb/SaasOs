import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Product {
  id: number
  title: string
  description: string
  image: string
}

const products: Product[] = [
  {
    id: 1,
    title: "Dashboard otimizado",
    description: "Visualize rapidamente as principais informações do seu negócio.",
    image: "/images/slide/1.png",
  },
  {
    id: 2,
    title: "Gestão de clientes",
    description: "Consulte ordens, visitas agendadas e envie mensagens via WhatsApp.",
    image: "/images/slide/2.png",
  },
  {
    id: 3,
    title: "Cadastro completo de clientes",
    description: "Tenha acesso rápido a todas as informações importantes.",
    image: "/images/slide/3.png",
  },
  {
    id: 4,
    title: "Ordens de serviço",
    description: "Gerencie orçamentos, status e recibos com facilidade.",
    image: "/images/slide/4.png",
  },
  {
    id: 5,
    title: "Cadastro de ordens",
    description: "Crie e gerencie ordens de serviço com rapidez.",
    image: "/images/slide/5.png",
  },
  {
    id: 6,
    title: "Produtos e peças",
    description: "Controle estoque e disponibilidade de peças.",
    image: "/images/slide/6.png",
  },
  {
    id: 7,
    title: "Gestão de estoque",
    description: "Atualize e acompanhe movimentações de produtos.",
    image: "/images/slide/7.png",
  },
]

export function ProductCarousel() {
  const [current, setCurrent] = useState(0)
  const [isAutoplay, setIsAutoplay] = useState(true)

  useEffect(() => {
    if (!isAutoplay) return

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % products.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [isAutoplay])

  const goToSlide = (index: number) => {
    setCurrent(index)
    setIsAutoplay(false)
  }

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % products.length)
    setIsAutoplay(false)
  }

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + products.length) % products.length)
    setIsAutoplay(false)
  }

  return (
    <div
      className="w-full mx-auto"
      onMouseEnter={() => setIsAutoplay(false)}
      onMouseLeave={() => setIsAutoplay(true)}
    >
      {/* Carousel */}
      <div className="relative bg-muted rounded-lg overflow-hidden group">

        {/* Slides */}
        <div className="relative w-full aspect-video">

          {products.map((product, index) => (
            <div
              key={product.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === current ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-contain"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-8">

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
                  {product.title}
                </h2>

                <p className="text-sm sm:text-base text-gray-200 max-w-xl">
                  {product.description}
                </p>

              </div>
            </div>
          ))}

        </div>

        {/* Navigation */}

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition"
          aria-label="Slide anterior"
        >
          <ChevronLeft className="w-6 h-6 text-black" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition"
          aria-label="Próximo slide"
        >
          <ChevronRight className="w-6 h-6 text-black" />
        </button>

      </div>

      {/* Dots */}

      <div className="flex justify-center gap-3 mt-6">

        {products.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-3 rounded-full transition-all duration-300 ${
              index === current
                ? "bg-primary w-8"
                : "bg-muted-foreground/40 hover:bg-muted-foreground/70 w-3"
            }`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}

      </div>
    </div>
  )
}