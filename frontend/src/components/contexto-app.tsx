import { createContext, useContext, useState, ReactNode } from 'react';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  avatar?: string;
  universidad: string;
}

interface Curso {
  id: string;
  nombre: string;
  ciclo: number;
}

interface ArchivoAdjunto {
  id: string;
  nombre: string;
  tamaño: number;
  tipo: string;
  url?: string; // Para archivos subidos
  archivo?: File; // Para archivos locales
}

interface Publicacion {
  id: string;
  titulo: string;
  contenido: string;
  autor: Usuario;
  fechaCreacion: Date;
  curso: string; // ID del curso
  votos_positivos: number;
  votos_negativos: number;
  comentarios: Comentario[];
  voto_usuario?: 'positivo' | 'negativo';
  hashtags: string[];
  archivos: ArchivoAdjunto[];
  // Sistema de calificación
  calificacion: number; // Calificación promedio (0-5)
  calificacion_promedio?: number; // Igual que calificacion, para compatibilidad
  total_calificaciones: number; // Número total de calificaciones
  calificacion_usuario?: number; // Calificación del usuario actual (0-5, 0 significa sin calificación)
  // Campos adicionales
  vistas: number;
  esta_guardado?: boolean;
}

interface Comentario {
  id: string;
  contenido: string;
  autor: Usuario;
  fechaCreacion: Date;
  votos_positivos: number;
  votos_negativos: number;
  voto_usuario?: 'positivo' | 'negativo';
}

interface ContextoAppTipo {
  usuario: Usuario | null;
  publicaciones: Publicacion[];
  cursos: Curso[];
  iniciarSesion: (email: string, password: string) => Promise<void>;
  registrarse: (nombre: string, email: string, password: string) => Promise<void>;
  cerrarSesion: () => void;
  actualizarPerfil: (datosPerful: Partial<Usuario>) => void;
  crearPublicacion: (titulo: string, contenido: string, curso: string, hashtags: string[], archivos: ArchivoAdjunto[]) => void;
  votarPublicacion: (idPublicacion: string, voto: 'positivo' | 'negativo') => void;
  agregarComentario: (idPublicacion: string, contenido: string) => void;
  votarComentario: (idPublicacion: string, idComentario: string, voto: 'positivo' | 'negativo') => void;
  buscarPublicaciones: (consulta: string) => Publicacion[];
  obtenerCursoPorId: (idCurso: string) => Curso | undefined;
  obtenerCursosPorCiclo: (ciclo: number) => Curso[];
  esModoOscuro: boolean;
  alternarModoOscuro: () => void;
  // Nuevas funciones de calificación y características adicionales
  calificarPublicacion: (idPublicacion: string, calificacion: number) => void;
  alternarGuardado: (idPublicacion: string) => void;
  reportarPublicacion: (idPublicacion: string) => void;
  incrementarVistas: (idPublicacion: string) => void;
}

const ContextoApp = createContext<ContextoAppTipo | undefined>(undefined);

