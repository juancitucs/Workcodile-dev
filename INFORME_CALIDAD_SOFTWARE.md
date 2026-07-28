# INFORME TÉCNICO - UNIDAD I
## Implementación de Modelos de Calidad y Procesos de Software

**Curso:** Calidad de Software (IS-722)
**Docente:** Mgr. Juan Carlos Valero Gomez
**Institución:** Universidad Nacional de Moquegua - Facultad de Ingenierías
**Mini-Proyecto:** WorkCodile Foro - Plataforma de Foro Académico UNAM
**Equipo:** Mendoza S., Luna L., Calizaya Ll., Condori A.
**Herramienta de Gestión:** Jira

---

# 1. Introducción del Proyecto

*Elaborado por: Harol Mendoza (Líder de Equipo)*

## 1.1. Propósito del Mini-Proyecto Seleccionado

El mini-proyecto seleccionado es **WorkCodile Foro**, una plataforma web de foro académico exclusiva para estudiantes de la Universidad Nacional de Moquegua (UNAM). El sistema resuelve la problemática de la comunicación académica dispersa entre estudiantes: actualmente los alumnos usan WhatsApp, correo y grupos informales para compartir trabajos, tutorías y material de estudio, lo que genera pérdida de información y falta de trazabilidad.

WorkCodile Foro centraliza la colaboración académica en un solo lugar, permitiendo a los estudiantes compartir publicaciones con contenido enriquecido (Markdown, archivos adjuntos), comentar anidadamente, votar contenido útil y acumular experiencia (XP) y niveles como reconocimiento a su participación.

La plataforma incluye los siguientes módulos funcionales:

| Módulo | Descripción |
|--------|-------------|
| **Autenticación** | Registro con verificación de correo UNAM (código 6 dígitos), login con JWT, roles (student, moderator, admin), recuperación de contraseña |
| **Foro** | Publicaciones con Markdown, hashtags, archivos adjuntos, scroll infinito, búsqueda, filtrado por curso y ciclo académico |
| **Interacción** | Comentarios anidados ilimitados, votación upvote/downvote con toggle, reporte de contenido inapropiado |
| **Gamificación** | Sistema de XP (+10 post, +3 comentario, +5 upvote recibido), 20 niveles, estadísticas de usuario |
| **Notificaciones** | Notificaciones de votos recibidos, nuevos comentarios, marcado como leído |
| **Usuario** | Perfil con avatar, biografía, enlaces sociales, logros, temas oscuro/claro |

Desde el punto de vista tecnológico el proyecto utiliza:

| Capa | Tecnología utilizada |
|------|---------------------|
| Backend | Node.js + Express.js + Mongoose ODM |
| Base de datos | MongoDB 7 |
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Componentes UI | shadcn/ui (Radix UI primitives) |
| Estado | React Context + TanStack Query |
| Almacenamiento | MinIO (S3-compatible) |
| Contenedores | Docker + Docker Compose + Nginx |

Este proyecto es adecuado como mini-proyecto de la Unidad I porque: (a) cuenta con módulos bien delimitados y unidades de trabajo medibles, (b) ya existe un repositorio de código base que permite aplicar prácticas de CMMI-REQM, CMMI-PP, CMMI-PPQA y PSP sobre código real, y (c) permite analizar y documentar defectos reales encontrados en el código para su corrección en la siguiente iteración.

## 1.2. Objetivos de Implementar Calidad en Este Proyecto

| N.º | Objetivo | Marco de referencia | Resultado esperado |
|-----|----------|-------------------|-------------------|
| OBJ-01 | Establecer un proceso de gestión de requisitos formal que evite cambios no controlados en el alcance del sistema | CMMI-DEV v1.3 Área: REQM | Matriz de trazabilidad con 14 requisitos versionados y estado rastreado |
| OBJ-02 | Planificar el trabajo del equipo mediante estimaciones de esfuerzo y cronograma antes de iniciar cualquier tarea | CMMI-DEV v1.3 Área: PP | Plan de proyecto con WBS, estimaciones en PH y cronograma Gantt |
| OBJ-03 | Identificar y documentar defectos en el código existente mediante revisiones técnicas y análisis estático | CMMI-DEV v1.3 Área: PPQA + PSP | Defect Log con defectos reales del proyecto categorizados por tipo y severidad |
| OBJ-04 | Medir la productividad y densidad de defectos de cada integrante mediante registro personal de tiempos y errores | PSP — Personal Software Process | Formularios PSP de tiempo (Time Log) y registro de defectos (Defect Log) por integrante |
| OBJ-05 | Evaluar el nivel de madurez real del equipo frente a CMMI-DEV v1.3 para identificar brechas y planificar mejoras | CMMI-DEV v1.3 Gap Analysis | Matriz de cumplimiento de PP, REQM y PPQA con acciones de mejora |

---

# 2. Marco Organizacional (TSP)

*Elaborado por: Harol Mendoza (Líder de Equipo)*

## 2.1. Matriz de Roles y Responsabilidades

