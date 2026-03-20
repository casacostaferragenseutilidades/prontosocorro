import React from 'react'
import { Layout } from '@/components/layout'
import { Card, Button } from '@/components/ui-elements'
import { Construction, ArrowLeft } from 'lucide-react'
import { useLocation } from 'wouter'

export default function ComingSoon({ title = 'Em Desenvolvimento' }: { title?: string }) {
  const [, setLocation] = useLocation()

  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <Construction className="w-12 h-12 text-primary" />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-4">{title}</h1>
        
        <p className="text-lg text-muted-foreground max-w-md mb-8">
          Estamos trabalhando nesta funcionalidade para trazer a melhor experiência para você. Em breve ela estará disponível!
        </p>
        
        <Card className="p-8 border-dashed border-2 border-primary/20 bg-primary/5 max-w-lg w-full mb-8">
          <div className="flex flex-col items-center gap-4">
            <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-2/3 rounded-full"></div>
            </div>
            <p className="text-sm font-medium text-primary uppercase tracking-wider">Progresso: 65%</p>
          </div>
        </Card>
        
        <Button 
          variant="outline" 
          onClick={() => setLocation('/')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o Dashboard
        </Button>
      </div>
    </Layout>
  )
}
