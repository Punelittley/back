// Подписи статусов для отображения на русском (значения в API остаются на английском)

const APPOINTMENT_STATUS: Record<string, string> = {
  scheduled: 'Запланирована',
  completed: 'Выполнена',
  cancelled: 'Отменена',
}

const ANALYSIS_STATUS: Record<string, string> = {
  pending: 'Ожидает',
  ready: 'Готов',
  cancelled: 'Отменён',
}

export function appointmentStatusLabel(status: string): string {
  return APPOINTMENT_STATUS[status] ?? status
}

export function analysisStatusLabel(status: string): string {
  return ANALYSIS_STATUS[status] ?? status
}