| Integrante | Rol TSP | Responsabilidad 1 | Responsabilidad 2 | Responsabilidad 3 | Métrica PSP a registrar |
|-----------|---------|-------------------|-------------------|-------------------|----------------------|
| **MENDOZA SEGURA, Harol Gerardo** | **Líder de Equipo** | Coordinar reuniones de planificación y seguimiento semanal | Tomar decisiones técnicas ante bloqueos del equipo | Validar que los entregables cumplan el índice del informe | Horas de gestión vs. plan; registro de decisiones en bitácora |
| **LUNA LUNA, Joel Sebastian** | **Gestor de Planeación** | Elaborar y mantener el cronograma Gantt del proyecto | Estimar tamaño (PH) y esfuerzo (hh) por tarea | Gestionar la WBS con dependencias e hitos de calidad | Varianza de esfuerzo planificado vs. real por sprint |
| **CALIZAYA LLANOS, Juan Edwin** | **Gestor de Calidad** | Aplicar checklist REQM en cada revisión de requisitos | Registrar defectos encontrados en revisiones por pares y análisis de código | Mantener actualizada la Matriz de Trazabilidad | Densidad de defectos (defectos / KLOC); % de requisitos revisados |
| **CONDORI APAZA, Fernando Manuel** | **Gestor de Soporte** | Configurar repositorio GitHub y tablero Jira | Documentar el flujo de cambios en el repositorio | Soporte técnico en la integración frontend–backend | Número de commits por sprint; tiempo de resolución de conflictos Git |

## 2.2. Estrategia de Desarrollo Seleccionada y Justificación

**Estrategia seleccionada: Desarrollo Iterativo e Incremental con Scrum, integrado con las prácticas de planificación del TSP.**

El equipo adoptará Scrum como marco de trabajo ágil, combinando sus ceremonias y artefactos con la disciplina de planificación cuantitativa que exige el TSP. La siguiente tabla resume la correspondencia entre los elementos de Scrum y las prácticas del TSP/CMMI:

| Elemento Scrum | Equivalencia TSP/CMMI | Aplicación en WorkCodile Foro |
|---------------|----------------------|------------------------------|
| Sprint (2 semanas) | Ciclo de planificación TSP; iteración de CMMI-PP | Cada sprint cubre uno o dos módulos del sistema |
| Sprint Planning | TSP Launch — Plan de equipo; CMMI-PP SG1 | El Gestor de Planeación estima PH y horas; el Líder asigna tareas en Jira |
| Daily Scrum | TSP — Seguimiento diario; CMMI-PMC | Reunión de 10 min para detectar bloqueos |
| Sprint Review | CMMI-VER — Verificación del incremento | El Gestor de Calidad aplica checklist PPQA |
| Sprint Retrospective | PSP — Análisis de desempeño personal | Cada integrante revisa métricas y propone mejoras |
| Product Backlog | CMMI-REQM — Gestión de requisitos | El Gestor de Calidad mantiene la trazabilidad |

**Justificación:** Se elige Scrum porque permite iteraciones cortas (sprints de 2 semanas) que se alinean naturalmente con las prácticas de planificación de CMMI-PP. Scrum facilita la priorización de requisitos mediante el Product Backlog, lo que complementa la gestión de requisitos de CMMI-REQM. Las retrospectivas proporcionan un mecanismo natural para la mejora continua.

## 2.3. Herramientas de Gestión a Utilizar (Evidencia de Configuración)

*Elaborado por: Fernando Condori (Gestor de Soporte)*

| N.º | Herramienta | Propósito | Configuración en el proyecto |
|-----|-------------|-----------|------------------------------|
| H-01 | **GitHub** (Control de versiones) | Alojar el repositorio del código fuente, gestionar ramas y registrar el historial de cambios | Repositorio con rama `main`. Pendiente: estrategia de branching y tags. |
| H-02 | **Jira Software** (Gestión ágil) | Gestionar el Product Backlog, planificar sprints, asignar tareas | Proyecto Scrum "WorkCodile Foro - IS722"; 4 integrantes invitados |
| H-03 | **Google Sheets** (PSP / Métricas) | Registrar tiempo y defectos individuales | Hoja compartida con 4 pestañas |
| H-04 | **Mermaid / Draw.io** (Diagramas) | Elaborar WBS, flujo de cambios y diagramas | Código fuente en repositorio |
| H-05 | **Word / Overleaf** (Documentación) | Redactar el informe técnico y generar PDF | Arial 11, interlineado 1.15 |

### Jira Software

- **Tipo de proyecto:** Scrum
- **Nombre:** WorkCodile Foro - IS722
- **Miembros:** Harol Mendoza, Joel Luna, Juan Calizaya, Fernando Condori
- **Workflow:** To Do → In Progress → In Review → Done

*[Incluir aquí captura de pantalla del tablero Jira con los miembros invitados]*

---

# 3. Gestión de Requisitos (Nivel 2 CMMI - REQM)

*Elaborado por: Fernando Condori (Soporte). Revisado por: Juan Calizaya (Gestor de Calidad)*

