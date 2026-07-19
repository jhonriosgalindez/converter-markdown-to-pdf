# MarkDraft — Editor de Markdown a PDF

¡Bienvenido a **MarkDraft**! Esta es una aplicación web interactiva y moderna de una sola página (SPA) diseñada para redactar, formatear y exportar documentos de Markdown directamente a archivos PDF de alta calidad desde el navegador, con control de diseño preciso en tiempo real.

---

##  ¿En qué consiste el proyecto?

**MarkDraft** resuelve el desafío común de convertir documentos Markdown en PDFs profesionales y listos para imprimir sin tener que luchar con los estilos de impresión predeterminados del navegador. La aplicación está diseñada especialmente para crear currículums, cartas de presentación, informes, guías y documentación técnica elegante.

###  Características Principales
- **Editor en Tiempo Real:** Interfaz de doble panel (o panel conmutables para móviles) que sincroniza instantáneamente el código Markdown escrito con una hoja de vista previa interactiva.
- **Control de Formato y Maquetación:**
  - **Formatos de página estándar:** A4, Carta (Letter) y Oficio (Legal).
  - **Orientación:** Vertical (Portrait) y Horizontal (Landscape).
  - **Tamaños de margen adaptativos:** Estrecho, Normal y Ancho.
  - **Estilos tipográficos curados:** Sans (Inter), Serif (Playfair Display) y Mono (JetBrains Mono).
- **Evitado de Cortes Huérfanos Dinámico:** El motor de exportación calcula las posiciones de los elementos de manera inteligente antes de generar el PDF para evitar que líneas de texto o encabezados individuales queden recortados por la mitad al cambiar de página.
- **Saltos de Página Manuales:** Inserta saltos de página con un solo clic con marcadores visuales amigables en el editor.
- **Sincronización Inteligente de Nombre de Archivo:** Detecta automáticamente el primer encabezado (`# Título`) del documento para sugerir un nombre de archivo limpio y amigable al exportar.
- **Totalmente Responsive:** Diseño fluido adaptado tanto a pantallas de escritorio ultra-anchas como a dispositivos móviles mediante pestañas conmutables ergonómicas.
- **Privacidad Primero:** Todo el procesamiento y generación del PDF ocurre localmente en el navegador del usuario. Tus datos nunca se envían a servidores externos.

---

## 🛠️ Tecnologías Utilizadas

La aplicación está construida sobre un ecosistema moderno, rápido y robusto de desarrollo frontend:

- **React (v18+)** con **TypeScript**: Para garantizar una estructura de componentes robusta, modular, tipada y de fácil mantenimiento.
- **Vite**: Como entorno de desarrollo y empaquetador ultrarrápido para una experiencia ágil y una compilación optimizada en producción.
- **Tailwind CSS**: Para el diseño y maquetación visual altamente pulido, limpio y adaptivo con clases de diseño responsivo.
- **html2canvas**: Para la rasterización fidedigna y de alta resolución (escala 2x para calidad de imprenta) del lienzo del documento.
- **jsPDF**: Para la maquetación espacial, división en páginas y empaquetado del archivo PDF final.
- **react-markdown** y **remark-gfm**: Para interpretar el estándar de Markdown y añadir compatibilidad con tablas complejas, listas de tareas y enlaces.
- **Lucide React**: Para un conjunto moderno, limpio y cohesivo de iconos vectoriales en la interfaz de usuario.

---

## 📖 Guía de Uso para el Usuario

Cualquier usuario, sin importar su experiencia técnica, puede empezar a crear documentos en segundos:

### 1. Redacción del Documento
Escribe en el panel del **Editor** de la izquierda utilizando la sintaxis de Markdown común:
- Usa `#` para títulos, `##` para subtítulos.
- Usa `**negrita**` e `*itálica*`.
- Puedes crear tablas, listas con viñetas y listas de tareas marcadas.
- **Barra de Herramientas:** En la parte superior del editor encontrarás accesos rápidos para insertar formato negrita, cursiva, enlaces, bloques de código, tablas y citas con un solo clic.

### 2. Estructuración con Saltos de Página
Para asegurarte de que una sección importante comience exactamente en una hoja nueva del PDF:
- Coloca el cursor en el editor y haz clic en el botón **"Salto de Página"** en la barra de herramientas del editor.
- Esto insertará una línea especial en el editor de Markdown que se representará visualmente como una hermosa línea punteada con un icono de tijera en la vista previa del documento.

### 3. Personalización del Diseño
En la barra de **Vista Previa** (columna derecha), utiliza el menú desplegable de configuraciones de diseño para adaptar el estilo:
- **Formato:** Elige el tamaño del papel según la norma de tu país o región (A4 u Oficio).
- **Orientación:** Cambia entre vertical u horizontal según la naturaleza de tu gráfico o documento.
- **Márgenes:** Reduce los márgenes para dar más espacio a currículums compactos, o amplíalos para informes ejecutivos.
- **Tipografía:** Cambia el estilo tipográfico para dar una vibra moderna (Sans), editorial clásica (Serif) o técnica (Mono).
- **Color:** Cambia el color de énfasis para que los encabezados destaquen de acuerdo a la paleta de tu preferencia.

### 4. Selección de Plantillas
Si necesitas inspiración o no quieres empezar desde cero:
1. Haz clic en el botón **"Plantillas"** en la barra de herramientas principal.
2. Selecciona entre un Currículum Profesional, una Guía Técnica de Programación, un Reporte Financiero Mensual, o una Carta de Presentación Elegante.
3. El editor se cargará automáticamente con el formato listo para que solo tengas que reemplazar la información con la tuya.

### 5. Exportar el PDF
Una vez que el documento esté listo y a tu gusto:
- Puedes cambiar opcionalmente el nombre del archivo en la barra superior (el editor sugerirá uno de forma inteligente).
- Haz clic en el botón principal **"Exportar PDF"** en la esquina superior derecha. El motor procesará tu diseño y descargará el archivo `.pdf` final a tu computadora o móvil en pocos segundos.
- Alternativamente, puedes hacer clic en el icono de la **Impresora** para abrir el asistente de impresión nativo de tu sistema operativo, ideal si deseas guardarlo directamente usando la función del sistema o enviarlo a una impresora física.

---

## 💻 Desarrollo e Instalación Local

Si deseas clonar y ejecutar este proyecto en tu propio entorno:

1. Asegúrate de tener instalado [Node.js](https://nodejs.org/).
2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo local:
   ```bash
   npm run dev
   ```
4. Abre la dirección que te proporcione la consola (usualmente `http://localhost:3000` o `http://localhost:5173`) en tu navegador favorito.
5. Para compilar el proyecto para producción:
   ```bash
   npm run build
   ```