const cursos: Curso[] = [
  // Ciclo 1
  { id: 'IS-121', nombre: 'FUNDAMENTOS DE PROGRAMACION', ciclo: 1 },
  { id: 'IS-122', nombre: 'MATEMATICA I', ciclo: 1 },
  { id: 'IS-123', nombre: 'METODOLOGIA Y TECNICAS DE ESTUDIO UNIVERSITARIO', ciclo: 1 },
  { id: 'IS-124', nombre: 'REDACCION Y COMUNICACION', ciclo: 1 },
  { id: 'IS-125', nombre: 'FILOSOFIA', ciclo: 1 },
  { id: 'IS-126', nombre: 'SOCIOLOGIA Y REALIDAD NACIONAL', ciclo: 1 },
  { id: 'IS-127', nombre: 'BIOLOGIA Y MEDIO AMBIENTE', ciclo: 1 },
  
  // Ciclo 2
  { id: 'IS-221', nombre: 'ESTRUCTURA DE DATOS', ciclo: 2 },
  { id: 'IS-223', nombre: 'PROGRAMACION ORIENTADA A OBJETOS I', ciclo: 2 },
  { id: 'IS-224', nombre: 'ALGEBRA LINEAL', ciclo: 2 },
  { id: 'IS-225', nombre: 'MATEMATICAS DISCRETAS I', ciclo: 2 },
  { id: 'IS-226', nombre: 'MATEMATICA II', ciclo: 2 },
  { id: 'IS-227', nombre: 'ESTADISTICA BASICA', ciclo: 2 },
  { id: 'IS-228', nombre: 'ETICA', ciclo: 2 },
  
  // Ciclo 3
  { id: 'IS-321', nombre: 'ANALISIS Y DISEÑO DE ALGORITMOS', ciclo: 3 },
  { id: 'IS-322', nombre: 'PROGRAMACION ORIENTADA A OBJETOS II', ciclo: 3 },
  { id: 'IS-323', nombre: 'FUNDAMENTOS DE SISTEMAS DE INFORMACION', ciclo: 3 },
  { id: 'IS-324', nombre: 'MATEMATICA III', ciclo: 3 },
  { id: 'IS-325', nombre: 'MATEMATICAS DISCRETAS II', ciclo: 3 },
  { id: 'IS-326', nombre: 'PROBABILIDADES', ciclo: 3 },
  { id: 'IS-327', nombre: 'FISICA ELECTRICA', ciclo: 3 },
  
  // Ciclo 4
  { id: 'IS-421', nombre: 'ALGORITMOS PARALELOS', ciclo: 4 },
  { id: 'IS-422', nombre: 'ANALISIS Y DISEÑO DE SISTEMAS I', ciclo: 4 },
  { id: 'IS-423', nombre: 'BASE DE DATOS I', ciclo: 4 },
  { id: 'IS-424', nombre: 'SISTEMAS OPERATIVOS', ciclo: 4 },
  { id: 'IS-425', nombre: 'MATEMATICA IV', ciclo: 4 },
  { id: 'IS-426', nombre: 'CIRCUITOS ELECTRICOS Y ELECTRONICOS', ciclo: 4 },
  { id: 'IS-427', nombre: 'INVESTIGACION OPERATIVA I', ciclo: 4 },
  
  // Ciclo 5
  { id: 'IS-521', nombre: 'SISTEMAS DISTRIBUIDOS', ciclo: 5 },
  { id: 'IS-522', nombre: 'ANALISIS Y DISEÑO DE SISTEMAS II', ciclo: 5 },
  { id: 'IS-523', nombre: 'BASE DE DATOS II', ciclo: 5 },
  { id: 'IS-524', nombre: 'APLICACIONES WEB I', ciclo: 5 },
  { id: 'IS-525', nombre: 'METODOS NUMERICOS', ciclo: 5 },
  { id: 'IS-526', nombre: 'SISTEMAS DIGITALES', ciclo: 5 },
  { id: 'IS-527', nombre: 'INVESTIGACION OPERATIVA II', ciclo: 5 },
  
  // Ciclo 6
  { id: 'IS-621', nombre: 'INGENIERIA DE SOFTWARE', ciclo: 6 },
  { id: 'IS-622', nombre: 'BUSINESS INTELLIGENCE', ciclo: 6 },
  { id: 'IS-623', nombre: 'PROGRAMACION DE DISPOSITIVOS MOVILES I', ciclo: 6 },
  { id: 'IS-624', nombre: 'APLICACIONES WEB II', ciclo: 6 },
  { id: 'IS-625', nombre: 'REALIDAD AUMENTADA', ciclo: 6 },
  { id: 'IS-626', nombre: 'ARQUITECTURA DE COMPUTADORAS', ciclo: 6 },
  
  // Ciclo 7
  { id: 'IS-721', nombre: 'DATA MINING', ciclo: 7 },
  { id: 'IS-722', nombre: 'CALIDAD DE SOFTWARE', ciclo: 7 },
  { id: 'IS-723', nombre: 'PROGRAMACION DE DISPOSITIVOS MOVILES II', ciclo: 7 },
  { id: 'IS-724', nombre: 'PROGRAMACION DE VIDEO JUEGOS I', ciclo: 7 },
  { id: 'IS-725', nombre: 'REDES I', ciclo: 7 },
  { id: 'IS-726', nombre: 'LENGUAJE DE BAJO NIVEL', ciclo: 7 },
  
  // Ciclo 8
  { id: 'IS-821', nombre: 'CLOUD COMPUTING', ciclo: 8 },
  { id: 'IS-822', nombre: 'PROCESAMIENTO DE IMAGENES Y VIDEOS', ciclo: 8 },
  { id: 'IS-823', nombre: 'PROYECTO DE INVESTIGACION I', ciclo: 8 },
  { id: 'IS-824', nombre: 'PROGRAMACION DE VIDEO JUEGOS II', ciclo: 8 },
  { id: 'IS-825', nombre: 'INTERACCION HUMANO COMPUTADOR', ciclo: 8 },
  { id: 'IS-826', nombre: 'REDES II', ciclo: 8 },
  { id: 'IS-827', nombre: 'ROBOTICA I', ciclo: 8 },
  
  // Ciclo 9
  { id: 'IS-921', nombre: 'INTELIGENCIA ARTIFICIAL I', ciclo: 9 },
  { id: 'IS-922', nombre: 'SEGURIDAD INFORMATICA', ciclo: 9 },
  { id: 'IS-923', nombre: 'PROYECTO DE INVESTIGACION II', ciclo: 9 },
  { id: 'IS-924', nombre: 'FORMACION DE EMPRESAS CON BASE TECNOLOGICA', ciclo: 9 },
  { id: 'IS-925', nombre: 'PROYECTOS INFORMATICOS I', ciclo: 9 },
  { id: 'IS-926', nombre: 'ROBOTICA II', ciclo: 9 },
  { id: 'IS-927', nombre: 'ELECTIVO I: PLANEAMIENTO ESTRATEGICO DE SISTEMAS DE INFORMACION', ciclo: 9 },
  { id: 'IS-928', nombre: 'ELECTIVO I: TOPICOS AVANZADOS I', ciclo: 9 },
  
  // Ciclo 10
  { id: 'IS-1021', nombre: 'INTELIGENCIA ARTIFICIAL II', ciclo: 10 },
  { id: 'IS-1022', nombre: 'AUDITORIA DE SISTEMAS DE INFORMACION', ciclo: 10 },
  { id: 'IS-1023', nombre: 'SEGURIDAD DE LA INFORMACION', ciclo: 10 },
  { id: 'IS-1024', nombre: 'SEMINARIO DE TESIS', ciclo: 10 },
  { id: 'IS-1025', nombre: 'ELECTIVO II: PLANEAMIENTO ESTRATEGICO DE TECNOLOGIA DE INFORMACION', ciclo: 10 },
  { id: 'IS-1026', nombre: 'PROYECTOS INFORMATICOS II', ciclo: 10 },
  { id: 'IS-1027', nombre: 'ELECTIVO II: TOPICOS AVANZADOS II', ciclo: 10 }
];

