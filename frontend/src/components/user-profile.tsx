import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { useApp } from './app-context';
import { WorkCodileLogo } from './crocodile-icon';
import { toast } from 'sonner@2.0.3';
import { 
  User, 
  Mail, 
  GraduationCap, 
  Calendar, 
  MapPin, 
  Edit3, 
  Save, 
  X,
  Trophy,
  MessageSquare,
  ThumbsUp,
  BookOpen,
  Camera,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const { user, posts, updateProfile } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editedProfile, setEditedProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: '',
    location: 'Moquegua, Perú',
    cycle: '5',
    interests: ['Programación', 'Bases de datos', 'Desarrollo web'],
    avatar: user?.avatar || ''
  });

  // Statistics from user posts
  const userPosts = posts.filter(post => post.author.id === user?.id);
  const totalUpvotes = userPosts.reduce((sum, post) => sum + post.upvotes, 0);
  const totalComments = userPosts.reduce((sum, post) => sum + post.comments.length, 0);

  const stats = [
    { label: 'Publicaciones', value: userPosts.length, icon: BookOpen, color: 'text-blue-500' },
    { label: 'Votos positivos', value: totalUpvotes, icon: ThumbsUp, color: 'text-green-500' },
    { label: 'Comentarios', value: totalComments, icon: MessageSquare, color: 'text-purple-500' },
    { label: 'Reputación', value: Math.floor(totalUpvotes * 1.5 + totalComments * 0.5), icon: Trophy, color: 'text-yellow-500' }
  ];

  // Handle avatar upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB');
      return;
    }

    setIsUploadingAvatar(true);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setAvatarPreview(result);
      setEditedProfile(prev => ({ ...prev, avatar: result }));
      setIsUploadingAvatar(false);
      toast.success('Avatar cargado correctamente');
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleSave = () => {
    // Update the user profile in the context
    updateProfile({
      name: editedProfile.name,
      avatar: editedProfile.avatar
    });
    setAvatarPreview(null);
    setIsEditing(false);
    toast.success('Perfil actualizado correctamente');
  };

  const handleCancel = () => {
    setEditedProfile({
      name: user?.name || '',
      email: user?.email || '',
      bio: '',
      location: 'Moquegua, Perú',
      cycle: '5',
      interests: ['Programación', 'Bases de datos', 'Desarrollo web'],
      avatar: user?.avatar || ''
    });
    setAvatarPreview(null);
    setIsEditing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-7xl w-[95vw] max-h-[90vh] p-0 overflow-hidden">
        <div className="flex h-full max-h-[85vh] flex-col">
          {/* Header */}
          <div className="p-6 border-b border-border flex-shrink-0">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-primary" />
                    <span>Mi Perfil</span>
                  </DialogTitle>
                  <DialogDescription>
                    Gestiona tu información personal, estadísticas y actividad en WorkCodile
                  </DialogDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  )}
                </div>
              </div>
            </DialogHeader>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative group">
                <Avatar 
                  className={`h-24 w-24 ${isEditing ? 'cursor-pointer transition-all duration-200 hover:opacity-75' : ''}`}
                  onClick={handleAvatarClick}
                >
                  <AvatarImage 
                    src={avatarPreview || editedProfile.avatar || user?.avatar} 
                    alt={user?.name} 
                  />
                  <AvatarFallback className="text-2xl bg-primary/10">
                    {user?.avatar ? (
                      user.name?.charAt(0).toUpperCase()
                    ) : (
                      <WorkCodileLogo className="h-12 w-12" />
                    )}
                  </AvatarFallback>
                </Avatar>
                
                {isEditing && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      {isUploadingAvatar ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Upload className="h-6 w-6 text-white" />
                        </motion.div>
                      ) : (
                        <>
                          <Camera className="h-5 w-5 text-white mb-1" />
                          <span className="text-xs text-white font-medium">Cambiar</span>
                        </>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={handleAvatarClick}
                      className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                      disabled={isUploadingAvatar}
                    >
                      {isUploadingAvatar ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Upload className="h-4 w-4" />
                        </motion.div>
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </Button>
                  </>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="name">Nombre</Label>
                      <Input
                        id="name"
                        value={editedProfile.name}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ingresa tu nombre"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Biografía</Label>
                      <Textarea
                        id="bio"
                        placeholder="Cuéntanos sobre ti..."
                        value={editedProfile.bio}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                        className="mt-1 h-20 resize-none"
                      />
                    </div>
                    {isEditing && (
                      <div className="flex items-start space-x-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <ImageIcon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          <p className="font-medium mb-1">Cambiar foto de perfil:</p>
                          <p>Haz clic en tu avatar o en el botón de cámara para subir una nueva imagen. Formatos admitidos: JPG, PNG, GIF. Tamaño máximo: 5MB.</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold">{user?.name}</h2>
                    <p className="text-muted-foreground mt-1">
                      {editedProfile.bio || 'Estudiante de Ingeniería de Sistemas en UNAM'}
                    </p>
                  </>
                )}

                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <GraduationCap className="h-4 w-4" />
                    <span>Ciclo {editedProfile.cycle}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{editedProfile.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Miembro desde 2024</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Actions - moved to bottom fixed section */}

            <Separator />

            {/* Statistics */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Estadísticas</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      whileHover={{ scale: 1.05 }}
                      className="bg-muted/30 rounded-lg p-4 text-center"
                    >
                      <Icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Interests/Skills */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Intereses y habilidades</h3>
              {isEditing ? (
                <div>
                  <Label htmlFor="interests">Intereses (separados por coma)</Label>
                  <Input
                    id="interests"
                    value={editedProfile.interests.join(', ')}
                    onChange={(e) => setEditedProfile(prev => ({ 
                      ...prev, 
                      interests: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                    }))}
                    placeholder="Programación, Bases de datos, Desarrollo web..."
                    className="mt-1"
                  />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {editedProfile.interests.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="bg-primary/10 text-primary">
                      {interest}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Recent Activity */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Actividad reciente</h3>
              <div className="space-y-3">
                {userPosts.slice(0, 3).map((post) => (
                  <motion.div
                    key={post.id}
                    whileHover={{ x: 4 }}
                    className="p-3 bg-muted/20 rounded-lg border border-border/50"
                  >
                    <h4 className="font-medium text-sm line-clamp-1">{post.title}</h4>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>{post.createdAt.toLocaleDateString()}</span>
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center space-x-1">
                          <ThumbsUp className="h-3 w-3" />
                          <span>{post.upvotes}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{post.comments.length}</span>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {userPosts.length === 0 && (
                  <p className="text-muted-foreground text-sm">No has creado ninguna publicación aún.</p>
                )}
              </div>
            </div>
            </div>
          </div>

          {/* Action Buttons - Fixed at bottom if editing */}
          {isEditing && (
            <div className="p-6 border-t border-border bg-background flex-shrink-0">
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar cambios
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}