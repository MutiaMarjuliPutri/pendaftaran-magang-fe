import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'react-hot-toast'
import { Loader2, UserPlus, Mail, User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import api from '@/api/axios'

const registerSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  full_name: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
  confirm_password: z.string()
}).refine((data) => data.password === data.confirm_password, {
  message: "Kata sandi tidak cocok",
  path: ["confirm_password"],
});

export default function Register() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await api.post('/auth/register', data)
      toast.success('Pendaftaran berhasil! Silakan masuk.')
      navigate('/login')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mendaftar. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-lg space-y-8 bg-card p-8 rounded-2xl border border-border shadow-2xl relative z-10 backdrop-blur-sm bg-card/80">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-900 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-red-900/20 rotate-3 hover:rotate-0 transition-transform duration-300">
            <UserPlus className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Buat Akun Baru</h1>
          <p className="text-muted-foreground mt-2">Daftar sekarang untuk melamar program magang</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register('full_name')}
                  className="flex h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-red-900/20 focus:border-red-900/50 outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register('username')}
                  className="flex h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-red-900/20 focus:border-red-900/50 outline-none transition-all"
                  placeholder="johndoe"
                />
              </div>
              {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                {...register('email')}
                className="flex h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-red-900/20 focus:border-red-900/50 outline-none transition-all"
                placeholder="john@example.com"
              />
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="flex h-11 w-full rounded-xl border border-input bg-background pl-10 pr-10 py-2 text-sm focus:ring-2 focus:ring-red-900/20 focus:border-red-900/50 outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Konfirmasi Sandi</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirm_password')}
                  className="flex h-11 w-full rounded-xl border border-input bg-background pl-10 pr-10 py-2 text-sm focus:ring-2 focus:ring-red-900/20 focus:border-red-900/50 outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors duration-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirm_password && <p className="text-xs text-destructive">{errors.confirm_password.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 inline-flex items-center justify-center rounded-xl bg-red-900 text-white font-bold shadow-xl shadow-red-900/20 transition-all duration-300 hover:bg-red-950 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Sedang Memproses...
              </>
            ) : (
              <>
                Daftar Sekarang <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-sm text-muted-foreground mt-6">
          Sudah memiliki akun? <span onClick={() => navigate('/login')} className="text-red-900 font-bold hover:underline cursor-pointer transition-all">Masuk di sini</span>
        </div>
      </div>
    </div>
  )
}
