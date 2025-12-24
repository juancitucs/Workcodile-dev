import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useApp } from './app-context';
import { WorkCodileLogo } from './crocodile-icon';
import { Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function ResetPasswordPage() {
  const { resetPassword } = useApp();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    code: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await resetPassword(form.code, form.password);
      setMessage(response.msg);
      setTimeout(() => navigate('/auth'), 2000);
    } catch (err: any) {
      setError(err.message || err.msg || 'Error al restablecer la contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen workcodile-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.3, 0.6]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto w-full"
      >
        <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <WorkCodileLogo className="h-12 w-12" />
            </div>
            <CardTitle>Restablecer Contraseña</CardTitle>
            <CardDescription>
              Ingresa el código que te enviamos y tu nueva contraseña.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código de Recuperación</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="XXXXXX"
                  value={form.code}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Nueva Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="**********"
                  value={form.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="**********"
                  value={form.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {error && (
                <p className="text-destructive text-sm text-center">{error}</p>
              )}
              {message && (
                <p className="text-green-600 text-sm text-center">{message}</p>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Restableciendo...
                  </>
                ) : (
                  'Restablecer Contraseña'
                )}
              </Button>
              <div className="text-center mt-4">
                <Link to="/auth" className="text-sm text-gray-600 hover:text-gray-800 hover:underline">
                  Volver a Iniciar Sesión
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
