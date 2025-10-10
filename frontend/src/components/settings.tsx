import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { useApp } from './app-context';
import { 
  Settings as SettingsIcon, 
  X, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Database,
  Moon,
  Sun,
  Monitor,
  Volume2,
  Mail,
  MessageSquare,
  Heart,
  Trash2,
  Download,
  AlertTriangle,
  Loader2,
  CheckCircle,
  FileDown,
  Lock,
  Key
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Settings({ isOpen, onClose }: SettingsProps) {
  const { user, logout, isDarkMode, toggleDarkMode, posts } = useApp();
  const [settings, setSettings] = useState({
    // Notification settings
    emailNotifications: true,
    pushNotifications: true,
    commentNotifications: true,
    mentionNotifications: true,
    voteNotifications: false,
    
    // Privacy settings
    profileVisibility: 'public',
    showEmail: false,
    showStats: true,
    allowMessages: true,
    
    // Display settings
    theme: isDarkMode ? 'dark' : 'light',
    language: 'es',
    postsPerPage: 10,
    
    // Sound settings
    soundEnabled: true,
    soundVolume: 50
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1); // 1: first confirmation, 2: final confirmation

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Apply theme change if needed
      if (settings.theme === 'dark' && !isDarkMode) {
        toggleDarkMode();
      } else if (settings.theme === 'light' && isDarkMode) {
        toggleDarkMode();
      }
      
      toast.success('Configuración guardada correctamente');
    } catch (error) {
      toast.error('Error al guardar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (value: string) => {
    handleSettingChange('language', value);
    if (value !== 'es') {
      toast.info('La interfaz en inglés estará disponible cuando lancemos WorkCodile en producción', {
        description: 'Por ahora solo está disponible en español'
      });
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get user posts and data
      const userPosts = posts.filter(post => post.author.id === user?.id);
      const userData = {
        exportInfo: {
          platform: 'WorkCodile',
          exportDate: new Date().toISOString(),
          exportVersion: '1.0'
        },
        profile: {
          id: user?.id,
          name: user?.name,
          email: user?.email,
          university: user?.university,
          avatar: user?.avatar
        },
        posts: userPosts.map(post => ({
          id: post.id,
          title: post.title,
          content: post.content,
          course: post.course,
          createdAt: post.createdAt,
          upvotes: post.upvotes,
          downvotes: post.downvotes,
          hashtags: post.hashtags,
          commentsCount: post.comments.length
        })),
        comments: userPosts.flatMap(post => 
          post.comments.filter(comment => comment.author.id === user?.id)
        ),
        settings: settings,
        statistics: {
          totalPosts: userPosts.length,
          totalUpvotes: userPosts.reduce((sum, post) => sum + post.upvotes, 0),
          totalComments: userPosts.reduce((sum, post) => sum + post.comments.length, 0),
          reputation: Math.floor(userPosts.reduce((sum, post) => sum + post.upvotes, 0) * 1.5)
        }
      };

      // Create and download file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `workcodile-datos-${user?.name?.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Datos exportados correctamente', {
        description: 'El archivo se ha descargado en tu dispositivo'
      });
    } catch (error) {
      toast.error('Error al exportar los datos');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccountStart = () => {
    setDeleteStep(1);
    setDeleteConfirmationText('');
    setShowDeleteDialog(true);
  };

  const handleDeleteAccountConfirm = () => {
    if (deleteStep === 1) {
      setDeleteStep(2);
      setDeleteConfirmationText('');
    } else if (deleteStep === 2 && deleteConfirmationText === 'ELIMINAR CUENTA') {
      // In a real app, this would call an API to delete the account
      toast.success('Cuenta eliminada correctamente', {
        description: 'Se han eliminado todos tus datos'
      });
      setShowDeleteDialog(false);
      logout();
      onClose();
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setDeleteStep(1);
    setDeleteConfirmationText('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-7xl w-[95vw] max-h-[90vh] p-0 overflow-hidden">
        <div className="flex h-full max-h-[85vh] flex-col">
          {/* Header */}
          <div className="p-6 border-b border-border flex-shrink-0">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <SettingsIcon className="h-5 w-5 text-primary" />
                <span>Configuración</span>
              </DialogTitle>
              <DialogDescription>
                Personaliza tu experiencia en WorkCodile, notificaciones, privacidad y más
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-8">
            {/* Account Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>Información de la cuenta</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre de usuario</Label>
                  <Input value={user?.name} disabled className="mt-1" />
                </div>
                <div>
                  <Label>Correo electrónico</Label>
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
              <p className="text-xs text-muted-foreground mt-2">
                Para cambiar tu información de cuenta, ve a "Mi Perfil" o contacta al soporte técnico.
              </p>
            </div>

            <Separator />

            {/* Notifications */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Bell className="h-5 w-5 text-primary" />
                <span>Notificaciones</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notificaciones por email</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibe resúmenes semanales por correo
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notificaciones push</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificaciones instantáneas en el navegador
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>Comentarios en mis posts</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Cuando alguien comenta en tus publicaciones
                    </p>
                  </div>
                  <Switch
                    checked={settings.commentNotifications}
                    onCheckedChange={(checked) => handleSettingChange('commentNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Menciones</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Cuando alguien te menciona en un comentario
                    </p>
                  </div>
                  <Switch
                    checked={settings.mentionNotifications}
                    onCheckedChange={(checked) => handleSettingChange('mentionNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base flex items-center space-x-2">
                      <Heart className="h-4 w-4" />
                      <span>Votos en mis publicaciones</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Cuando alguien vota tus publicaciones
                    </p>
                  </div>
                  <Switch
                    checked={settings.voteNotifications}
                    onCheckedChange={(checked) => handleSettingChange('voteNotifications', checked)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Privacy */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>Privacidad</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Visibilidad del perfil</Label>
                    <p className="text-sm text-muted-foreground">
                      Controla quién puede ver tu perfil completo
                    </p>
                  </div>
                  <Select
                    value={settings.profileVisibility}
                    onValueChange={(value) => handleSettingChange('profileVisibility', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Público</SelectItem>
                      <SelectItem value="students">Solo estudiantes</SelectItem>
                      <SelectItem value="private">Privado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Mostrar email en perfil</Label>
                    <p className="text-sm text-muted-foreground">
                      Otros usuarios podrán ver tu correo
                    </p>
                  </div>
                  <Switch
                    checked={settings.showEmail}
                    onCheckedChange={(checked) => handleSettingChange('showEmail', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Mostrar estadísticas</Label>
                    <p className="text-sm text-muted-foreground">
                      Muestra votos y reputación en tu perfil
                    </p>
                  </div>
                  <Switch
                    checked={settings.showStats}
                    onCheckedChange={(checked) => handleSettingChange('showStats', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Permitir mensajes directos</Label>
                    <p className="text-sm text-muted-foreground">
                      Otros estudiantes pueden enviarte mensajes
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowMessages}
                    onCheckedChange={(checked) => handleSettingChange('allowMessages', checked)}
                  />
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
                      Selecciona el tema de la aplicación
                    </p>
                  </div>
                  <Select
                    value={settings.theme}
                    onValueChange={(value) => handleSettingChange('theme', value)}
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
                      <SelectItem value="system">
                        <div className="flex items-center space-x-2">
                          <Monitor className="h-4 w-4" />
                          <span>Sistema</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Idioma</Label>
                    <p className="text-sm text-muted-foreground">
                      Idioma de la interfaz de WorkCodile
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select
                      value={settings.language}
                      onValueChange={handleLanguageChange}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">
                          <div className="flex items-center space-x-2">
                            <span>🇪🇸</span>
                            <span>Español</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="en">
                          <div className="flex items-center space-x-2">
                            <span>🇺🇸</span>
                            <span>English</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {settings.language !== 'es' && (
                      <div className="text-xs text-orange-500 flex items-center space-x-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Próximamente</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Posts por página</Label>
                    <p className="text-sm text-muted-foreground">
                      Cantidad de publicaciones a mostrar
                    </p>
                  </div>
                  <Select
                    value={settings.postsPerPage.toString()}
                    onValueChange={(value) => handleSettingChange('postsPerPage', parseInt(value))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Sound */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Volume2 className="h-5 w-5 text-primary" />
                <span>Sonidos</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Habilitar sonidos</Label>
                    <p className="text-sm text-muted-foreground">
                      Sonidos para notificaciones y acciones
                    </p>
                  </div>
                  <Switch
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => handleSettingChange('soundEnabled', checked)}
                  />
                </div>

                {settings.soundEnabled && (
                  <div className="space-y-2">
                    <Label className="text-base">Volumen: {settings.soundVolume}%</Label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.soundVolume}
                      onChange={(e) => handleSettingChange('soundVolume', parseInt(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Data Management */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Database className="h-5 w-5 text-primary" />
                <span>Gestión de datos</span>
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base flex items-center space-x-2">
                        <FileDown className="h-4 w-4 text-primary" />
                        <span>Exportar mis datos</span>
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Descarga un archivo JSON con todas tus publicaciones, comentarios y estadísticas
                      </p>
                      <div className="text-xs text-muted-foreground mt-1">
                        Incluye: perfil, {posts.filter(post => post.author.id === user?.id).length} publicaciones, comentarios y configuración
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={handleExportData}
                      disabled={isExporting}
                      className="min-w-[100px]"
                    >
                      {isExporting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Exportando...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Exportar
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base text-destructive flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Eliminar cuenta</span>
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Esta acción no se puede deshacer. Se eliminarán permanentemente todos tus datos, publicaciones y comentarios.
                      </p>
                      <div className="text-xs text-destructive/70 mt-1">
                        ⚠️ Requiere confirmación en dos pasos
                      </div>
                    </div>
                    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" onClick={handleDeleteAccountStart}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center space-x-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            <span>
                              {deleteStep === 1 ? '¿Eliminar tu cuenta?' : 'Confirmación final'}
                            </span>
                          </AlertDialogTitle>
                          <AlertDialogDescription asChild>
                            {deleteStep === 1 ? (
                              <div className="space-y-3">
                                <p className="text-muted-foreground text-sm">Esta acción eliminará permanentemente:</p>
                                <div className="bg-destructive/5 p-3 rounded-lg space-y-1 text-sm">
                                  <div className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-destructive rounded-full"></span>
                                    <span>Tu perfil y información personal</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-destructive rounded-full"></span>
                                    <span>{posts.filter(post => post.author.id === user?.id).length} publicaciones</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-destructive rounded-full"></span>
                                    <span>Todos tus comentarios y votos</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-destructive rounded-full"></span>
                                    <span>Tu configuración y preferencias</span>
                                  </div>
                                </div>
                                <p className="text-destructive font-medium text-sm">
                                  Esta acción no se puede deshacer.
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <p className="text-muted-foreground text-sm">Para confirmar la eliminación, escribe exactamente:</p>
                                <div className="bg-muted p-2 rounded font-mono text-center text-sm">
                                  ELIMINAR CUENTA
                                </div>
                                <Input
                                  value={deleteConfirmationText}
                                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                                  placeholder="Escribe: ELIMINAR CUENTA"
                                  className="text-center font-mono"
                                />
                              </div>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={handleDeleteCancel}>
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccountConfirm}
                            className="bg-destructive hover:bg-destructive/90"
                            disabled={deleteStep === 2 && deleteConfirmationText !== 'ELIMINAR CUENTA'}
                          >
                            {deleteStep === 1 ? (
                              <>
                                <Lock className="h-4 w-4 mr-2" />
                                Continuar
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar definitivamente
                              </>
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </div>

            </div>
          </div>

          {/* Action Buttons - Fixed at bottom */}
          <div className="p-6 border-t border-border bg-background flex-shrink-0">
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <SettingsIcon className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <SettingsIcon className="h-4 w-4 mr-2" />
                )}
                {isLoading ? 'Guardando...' : 'Guardar configuración'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}