## 3.1. Matriz de Trazabilidad de Requisitos

| ID Req | Descripción | Módulo | Responsable | Estado |
|--------|-------------|--------|-------------|--------|
| RQ-01 | Registro de usuarios con verificación de código de 6 dígitos enviado al correo UNAM | Autenticación | Fernando Condori | Revisado |
| RQ-02 | Inicio de sesión con JWT y control de acceso por roles (student, moderator, admin) | Autenticación | Fernando Condori | Revisado |
| RQ-03 | Recuperación de contraseña mediante código de verificación por correo | Autenticación | Fernando Condori | En proceso |
| RQ-04 | Creación de posts con título, contenido Markdown, hashtags y archivos adjuntos | Foro | Harol Mendoza | Revisado |
| RQ-05 | Edición y eliminación de posts propios | Foro | Harol Mendoza | Revisado |
| RQ-06 | Filtrado de posts por curso y ciclo académico (10 ciclos, 60+ cursos) | Foro | Joel Luna | Revisado |
| RQ-07 | Sistema de comentarios anidados (respuestas ilimitadas) con votación | Interacción | Joel Luna | En proceso |
| RQ-08 | Votación upvote/downvote en posts y comentarios con toggle | Interacción | Harol Mendoza | Revisado |
| RQ-09 | Sistema de experiencia (XP) y niveles: +10 XP por post, +3 XP por comentario, +5 XP por upvote recibido | Gamificación | Joel Luna | Pendiente |
| RQ-10 | Sistema de notificaciones: votos recibidos, nuevos comentarios, marcado como leído | Notificaciones | Fernando Condori | En proceso |
| RQ-11 | Perfil de usuario con avatar, biografía, enlaces sociales, estadísticas y nivel | Usuario | Harol Mendoza | Pendiente |
| RQ-12 | Búsqueda de posts por título, contenido, autor y hashtags | Foro | Joel Luna | Pendiente |
| RQ-13 | Tema oscuro/claro y preferencias de visualización con persistencia en localStorage y sincronización con backend | UI/UX | Fernando Condori | Revisado |
| RQ-14 | Reporte de posts inapropiados con moderación (admin/moderator) | Moderación | Juan Calizaya | Pendiente |

## 3.2. Diagrama de Proceso de Control de Cambios

*Elaborado por: Fernando Condori (Soporte)*

```
                  ┌─────────────┐
                  │  CLIENTE    │
                  │  Solicita   │
                  │  Cambio     │
                  └──────┬──────┘
                         ▼
            ┌──────────────────────────┐
            │ 1. REGISTRO EN JIRA      │
            │ (Change Request, To Do)   │
            │ Resp: Fernando C.        │
            └──────────────────────────┘
                         ▼
            ┌──────────────────────────┐
            │ 2. ANÁLISIS DE IMPACTO   │
            │ (Alcance/Tiempo/Riesgos) │
            │ Resp: Joel Luna          │
            └──────────────────────────┘
                         ▼
            ┌──────────────────────────┐
            │ 3. REVISIÓN DEL LÍDER    │
            └──────┬──────────┬────────┘
                 Sí          No
                   ▼          ▼
            ┌──────────┐ ┌──────────────────┐
            │4.APROBADO│ │5.RECHAZADO       │
            │Pasa a    │ │Se notifica al    │
            │Backlog   │ │cliente con motivo│
            └────┬─────┘ └──────────────────┘
                 ▼
            ┌──────────────────────────┐
            │ 6. ACTUALIZAR MATRIZ     │
            │ Nuevo ID, Estado: Pend.  │
            │ Resp: Fernando C.        │
            └──────────────────────────┘
                 ▼
            ┌──────────────────────────┐
            │ 7. SPRINT BACKLOG        │
            │ Priorizar y asignar      │
            │ Resp: Joel Luna          │
            └──────────────────────────┘
                 ▼
            ┌──────────────────────────┐
            │ 8. EJECUCIÓN + PEER      │
            │ REVIEW + QA              │
            └──────────────────────────┘
                 ▼
            ┌──────────────────────────┐
            │ 9. MATRIZ → "Revisado"   │
            └──────────────────────────┘
```

---

# 4. Planificación del Proyecto (Nivel 2 CMMI - PP)

*Elaborado por: Joel Luna (Gestor de Planeación). Revisado por: Juan Calizaya (Gestor de Calidad)*

## 4.1. Estructura de Desglose de Trabajo (WBS / EDT)

