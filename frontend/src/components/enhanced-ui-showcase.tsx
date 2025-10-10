import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Sparkles, 
  Palette, 
  Layers, 
  Zap,
  Eye,
  Heart,
  Star,
  TrendingUp
} from 'lucide-react';

export function EnhancedUIShowcase() {
  const improvements = [
    {
      icon: Palette,
      title: "Bordes Menos Redondeados",
      description: "Reducido de 0.75rem a 0.375rem para un look más moderno y profesional",
      color: "from-blue-500 to-purple-500"
    },
    {
      icon: Layers,
      title: "Glassmorphism Avanzado",
      description: "Efectos de cristal con backdrop-blur y transparencias elegantes",
      color: "from-green-500 to-teal-500"
    },
    {
      icon: Sparkles,
      title: "Animaciones Fluidas",
      description: "Transiciones cubic-bezier para movimientos más naturales",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: Zap,
      title: "Efectos Hover Mejorados",
      description: "Elevación sutil y sombras dinámicas en interacciones",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Eye,
      title: "Scrollbars Modernos",
      description: "Barras de desplazamiento con gradientes y estilos minimalistas",
      color: "from-indigo-500 to-blue-500"
    },
    {
      icon: Star,
      title: "Gradientes Sutiles",
      description: "Backgrounds con múltiples capas de gradientes radiales",
      color: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-workcodile-green to-workcodile-green-light bg-clip-text text-transparent mb-4">
          <Sparkles className="h-8 w-8 text-workcodile-green" />
          <h2 className="text-3xl font-bold">Diseño Renovado</h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          WorkCodile ahora cuenta con un diseño más moderno, elegante y sofisticado. 
          Cada elemento ha sido cuidadosamente refinado para una mejor experiencia visual.
        </p>
      </motion.div>

      {/* Improvements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {improvements.map((improvement, index) => {
          const Icon = improvement.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="hover-lift"
            >
              <Card className="glass-card gradient-border shadow-modern hover:shadow-modern-lg h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${improvement.color} text-white shadow-md`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{improvement.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {improvement.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Demo Cards Section */}
      <div className="mt-12 space-y-6">
        <h3 className="text-2xl font-bold text-center mb-8">Ejemplos de Diseño</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Old vs New Comparison */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-1 bg-red-100 rounded">
                    <div className="w-4 h-4 bg-red-500 rounded" />
                  </div>
                  <span>Diseño Anterior</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 bg-muted/50 rounded-xl border">
                  <p className="text-sm text-muted-foreground">Bordes muy redondeados (12px)</p>
                </div>
                <div className="p-4 bg-background border rounded-xl">
                  <p className="text-sm text-muted-foreground">Efectos básicos</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-xl">
                  <p className="text-sm text-muted-foreground">Animaciones simples</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="glass-card gradient-border shadow-modern h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-1 bg-green-100 rounded">
                    <div className="w-4 h-4 bg-green-500 rounded" />
                  </div>
                  <span>Diseño Nuevo</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <motion.div 
                  className="p-4 glass-card shadow-modern hover:shadow-modern-lg transition-all duration-300"
                  whileHover={{ y: -2 }}
                >
                  <p className="text-sm text-muted-foreground">Bordes moderados (6px) ✨</p>
                </motion.div>
                <motion.div 
                  className="p-4 gradient-border hover-lift"
                  whileHover={{ scale: 1.02 }}
                >
                  <p className="text-sm text-muted-foreground">Glassmorphism avanzado 🔮</p>
                </motion.div>
                <motion.div 
                  className="p-4 shimmer bg-gradient-to-r from-workcodile-green-subtle/50 to-workcodile-gray-subtle/30 rounded-md"
                  whileHover={{ y: -1 }}
                >
                  <p className="text-sm text-muted-foreground">Animaciones fluidas 🎭</p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex justify-center space-x-4 pt-8"
      >
        <Button className="btn-modern">
          <Heart className="h-4 w-4 mr-2" />
          Me Gusta el Nuevo Diseño
        </Button>
        <Button variant="outline" className="hover-lift">
          <TrendingUp className="h-4 w-4 mr-2" />
          Ver Más Mejoras
        </Button>
      </motion.div>
    </div>
  );
}