import { useState, memo, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import { useApp } from './app-context';
import { UserProfile } from './user-profile';
import { Settings } from './settings';
import { WorkCodileLogo } from './crocodile-icon';
import { EnhancedNotifications } from './enhanced-notifications';
import {
  Menu,
  Search,
  Plus,
  Gift,
  Settings as SettingsIcon,
  LogOut,
  Moon,
  Sun,
  User,
  Home,
  TreePine
} from 'lucide-react';

interface HeaderProps {
  onCreatePost: () => void;
  onSearch: (query: string) => void;
  onToggleMobileMenu: () => void;
  onResetFilters: () => void;
}

export const Header = memo(function Header({ onCreatePost, onSearch, onToggleMobileMenu, onResetFilters }: HeaderProps) {
  const { user, logout, theme, toggleTheme, christmasTheme, toggleChristmasTheme } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Detección de scroll para efecto de sombra del header sticky
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="sticky top-0 z-50 transition-shadow duration-300"
      style={{
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        borderBottom: theme === 'dark' ? '2px solid #4b5563' : '2px solid #d1d5db',
        boxShadow: isScrolled
          ? `${christmasTheme ? 'inset 0 0 40px rgba(239, 68, 68, 0.25)' : 'inset 0 0 40px rgba(34, 197, 94, 0.25)'}, 0 4px 12px rgba(0, 0, 0, 0.15)`
          : christmasTheme
            ? 'inset 0 0 40px rgba(239, 68, 68, 0.25)'
            : 'inset 0 0 40px rgba(34, 197, 94, 0.25)'
      }}
    >
      <div className="container max-w-[1800px] mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left Section: Logo */}
          <div className="flex items-center gap-4 min-w-0">
            {/* Hamburger Menu */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden flex-shrink-0"
              onClick={onToggleMobileMenu}
              aria-label="Abrir menú de navegación"
            >
              <Menu className="h-6 w-6" />
            </Button>

            {/* Logo - Full Page Refresh */}
            <motion.div
              className="flex items-center gap-3 cursor-pointer flex-shrink-0"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => window.location.reload()}
              title="Inicio - Refrescar página"
            >
              <div className={`bg-gradient-to-br from-workcodile-green/10 to-workcodile-green-light/10 p-2 rounded-lg border border-workcodile-green/20 shadow-sm ${christmasTheme ? 'santa-hat-logo' : ''}`}>
                <WorkCodileLogo className="h-8 w-8" />
              </div>
              <div className="flex items-center gap-1">
                <h1 className="text-[62px] font-bold text-primary leading-tight">
                  Work<span className="text-foreground">Codile</span>
                </h1>
                {/* Estrella brillante navideña */}
                {christmasTheme && (
                  <span className="christmas-star" title="¡Feliz Navidad!">
                    ⭐
                  </span>
                )}
              </div>
            </motion.div>

            {/* Home Button - Soft Reset (filters only, no reload) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="flex-shrink-0"
              title="Limpiar filtros (sin recargar)"
              aria-label="Ir al inicio y limpiar filtros"
            >
              <Home className="h-5 w-5" />
            </Button>
          </div>

          {/* Center Section: Search Bar */}
          <div className="flex-1 max-w-[493px] mx-2 block md:hidden">
            <form onSubmit={handleSearch} className="relative" role="search">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                placeholder="Buscar publicaciones..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 bg-workcodile-gray-light/30 border-workcodile-border-light backdrop-blur-sm focus:border-workcodile-green/50 transition-all duration-300"
                aria-label="Buscar publicaciones"
              />
            </form>
          </div>

          {/* Right Section: Actions */}
          <div className="flex items-center gap-2">
            {/* Create Post Button */}
            <Button
              onClick={onCreatePost}
              className="hidden sm:flex items-center gap-2 btn-modern"
              size="sm"
            >
              {christmasTheme ? (
                <Gift className="h-4 w-4 gift-icon" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span>{christmasTheme ? 'Crear Regalo' : 'Crear Post'}</span>
            </Button>

            <Button
              onClick={onCreatePost}
              className="sm:hidden"
              size="icon"
              variant="outline"
              aria-label="Crear publicación"
            >
              {christmasTheme ? (
                <Gift className="h-4 w-4 gift-icon" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>

            {/* TODO: Placeholder buttons for future features */}
            {/* Uncomment when ready to implement:
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex"
              title="Mensajes (próximamente)"
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex"
              title="Calendario (próximamente)"
            >
              <Calendar className="h-5 w-5" />
            </Button>
            */}

            {/* Notifications */}
            <EnhancedNotifications />

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className='sm:inline-flex'
              aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Christmas Theme Toggle 🎄 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleChristmasTheme}
              className={`sm:inline-flex transition-colors ${christmasTheme ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20' : ''}`}
              title={christmasTheme ? 'Desactivar tema navideño' : 'Activar tema navideño'}
              aria-label={christmasTheme ? 'Desactivar tema navideño' : 'Activar tema navideño'}
              aria-pressed={christmasTheme}
            >
              <TreePine className="h-5 w-5" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 rounded-full h-8 w-8" aria-label="Menú de usuario">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-primary/10">
                      {user?.avatar ? (
                        user.name?.charAt(0).toUpperCase()
                      ) : (
                        <WorkCodileLogo className="h-5 w-5" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowProfile(true)} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Mi Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowSettings(true)} className="cursor-pointer">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuItem className="sm:hidden cursor-pointer" onClick={toggleTheme}>
                  {theme === 'dark' ?
                    <Sun className="mr-2 h-4 w-4" /> :
                    <Moon className="mr-2 h-4 w-4" />}
                  Cambiar Tema
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <UserProfile
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />

      {/* Settings Modal */}
      {showSettings && <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />}
    </motion.header>
  );
});
