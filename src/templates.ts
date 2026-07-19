import { DocumentTemplate } from './types';

export const templates: DocumentTemplate[] = [
  {
    id: 'cv-template',
    name: 'Currículum Vitae (CV)',
    icon: 'Briefcase',
    description: 'Un diseño elegante de CV profesional de una sola página.',
    content: `# Juan Pérez\n ## Desarrollador Full-Stack\n
📍 Madrid, España | ✉️ juan.perez@email.com | 📱 +34 123 456 789 | 🌐 github.com/juanperez

---

## Resumen Profesional
Desarrollador apasionado con más de 5 años de experiencia creando aplicaciones web modernas y escalables. Especializado en React, Node.js y arquitecturas cloud. Comprometido con las buenas prácticas de desarrollo y el trabajo en equipo.

---

## Experiencia Laboral

### Desarrollador React Senior | Tech Solutions S.L.
*Enero 2024 - Presente*
- Lideré la migración de un sistema legado a una SPA basada en React 18, mejorando el rendimiento en un 40%.
- Diseñé arquitecturas escalables utilizando TypeScript y Tailwind CSS.
- Coordiné un equipo de 4 desarrolladores frontend mediante metodologías ágiles (Scrum).

### Desarrollador Full-Stack | Innova Code
*Marzo 2021 - Diciembre 2023*
- Desarrollé y mantuve microservicios robustos utilizando Node.js y Express.
- Implementé interfaces de usuario interactivas con React y Redux Toolkit.
- Optimicé consultas de bases de datos PostgreSQL, reduciendo el tiempo de respuesta de la API en un 25%.

---

## Educación

🎓 **Grado en Ingeniería Informática**  
*Universidad Complutense de Madrid (2017 - 2021)*

---

## Habilidades Técnicas

- **Lenguajes:** JavaScript (ES6+), TypeScript, SQL, HTML5, CSS3.
- **Frontend:** React, Next.js, Tailwind CSS, Redux, Sass.
- **Backend:** Node.js, Express, REST APIs, GraphQL.
- **Herramientas:** Git, Docker, AWS, PostgreSQL, MongoDB, Jest.
`
  },
  {
    id: 'report-template',
    name: 'Informe Técnico',
    icon: 'FileText',
    description: 'Estructura formal para informes de proyectos, análisis o estudios.',
    content: `# INFORME DE RENDIMIENTO DEL SISTEMA
**Proyecto:** Plataforma de Comercio Electrónico "CompreFácil"  
**Autor:** Departamento de Infraestructura y SRE  
**Fecha:** 8 de Julio de 2026

---

## 1. Introducción
Este informe presenta el análisis del rendimiento y estabilidad de los servidores de producción de la plataforma "CompreFácil" durante el evento promocional del pasado fin de semana (Cyber Monday).

## 2. Métricas Clave

| Métrica | Objetivo | Valor Obtenido | Estado |
| :--- | :---: | :---: | :---: |
| Tiempo de Actividad (Uptime) | > 99.9% | 99.98% | En Orden |
| Tiempo de Respuesta Promedio | < 300 ms | 240 ms | Excelente |
| Tasa de Errores de API | < 0.5% | 0.12% | Excelente |
| Carga Máxima de CPU | < 80% | 72% | En Orden |

## 3. Análisis de Resultados
Durante las horas de mayor tráfico (20:00 - 23:00 UTC), se registró un incremento de visitas simultáneas de hasta un **350%** en comparación con un fin de semana estándar.

> El sistema de auto-escalado horizontal de contenedores respondió de manera óptima, incrementando las instancias activas de 4 a 12 de forma automática en menos de 3 minutos.

### Puntos Fuertes Identificados:
1. **Balanceo de Carga:** El tráfico se distribuyó equitativamente entre todas las réplicas activas.
2. **Caché Eficiente:** El uso de caché de Redis redujo la carga en la base de datos PostgreSQL en un **60%**.

## 4. Conclusiones y Recomendaciones
El sistema demostró una robustez sobresaliente. Sin embargo, para futuros eventos masivos se recomienda:

1. Incrementar el límite máximo de conexiones simultáneas en la base de datos.
2. Optimizar la compresión de imágenes estáticas para disminuir el consumo de ancho de banda.
`
  },
  {
    id: 'meeting-template',
    name: 'Acta de Reunión',
    icon: 'Calendar',
    description: 'Para resumir temas tratados, asistentes y tareas acordadas.',
    content: `# Acta de Reunión: Sincronización Semanal de Diseño
**Proyecto:** Rediseño del Panel de Control (Dashboard)  
**Fecha:** 8 de Julio de 2026 | **Hora:** 10:00 - 11:00 CEST  
**Organizador:** Sofía Martínez (Product Owner)

---

## 👥 Asistentes
- Sofía Martínez (Product Owner)
- Carlos Ruiz (Diseñador UX/UI)
- Laura Beltrán (Desarrolladora Frontend)
- Miguel Sánchez (QA Engineer)

---

## 📌 Temas Tratados

1. **Aprobación de Wireframes de la Vista Móvil:**
   Se revisó la propuesta entregada por Carlos sobre el flujo de navegación simplificado para smartphones.
2. **Estrategia de Accesibilidad (WCAG 2.1):**
   Discusión sobre el contraste de color para las alertas de estado y el soporte de navegación mediante teclado.
3. **Plazos de Desarrollo Frontend:**
   Revisión del sprint actual y la asignación de tareas del tablero Jira.

---

## 📝 Decisiones Tomadas
- Se aprueba de manera unánime el flujo móvil presentado, con el ajuste menor de aumentar el tamaño de los botones principales a un mínimo de **48px** para mejorar la experiencia táctil.
- Se adopta la paleta de colores de alto contraste propuesta para asegurar el cumplimiento del estándar AA.

---

## ✅ Tareas Asignadas (Action Items)

| Tarea | Responsable | Fecha Límite | Estado |
| :--- | :--- | :---: | :---: |
| Subir diseños finales en Figma de la vista móvil | Carlos Ruiz | 10 Jul 2026 | Pendiente |
| Crear historias técnicas de desarrollo en Jira | Sofía Martínez | 09 Jul 2026 | En Progreso |
| Investigar e implementar la navegación de teclado | Laura Beltrán | 14 Jul 2026 | Pendiente |
| Diseñar plan de pruebas para accesibilidad visual | Miguel Sánchez | 15 Jul 2026 | Pendiente |
`
  },
  {
    id: 'letter-template',
    name: 'Carta Formal',
    icon: 'Mail',
    description: 'Estructura clásica para cartas de presentación, solicitudes o comunicados.',
    content: `## CARTA DE PRESENTACIÓN

**De:** Laura Gómez Silva  
📍 Calle de Alcalá 120, Madrid, España  
✉️ laura.gomez@email.com | 📱 +34 600 000 000  

**Para:**  
Atención al Departamento de Selección  
**Empresa:** Futura Tech S.L.  
📍 Av. de la Constitución 45, Barcelona, España  

**Fecha:** 8 de Julio de 2026  

---

**Asunto: Candidatura para el puesto de Desarrolladora Frontend Senior**

Estimados miembros del comité de selección:

Les escribo con gran entusiasmo para presentar mi candidatura al puesto de **Desarrolladora Frontend Senior**, publicado recientemente en su portal de empleo corporativo. Sigo de cerca los logros de Futura Tech en el campo de las aplicaciones web accesibles y considero que mi perfil profesional se alinea estrechamente con sus valores y necesidades técnicas.

Durante los últimos seis años, me he especializado en la creación de interfaces de usuario receptivas, rápidas y accesibles utilizando tecnologías como **React**, **TypeScript** y **Sass**. En mi anterior rol en *Digital Lab*, logré reducir los tiempos de carga del lado del cliente en un **30%** mediante técnicas de carga diferida (lazy loading) y optimización de recursos.

Agradezco de antemano el tiempo dedicado a revisar mi currículum adjunto. Estaría encantada de mantener una entrevista para detallar cómo mis habilidades pueden aportar valor a su equipo de desarrollo.

Atentamente,

**Laura Gómez Silva**  
*Desarrolladora Frontend*
`
  }
];
