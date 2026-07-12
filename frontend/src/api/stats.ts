import api from './index'
import type { StatsOverviewResponse, PopularBook, MonthlyStat } from '../types/api'

export const statsApi = {
  getOverview: () =>
    api.get<StatsOverviewResponse>('/stats'),

  getPopular: () =>
    api.get<PopularBook[]>('/stats/popular'),

  getMonthly: () =>
    api.get<MonthlyStat[]>('/stats/monthly'),
}
