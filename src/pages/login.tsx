import React, { useState } from 'react'
import { Card, Button, Input } from '@/components/ui-elements'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useLocation } from 'wouter'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { signIn } = useAuth()
  const { toast } = useToast()
  const [, setLocation] = useLocation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha email e senha',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    
    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        toast({
          title: 'Erro no login',
          description: error.message || 'Verifique suas credenciais',
          variant: 'destructive'
        })
      } else {
        toast({
          title: 'Login realizado',
          description: 'Bem-vindo ao sistema!'
        })
        setLocation('/')
      }
    } catch (error) {
      toast({
        title: 'Erro inesperado',
        description: 'Tente novamente mais tarde',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
              VV
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Venda Varejo</h1>
            <p className="text-gray-600">Sistema Financeiro</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Ainda não tem uma conta?{' '}
              <button
                className="text-blue-600 hover:text-blue-700 font-medium"
                onClick={() => setLocation('/register')}
              >
                Cadastre-se
              </button>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Acesso de demonstração:</p>
              <div className="bg-gray-50 rounded-lg p-3 text-xs">
                <p><strong>Email:</strong> admin@venda-varejo.com</p>
                <p><strong>Senha:</strong> admin123</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