```
                                       WorkCodile Foro
                                           1.0
                                            │
         ┌──────────┬──────────┬──────────┬──┼──────────┬──────────┬──────────┐
         │          │          │          │  │          │          │          │
     1.1         1.2        1.3        1.4 │ 1.5        1.6        1.7       1.8
   Gestión     Requisitos   Diseño   Frontend│ Backend   Pruebas   Despliegue  Doc.
   Proyecto                            │    │
         │          │          │     ┌─┴──┐ │ ┌────┐     ┌──┴──┐      │        │
    ┌────┴────┐     │     ┌────┴────┐│    │ │ │    │     │     │      │        │
    │        │     │     │         ││    │ │ │    │     │     │      │        │
  1.1.1    1.1.2 1.2.1 1.3.1  1.3.2│1.4.1│ │1.5.1│ 1.6.1 1.6.2 1.7.1   1.7.2
 Planif.   Seguim.      Arquit. Prot.│Login │ Auth│ Unit. Integ. Conf.   Doc.
 Inicial   Sprint        Front. UI   │+ Reg │ API  │ API   Front. Docker Técn.
                                     │      │     │
                                     │1.4.2 │1.4.3│1.4.4│1.5.2│1.5.3│1.5.4│
                                     │Posts │Com. │Notif.│Posts│Votac│Gamif│
                                     │+Feed │+Votes│+Perf.│CRUD │ API │ API │
```

**Niveles de profundidad:**
- **Nivel 1 (Raíz):** WorkCodile Foro (1.0)
- **Nivel 2:** 8 categorías: Gestión, Requisitos, Diseño, Frontend, Backend, Pruebas, Despliegue, Documentación
- **Nivel 3:** 17 sub-tareas específicas

## 4.2. Estimación de Tamaño y Esfuerzo

| Código WBS | Tarea | Tamaño (PH) | Esfuerzo (hh) | Responsable |
|-----------|-------|-------------|---------------|-------------|
| 1.1.1 | Planificación inicial del proyecto | 3 | 8 | Joel Luna |
| 1.1.2 | Seguimiento de sprints (3 sprints × 2h) | - | 6 | Harol Mendoza |
| 1.2.1 | Levantamiento y documentación de requisitos | 5 | 10 | Fernando Condori |
| 1.3.1 | Diseño de arquitectura frontend (React + Vite) | 3 | 6 | Harol Mendoza |
| 1.3.2 | Prototipo UI (componentes shadcn/ui, layout) | 5 | 10 | Fernando Condori |
| 1.4.1 | Login y registro con verificación de correo | 8 | 12 | Harol Mendoza |
| 1.4.2 | Posts y feed con scroll infinito | 13 | 20 | Harol Mendoza |
| 1.4.3 | Comentarios y votación (con react-virtuoso) | 8 | 14 | Joel Luna |
| 1.4.4 | Notificaciones y perfil de usuario | 8 | 12 | Fernando Condori |
| 1.5.1 | API de autenticación (JWT, bcrypt, verificación) | 8 | 12 | Fernando Condori |
| 1.5.2 | CRUD de posts y comentarios (API REST) | 13 | 18 | Joel Luna |
| 1.5.3 | API de votación y sistema XP | 8 | 12 | Joel Luna |
| 1.5.4 | API de gamificación y notificaciones | 5 | 8 | Joel Luna |
| 1.6.1 | Pruebas unitarias API (Jest + Supertest) | 5 | 10 | Juan Calizaya |
| 1.6.2 | Pruebas de integración frontend (Vitest + RTL) | 5 | 10 | Juan Calizaya |
| 1.7.1 | Planificación del entorno de despliegue | 3 | 6 | Harol Mendoza |
| 1.7.2 | Documentación técnica (README, guías, informes) | 3 | 6 | Juan Calizaya |
| **Total** | | **103 PH** | **180 hh** | |

## 4.3. Cronograma del Proyecto (Gantt)

*Elaborado por: Joel Luna (Gestor de Planeación)*

**Duración total:** 6 semanas (3 Sprints de 2 semanas)

### Sprint 1: Base del proyecto (Semanas 1-2)

| Día | Semana 1 | Semana 2 |
|-----|----------|----------|
| Lunes | Planificación inicial y asignación de roles | Prototipo UI (componentes base) |
| Martes | Levantamiento de requisitos | Prototipo UI (pantallas principales) |
| Miércoles | Diseño de arquitectura frontend | Login y registro frontend |
| Jueves | Análisis de riesgos y setup Jira | Login y registro frontend |
| Viernes | Configuración Docker y entorno dev | API de autenticación (backend) |
| Sábado | — | API de autenticación (backend) |
| **Calidad** | **Diseño de checklist PPQA (Juan Calizaya)** | **Aplicar checklist a RQ-01 a RQ-05** |

| Hito de calidad | Sprint 1 |
|-----------------|----------|
| ★ **Hito 1 (Fin Sem 2)** | **Peer Review de autenticación y requisitos** — Juan C. revisa WBS de Joel L. |

### Sprint 2: Funcionalidades Core (Semanas 3-4)

| Día | Semana 3 | Semana 4 |
|-----|----------|----------|
| Lunes | Posts y feed frontend (scroll infinito) | Votación frontend (upvote/downvote) |
| Martes | Posts y feed frontend | Votación frontend |
| Miércoles | API Posts CRUD | API Votación |
| Jueves | API Posts CRUD | API Votación |
| Viernes | Comentarios anidados frontend | Pruebas unitarias API (Jest) |
| Sábado | Comentarios anidados frontend | — |
| **Calidad** | **Aplicar checklist a nuevos requisitos (Juan Calizaya)** | **Ejecutar peer review de código backend** |

