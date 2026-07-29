export function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

export function toRoman(num: number): string {
  const romanNumerals: Record<number, string> = {
    1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
    6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X',
  }
  return romanNumerals[num] || num.toString()
}

const SHORT_NAMES: Record<string, string> = {
  'FUNDAMENTOS DE PROGRAMACION': 'Fundamentos P.',
  'MATEMATICA I': 'Matematica 1', 'MATEMATICA II': 'Matematica 2',
  'MATEMATICA III': 'Matematica 3', 'MATEMATICA IV': 'Matematica 4',
  'METODOLOGIA Y TECNICAS DE ESTUDIO UNIVERSITARIO': 'Metodologia',
  'REDACCION Y COMUNICACION': 'Redaccion', 'FILOSOFIA': 'Filosofia',
  'SOCIOLOGIA Y REALIDAD NACIONAL': 'Sociologia',
  'BIOLOGIA Y MEDIO AMBIENTE': 'Biologia',
  'ESTRUCTURA DE DATOS': 'Est. Datos',
  'PROGRAMACION ORIENTADA A OBJETOS I': 'POO 1',
  'PROGRAMACION ORIENTADA A OBJETOS II': 'POO 2',
  'ALGEBRA LINEAL': 'Alg. Lineal',
  'MATEMATICAS DISCRETAS I': 'M. Discretas 1',
  'MATEMATICAS DISCRETAS II': 'MDiscretas 2',
  'ESTADISTICA BASICA': 'Estadistica', 'ETICA': 'Etica',
  'ANALISIS Y DISEÑO DE ALGORITMOS': 'ADA',
  'FUNDAMENTOS DE SISTEMAS DE INFORMACION': 'Fund. Sistemas',
  'PROBABILIDADES': 'Probabilidad',
  'FISICA ELECTRICA': 'Fisica Elec.',
  'ALGORITMOS PARALELOS': 'Algo. Paralelos',
  'ANALISIS Y DISEÑO DE SISTEMAS I': 'ADS 1',
  'ANALISIS Y DISEÑO DE SISTEMAS II': 'ADS 2',
  'BASE DE DATOS I': 'BD 1', 'BASE DE DATOS II': 'BD 2',
  'SISTEMAS OPERATIVOS': 'Sist. Operativos',
  'CIRCUITOS ELECTRICOS Y ELECTRONICOS': 'Circuitos Elec.',
  'INVESTIGACION OPERATIVA I': 'Inv. Operat. 1',
  'INVESTIGACION OPERATIVA II': 'Inv. Operat.2',
  'SISTEMAS DISTRIBUIDOS': 'Sist. Distribu.',
  'APLICACIONES WEB I': 'App Web 1',
  'APLICACIONES WEB II': 'App Web 2',
  'METODOS NUMERICOS': 'M. Numericos',
  'SISTEMAS DIGITALES': 'Sist. Digitale',
  'INGENIERIA DE SOFTWARE': 'Ing. Software',
  'BUSINESS INTELLIGENCE': 'Business Int.',
  'PROGRAMACION DE DISPOSITIVOS MOVILES I': 'Pro. Moviles 1',
  'PROGRAMACION DE DISPOSITIVOS MOVILES II': 'Pro. Moviles 2',
  'REALIDAD AUMENTADA': 'Realidad Aum.',
  'ARQUITECTURA DE COMPUTADORAS': 'Arq. Comp.',
  'DATA MINING': 'Data Mining',
  'CALIDAD DE SOFTWARE': 'Calidad SW',
  'PROGRAMACION DE VIDEO JUEGOS I': 'Videojuego 1',
  'PROGRAMACION DE VIDEO JUEGOS II': 'Videojuego 2',
  'REDES I': 'Redes 1', 'REDES II': 'Redes 2',
  'LENGUAJE DE BAJO NIVEL': 'Bajo Nivel',
  'CLOUD COMPUTING': 'Cloud Comp.',
  'PROCESAMIENTO DE IMAGENES Y VIDEOS': 'Proc. Img.',
  'PROYECTO DE INVESTIGACION I': 'Proy. Invest. 1',
  'PROYECTO DE INVESTIGACION II': 'Proy. Invest. 2',
  'INTERACCION HUMANO COMPUTADOR': 'HCI',
  'ROBOTICA I': 'Robotica 1', 'ROBOTICA II': 'Robotica 2',
  'INTELIGENCIA ARTIFICIAL I': 'IA 1',
  'INTELIGENCIA ARTIFICIAL II': 'IA 2',
  'SEGURIDAD INFORMATICA': 'Seg. Inform.',
  'FORMACION DE EMPRESAS CON BASE TECNOLOGICA': 'Form. Empres.',
  'PROYECTOS INFORMATICOS I': 'Proy. Infor. 1',
  'PROYECTOS INFORMATICOS II': 'Proy. Infor. 2',
  'AUDITORIA DE SISTEMAS DE INFORMACION': 'Auditoria SI',
  'SEGURIDAD DE LA INFORMACION': 'Seg. Info.',
  'SEMINARIO DE TESIS': 'Sem. Tesis',
}

export function getShortName(fullName: string): string {
  return SHORT_NAMES[fullName] || toTitleCase(fullName)
}

export function getAllPrerequisites(courseId: string, prereqMap: Record<string, string[]>): string[] {
  const result: string[] = []
  const visited = new Set<string>()
  function recurse(id: string) {
    if (visited.has(id)) return
    visited.add(id)
    for (const prereqId of prereqMap[id] || []) {
      result.push(prereqId)
      recurse(prereqId)
    }
  }
  recurse(courseId)
  return result
}

export function getAllDescendants(courseId: string, unlocksMap: Record<string, string[]>): string[] {
  const result: string[] = []
  const visited = new Set<string>()
  function recurse(id: string) {
    if (visited.has(id)) return
    visited.add(id)
    for (const unlockId of unlocksMap[id] || []) {
      result.push(unlockId)
      recurse(unlockId)
    }
  }
  recurse(courseId)
  return result
}
