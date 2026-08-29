import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Solara OS
            </h1>
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                E-mail: <span className="font-medium text-gray-900">{user.email}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
