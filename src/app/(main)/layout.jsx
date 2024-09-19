import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function MainLayout({ children }) {
  const supabase = createClient()

  const { data, error } = await (await supabase).auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }

  return(
    children
  )
}