| Hito de calidad | Sprint 2 |
|-----------------|----------|
| ★ **Hito 2 (Fin Sem 4)** | **Auditoría de calidad del código (Checklist PPQA)** — Juan C. revisa matriz de Fernando C. |

### Sprint 3: Complementos y Cierre (Semanas 5-6)

| Día | Semana 5 | Semana 6 |
|-----|----------|----------|
| Lunes | Notificaciones frontend | Configuración Docker producción |
| Martes | Perfil de usuario frontend | Configuración Docker producción |
| Miércoles | API de gamificación y XP | Documentación técnica |
| Jueves | Pruebas de integración frontend | Documentación técnica |
| Viernes | Pruebas de integración frontend | Correcciones finales post-peer review |
| Sábado | — | **Entrega final** |
| **Calidad** | **Registro de defectos en Defect Log (Juan Calizaya)** | **Consolidar Time Log + Defect Log del equipo** |

| Hito de calidad | Sprint 3 |
|-----------------|----------|
| ★ **Hito 3 (Fin Sem 6)** | **Aceptación final y entrega de documentación** — Harol M. revisa y aprueba todo |

### Dependencias clave

| Dependencia | Relación |
|-------------|----------|
| 1.5.1 (API Auth) → 1.4.1 (Login frontend) | El frontend necesita la API |
| 1.5.2 (CRUD Posts API) → 1.4.2 (Posts frontend) | El feed necesita datos del backend |
| 1.5.3 (Votación API) → 1.4.3 (Votación frontend) | Los votos requieren la API |
| 1.4.x + 1.5.x → 1.6.x (Pruebas) | Las pruebas requieren código terminado |

## 4.4. Matriz de Gestión de Riesgos

*Elaborado por: Joel Luna (Gestor de Planeación)*

| ID | Descripción | Prob. (1-3) | Impacto (1-3) | P×I | Plan de Mitigación |
|----|-------------|-------------|---------------|-----|-------------------|
| R-01 | Miembro del equipo no cumple con las horas estimadas por falta de disponibilidad | 3 | 3 | 9 | Horarios fijos de trabajo sincrónico (3h/día). Reasignar tareas si es necesario. Buffer del 20%. |
| R-02 | Cambios en los requisitos a mitad del proyecto que afectan el cronograma | 2 | 3 | 6 | Aplicar proceso de control de cambios (sección 3.2). Evaluar impacto antes de aprobar. |
| R-03 | Problemas técnicos con la integración de Jira, Docker o MongoDB | 2 | 2 | 4 | Documentar configuración inicial. Entorno de respaldo local. Pruebas de integración tempranas. |
| R-04 | Baja calidad en los entregables por falta de experiencia en CMMI/PSP | 2 | 3 | 6 | Capacitación interna de 1 hora sobre CMMI. Checklists desde el día 1. Peer reviews obligatorios. |

---

# 5. Aseguramiento de Calidad (Nivel 2 CMMI - PPQA)

*Elaborado por: Juan Calizaya (Gestor de Calidad)*

## 5.1. Checklist de Verificación de Calidad

**Checklist para evaluar la calidad de los Requisitos (REQM)**
*Aplicada por: Juan Calizaya (Gestor de Calidad) sobre el trabajo de Fernando Condori*

| # | Pregunta | Sí | No | N/A | Observaciones |
|---|----------|----|----|-----|---------------|
| 1 | ¿El requisito está redactado de forma clara y sin ambigüedades? | ☐ | ☐ | ☐ | |
| 2 | ¿El requisito es verificable? (Se puede definir una prueba o criterio de aceptación objetivo) | ☐ | ☐ | ☐ | |
| 3 | ¿El requisito está asignado a un módulo específico del sistema? | ☐ | ☐ | ☐ | |
| 4 | ¿El requisito tiene un responsable asignado en la matriz de trazabilidad? | ☐ | ☐ | ☐ | |
| 5 | ¿El requisito es factible técnicamente dentro del alcance y tiempo del proyecto? | ☐ | ☐ | ☐ | |
| 6 | ¿El requisito tiene un estado actualizado en la matriz (Pendiente/En proceso/Revisado)? | ☐ | ☐ | ☐ | |
| 7 | ¿El requisito está priorizado respecto a otros en el backlog? | ☐ | ☐ | ☐ | |

### Resultados

| Requisito evaluado | Resultado | Observación |
|-------------------|-----------|-------------|
| RQ-01 a RQ-14 | 12/14 aprobados, 2 requieren ajustes | RQ-09 y RQ-12 tenían descripciones muy técnicas, se refinaron |

## 5.2. Evidencias de Revisiones por Pares (Peer Reviews)

*Ejecutado por: Juan Calizaya (Gestor de Calidad)*

### Acta de Revisión por Pares #1

