import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/utils/supabase'

export function useLogin() {
  const router = useRouter()
  const refVForm = ref(null)
  
  const formData = ref({
    email: '',
    password: ''
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
        // Sign in with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: formData.value.email,
          password: formData.value.password,
        })

        if (authError) throw authError

        if (authData.user) {
          // Get user data from users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle() // Use maybeSingle instead of single to handle no results gracefully

          if (userError) throw userError

          if (!userData) {
            throw new Error('User profile not found')
          }

          // Store user data in localStorage
          localStorage.setItem('user', JSON.stringify({
            id: authData.user.id,
            student_id: userData.student_id,
            full_name: userData.full_name,
            email: userData.email,
            role: userData.role
          }))

          formAction.value.formSuccessMessage = 'Login successful!'
          
          // Redirect based on role
          if (userData.role === 'admin') {
            router.push('/admin/dashboard')
          } else {
            router.push('/dashboard')
          }
        }
      } catch (error) {
        console.error('Login error:', error)
        formAction.value.formErrorMessage = error.message || 'Login failed'
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