const usuariosMock: Usuario[] = [
  {
    id: '1',
    nombre: 'Ana García',
    email: 'ana.garcia@unam.edu.pe',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b977?w=100&h=100&fit=crop&crop=face',
    universidad: 'UNAM'
  },
  {
    id: '2',
    nombre: 'Carlos Mendoza',
    email: 'carlos.mendoza@unam.edu.pe',
    // Sin avatar para mostrar el logo por defecto
    universidad: 'UNAM'
  },
  {
    id: '3',
    nombre: 'María Rodriguez',
    email: 'maria.rodriguez@unam.edu.pe',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    universidad: 'UNAM'
  }
];

const publicacionesMock: Publicacion[] = [
  {
    id: '1',
    titulo: '🔍 Busco tutor para Matemática II',
    contenido: 'Hola estudiantes de UNAM! Necesito ayuda con Matemática II, especialmente con integrales. Estoy dispuesto a pagar por sesiones de tutoría. Si alguien puede ayudarme, por favor contáctenme.',
    autor: usuariosMock[0],
    fechaCreacion: new Date('2024-01-15T10:30:00'),
    curso: 'IS-226',
    votos_positivos: 12,
    votos_negativos: 1,
    hashtags: ['tutoría', 'matemática', 'integrales', 'ayuda'],
    archivos: [
      {
        id: 'att1',
        nombre: 'ejercicios_matematica_ii.pdf',
        tamaño: 2048000,
        tipo: 'application/pdf'
      }
    ],
    comentarios: [
      {
        id: '1',
        contenido: 'Hola Ana! Yo puedo ayudarte con Matemática II. Soy estudiante de quinto ciclo de Ingeniería. Mándame un mensaje.',
        autor: usuariosMock[1],
        fechaCreacion: new Date('2024-01-15T11:00:00'),
        votos_positivos: 3,
        votos_negativos: 0
      }
    ],
    calificacion: 4.2,
    calificacion_promedio: 4.2,
    total_calificaciones: 8,
    calificacion_usuario: 5,
    vistas: 156,
    esta_guardado: false
  },
  {
    id: '2',
    titulo: '💻 Ofrezco servicios para Aplicaciones Web I',
    contenido: 'Soy estudiante de Ingeniería de Sistemas y ofrezco servicios de desarrollo web (HTML, CSS, JavaScript, React). Precios accesibles para estudiantes. Portfolio disponible.',
    autor: usuariosMock[1],
    fechaCreacion: new Date('2024-01-14T15:45:00'),
    curso: 'IS-524',
    votos_positivos: 25,
    votos_negativos: 2,
    hashtags: ['desarrollo', 'web', 'react', 'javascript', 'freelance'],
    archivos: [
      {
        id: 'att2',
        nombre: 'portfolio_proyectos.zip',
        tamaño: 5120000,
        tipo: 'application/zip'
      },
      {
        id: 'att3',
        nombre: 'certificados_cursos.jpg',
        tamaño: 1024000,
        tipo: 'image/jpeg'
      }
    ],
    comentarios: [
      {
        id: '2',
        contenido: '¿Tienes experiencia con bases de datos? Necesito ayuda con un proyecto de MySQL.',
        autor: usuariosMock[2],
        fechaCreacion: new Date('2024-01-14T16:30:00'),
        votos_positivos: 1,
        votos_negativos: 0
      },
      {
        id: '3',
        contenido: 'Sí, manejo MySQL, PostgreSQL y MongoDB. Te puedo ayudar sin problema.',
        autor: usuariosMock[1],
        fechaCreacion: new Date('2024-01-14T16:45:00'),
        votos_positivos: 2,
        votos_negativos: 0
      }
    ],
    calificacion: 4.8,
    calificacion_promedio: 4.8,
    total_calificaciones: 15,
    calificacion_usuario: 0,
    vistas: 342,
    esta_guardado: true
  },
  {
    id: '3',
    titulo: '📚 Grupo de estudio para Estadística Básica',
    contenido: 'Estoy formando un grupo de estudio para el curso de Estadística Básica del profesor Mamani. Nos juntaríamos los sábados por la tarde en la biblioteca. ¿Quién se apunta?',
    autor: usuariosMock[2],
    fechaCreacion: new Date('2024-01-13T09:15:00'),
    curso: 'IS-227',
    votos_positivos: 18,
    votos_negativos: 0,
    hashtags: ['grupo', 'estudio', 'estadística', 'biblioteca', 'sábados'],
    archivos: [],
    comentarios: [],
    calificacion: 3.9,
    calificacion_promedio: 3.9,
    total_calificaciones: 12,
    calificacion_usuario: 4,
    vistas: 89,
    esta_guardado: false
  },
  {
    id: '4',
    titulo: '⚠️ Aviso: Laboratorio para Fundamentos de Programación',
    contenido: 'Por mantenimiento, el laboratorio de computación estará cerrado del 20 al 25 de enero. Por favor planifiquen sus trabajos de Fundamentos de Programación con anticipación.',
    autor: usuariosMock[0],
    fechaCreacion: new Date('2024-01-12T14:20:00'),
    curso: 'IS-121',
    votos_positivos: 8,
    votos_negativos: 3,
    hashtags: ['aviso', 'laboratorio', 'mantenimiento', 'programación'],
    archivos: [],
    comentarios: [
      {
        id: '4',
        contenido: 'Gracias por el aviso. ¿Hay algún laboratorio alternativo disponible?',
        autor: usuariosMock[1],
        fechaCreacion: new Date('2024-01-12T15:00:00'),
        votos_positivos: 2,
        votos_negativos: 0
      }
    ],
    calificacion: 3.5,
    calificacion_promedio: 3.5,
    total_calificaciones: 6,
    calificacion_usuario: 0,
    vistas: 234,
    esta_guardado: false
  }
];

