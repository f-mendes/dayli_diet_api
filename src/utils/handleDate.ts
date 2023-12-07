export function validateDate(date: string) {
  const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/
  const isValid = dateRegex.test(date)

  if (isValid) {
    return dateBrToDate(date)
  } else {
    return new Date().toISOString().split('T')[0]
  }
}

export function dateBrToDate(date: string) {
  return date.split('/').reverse().join('-').trim()
}

export function validateTime(hour: string) {
  const formatHourRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/
  const isValid = formatHourRegex.test(hour)
  if (isValid) {
    return hour
  } else {
    return '13:00'
  }
}
