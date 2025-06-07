import { createServerComponentClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const createServerClient = () => {
  return createServerComponentClient({
    cookies,
  })
}