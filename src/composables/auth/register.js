import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/utils/supabase'

export function useRegister() {
  const router = useRouter()
  const refVForm = ref(null)
  
  const formData = ref({
    student_id: '',
    full_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'student' // Default role for registration
  })

  const formAction = ref({
    formProcess: false,
    formSuccessMessage: '',
    formErrorMessage: ''
  })

  const onFormSubmit = async () => {
    const { valid } = await refVForm.value.validate()
    
    if (valid) {
      formAction.value.formProcess = true
      formAction.value.formErrorMessage = ''
      
      try {
        // Register user with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.value.email,
          password: formData.value.password,
          options: {
            data: {
              full_name: formData.value.full_name,
              student_id: formData.value.student_id,
              role: formData.value.role
            }
          }
        })

        if (authError) throw authError

        if (authData.user) {
          // Create user record in users table
          const { error: insertError } = await supabase
            .from('users')
            .insert([
              {
                id: authData.user.id,
                student_id: formData.value.student_id,
                full_name: formData.value.full_name,
                email: formData.value.email,
                role: formData.value.role
              }
            ])

          if (insertError) {
            console.error('Error creating user record:', insertError)
            throw new Error('Failed to create user profile')
          }

          formAction.value.formSuccessMessage = 'Registration successful! Redirecting to login...'
          setTimeout(() => {
            router.push('/')
          }, 2000)
        }
      } catch (error) {
        console.error('Registration error:', error)
        formAction.value.formErrorMessage = error.message || 'Registration failed'
      } finally {
        formAction.value.formProcess = false
      }
    }
  }

  return {
    formData,
    formAction,
    refVForm,
    onFormSubmit
  }
} 