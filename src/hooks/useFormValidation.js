import { useState, useCallback } from 'react'

/**
 * Hook para validación de formularios
 * Simplifica manejo de estado, validación y errores
 */
export function useFormValidation(initialValues, validationRules = {}) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateField = useCallback((name, value) => {
    const rules = validationRules[name]
    if (!rules) return ''

    // Required
    if (rules.required && !value) {
      return rules.requiredMessage || 'Este campo es requerido'
    }

    // Min length
    if (rules.minLength && value.length < rules.minLength) {
      return rules.minLengthMessage || `Mínimo ${rules.minLength} caracteres`
    }

    // Max length
    if (rules.maxLength && value.length > rules.maxLength) {
      return rules.maxLengthMessage || `Máximo ${rules.maxLength} caracteres`
    }

    // Min value
    if (rules.min !== undefined && Number(value) < rules.min) {
      return rules.minMessage || `Valor mínimo: ${rules.min}`
    }

    // Max value
    if (rules.max !== undefined && Number(value) > rules.max) {
      return rules.maxMessage || `Valor máximo: ${rules.max}`
    }

    // Pattern
    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.patternMessage || 'Formato inválido'
    }

    // Custom validation
    if (rules.validate && typeof rules.validate === 'function') {
      const customError = rules.validate(value, values)
      if (customError) return customError
    }

    return ''
  }, [validationRules, values])

  const handleChange = useCallback((event) => {
    const { name, value, type, checked } = event.target
    const newValue = type === 'checkbox' ? checked : value

    setValues((prev) => ({
      ...prev,
      [name]: newValue,
    }))

    // Validate on change if field was touched
    if (touched[name]) {
      const error = validateField(name, newValue)
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }))
    }
  }, [touched, validateField])

  const handleBlur = useCallback((event) => {
    const { name, value } = event.target

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }))

    const error = validateField(name, value)
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }))
  }, [validateField])

  const validate = useCallback(() => {
    const newErrors = {}
    let isValid = true

    Object.keys(validationRules).forEach((fieldName) => {
      const error = validateField(fieldName, values[fieldName])
      if (error) {
        newErrors[fieldName] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }, [validationRules, values, validateField])

  const handleSubmit = useCallback((onSubmit) => {
    return async (event) => {
      event.preventDefault()
      setIsSubmitting(true)

      const isValid = validate()

      if (isValid) {
        try {
          await onSubmit(values)
        } catch (error) {
          console.error('Error en submit:', error)
        }
      }

      setIsSubmitting(false)
    }
  }, [validate, values])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }))
  }, [])

  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }))
  }, [])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldError,
    validate,
  }
}

/**
 * Reglas de validación comunes
 */
export const commonValidations = {
  required: (message) => ({
    required: true,
    requiredMessage: message,
  }),

  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternMessage: 'Email inválido',
  },

  phone: {
    pattern: /^\d{10}$/,
    patternMessage: 'Teléfono debe tener 10 dígitos',
  },

  positiveNumber: {
    min: 0,
    minMessage: 'Debe ser un número positivo',
  },

  percentage: {
    min: 0,
    max: 100,
    minMessage: 'Porcentaje debe ser entre 0 y 100',
    maxMessage: 'Porcentaje debe ser entre 0 y 100',
  },

  coordinates: {
    lat: {
      min: -90,
      max: 90,
      minMessage: 'Latitud debe estar entre -90 y 90',
      maxMessage: 'Latitud debe estar entre -90 y 90',
    },
    lng: {
      min: -180,
      max: 180,
      minMessage: 'Longitud debe estar entre -180 y 180',
      maxMessage: 'Longitud debe estar entre -180 y 180',
    },
  },
}
