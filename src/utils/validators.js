// 👉 IsEmpty
export const isEmpty = (value) => {
    // Null, undefined, or empty string
    if (value === null || value === undefined || value === '') return true
  
    // Check for strings (non-empty strings are not empty)
    if (typeof value === 'string') return value.trim() === ''
  
    // For all other types, return false
    return false
  }
  
  // 👉 IsNullOrUndefined
  export const isNullOrUndefined = (value) => {
    return value === null || value === undefined
  }
  
  // 👉 IsEmptyArray
  export const isEmptyArray = (arr) => {
    return Array.isArray(arr) && arr.length === 0
  }
  
  // 👉 IsObject
  export const isObject = (obj) =>
    obj !== null && !!obj && typeof obj === 'object' && !Array.isArray(obj)
  
  // 👉 Required Validator
  export const requiredValidator = (v) => !!v || 'This field is required'
  
  // 👉 Email Validator
  export const emailValidator = (v) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return !v || pattern.test(v) || 'Please enter a valid email address'
  }
  
  //👉 Password Validator
  export const passwordValidator = (v) => {
    if (!v) return true
    if (v.length < 8) return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(v)) return 'Password must contain at least one uppercase letter'
    if (!/[a-z]/.test(v)) return 'Password must contain at least one lowercase letter'
    if (!/[0-9]/.test(v)) return 'Password must contain at least one number'
    return true
  }
  
  // 👉 Confirm Password Validator
  export const confirmedValidator = (value, target) => {
    return (v) => v === target || 'Passwords do not match'
  }
  
  // 👉 Between Validator
  export const betweenValidator = (value, min, max) => {
    const valueAsNumber = Number(value)
  
    return (
      (Number(min) <= valueAsNumber && Number(max) >= valueAsNumber) ||
      `Enter number between ${min} and ${max}`
    )
  }
  
  // 👉 Integer Validator
  export const integerValidator = (value) => {
    if (isEmpty(value)) return true
  
    if (Array.isArray(value))
      return value.every((val) => /^-?[0-9]+$/.test(String(val))) || 'This field must be a number'
  
    return /^-?[0-9]+$/.test(String(value)) || 'This field must be a number'
  }
  
  // 👉 Regex Validator
  export const regexValidator = (value, regex) => {
    if (isEmpty(value)) return true
  
    let regeX = regex
    if (typeof regeX === 'string') regeX = new RegExp(regeX)
  
    if (Array.isArray(value)) return value.every((val) => regexValidator(val, regeX))
  
    return regeX.test(String(value)) || "The input doesn't match the expected format"
  }
  
  // 👉 Alpha Validator
  export const alphaValidator = (value) => {
    if (isEmpty(value)) return true
  
    return /^[A-Z]*$/i.test(String(value)) || 'The Alpha field may only contain alphabetic characters'
  }
  
  // 👉 URL Validator
  export const urlValidator = (value) => {
    if (isEmpty(value)) return true
  
    const re = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}[.]{0,1}/
  
    return re.test(String(value)) || 'URL is invalid'
  }
  
  // 👉 Length Validator
  export const lengthValidator = (value, length) => {
    if (isEmpty(value)) return true
  
    return (
      String(value).length >= length ||
      `The Min Character field must be at least ${length} characters`
    )
  }
  
  // 👉 Alpha-dash Validator
  export const alphaDashValidator = (value) => {
    if (isEmpty(value)) return true
  
    const valueAsString = String(value)
  
    return (
      /^[0-9A-Z_-]*$/i.test(valueAsString) ||
      'The input must be alphanumeric and can only include dashes (-) and underscores (_).'
    )
  }
  
  // 👉 Image Validator
  export const imageValidator = (value) => {
    if (isEmpty(value)) return true
  
    return !value || !value.length || value[0].size < 2000000 || 'Image size should be less than 2 MB'
  }
  
  // 👉 General Date Comparison Validator
  export const compareDatesValidator = (
    date1,
    date2,
    operator,
    date1Name = 'first',
    date2Name = 'second'
  ) => {
    if (isEmpty(date1)) return true
  
    const d1 = new Date(date1)
    const d2 = new Date(date2)
  
    if (isNaN(d1) || isNaN(d2)) return 'Invalid date input'
  
    const time1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime()
    const time2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime()
  
    const messages = {
      '===': 'Dates must be exactly the same',
      '==': 'Dates must be equal',
      '!==': 'Dates must not be the same',
      '!=': 'Dates must not be equal',
      '>': `The ${date1Name} date must be later than the ${date2Name} date`,
      '>=': `The ${date1Name} date must be the same or later than the ${date2Name} date`,
      '<': `The ${date1Name} date must be earlier than the ${date2Name} date`,
      '<=': `The ${date1Name} date must be the same or earlier than the ${date2Name} date`
    }
  
    if (!(operator in messages)) return `Invalid operator: ${operator}`
  
    const comparisons = {
      '===': time1 === time2,
      '==': time1 == time2,
      '!==': time1 !== time2,
      '!=': time1 != time2,
      '>': time1 > time2,
      '>=': time1 >= time2,
      '<': time1 < time2,
      '<=': time1 <= time2
    }
  
    return comparisons[operator] || messages[operator]
  }