import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Product {
  id: number
  title: string
  description: string
  image: string
}

const products: Product[] = [
  {
    id: 1,
    title: "Produto Premium",
    description: "Qualidade incomparável com design moderno",
    image: "/premium-product-showcase-elegant-modern.jpg",
  },
  {
    id: 2,
    title: "Inovação Tecnológica",
    description: "Desenvolvido com a melhor tecnologia disponível",
    image: "/technology-innovation-product-sleek-design.jpg",
  },
  {
    id: 3,
    title: "Design Exclusivo",
    description: "Criado com atenção aos detalhes e estilo",
    image: "/exclusive-design-luxury-product-high-end.jpg",
  },
  {
    id: 4,
    title: "Perfeição Absoluta",
    description: "O ponto final em qualidade e performance",
    image: "/perfect-product-excellence-performance-premium-qua.jpg",
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
    <div className="w-full max-w-5xl mx-auto px-4 py-12">
      {/* Main Carousel */}
      <div className="relative bg-muted rounded-lg overflow-hidden group">
        {/* Slides */}
        <div className="relative w-full aspect-video">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === current ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              {/* Overlay com informações do produto */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                <h2 className="text-4xl font-bold text-white mb-2 text-balance">{product.title}</h2>
                <p className="text-lg text-gray-100">{product.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
          aria-label="Slide anterior"
        >
          <ChevronLeft className="w-6 h-6 text-black" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
          aria-label="Próximo slide"
        >
          <ChevronRight className="w-6 h-6 text-black" />
        </button>
      </div>

      {/* Dots Navigation */}
      <div className="flex justify-center gap-3 mt-8">
        {products.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === current ? "bg-primary w-8" : "bg-muted-foreground/40 hover:bg-muted-foreground/60"
            }`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
