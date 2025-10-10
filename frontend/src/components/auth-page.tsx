import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useApp } from './app-context';
import { WorkCodileLogo } from './crocodile-icon';
import { Loader2, GraduationCap, Users, BrainCircuit } from 'lucide-react';

export function AuthPage() {
  const { login, register } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(loginForm.email, loginForm.password);
    } catch (err) {
      setError('Credenciales incorrectas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    if (!registerForm.email.includes('@unam.edu.pe')) {
      setError('Debes usar tu correo institucional de UNAM (@unam.edu.pe)');
      setIsLoading(false);
      return;
    }

    try {
      await register(registerForm.name, registerForm.email, registerForm.password);
    } catch (err) {
      setError('Error al crear la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen workcodile-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
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

      <div className="container max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center lg:text-left"
        >
          <motion.div
            className="flex items-center justify-center lg:justify-start mb-8"
            whileHover={{ scale: 1.05 }}
          >
            <div className="bg-white/10 p-3 rounded-2xl mr-4 pulse-green border border-primary/20">
              <WorkCodileLogo className="h-12 w-12" />
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-primary">
              Work<span className="text-foreground">Codile</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xl text-muted-foreground mb-8 max-w-lg"
          >
            La plataforma de intercambio de trabajos y servicios exclusiva para estudiantes de la Universidad Nacional de Moquegua
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            <div className="text-center p-4 bg-card/50 backdrop-blur-sm rounded-xl border">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Conecta</h3>
              <p className="text-sm text-muted-foreground">Con otros estudiantes</p>
            </div>
            <div className="text-center p-4 bg-card/50 backdrop-blur-sm rounded-xl border">
              <BrainCircuit className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Aprende</h3>
              <p className="text-sm text-muted-foreground">Intercambia conocimientos</p>
            </div>
            <div className="text-center p-4 bg-card/50 backdrop-blur-sm rounded-xl border">
              <GraduationCap className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Crece</h3>
              <p className="text-sm text-muted-foreground">Desarrolla habilidades</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right side - Auth form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-md mx-auto w-full"
        >
          <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle>Bienvenido a WorkCodile</CardTitle>
              <CardDescription>
                Únete a la comunidad estudiantil de UNAM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                  <TabsTrigger value="register">Registrarse</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Correo institucional</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="tu.nombre@unam.edu.pe"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Contraseña</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                    {error && (
                      <p className="text-destructive text-sm text-center">{error}</p>
                    )}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Iniciando sesión...
                        </>
                      ) : (
                        'Iniciar Sesión'
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Nombre completo</Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Tu nombre completo"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Correo institucional</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="tu.nombre@unam.edu.pe"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Contraseña</Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-confirm">Confirmar contraseña</Label>
                      <Input
                        id="register-confirm"
                        type="password"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                      />
                    </div>
                    {error && (
                      <p className="text-destructive text-sm text-center">{error}</p>
                    )}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creando cuenta...
                        </>
                      ) : (
                        'Crear Cuenta'
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>Solo estudiantes de UNAM con correo institucional</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}