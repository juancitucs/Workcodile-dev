import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useApp } from './app-context';
import { WorkCodileLogo } from './crocodile-icon';
import { Loader2, GraduationCap, Users, BrainCircuit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog'; // Added for code verification dialog

export function AuthPage() {
  const { login, sendVerificationCode, verifyAndRegister } = useApp(); // Updated to new functions
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [currentStep, setCurrentStep] = useState<'form' | 'verifyCode'>('form');
  const [tempRegisterData, setTempRegisterData] = useState({ name: '', email: '', password: '' });
  const [verificationCode, setVerificationCode] = useState('');
  const [resendCodeTimer, setResendCodeTimer] = useState(0);

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
    } catch (err: any) {
      setError(err.message || err.msg || 'Error al iniciar sesión. Credenciales incorrectas o correo no verificado.');
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

    // Validation for name
    const nameRegex = /^[a-zA-Z\s\u00C0-\u017F]+$/;
    if (!nameRegex.test(registerForm.name)) {
      setError('El nombre solo puede contener letras, espacios y tildes.');
      setIsLoading(false);
      return;
    }

    // Validation for password
    const password = registerForm.password;
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      setIsLoading(false);
      return;
    }
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    if (!hasNumber || !hasSymbol) {
      setError('La contraseña debe contener al menos un número y un símbolo.');
      setIsLoading(false);
      return;
    }

    // Temporarily removed @unam.edu.pe restriction as per user request
    // if (!registerForm.email.includes('@unam.edu.pe')) {
    //   setError('Debes usar tu correo institucional de UNAM (@unam.edu.pe)');
    //   setIsLoading(false);
    //   return;
    // }

    try {
      // Call the new sendVerificationCode function
      const response = await sendVerificationCode(registerForm.name, registerForm.email, registerForm.password);
      setTempRegisterData({ name: registerForm.name, email: registerForm.email, password: registerForm.password });
      setCurrentStep('verifyCode');
      setError(response.msg || 'Código de verificación enviado a tu correo electrónico. Por favor, revísalo para completar tu registro.');
      setResendCodeTimer(60); // Start 60-second timer for resend
    } catch (err: any) {
      setError(err.msg || err.message || 'Error al procesar el registro. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await verifyAndRegister(tempRegisterData.email, tempRegisterData.password, verificationCode);
      // If successful, app-context's verifyAndRegister logs in the user
      setCurrentStep('form'); // Close dialog
      setRegisterForm({ name: '', email: '', password: '', confirmPassword: '' }); // Clear form
      setVerificationCode(''); // Clear code
      setError('¡Registro completado exitosamente! Has iniciado sesión automáticamente.');
    } catch (err: any) {
      setError(err.msg || err.message || 'Error al verificar el código. Código inválido o expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await sendVerificationCode(tempRegisterData.name, tempRegisterData.email, tempRegisterData.password);
      setError(response.msg || 'Nuevo código de verificación enviado. Revisa tu correo.');
      setResendCodeTimer(60); // Reset timer
    } catch (err: any) {
      setError(err.msg || err.message || 'Error al reenviar el código. Inténtalo de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (resendCodeTimer > 0) {
      const timer = setTimeout(() => {
        setResendCodeTimer(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCodeTimer]);

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
                        placeholder="**********"
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
                      <Label htmlFor="register-name">Nombre de Usuario</Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Tu nombre de usuario"
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
                        placeholder="**********"
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
                        placeholder="**********"
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
                          Enviando código...
                        </>
                      ) : (
                        'Enviar Código'
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

      {/* Code Verification Dialog */}
      <Dialog open={currentStep === 'verifyCode'} onOpenChange={(open) => { if (!open && !isLoading) setCurrentStep('form'); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verificación de Código</DialogTitle>
            <DialogDescription>
              Hemos enviado un código de 6 dígitos a su correo electrónico ({tempRegisterData.email}). Por favor, introdúzcalo a continuación para completar su registro.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleVerifyCode} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="verification-code">Código de Verificación</Label>
              <Input
                id="verification-code"
                type="text"
                placeholder="XXXXXX"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCurrentStep('form')} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || verificationCode.length !== 6}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Verificar'
                )}
              </Button>
            </DialogFooter>
          </form>
          <div className="text-center text-sm text-muted-foreground">
            {resendCodeTimer > 0 ? (
              <p>Reenviar código en {resendCodeTimer} segundos.</p>
            ) : (
              <Button variant="link" onClick={handleResendCode} disabled={isLoading}>
                Reenviar Código
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}