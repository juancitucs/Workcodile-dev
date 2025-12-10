import { useState, memo } from 'react';
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
  Settings as SettingsIcon, 
  LogOut, 
  Moon, 
  Sun,
  User
} from 'lucide-react';

interface HeaderProps {
  onCreatePost: () => void;
  onSearch: (query: string) => void;
  onToggleMobileMenu: () => void;
}

export const Header = memo(function Header({ onCreatePost, onSearch, onToggleMobileMenu }: HeaderProps) {
  const { user, logout, theme, toggleTheme, resetMainFeed } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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
      className="sticky top-0 z-50 glass-card border-b border-workcodile-border-light shadow-modern"
    >
      <div className="container max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Hamburger Menu */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onToggleMobileMenu}
            >
              <Menu className="h-6 w-6" />
            </Button>

            {/* Logo */}
            <motion.div
              className="flex items-center space-x-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetMainFeed}
            >
              <div className="bg-gradient-to-br from-workcodile-green/10 to-workcodile-green-light/10 p-2 rounded-lg border border-workcodile-green/20 shadow-sm">
                <WorkCodileLogo className="h-8 w-8" />
              </div>
              <div className='hidden md:block'>
                <h1 className="text-xl font-bold text-primary">
                  Work<span className="text-foreground">Codile</span>
                </h1>
                <p className="text-xs text-muted-foreground">UNAM Community</p>
              </div>
            </motion.div>
          </div>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-6 sm:block">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar publicaciones..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 bg-workcodile-gray-light/30 border-workcodile-border-light backdrop-blur-sm focus:border-workcodile-green/50 transition-all duration-300"
              />
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Create Post Button */}
            <Button
              onClick={onCreatePost}
              className="hidden sm:flex items-center space-x-2 btn-modern"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              <span>Crear Post</span>
            </Button>

            <Button
              onClick={onCreatePost}
              className="sm:hidden"
              size="icon"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <EnhancedNotifications />

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className='sm:inline-flex'
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 rounded-full h-8 w-8">
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
                <DropdownMenuItem onClick={() => setShowProfile(true)}>
                  <User className="mr-2 h-4 w-4" />
                  Mi Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowSettings(true)}>
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuItem className="sm:hidden" onClick={toggleTheme}>
                  {theme === 'dark' ? 
                    <Sun className="mr-2 h-4 w-4" /> : 
                    <Moon className="mr-2 h-4 w-4" />}
                  Cambiar Tema
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
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