import { useEffect, useState } from "react"

export function useZipcodeAutocomplete<T>({
  zipcode,
  paths,
  setData,
  setError,
  clearErrors,
}: {
  zipcode?: string
  paths: Record<keyof T | string, string>
  setData: (field: string, value: any) => void
  setError: (field: string, message: string) => void
  clearErrors: (field?: string) => void
}) {
  const [isZipcodeLoading, setLoading] = useState(false)

  useEffect(() => {
    if (!zipcode || zipcode.length !== 9) return

    const fetchAddress = async () => {
      try {
        setLoading(true)
        clearErrors("zipcode")

        const res = await fetch(`https://viacep.com.br/ws/${zipcode}/json`)
        const data = await res.json()

        if (data.erro) {
          setError("zipcode", "CEP inválido")
          return
        }

        setData(paths.state, data.uf)
        setData(paths.city, data.localidade)
        setData(paths.district, data.bairro)
        setData(paths.street, data.logradouro)
        setData(paths.complement, data.complemento || "")
      } catch {
        setError("zipcode", "Erro ao buscar CEP")
      } finally {
        setLoading(false)
      }
    }

    fetchAddress()
  }, [zipcode])

  return { isZipcodeLoading }
}
