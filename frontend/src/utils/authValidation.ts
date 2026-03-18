// Функции валидации для защиты от XSS и некорректного ввода
export const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase()
}

export const validateEmail = (email: string): void => {
  if (!email || email.length === 0) {
    throw new Error('Email не может быть пустым')
  }
  if (email.length > 255) {
    throw new Error('Email слишком длинный (макс. 255 символов)')
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new Error('Некорректный формат email')
  }
}

export const validatePassword = (password: string): void => {
  if (!password || password.length === 0) {
    throw new Error('Пароль не может быть пустым')
  }
  if (password.length < 6) {
    throw new Error('Пароль должен быть минимум 6 символов')
  }
  if (password.length > 128) {
    throw new Error('Пароль слишком длинный (макс. 128 символов)')
  }
}

export const sanitizeFullName = (name: string): string => {
  if (!name || name.length === 0) {
    throw new Error('ФИО не может быть пустым')
  }
  if (name.length > 255) {
    throw new Error('ФИО слишком длинное (макс. 255 символов)')
  }
  // Удаляем опасные HTML/JS символы, цифры, но оставляем буквы, дефисы, пробелы
  const sanitized = name
    .replace(/[<>"'`]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/[0-9]/g, '') // Удаляем цифры
    .trim()

  // Проверяем наличие цифр в исходных данных
  if (/\d/.test(name)) {
    throw new Error('ФИО не должно содержать цифры')
  }

  if (sanitized.length === 0) {
    throw new Error('ФИО не может быть пустым после очистки')
  }

  return sanitized
}

export const validatePhone = (phone: string): void => {
  if (!phone || phone.length === 0) {
    throw new Error('Телефон не может быть пустым')
  }
  if (phone.length < 11 || phone.length > 12) {
    throw new Error('Телефон должен быть 11-12 цифр')
  }
  if (!/^\+?\d+$/.test(phone)) {
    throw new Error('Телефон должен содержать только цифры и опциональный + в начале')
  }
}