export function ProveedorApp({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>(publicacionesMock);
  const [esModoOscuro, setEsModoOscuro] = useState(false);

  const iniciarSesion = async (email: string, password: string) => {
    // Simular llamada a la API
    await new Promise(resolve => setTimeout(resolve, 1000));
    const usuarioEncontrado = usuariosMock.find(u => u.email === email);
    if (usuarioEncontrado) {
      setUsuario(usuarioEncontrado);
    } else {
      throw new Error('Usuario no encontrado');
    }
  };

  const registrarse = async (nombre: string, email: string, password: string) => {
    // Simular llamada a la API
    await new Promise(resolve => setTimeout(resolve, 1000));
    const nuevoUsuario: Usuario = {
      id: Date.now().toString(),
      nombre,
      email,
      universidad: 'UNAM'
    };
    setUsuario(nuevoUsuario);
  };

  const cerrarSesion = () => {
    setUsuario(null);
  };

  const actualizarPerfil = (datosPerful: Partial<Usuario>) => {
    if (usuario) {
      setUsuario({ ...usuario, ...datosPerful });
    }
  };

  const crearPublicacion = (titulo: string, contenido: string, curso: string, hashtags: string[], archivos: ArchivoAdjunto[]) => {
    if (!usuario) return;
    
    const nuevaPublicacion: Publicacion = {
      id: Date.now().toString(),
      titulo,
      contenido,
      autor: usuario,
      fechaCreacion: new Date(),
      curso,
      votos_positivos: 0,
      votos_negativos: 0,
      comentarios: [],
      hashtags,
      archivos,
      calificacion: 0,
      calificacion_promedio: 0,
      total_calificaciones: 0,
      calificacion_usuario: 0,
      vistas: 0,
      esta_guardado: false
    };
    
    setPublicaciones(prev => [nuevaPublicacion, ...prev]);
  };

  const votarPublicacion = (idPublicacion: string, voto: 'positivo' | 'negativo') => {
    setPublicaciones(prev => prev.map(publicacion => {
      if (publicacion.id === idPublicacion) {
        const votoActual = publicacion.voto_usuario;
        let nuevosVotosPositivos = publicacion.votos_positivos;
        let nuevosVotosNegativos = publicacion.votos_negativos;
        let nuevoVotoUsuario: 'positivo' | 'negativo' | undefined = voto;

        // Remover voto anterior
        if (votoActual === 'positivo') nuevosVotosPositivos--;
        if (votoActual === 'negativo') nuevosVotosNegativos--;

        // Agregar nuevo voto si es diferente del actual
        if (votoActual === voto) {
          nuevoVotoUsuario = undefined;
        } else {
          if (voto === 'positivo') nuevosVotosPositivos++;
          if (voto === 'negativo') nuevosVotosNegativos++;
        }

        return {
          ...publicacion,
          votos_positivos: nuevosVotosPositivos,
          votos_negativos: nuevosVotosNegativos,
          voto_usuario: nuevoVotoUsuario
        };
      }
      return publicacion;
    }));
  };

  const agregarComentario = (idPublicacion: string, contenido: string) => {
    if (!usuario) return;

    const nuevoComentario: Comentario = {
      id: Date.now().toString(),
      contenido,
      autor: usuario,
      fechaCreacion: new Date(),
      votos_positivos: 0,
      votos_negativos: 0
    };

    setPublicaciones(prev => prev.map(publicacion => {
      if (publicacion.id === idPublicacion) {
        return {
          ...publicacion,
          comentarios: [...publicacion.comentarios, nuevoComentario]
        };
      }
      return publicacion;
    }));
  };

  const votarComentario = (idPublicacion: string, idComentario: string, voto: 'positivo' | 'negativo') => {
    setPublicaciones(prev => prev.map(publicacion => {
      if (publicacion.id === idPublicacion) {
        return {
          ...publicacion,
          comentarios: publicacion.comentarios.map(comentario => {
            if (comentario.id === idComentario) {
              const votoActual = comentario.voto_usuario;
              let nuevosVotosPositivos = comentario.votos_positivos;
              let nuevosVotosNegativos = comentario.votos_negativos;
              let nuevoVotoUsuario: 'positivo' | 'negativo' | undefined = voto;

              if (votoActual === 'positivo') nuevosVotosPositivos--;
              if (votoActual === 'negativo') nuevosVotosNegativos--;

              if (votoActual === voto) {
                nuevoVotoUsuario = undefined;
              } else {
                if (voto === 'positivo') nuevosVotosPositivos++;
                if (voto === 'negativo') nuevosVotosNegativos++;
              }

              return {
                ...comentario,
                votos_positivos: nuevosVotosPositivos,
                votos_negativos: nuevosVotosNegativos,
                voto_usuario: nuevoVotoUsuario
              };
            }
            return comentario;
          })
        };
      }
      return publicacion;
    }));
  };

  const buscarPublicaciones = (consulta: string) => {
    if (!consulta.trim()) return publicaciones;
    
    return publicaciones.filter(publicacion => 
      publicacion.titulo.toLowerCase().includes(consulta.toLowerCase()) ||
      publicacion.contenido.toLowerCase().includes(consulta.toLowerCase()) ||
      publicacion.autor.nombre.toLowerCase().includes(consulta.toLowerCase()) ||
      publicacion.hashtags.some(tag => tag.toLowerCase().includes(consulta.toLowerCase()))
    );
  };

  const obtenerCursoPorId = (idCurso: string) => {
    return cursos.find(curso => curso.id === idCurso);
  };

  const obtenerCursosPorCiclo = (ciclo: number) => {
    return cursos.filter(curso => curso.ciclo === ciclo);
  };

  const alternarModoOscuro = () => {
    setEsModoOscuro(prev => !prev);
    document.documentElement.classList.toggle('dark');
  };

  const calificarPublicacion = (idPublicacion: string, calificacion: number) => {
    if (!usuario) return; // Asegurar que el usuario esté logueado
    
    setPublicaciones(prev => prev.map(publicacion => {
      if (publicacion.id === idPublicacion) {
        const fueCalificadoPorUsuario = publicacion.calificacion_usuario && publicacion.calificacion_usuario > 0;
        const nuevoTotalCalificaciones = fueCalificadoPorUsuario ? publicacion.total_calificaciones : publicacion.total_calificaciones + 1;
        
        // Calcular nueva calificación promedio
        const totalActual = publicacion.calificacion * publicacion.total_calificaciones;
        const nuevoTotal = fueCalificadoPorUsuario 
          ? totalActual - (publicacion.calificacion_usuario || 0) + calificacion
          : totalActual + calificacion;
        const nuevaCalificacionPromedio = nuevoTotalCalificaciones > 0 ? nuevoTotal / nuevoTotalCalificaciones : 0;

        console.log(`Usuario ${usuario.nombre} calificó el post "${publicacion.titulo}" con ${calificacion} cocodrilos`);

        return {
          ...publicacion,
          calificacion: nuevaCalificacionPromedio,
          total_calificaciones: nuevoTotalCalificaciones,
          calificacion_usuario: calificacion
        };
      }
      return publicacion;
    }));
  };

  const alternarGuardado = (idPublicacion: string) => {
    setPublicaciones(prev => prev.map(publicacion => {
      if (publicacion.id === idPublicacion) {
        return {
          ...publicacion,
          esta_guardado: !publicacion.esta_guardado
        };
      }
      return publicacion;
    }));
  };

  const reportarPublicacion = (idPublicacion: string) => {
    // En una app real, esto enviaría un reporte al backend
    console.log(`Publicación ${idPublicacion} reportada por el usuario ${usuario?.id}`);
  };

  const incrementarVistas = (idPublicacion: string) => {
    setPublicaciones(prev => prev.map(publicacion => {
      if (publicacion.id === idPublicacion) {
        return {
          ...publicacion,
          vistas: publicacion.vistas + 1
        };
      }
      return publicacion;
    }));
  };

  return (
    <ContextoApp.Provider value={{
      usuario,
      publicaciones,
      cursos,
      iniciarSesion,
      registrarse,
      cerrarSesion,
      actualizarPerfil,
      crearPublicacion,
      votarPublicacion,
      agregarComentario,
      votarComentario,
      buscarPublicaciones,
      obtenerCursoPorId,
      obtenerCursosPorCiclo,
      esModoOscuro,
      alternarModoOscuro,
      calificarPublicacion,
      alternarGuardado,
      reportarPublicacion,
      incrementarVistas
    }}>
      {children}
    </ContextoApp.Provider>
  );
}

export function usarApp() {
  const contexto = useContext(ContextoApp);
  if (!contexto) {
    throw new Error('usarApp debe ser usado dentro de un ProveedorApp');
  }
  return contexto;
}