| Campo | Detalle |
|-------|---------|
| **Fecha:** | 15/05/2026 |
| **Revisor:** | Juan Calizaya (Gestor de Calidad) |
| **Autor del trabajo revisado:** | Joel Luna (Gestor de Planeación) |
| **Artefacto revisado:** | WBS y Estimación de Tamaño/Esfuerzo |
| **Error encontrado:** | La tarea "1.4.3 Comentarios y votación" no consideraba la complejidad de react-virtuoso. Se omitió la tarea 1.6.2 (Pruebas de integración frontend) y RQ-14 (Moderación). |
| **Corrección aplicada:** | Se agregó 1.6.2 con 5 PH y se incluyó RQ-14 en la matriz. |
| **Estado:** | Corregido ✔ |

### Acta de Revisión por Pares #2

| Campo | Detalle |
|-------|---------|
| **Fecha:** | 18/05/2026 |
| **Revisor:** | Juan Calizaya (Gestor de Calidad) |
| **Autor del trabajo revisado:** | Fernando Condori (Soporte) |
| **Artefacto revisado:** | Matriz de Trazabilidad de Requisitos |
| **Error encontrado:** | RQ-13 no especificaba si la preferencia de tema era persistente o solo de sesión. |
| **Corrección aplicada:** | Se refinó la descripción indicando persistencia en localStorage + sincronización con backend. |
| **Estado:** | Corregido ✔ |

---

# 6. Disciplina Personal (PSP)

*Elaborado por: Todos los integrantes. Consolidado por: Juan Calizaya (Gestor de Calidad)*

## 6.1. Consolidado del Time Log del Equipo

| Estudiante | Fecha | Tarea | Hora Inicio | Hora Fin | Interrupciones (min) | Tiempo Neto (min) |
|-----------|-------|-------|-------------|----------|---------------------|-------------------|
| **Harol Mendoza** | 12/05 | Planificación inicial y asignación de roles | 09:00 | 10:30 | 10 | 80 |
| **Harol Mendoza** | 14/05 | Diseño de arquitectura frontend | 15:00 | 17:00 | 15 | 105 |
| **Harol Mendoza** | 16/05 | Implementación de login y registro frontend | 10:00 | 13:00 | 20 | 160 |
| **Harol Mendoza** | 19/05 | Implementación de posts y feed con scroll infinito | 14:00 | 17:30 | 10 | 200 |
| **Joel Luna** | 12/05 | Elaboración de WBS y cronograma | 10:00 | 12:00 | 10 | 110 |
| **Joel Luna** | 14/05 | Estimación de tamaño y esfuerzo | 16:00 | 18:00 | 5 | 115 |
| **Joel Luna** | 15/05 | Matriz de riesgos | 09:00 | 10:30 | 10 | 80 |
| **Joel Luna** | 18/05 | API de posts y comentarios (CRUD) | 15:00 | 18:00 | 15 | 165 |
| **Juan Calizaya** | 13/05 | Diseño de checklist de calidad | 11:00 | 12:30 | 5 | 85 |
| **Juan Calizaya** | 15/05 | Peer Review #1 (WBS de Joel Luna) | 16:00 | 17:00 | 0 | 60 |
| **Juan Calizaya** | 18/05 | Peer Review #2 (Requisitos de Fernando Condori) | 10:00 | 11:00 | 5 | 55 |
| **Juan Calizaya** | 20/05 | Configuración de entorno de pruebas | 14:00 | 16:00 | 10 | 110 |
| **Fernando Condori** | 12/05 | Configuración de Jira e invitación de miembros | 09:30 | 11:00 | 5 | 85 |
| **Fernando Condori** | 13/05 | Levantamiento de requisitos y matriz de trazabilidad | 14:00 | 16:30 | 10 | 140 |
| **Fernando Condori** | 15/05 | Prototipo de componentes UI (shadcn/ui) | 10:00 | 12:30 | 10 | 140 |
| **Fernando Condori** | 17/05 | Diagrama de control de cambios | 15:00 | 16:00 | 5 | 55 |
| **Fernando Condori** | 20/05 | Notificaciones y perfil de usuario frontend | 14:00 | 17:00 | 15 | 165 |

**Total tiempo neto del equipo:** 1920 minutos (~32 horas)

## 6.2. Consolidado del Defect Log del Equipo

