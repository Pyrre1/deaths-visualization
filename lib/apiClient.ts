import axios from "axios"

/**
 * Query parameters accepted by the `/api/deaths` proxy endpoint.
 * All fields are optional; omitted fields are excluded from the request.
 */
export type DeathFilters = {
  from_year?: number            // Inclusive start year (1997-2024)
  to_year?: number              // Inclusive end year (1997-2024)
  region_code?: number          // Region code (0 = national aggregate)
  sex_code?: number             // Sex code: 1 = men, 2 = women, 3 = both
  age_code?: number             // Age group code (99 = all ages combined)
  diagnosis_code?: string       // Diagnosis code: ICD-10 chapter/code filter
  exclude_diagnosis_code?: string // Exclude a specific diagnosis code ("99" = samtliga dödsorsaker)
  measure_code?: number         // Measure type (absolute count vs /100.000 rate)  
  order_by?: string             // Column name to sort by
  direction?: "asc" | "desc"    // Sort direction
  limit?: number                // Max records to return
  offset?: number               // Pagination offset
}

/**
 * A single death record returned by the API.
 * Each record represents aggregated deaths for one combination of
 * year, region, sex, age group, and diagnosis.
 */
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

/** Top-level shape of the JSON response from `/api/deaths`. */
export type DeathsResponse = {
  data: DeathRecord[]
}

/**
 * Axios instance scoped to internal Next.js API routes.
 * Intercepts 401 responses and redirects the user to the sign-in page,
 * covering both expired tokens that failed silent refresh and missing sessions.
 */
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

/**
 * Fetches death records from the Next.js proxy endpoint `/api/deaths`.
 *
 * Strips `undefined` values from `filters` before serialising to query params
 * so the API never receives empty keys.
 *
 * @param filters - Query parameters to filter the result set.
 * @returns Flat array of {@link DeathRecord} objects.
 * @throws Axios error (non-401). 401s are handled by the interceptor.
 */
export async function fetchDeaths(filters: DeathFilters): Promise<DeathRecord[]> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined)
  )
  const res = await api.get<DeathsResponse>("/api/deaths", { params })
  return res.data.data
}