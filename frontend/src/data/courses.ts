export interface Course {
  id: string
  name: string
  cycle: number
}

export const courses: Course[] = [
  // Ciclo 1
  { id: 'IS-121', name: 'FUNDAMENTOS DE PROGRAMACION', cycle: 1 },
  { id: 'IS-122', name: 'MATEMATICA I', cycle: 1 },
  { id: 'IS-123', name: 'METODOLOGIA Y TECNICAS DE ESTUDIO UNIVERSITARIO', cycle: 1 },
  { id: 'IS-124', name: 'REDACCION Y COMUNICACION', cycle: 1 },
  { id: 'IS-125', name: 'FILOSOFIA', cycle: 1 },
  { id: 'IS-126', name: 'SOCIOLOGIA Y REALIDAD NACIONAL', cycle: 1 },
  { id: 'IS-127', name: 'BIOLOGIA Y MEDIO AMBIENTE', cycle: 1 },
  // Ciclo 2
  { id: 'IS-221', name: 'ESTRUCTURA DE DATOS', cycle: 2 },
  { id: 'IS-223', name: 'PROGRAMACION ORIENTADA A OBJETOS I', cycle: 2 },
  { id: 'IS-224', name: 'ALGEBRA LINEAL', cycle: 2 },
  { id: 'IS-225', name: 'MATEMATICAS DISCRETAS I', cycle: 2 },
  { id: 'IS-226', name: 'MATEMATICA II', cycle: 2 },
  { id: 'IS-227', name: 'ESTADISTICA BASICA', cycle: 2 },
  { id: 'IS-228', name: 'ETICA', cycle: 2 },
  // Ciclo 3
  { id: 'IS-321', name: 'ANALISIS Y DISEÑO DE ALGORITMOS', cycle: 3 },
  { id: 'IS-322', name: 'PROGRAMACION ORIENTADA A OBJETOS II', cycle: 3 },
  { id: 'IS-323', name: 'FUNDAMENTOS DE SISTEMAS DE INFORMACION', cycle: 3 },
  { id: 'IS-324', name: 'MATEMATICA III', cycle: 3 },
  { id: 'IS-325', name: 'MATEMATICAS DISCRETAS II', cycle: 3 },
  { id: 'IS-326', name: 'PROBABILIDADES', cycle: 3 },
  { id: 'IS-327', name: 'FISICA ELECTRICA', cycle: 3 },
  // Ciclo 4
  { id: 'IS-421', name: 'ALGORITMOS PARALELOS', cycle: 4 },
  { id: 'IS-422', name: 'ANALISIS Y DISEÑO DE SISTEMAS I', cycle: 4 },
  { id: 'IS-423', name: 'BASE DE DATOS I', cycle: 4 },
  { id: 'IS-424', name: 'SISTEMAS OPERATIVOS', cycle: 4 },
  { id: 'IS-425', name: 'MATEMATICA IV', cycle: 4 },
  { id: 'IS-426', name: 'CIRCUITOS ELECTRICOS Y ELECTRONICOS', cycle: 4 },
  { id: 'IS-427', name: 'INVESTIGACION OPERATIVA I', cycle: 4 },
  // Ciclo 5
  { id: 'IS-521', name: 'SISTEMAS DISTRIBUIDOS', cycle: 5 },
  { id: 'IS-522', name: 'ANALISIS Y DISEÑO DE SISTEMAS II', cycle: 5 },
  { id: 'IS-523', name: 'BASE DE DATOS II', cycle: 5 },
  { id: 'IS-524', name: 'APLICACIONES WEB I', cycle: 5 },
  { id: 'IS-525', name: 'METODOS NUMERICOS', cycle: 5 },
  { id: 'IS-526', name: 'SISTEMAS DIGITALES', cycle: 5 },
  { id: 'IS-527', name: 'INVESTIGACION OPERATIVA II', cycle: 5 },
  // Ciclo 6
  { id: 'IS-621', name: 'INGENIERIA DE SOFTWARE', cycle: 6 },
  { id: 'IS-622', name: 'BUSINESS INTELLIGENCE', cycle: 6 },
  { id: 'IS-623', name: 'PROGRAMACION DE DISPOSITIVOS MOVILES I', cycle: 6 },
  { id: 'IS-624', name: 'APLICACIONES WEB II', cycle: 6 },
  { id: 'IS-625', name: 'REALIDAD AUMENTADA', cycle: 6 },
  { id: 'IS-626', name: 'ARQUITECTURA DE COMPUTADORAS', cycle: 6 },
  // Ciclo 7
  { id: 'IS-721', name: 'DATA MINING', cycle: 7 },
  { id: 'IS-722', name: 'CALIDAD DE SOFTWARE', cycle: 7 },
  { id: 'IS-723', name: 'PROGRAMACION DE DISPOSITIVOS MOVILES II', cycle: 7 },
  { id: 'IS-724', name: 'PROGRAMACION DE VIDEO JUEGOS I', cycle: 7 },
  { id: 'IS-725', name: 'REDES I', cycle: 7 },
  { id: 'IS-726', name: 'LENGUAJE DE BAJO NIVEL', cycle: 7 },
  // Ciclo 8
  { id: 'IS-821', name: 'CLOUD COMPUTING', cycle: 8 },
  { id: 'IS-822', name: 'PROCESAMIENTO DE IMAGENES Y VIDEOS', cycle: 8 },
  { id: 'IS-823', name: 'PROYECTO DE INVESTIGACION I', cycle: 8 },
  { id: 'IS-824', name: 'PROGRAMACION DE VIDEO JUEGOS II', cycle: 8 },
  { id: 'IS-825', name: 'INTERACCION HUMANO COMPUTADOR', cycle: 8 },
  { id: 'IS-826', name: 'REDES II', cycle: 8 },
  { id: 'IS-827', name: 'ROBOTICA I', cycle: 8 },
  // Ciclo 9
  { id: 'IS-921', name: 'INTELIGENCIA ARTIFICIAL I', cycle: 9 },
  { id: 'IS-922', name: 'SEGURIDAD INFORMATICA', cycle: 9 },
  { id: 'IS-923', name: 'PROYECTO DE INVESTIGACION II', cycle: 9 },
  { id: 'IS-924', name: 'FORMACION DE EMPRESAS CON BASE TECNOLOGICA', cycle: 9 },
  { id: 'IS-925', name: 'PROYECTOS INFORMATICOS I', cycle: 9 },
  { id: 'IS-926', name: 'ROBOTICA II', cycle: 9 },
  { id: 'IS-927', name: 'ELECTIVO I: PLANEAMIENTO ESTRATEGICO DE SISTEMAS DE INFORMACION', cycle: 9 },
  { id: 'IS-928', name: 'ELECTIVO I: TOPICOS AVANZADOS I', cycle: 9 },
  // Ciclo 10
  { id: 'IS-1021', name: 'INTELIGENCIA ARTIFICIAL II', cycle: 10 },
  { id: 'IS-1022', name: 'AUDITORIA DE SISTEMAS DE INFORMACION', cycle: 10 },
  { id: 'IS-1023', name: 'SEGURIDAD DE LA INFORMACION', cycle: 10 },
  { id: 'IS-1024', name: 'SEMINARIO DE TESIS', cycle: 10 },
  { id: 'IS-1025', name: 'ELECTIVO II: PLANEAMIENTO ESTRATEGICO DE TECNOLOGIA DE INFORMACION', cycle: 10 },
  { id: 'IS-1026', name: 'PROYECTOS INFORMATICOS II', cycle: 10 },
  { id: 'IS-1027', name: 'ELECTIVO II: TOPICOS AVANZADOS II', cycle: 10 },
]