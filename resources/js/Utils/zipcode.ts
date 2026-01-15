// lib/services/zipcode.ts
export interface ViaCepResponse {
  cep: string
  uf: string
  localidade: string
  bairro: string
  logradouro: string
  complemento: string
  erro?: boolean
}

export async function fetchAddressByZipcode(zipcode: string) {
  const cleanZip = zipcode.replace(/\D/g, "")

  if (cleanZip.length !== 8) return null

  const res = await fetch(`https://viacep.com.br/ws/${cleanZip}/json/`)

  if (!res.ok) return null

  const data: ViaCepResponse = await res.json()

  if (data.erro) return null

  return {
    zipcode: data.cep,
    state: data.uf,
    city: data.localidade,
    district: data.bairro,
    street: data.logradouro,
    complement: data.complemento,
  }
}
