import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'react-hot-toast'
import { Loader2, AlertCircle, User, Lock } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/api/axios'

const loginSchema = z.object({
  username: z.string().min(1, 'Username atau email wajib diisi'),
  password: z.string().min(1, 'Kata sandi wajib diisi'),
})

export default function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState(null) // null | 'username' | 'password' | 'general'
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data) => {
    setIsLoading(true)
    setLoginError(null)
    setErrorMessage('')
    try {
      const response = await api.post('/auth/login', data)
      const { token, ...user } = response.data.data
      setAuth(user, token)
      toast.success('Berhasil masuk! Selamat datang 👋')
      navigate('/dashboard')
    } catch (error) {
      const msg = error.response?.data?.message || 'Gagal masuk.'
      const statusCode = error.response?.status

      if (statusCode === 404 || msg.toLowerCase().includes('tidak ditemukan') || msg.toLowerCase().includes('akun')) {
        setLoginError('username')
        setErrorMessage('Username atau email tidak terdaftar. Periksa kembali.')
      } else if (statusCode === 400 && (msg.toLowerCase().includes('sandi') || msg.toLowerCase().includes('password'))) {
        setLoginError('password')
        setErrorMessage('Kata sandi salah. Periksa kembali kata sandi Anda.')
      } else if (msg.toLowerCase().includes('aktif')) {
        setLoginError('general')
        setErrorMessage('Akun Anda belum aktif. Hubungi admin.')
      } else {
        setLoginError('general')
        setErrorMessage(msg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = (field) => {
    const base = 'flex h-11 w-full rounded-xl border px-3 py-2 text-sm outline-none transition-all duration-200 pl-10'
    if (loginError === field) return `${base} border-red-400 bg-red-50/50 focus:ring-2 focus:ring-red-300 animate-shake`
    return `${base} border-input bg-background focus-visible:ring-2 focus-visible:ring-ring`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md space-y-6 bg-card p-8 rounded-2xl border border-border shadow-2xl relative z-10 backdrop-blur-sm bg-card/80">
        <div className="text-center">
          <div
            className="mx-auto w-48 h-48 mb-1 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => navigate('/')}
            title="Kembali ke Beranda"
          >
            <img src="/logo rapier.jpg" alt="Rapier Technology Logo" className="w-full h-full object-contain" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Selamat Datang</h1>
            <p className="text-muted-foreground text-sm">Silakan masuk ke akun pendaftaran magang Anda</p>
          </div>
        </div>

        {/* Banner error umum */}
        {loginError === 'general' && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Username / Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none" htmlFor="username">
              Username atau Email
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="username"
                type="text"
                className={inputClass('username')}
                placeholder="Masukkan username atau email"
                {...register('username')}
                onChange={() => { if (loginError === 'username') setLoginError(null) }}
              />
            </div>
            {errors.username && (
              <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                <AlertCircle size={12} /> {errors.username.message}
              </p>
            )}
            {loginError === 'username' && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 font-semibold bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                <AlertCircle size={13} /> {errorMessage}
              </div>
            )}
            {!errors.username && loginError !== 'username' && (
              <p className="text-xs text-muted-foreground">Bisa menggunakan username atau alamat email</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none" htmlFor="password">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="password"
                type="password"
                className={inputClass('password')}
                placeholder="••••••••"
                {...register('password')}
                onChange={() => { if (loginError === 'password') setLoginError(null) }}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                <AlertCircle size={12} /> {errors.password.message}
              </p>
            )}
            {loginError === 'password' && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 font-semibold bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                <AlertCircle size={13} /> {errorMessage}
              </div>
            )}
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
          Belum punya akun?{' '}
          <span onClick={() => navigate('/register')} className="text-primary font-semibold hover:underline cursor-pointer transition-all">
            Daftar
          </span>
        </div>
      </div>
    </div>
  )
}