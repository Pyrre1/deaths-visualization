import axios from "axios"

export type DeathFilters = {
  from_year?: number
  to_year?: number
  region_code?: number
  sex_code?: number
  age_code?: number
  diagnosis_code?: string
  exclude_diagnosis_code?: string
  measure_code?: number
  order_by?: string
  direction?: "asc" | "desc"
  limit?: number
  offset?: number
}

export type DeathRecord = {
  id: number
  year: number
  region_code: number
  region_name: string
  sex_code: number
  sex_label: string
  age_code: number
  age_range: string
  diagnosis_code: string
  diagnosis_name: string
  measure_code: number
  measure_label: string
  value: number
}

export type DeathsResponse = {
  data: DeathRecord[]
}

const api = axios.create()
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/"
    }
    return Promise.reject(error)
  }
)

export async function fetchDeaths(filters: DeathFilters): Promise<DeathRecord[]> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined)
  )
  const res = await api.get<DeathsResponse>("/api/deaths", { params })
  return res.data.data
}