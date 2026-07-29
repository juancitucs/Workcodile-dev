import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { useApp } from './app-context';
import {
  Settings as SettingsIcon,
  Shield,
  Palette,
  Database,
  Moon,
  Sun,
  Snowflake,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SettingsData {
  notifications: Record<string, boolean>;
  privacy: Record<string, boolean | string>;
  display: { theme: string };
  sound: { enabled: boolean; volume: number };
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export function Settings({ isOpen, onClose }: SettingsProps) {
  const { user, theme, toggleTheme, christmasTheme, toggleChristmasTheme } = useApp();
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/settings`, {
          headers: { 'x-auth-token': token },
        });
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  const handleSettingChange = (category: string, key: string, value: boolean | string | number) => {
    setSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [category]: {
          ...prev[category as keyof SettingsData],
          [key]: value,
        },
      };
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      if (settings?.display.theme !== theme) {
        toggleTheme();
      }

      toast.success('Configuracion guardada correctamente');
    } catch {
      toast.error('Error al guardar la configuracion');
    } finally {
      setIsLoading(false);
    }
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-7xl w-[95vw] max-h-[90vh] p-0 overflow-hidden">
        <div className="flex h-full max-h-[90vh] flex-col">
          <div className="p-6 border-b border-border flex-shrink-0">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <SettingsIcon className="h-5 w-5 text-primary" />
                <span>Configuracion</span>
              </DialogTitle>
              <DialogDescription>
                Personaliza tu experiencia en WorkCodile, notificaciones, privacidad y mas
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-8">
              {/* Account Info */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Informacion de la cuenta</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre de usuario</Label>
                    <Input value={user?.name} disabled className="mt-1" />
                  </div>
                  <div>
                    <Label>Correo electronico</Label>
                    <Input value={user?.email} disabled className="mt-1" />
                  </div>
                </div>
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      <p className="font-medium">Cuenta verificada de UNAM</p>
                      <p>Tu correo {user?.email} ha sido validado como estudiante de la Universidad Nacional de Moquegua</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Display */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <span>Apariencia</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Tema</Label>
                      <p className="text-sm text-muted-foreground">
                        Selecciona el tema de la aplicacion
                      </p>
                    </div>
                    <Select
                      value={settings.display.theme}
                      onValueChange={(value) => handleSettingChange('display', 'theme', value)}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center space-x-2">
                            <Sun className="h-4 w-4" />
                            <span>Claro</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center space-x-2">
                            <Moon className="h-4 w-4" />
                            <span>Oscuro</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base flex items-center space-x-2">
                        <Snowflake className="h-4 w-4 text-red-500" />
                        <span>Tema Navideno</span>
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Activa colores festivos rojos y verdes para la temporada
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={christmasTheme}
                      onClick={toggleChristmasTheme}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${christmasTheme ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${christmasTheme ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Data Management */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <Database className="h-5 w-5 text-primary" />
                  <span>Gestion de datos</span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Mas configuraciones proximamente...
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-border bg-background flex-shrink-0">
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="mr-2"
                  >
                    <SettingsIcon className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <SettingsIcon className="h-4 w-4 mr-2" />
                )}
                {isLoading ? 'Guardando...' : 'Guardar configuracion'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