| Estudiante | Fecha | Descripción del Defecto | Fase ocurrió | Fase solucionó | Tiempo (min) |
|-----------|-------|------------------------|-------------|---------------|-------------|
| Joel Luna | 14/05 | Error en estimación: tarea 1.4.3 no consideraba react-virtuoso | Planificación (WBS) | Peer Review | 15 |
| Joel Luna | 14/05 | Se omitió la tarea 1.6.2 (Pruebas integración frontend) en la WBS | Planificación (WBS) | Peer Review | 10 |
| Fernando C. | 15/05 | RQ-13 sin especificar persistencia (localStorage vs sesión) | Requisitos (Matriz) | Peer Review | 10 |
| Fernando C. | 15/05 | Priorización incorrecta: RQ-10 antes que RQ-08 (votación es base) | Requisitos (Matriz) | Revisión interna | 5 |
| Harol M. | 16/05 | Código de verificación no validaba TTL expirado | Desarrollo Frontend | Pruebas manuales | 25 |
| Joel Luna | 18/05 | API posts con paginación duplicada por cursor incorrecto | Desarrollo Backend | Pruebas unitarias | 30 |
| Fernando C. | 17/05 | Diagrama control cambios sin notificación al rechazar | Diseño | Peer Review | 10 |
| Juan C. | 19/05 | Checklist calidad sin pregunta sobre verificabilidad | Planificación | Revisión interna | 8 |
| **Todo el equipo** | 20/05 | **Sin versionamiento formal**: no hay tags (v1.0.0), releases ni changelog en GitHub | Gestión | Gap Analysis | 20 |
| **Harol M.** | 20/05 | **Código espagueti**: archivo app-context.tsx con 1340 líneas mezclando estado, API, UI y datos | Desarrollo Frontend | Análisis de código | 30 |
| **Joel Luna** | 20/05 | **Backend inconsistente**: postController.js mezcla Mongoose con driver raw MongoDB, bypass validaciones | Desarrollo Backend | Análisis de código | 25 |
| **Fernando C.** | 20/05 | **Sin documentación de API**: no hay OpenAPI/Swagger, los endpoints no están documentados | Documentación | Análisis de código | 15 |
| **Juan C.** | 20/05 | **Test unitario roto**: server.test.js usa ESM import en proyecto CommonJS, no ejecuta | Pruebas | Análisis de código | 10 |

**Total defectos:** 13 | **Tiempo total solución:** 213 minutos
**Promedio tiempo por defecto:** 16 minutos

---

# 7. Análisis de Brechas CMMI (Gap Analysis)

*Elaborado por: Harol Mendoza (Líder de Equipo) y Juan Calizaya (Gestor de Calidad)*

## 7.1. Matriz de Cumplimiento (Evaluación de SPs)

### Área PP (Planificación del Proyecto) — 14 SPs

**SG 1: Establish Estimates**

| SP | Práctica Específica | Cumplimiento | Justificación / Evidencia |
|----|--------------------|--------------|--------------------------|
| SP 1.1 | Estimate the Scope of the Project | Sí | WBS con 3 niveles de profundidad y 17 tareas detalladas (sección 4.1) |
| SP 1.2 | Establish Estimates of Work Product and Task Attributes | Sí | Tabla con 17 tareas estimadas en PH y hh (sección 4.2) |
| SP 1.3 | Define Project Life Cycle | Sí | Scrum adaptado con sprints de 2 semanas, justificado (sección 2.2) |
| SP 1.4 | Estimate Effort and Cost | Parcial | Esfuerzo estimado en 180 hh, pero costo económico no detallado |

**SG 2: Develop a Project Plan**

| SP | Práctica Específica | Cumplimiento | Justificación / Evidencia |
|----|--------------------|--------------|--------------------------|
| SP 2.1 | Establish the Budget and Schedule | Parcial | Cronograma con 3 sprints, dependencias y 3 hitos de calidad. Sin presupuesto. |
| SP 2.2 | Identify Project Risks | Sí | Matriz de 4 riesgos con P×I y plan de mitigación (sección 4.4) |
| SP 2.3 | Plan for Data Management | Parcial | Jira + GitHub usados, pero sin política formal de retención, respaldo ni versionamiento con tags/releases |
| SP 2.4 | Plan for Project Resources | Sí | Roles TSP con 3 responsabilidades cada uno (sección 2.1) |
| SP 2.5 | Plan for Needed Knowledge and Skills | Parcial | Capacitación en CMMI identificada (R-04) pero sin plan formal |
| SP 2.6 | Plan Stakeholder Involvement | Parcial | Cliente identificado, proceso de cambios definido, sin plan de comunicación formal |
| SP 2.7 | Establish the Project Plan | Sí | WBS, cronograma, estimaciones y riesgos integrados |

**SG 3: Obtain Commitment to the Plan**

| SP | Práctica Específica | Cumplimiento | Justificación / Evidencia |
|----|--------------------|--------------|--------------------------|
| SP 3.1 | Review Plans That Affect the Project | Parcial | Peer reviews internos ejecutados, sin revisión externa formal |
| SP 3.2 | Reconcile Work and Resource Levels | Sí | Peer reviews identificaron desajustes y fueron corregidos (sección 5.2) |
| SP 3.3 | Obtain Plan Commitment | Parcial | Acuerdo interno del equipo, sin firma formal del docente |

### Área REQM (Gestión de Requisitos) — 5 SPs

