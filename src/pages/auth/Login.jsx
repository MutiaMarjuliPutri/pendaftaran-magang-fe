import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/api/axios'

const loginSchema = z.object({
  username: z.string().min(1, 'Username atau email wajib diisi'),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
})

export default function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const response = await api.post('/auth/login', data)
      const { token, ...user } = response.data.data
      setAuth(user, token)
      toast.success('Berhasil masuk!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal masuk. Periksa kembali akun Anda.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md space-y-6 bg-card p-8 rounded-2xl border border-border shadow-2xl relative z-10 backdrop-blur-sm bg-card/80">
        <div className="text-center">
          {/* LOGO */}
          <div 
            className="mx-auto w-48 h-48 mb-1 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => navigate('/')}
            title="Kembali ke Beranda"
          >
            <img 
              src="/logo rapier.jpg" 
              alt="Rapier Technology Logo" 
              className="w-full h-full object-contain"
            />
          </div>

          
          {/* TEKS SELAMAT DATANG - JARAK RAPAT */}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Selamat Datang</h1>
            <p className="text-muted-foreground text-sm">Silakan masuk ke akun pendaftaran magang Anda</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="username">
              Username atau Email
            </label>
            <input
              id="username"
              type="text"
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200"
              placeholder="Masukkan username atau email"
              {...register('username')}
            />
            {errors.username && <p className="text-xs text-destructive mt-1 font-medium">{errors.username.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="password">
              Kata Sandi
            </label>
            <input
              id="password"
              type="password"
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200"
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password && <p className="text-xs text-destructive mt-1 font-medium">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground font-semibold shadow transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mohon Tunggu...
              </>
            ) : (
              'Masuk Sekarang'
            )}
          </button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Belum punya akun? <span onClick={() => navigate('/register')} className="text-primary font-semibold hover:underline cursor-pointer transition-all">Daftar</span>
        </div>
      </div>
    </div>
  )
}