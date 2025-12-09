import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
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
  Image as ImageIcon,
  Trash2,
  Plus,
  Link as LinkIcon,
  Github,
  Facebook,
  Youtube,
  MessageCircle,
} from 'lucide-react';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

const socialIcons = {
  github: { icon: <Github className="h-6 w-6" />, bgColor: "bg-gray-800", textColor: "text-white" },
  facebook: { icon: <Facebook className="h-6 w-6" />, bgColor: "bg-blue-600", textColor: "text-white" },
  youtube: { icon: <Youtube className="h-6 w-6" />, bgColor: "bg-red-600", textColor: "text-white" },
  whatsapp: { icon: <MessageCircle className="h-6 w-6" />, bgColor: "bg-green-500", textColor: "text-white" },
  default: { icon: <LinkIcon className="h-6 w-6 text-black" />, bgColor: "bg-muted/30", textColor: "text-black" },
};

export function UserProfile({ isOpen, onClose, userId }: UserProfileProps) {
  const { user, posts, updateProfile } = useApp();
  const [profileUser, setProfileUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editedProfile, setEditedProfile] = useState({
    name: '',
    email: '',
    bio: '',
    location: 'Moquegua, Perú',
    cycle: '5',
    interests: [],
    avatar: '',
    avatar_key: '',
    socialLinks: [],
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (userId) {
        try {
          const response = await fetch(`http://localhost:3001/api/auth/user/${userId}`);
          if (response.ok) {
            const data = await response.json();
            // The backend now returns the full avatar URL directly in `data.avatar`
            // if (data.avatar_key) {
            //   data.avatar = `http://localhost:9000/workcodile-files/${data.avatar_key}`;
            // }
            setProfileUser(data);
          }
        } catch (error) {
          console.error('Failed to fetch user:', error);
        }
      } else {
        setProfileUser(user);
      }
    };

    if (isOpen) {
      fetchUser();
    }
  }, [isOpen, userId, user]);

  useEffect(() => {
    if (profileUser) {
      setEditedProfile({
        name: profileUser.name || '',
        email: profileUser.email || '',
        bio: profileUser.bio || '',
        location: 'Moquegua, Perú',
        cycle: '5',
        interests: profileUser.interests || ['Programación', 'Bases de datos', 'Desarrollo web'],
        avatar: profileUser.avatar || '',
        avatar_key: profileUser.avatar_key || '',
        socialLinks: profileUser.socialLinks || [],
      });
    }
  }, [profileUser]);

  const userPosts = posts.filter(post => post.author.id === profileUser?._id);
  const totalUpvotes = userPosts.reduce((sum, post) => sum + post.upvotes, 0);

  const userComments = posts.flatMap(post => {
    const allComments: any[] = [];
    const findComments = (comments: any[]) => {
      comments.forEach(comment => {
        if (comment.author.id === profileUser?._id) {
          allComments.push({ ...comment, postId: post.id, postTitle: post.title });
        }
        if (comment.replies) {
          findComments(comment.replies);
        }
      });
    }
    if (post.comments) {
      findComments(post.comments);
    }
    return allComments;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const stats = [
    { label: 'Publicaciones', value: userPosts.length, icon: BookOpen, color: 'text-blue-500' },
    { label: 'Votos positivos', value: totalUpvotes, icon: ThumbsUp, color: 'text-green-500' },
    { label: 'Comentarios', value: userComments.length, icon: MessageSquare, color: 'text-purple-500' },
    { label: 'Reputación', value: Math.floor(totalUpvotes * 1.5 + userComments.length * 0.5), icon: Trophy, color: 'text-yellow-500' }
  ];

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB');
      return;
    }

    setIsUploadingAvatar(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/storage', {
        method: 'POST',
        headers: {
          'x-auth-token': token,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }

      const data = await response.json();

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        setEditedProfile(prev => ({ ...prev, avatar: result, avatar_key: data.objectName }));
        setIsUploadingAvatar(false);
        toast.success('Avatar cargado correctamente');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsUploadingAvatar(false);
      toast.error('Error al subir el avatar');
    }
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          name: editedProfile.name,
          bio: editedProfile.bio,
          interests: editedProfile.interests,
          avatar_key: editedProfile.avatar_key,
          socialLinks: editedProfile.socialLinks,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el perfil');
      }

      const updatedUser = await response.json();
      updateProfile(updatedUser);
      setAvatarPreview(null);
      setIsEditing(false);
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar el perfil');
    }
  };

  const handleCancel = () => {
    setEditedProfile({
      name: profileUser.name || '',
      email: profileUser.email || '',
      bio: profileUser.bio || '',
      location: 'Moquegua, Perú',
      cycle: '5',
      interests: profileUser.interests || ['Programación', 'Bases de datos', 'Desarrollo web'],
      avatar: profileUser.avatar || '',
      avatar_key: profileUser.avatar_key || '',
      socialLinks: profileUser.socialLinks || [],
    });
    setAvatarPreview(null);
    setIsEditing(false);
  };

  const handleSocialLinkChange = (index, field, value) => {
    const newLinks = [...editedProfile.socialLinks];
    newLinks[index][field] = value;
    setEditedProfile(prev => ({ ...prev, socialLinks: newLinks }));
  };

  const addSocialLink = () => {
    setEditedProfile(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { name: '', url: '' }],
    }));
  };

  const removeSocialLink = (index) => {
    const newLinks = [...editedProfile.socialLinks];
    newLinks.splice(index, 1);
    setEditedProfile(prev => ({ ...prev, socialLinks: newLinks }));
  };

  if (!profileUser) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-7xl w-[95vw] max-h-[90vh] p-0 overflow-hidden">
        <div className="flex h-full max-h-[85vh] flex-col">
          <div className="p-6 border-b border-border flex-shrink-0">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-primary" />
                    <span>{profileUser._id === user._id ? 'Mi Perfil' : `Perfil de ${profileUser.name}`}</span>
                  </DialogTitle>
                  <DialogDescription>
                    Gestiona tu información personal, estadísticas y actividad en WorkCodile
                  </DialogDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {profileUser._id === user._id && !isEditing && (
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

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative group">
                  <Avatar 
                    className={`h-24 w-24 ${isEditing ? 'cursor-pointer transition-all duration-200 hover:opacity-75' : ''}`}
                    onClick={handleAvatarClick}
                  >
                    <AvatarImage 
                      src={avatarPreview || editedProfile.avatar || profileUser.avatar} 
                      alt={profileUser.name} 
                    />
                    <AvatarFallback className="text-2xl bg-primary/10">
                      {profileUser.avatar ? (
                        profileUser.name?.charAt(0).toUpperCase()
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
                      <h2 className="text-2xl font-bold">{profileUser.name}</h2>
                      <p className="text-muted-foreground mt-1">
                        {editedProfile.bio || 'Estudiante de Ingeniería de Sistemas en UNAM'}
                      </p>
                    </>
                  )}

                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Mail className="h-4 w-4" />
                      <span>{profileUser.email}</span>
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

              <Separator />

              {editedProfile.socialLinks.length > 0 && !isEditing && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Redes Sociales</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {editedProfile.socialLinks.map((link, index) => {
                      const socialIconData = socialIcons[link.name.toLowerCase()] || socialIcons.default;
                      const IconComponent = socialIconData.icon;
                      const bgColorClass = socialIconData.bgColor;
                      const textColorClass = socialIconData.textColor;

                      return (
                        <a key={index} href={link.url} target="_blank" rel="noopener noreferrer">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className={`${bgColorClass} rounded-lg p-4 text-center`}
                          >
                            <div className={`flex justify-center items-center text-2xl font-bold mx-auto mb-2 ${textColorClass}`}>{IconComponent}</div>
                            <div className={`text-xs ${textColorClass}`}>{link.name}</div>
                          </motion.div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {isEditing && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Redes Sociales</h3>
                  {editedProfile.socialLinks.map((link, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <Input
                        value={link.name}
                        onChange={(e) => handleSocialLinkChange(index, 'name', e.target.value)}
                        placeholder="Nombre (e.g., GitHub)"
                      />
                      {link.name.toLowerCase() === 'whatsapp' ? (
                        <div className="flex items-center w-full">
                          <span className="text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-l-md border border-r-0 border-input">+51</span>
                          <Input
                            value={link.url.replace('https://wa.me/51', '')}
                            onChange={(e) => handleSocialLinkChange(index, 'url', `https://wa.me/51${e.target.value.replace(/[^0-9]/g, '')}`)}
                            placeholder="Número de WhatsApp"
                            className="rounded-l-none"
                          />
                        </div>
                      ) : (
                        <Input
                          value={link.url}
                          onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                          placeholder="URL"
                        />
                      )}
                      <Button variant="ghost" size="sm" onClick={() => removeSocialLink(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addSocialLink}>
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir enlace
                  </Button>
                </div>
              )}

              <Separator />

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

              <div>
                <h3 className="text-lg font-semibold mb-4">Actividad reciente</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3 text-muted-foreground">Últimas Publicaciones</h4>
                    <div className="space-y-3">
                      {userPosts.slice(0, 3).map((post) => (
                        <Link to={`/post/${post.id}`} key={post.id} onClick={onClose}>
                          <motion.div
                            whileHover={{ x: 4 }}
                            className="p-3 bg-muted/20 rounded-lg border border-border/50 cursor-pointer"
                          >
                            <h4 className="font-medium text-sm line-clamp-1">{post.title}</h4>
                            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
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
                        </Link>
                      ))}
                      {userPosts.length === 0 && (
                        <p className="text-muted-foreground text-sm">No has creado ninguna publicación aún.</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3 text-muted-foreground">Últimos Comentarios</h4>
                    <div className="space-y-3">
                      {userComments.slice(0, 3).map((comment) => (
                        <Link to={`/post/${comment.postId}#comment-${comment.id}`} key={comment.id} onClick={onClose}>
                          <motion.div
                            whileHover={{ x: 4 }}
                            className="p-3 bg-muted/20 rounded-lg border border-border/50 cursor-pointer"
                          >
                            <p className="text-sm text-foreground italic line-clamp-2">"{comment.content}"</p>
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
                              en: <span className="font-medium">{comment.postTitle}</span>
                            </p>
                          </motion.div>
                        </Link>
                      ))}
                      {userComments.length === 0 && (
                        <p className="text-muted-foreground text-sm">No ha hecho ningún comentario aún.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

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