| SP | Práctica Específica | Cumplimiento | Justificación / Evidencia |
|----|--------------------|--------------|--------------------------|
| SP 1.1 | Understand Requirements | Sí | Matriz con 14 requisitos, descripciones claras y módulos asignados |
| SP 1.2 | Obtain Commitment to Requirements | Parcial | Requisitos priorizados, sin firma formal de aceptación |
| SP 1.3 | Manage Requirements Changes | Sí | Diagrama de control de cambios con 9 pasos (sección 3.2) |
| SP 1.4 | Maintain Bidirectional Traceability | Parcial | Trazabilidad directa (ID→módulo), sin trazabilidad inversa (código→requisito) |
| SP 1.5 | Ensure Alignment Between Project Work and Requirements | Sí | Peer reviews detectaron RQ-13 ambiguo, priorización incorrecta, omisiones |

### Área PPQA (Aseguramiento de la Calidad del Proceso y del Producto) — 4 SPs

| SP | Práctica Específica | Cumplimiento | Justificación / Evidencia |
|----|--------------------|--------------|--------------------------|
| SP 1.1 | Objectively Evaluate Processes | Parcial | Checklist de 7 preguntas definido, pero solo evaluó REQM. No se evaluaron procesos de codificación ni estándares. |
| SP 1.2 | Objectively Evaluate Work Products | Sí | Dos peer reviews ejecutados y documentados sobre WBS y matriz |
| SP 2.1 | Communicate and Ensure Resolution | Parcial | Resultados en actas, sin canal formal de no conformidades |
| SP 2.2 | Establish Records | Sí | Defectos registrados en Defect Log con solución documentada |

### Resumen de Cumplimiento

| Área | SPs | Sí | Parcial | No | % Cumplimiento |
|------|-----|----|---------|----|----------------|
| PP | 14 | 7 | 7 | 0 | 50% Sí / 50% Parcial |
| REQM | 5 | 3 | 2 | 0 | 60% Sí / 40% Parcial |
| PPQA | 4 | 2 | 2 | 0 | 50% Sí / 50% Parcial |
| **Total** | **23** | **12** | **11** | **0** | **52% Sí / 48% Parcial** |

## 7.2. Plan de Mejora

*Elaborado por: Harol Mendoza (Líder de Equipo)*

El equipo debe mejorar en los siguientes aspectos: establecer una política formal de gestión de datos que incluya versionamiento con tags y releases en GitHub (PP SP 2.3); implementar un plan de capacitación en CMMI/PSP con sesiones programadas (PP SP 2.5); formalizar la trazabilidad inversa vinculando requisitos con código (REQM SP 1.4); documentar un acuerdo de aceptación de requisitos firmado por el docente (REQM SP 1.2); ampliar el checklist de calidad para cubrir planificación, diseño y estándares de codificación (PPQA SP 1.1); definir un plan de comunicación formal con los interesados (PP SP 2.6); y obtener la aprobación explícita del plan del proyecto (PP SP 3.1, SP 3.3). Los defectos de código identificados (app-context.tsx monolítico, backend inconsistente, test roto, falta de documentación API) deberán ser priorizados y corregidos en iteraciones futuras.

---

# 8. Conclusiones

*Elaborado por: Harol Mendoza (Líder de Equipo) con aportes de todo el equipo*

1. **La aplicación del marco CMMI nivel 2 en la planificación (PP) permitió estructurar el proyecto con una WBS de 3 niveles, 17 tareas estimadas en 103 PH y 180 hh, y un cronograma con 3 sprints y 3 hitos de calidad.** Esto contrasta con un enfoque empírico donde las tareas se definen sobre la marcha y las estimaciones son subjetivas, generando incumplimientos de plazo.

2. **La gestión de requisitos (REQM) mediante matriz de trazabilidad y control de cambios evitó ambigüedades.** Los peer reviews detectaron 13 defectos en fases tempranas con un tiempo promedio de corrección de 16 minutos, mientras que corregir esos mismos errores en producción habría tomado horas o días.

3. **El uso de los registros PSP proporcionó métricas objetivas sobre el desempeño del equipo.** Se registraron 1920 minutos de trabajo neto y 13 defectos con 213 minutos totales de solución. El 46% de los defectos ocurrieron en planificación, lo que indica que las revisiones tempranas están funcionando.

4. **El análisis de brechas CMMI reveló un cumplimiento del 52% (12 de 23 SPs completamente cumplidas).** Las áreas de mejora principales son la gestión formal de datos (incluyendo versionamiento), la trazabilidad inversa, y la cobertura de evaluación de procesos y estándares de codificación.

---

# 9. Anexos

*Elaborado por: Fernando Condori (Soporte)*

## Enlaces públicos
- **Repositorio GitHub:** https://github.com/juancitucs/Workcodile-dev
- **Diseño en Figma:** https://www.figma.com/design/iFTmdyWLUAylY9y2X9MMcg/WorkCodile-Foro
- **Tablero Jira:** [URL del proyecto Jira]

## Archivos adjuntos requeridos
1. Captura de pantalla del tablero Jira con miembros invitados (Sección 2.3)
2. Diagrama de control de cambios exportado como imagen (Sección 3.2)
3. Captura de pantalla del Gantt en GanttProject o MS Project (Sección 4.3)
4. Captura de pantalla de comentarios de Peer Review en Jira (Sección 5.2)
