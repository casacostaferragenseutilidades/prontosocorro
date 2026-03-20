import React, { useState } from 'react'
import { Card, Button, Input } from '@/components/ui-elements'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, UserPlus, ArrowLeft } from 'lucide-react'
import { useLocation } from 'wouter'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { signUp } = useAuth()
  const { toast } = useToast()
  const [, setLocation] = useLocation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !email || !password) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha nome, email e senha',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    
    try {
      const { error } = await signUp(email, password, { name, phone })
      
      if (error) {
        toast({
          title: 'Erro no cadastro',
          description: error.message || 'Ocorreu um erro ao criar sua conta',
          variant: 'destructive'
        })
      } else {
        toast({
          title: 'Conta criada com sucesso!',
          description: 'Você já pode fazer o login.'
        })
        setLocation('/login')
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
            <button 
              onClick={() => setLocation('/login')}
              className="absolute left-8 top-8 text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
              VV
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Criar Conta</h1>
            <p className="text-gray-600">Junte-se ao Venda Varejo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="w-full"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone (opcional)
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                className="w-full"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full mt-6"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Cadastrar
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <button
                className="text-blue-600 hover:text-blue-700 font-medium"
                onClick={() => setLocation('/login')}
              >
                Fazer login
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
