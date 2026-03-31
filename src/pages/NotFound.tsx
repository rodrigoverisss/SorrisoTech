import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="mt-4 text-xl text-gray-600">Página não encontrada</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-6">
          <Home className="mr-2 h-4 w-4" />
          Voltar ao Dashboard
        </Button>
      </div>
    </div>
  );
}
