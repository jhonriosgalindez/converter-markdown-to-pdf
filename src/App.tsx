import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Eye, 
  Edit3, 
  HelpCircle, 
  Check, 
  RotateCcw, 
  Trash2, 
  Settings2, 
  FilePlus2, 
  X, 
  ZoomIn, 
  ZoomOut,
  Info,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import Preview from './components/Preview';
import { templates } from './templates';
import { PageSize, PageOrientation } from './types';

export default function App() {
  // Estados principales
  const [markdown, setMarkdown] = useState<string>(templates[0].content);
  const [filename, setFilename] = useState<string>('mi-documento');
  
  // Estados de configuración de diseño
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [pageSize, setPageSize] = useState<PageSize>('A4');
  const [orientation, setOrientation] = useState<PageOrientation>('portrait');
  const [marginSize, setMarginSize] = useState<'normal' | 'narrow' | 'wide'>('normal');
  const [headingColor, setHeadingColor] = useState<'default' | 'blue' | 'indigo' | 'emerald' | 'amber'>('default');
  
  // Estados de interfaz de usuario (UI)
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor'); // para adaptabilidad móvil
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showTemplates, setShowTemplates] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportStep, setExportStep] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);

  // Sincronizar el nombre del archivo con el primer encabezado de markdown si es posible (UX inteligente)
  useEffect(() => {
    const headerMatch = markdown.match(/^#\s+(.+)$/m);
    if (headerMatch && headerMatch[1]) {
      // Limpiar y convertir en slug el encabezado
      const cleaned = headerMatch[1]
        .trim()
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // eliminar acentos
        .replace(/[^a-z0-9\s-_]/g, '') // eliminar caracteres especiales
        .replace(/\s+/g, '-'); // reemplazar espacios con guiones
      if (cleaned.length > 0 && cleaned.length < 30) {
        setFilename(cleaned);
      }
    }
  }, [markdown]);

  // Mostrar mensajes de estado flotantes (toasts)
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Acción para cargar contenido predefinido
  const loadTemplate = (content: string, name: string) => {
    setMarkdown(content);
    setShowTemplates(false);
    triggerToast(`Plantilla "${name}" cargada correctamente`);
  };

  // Acción para vaciar el editor
  const clearEditor = () => {
    if (window.confirm('¿Estás seguro de que deseas vaciar el editor? Se perderán todos los cambios.')) {
      setMarkdown('');
      triggerToast('Editor vaciado');
    }
  };

  // Acción para restaurar la plantilla predeterminada
  const resetToDefault = () => {
    if (window.confirm('¿Deseas restaurar la plantilla inicial? Se perderán tus cambios actuales.')) {
      setMarkdown(templates[0].content);
      triggerToast('Plantilla inicial restaurada');
    }
  };

  // Generación de PDF de alta fidelidad en el lado del cliente
  const replaceOklchWithHsl = (cssText: string): string => {
    return cssText.replace(/oklch\s*\(([^)]+)\)/g, (match, p1) => {
      try {
        // Dividir parámetros por espacio, barra diagonal o coma
        const parts = p1.trim().split(/\s*[\/\s,]\s*/).filter(Boolean);
        if (parts.length < 3) return match;

        // Luminosidad (0-1 o 0-100%)
        const lPart = parts[0];
        let l = parseFloat(lPart);
        if (lPart.includes('%')) l = l / 100;

        // Croma (0-0.4 o 0-100%)
        const cPart = parts[1];
        let c = parseFloat(cPart);
        if (cPart.includes('%')) c = (c / 100) * 0.4;

        // Matiz (0-360, turn, rad, grad)
        const hPart = parts[2];
        let h = parseFloat(hPart);
        if (hPart.includes('turn')) {
          h = h * 360;
        } else if (hPart.includes('rad')) {
          h = h * (180 / Math.PI);
        } else if (hPart.includes('grad')) {
          h = h * 0.9;
        }

        // Canal alfa (opcional)
        let a = 1;
        if (parts.length >= 4) {
          const aPart = parts[3];
          a = parseFloat(aPart);
          if (aPart.includes('%')) a = a / 100;
        }

        // Estimar la saturación basada en el croma: S = (C / 0.4) * 100
        const s = Math.min(100, Math.max(0, (c / 0.4) * 100));
        const lPercent = Math.min(100, Math.max(0, l * 100));

        if (isNaN(h) || isNaN(s) || isNaN(lPercent)) {
          return match;
        }

        if (parts.length >= 4 && !isNaN(a)) {
          return `hsla(${h.toFixed(1)}, ${s.toFixed(1)}%, ${lPercent.toFixed(1)}%, ${a})`;
        } else {
          return `hsl(${h.toFixed(1)}, ${s.toFixed(1)}%, ${lPercent.toFixed(1)}%)`;
        }
      } catch (e) {
        return match;
      }
    });
  };

  const generatePDF = async () => {
    const element = document.getElementById('pdf-preview-sheet');
    if (!element) {
      triggerToast('No se encontró el elemento de vista previa');
      return;
    }

    if (!markdown.trim()) {
      triggerToast('El documento está vacío. Escribe algo antes de exportar.');
      return;
    }

    try {
      setIsExporting(true);
      setExportStep('Cargando tipografías...');

      // Esperar a que todas las fuentes personalizadas (Google Fonts) se carguen por completo para que html2canvas calcule los límites del texto con precisión
      await document.fonts.ready;

      setExportStep('Renderizando documento...');

      // Reunir todas las reglas CSS de las hojas de estilo activas en el documento padre para integrarlas de manera segura sin oklch
      let cssText = '';
      for (let i = 0; i < document.styleSheets.length; i++) {
        const sheet = document.styleSheets[i];
        try {
          if (sheet.cssRules) {
            for (let j = 0; j < sheet.cssRules.length; j++) {
              cssText += sheet.cssRules[j].cssText + '\n';
            }
          }
        } catch (e) {
          console.warn('Could not read cssRules for stylesheet:', sheet.href, e);
        }
      }

      // Convertir todas las funciones de color oklch() en CSS a sus equivalentes estándar hsl()
      const processedCss = replaceOklchWithHsl(cssText);

      // Correcciones adicionales para el renderizado de texto en html2canvas (evita que las palabras se amontonen y el texto se superponga)
      const html2canvasOverrides = `
        * {
          text-rendering: auto !important;
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
        }
        .markdown-preview, .markdown-preview * {
          letter-spacing: 0.01em !important;
          word-spacing: 0.05em !important;
        }
      `;

      // Permitir que html2canvas genere un lienzo perfecto con escala personalizada (2x para calidad de impresión)
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // Eliminar todas las etiquetas de enlace de hoja de estilo existentes excepto Google Fonts
          const links = Array.from(clonedDoc.getElementsByTagName('link'));
          for (const link of links) {
            if (
              link.rel === 'stylesheet' &&
              !link.href.includes('googleapis.com') &&
              !link.href.includes('gstatic.com')
            ) {
              link.parentNode?.removeChild(link);
            }
          }

          // Eliminar todas las etiquetas <style> existentes en el documento clonado
          const styles = Array.from(clonedDoc.getElementsByTagName('style'));
          for (const style of styles) {
            style.parentNode?.removeChild(style);
          }

          // Inyectar obligatoriamente Google Fonts para garantizar que estén completamente cargadas y activas
          const fontLink = clonedDoc.createElement('link');
          fontLink.rel = 'stylesheet';
          fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Playfair+Display:ital,wght@0,400..700;1,400..700&display=swap';
          clonedDoc.head.appendChild(fontLink);

          // Crear una única etiqueta <style> procesada con colores HSL convertidos y ajustes de caracteres
          const newStyle = clonedDoc.createElement('style');
          newStyle.type = 'text/css';
          newStyle.innerHTML = processedCss + '\n' + html2canvasOverrides;
          clonedDoc.head.appendChild(newStyle);

          // También limpiar los estilos en línea de todos los elementos dentro del documento clonado
          const allElements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i] as HTMLElement;
            if (el.style) {
              if (el.style.cssText && el.style.cssText.includes('oklch')) {
                el.style.cssText = replaceOklchWithHsl(el.style.cssText);
              }
              // Permitir que las anulaciones de hojas de estilo tengan prioridad asegurando que letterSpacing/wordSpacing en línea estén limpios
              if (el.style.letterSpacing) el.style.letterSpacing = '';
              if (el.style.wordSpacing) el.style.wordSpacing = '';
            }
          }

          // Cálculo dinámico del espaciador de salto de página para evitar el recorte de texto/encabezado y garantizar márgenes perfectos
          const container = clonedDoc.getElementById('pdf-preview-sheet');
          if (container) {
            const isA4 = pageSize === 'A4';
            const isLegal = pageSize === 'Legal';
            const isPortrait = orientation === 'portrait';
            const pageHeightMm = isPortrait 
              ? (isA4 ? 297 : (isLegal ? 355.6 : 279.4)) 
              : (isA4 ? 210 : (isLegal ? 215.9 : 215.9));
            const pageWidthMm = isPortrait 
              ? (isA4 ? 210 : (isLegal ? 215.9 : 215.9)) 
              : (isA4 ? 297 : (isLegal ? 355.6 : 279.4));

            const containerWidthPx = container.offsetWidth || 794; // alternativa al ratio estándar A4 si offsetWidth es 0
            const pageHeightPx = (pageHeightMm * containerWidthPx) / pageWidthMm;

            // Definir márgenes en milímetros y convertirlos a píxeles
            const marginMm = marginSize === 'narrow' ? 15 : (marginSize === 'wide' ? 30 : 20); // márgenes estándar
            const marginPx = (marginMm * containerWidthPx) / pageWidthMm;

            // Poner a cero el relleno superior e inferior del contenedor en el clon
            // para que podamos controlar manualmente los márgenes superior e inferior con precisión en todas las páginas.
            container.style.paddingTop = '0px';
            container.style.paddingBottom = '0px';
            container.style.boxSizing = 'border-box';
            
            // Eliminar el borde y la sombra de la caja para evitar que aparezcan contornos/líneas grises en el PDF final
            container.style.border = 'none';
            container.style.boxShadow = 'none';

            // Reunir elementos desplazables planos para evitar el doble espaciado anidado
            const shiftableElements: HTMLElement[] = [];
            for (const child of Array.from(container.children)) {
              const el = child as HTMLElement;
              const tagName = el.tagName.toUpperCase();
              if (['UL', 'OL'].includes(tagName)) {
                // Para las listas, tratamos los elementos individuales de la lista como desplazables
                const lis = Array.from(el.children) as HTMLElement[];
                for (const li of lis) {
                  shiftableElements.push(li);
                }
              } else if (['H1', 'H2', 'H3', 'H4', 'P', 'TABLE', 'PRE', 'BLOCKQUOTE', 'HR', 'IMG'].includes(tagName)) {
                shiftableElements.push(el);
              } else {
                shiftableElements.push(el);
              }
            }

            // Iterar e inyectar espaciadores/ajustar márgenes de forma dinámica
            for (const el of shiftableElements) {
              // Forzar un recálculo del diseño llamando a getBoundingClientRect() en relación con el contenedor
              const containerRect = container.getBoundingClientRect();
              const elRect = el.getBoundingClientRect();
              const elTop = elRect.top - containerRect.top;
              const elBottom = elRect.bottom - containerRect.top;
              const elHeight = elRect.height;

              if (elHeight > 0) {
                // Determinar en qué página se encuentra actualmente la parte superior del elemento
                const pageIndex = Math.floor(elTop / pageHeightPx);
                const pageStart = pageIndex * pageHeightPx;
                const pageEnd = (pageIndex + 1) * pageHeightPx;
                
                const printableTop = pageStart + marginPx;
                const printableBottom = pageEnd - marginPx;

                let extraShift = 0;

                // Caso 1: El elemento comienza demasiado temprano (dentro del área de margen superior de la página)
                if (elTop < printableTop) {
                  extraShift = printableTop - elTop;
                }
                // Caso 2: El elemento cruza el límite inferior imprimible de la página
                else if (elBottom > printableBottom && elHeight < (pageHeightPx - 2 * marginPx)) {
                  // Empujar al inicio de la siguiente página imprimible
                  const nextPagePrintableTop = (pageIndex + 1) * pageHeightPx + marginPx;
                  extraShift = nextPagePrintableTop - elTop;
                }
                // Caso 3: El encabezado está demasiado cerca de la parte inferior de la página (evitar encabezados huérfanos)
                else {
                  const isHeading = ['H1', 'H2', 'H3', 'H4'].includes(el.tagName);
                  if (isHeading && (printableBottom - elBottom) < 45) {
                    const nextPagePrintableTop = (pageIndex + 1) * pageHeightPx + marginPx;
                    extraShift = nextPagePrintableTop - elTop;
                  }
                }

                if (extraShift > 0) {
                  // Crear e insertar un elemento espaciador adecuado
                  const isLi = el.tagName.toUpperCase() === 'LI';
                  const spacer = clonedDoc.createElement(isLi ? 'li' : 'div');
                  if (isLi) {
                    (spacer as HTMLElement).style.listStyleType = 'none';
                  }
                  spacer.style.height = `${extraShift}px`;
                  spacer.style.width = '100%';
                  spacer.style.clear = 'both';
                  spacer.className = 'pdf-page-break-spacer';
                  
                  el.parentNode?.insertBefore(spacer, el);
                }
              }
            }
          }
        }
      });

      setExportStep('Compilando PDF...');

      const imgData = canvas.toDataURL('image/png');
      
      // Inicializar jsPDF con tamaño estándar
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: pageSize.toLowerCase() === 'a4' ? 'a4' : (pageSize.toLowerCase() === 'legal' ? 'legal' : 'letter')
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      let pageNum = 1;

      // Añadir la primera página
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      // Bucle para documentos de varias páginas
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
        pageNum++;
      }

      setExportStep('Iniciando descarga...');
      pdf.save(`${filename || 'documento'}.pdf`);
      
      setTimeout(() => {
        setIsExporting(false);
        setExportStep('');
        triggerToast('¡PDF descargado con éxito!');
      }, 500);

    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsExporting(false);
      setExportStep('');
      triggerToast('Error al exportar el PDF. Inténtalo de nuevo.');
    }
  };

  // Función de impresión nativa
  const triggerNativePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      triggerToast('Por favor, permite las ventanas emergentes para imprimir de forma nativa.');
      return;
    }

    const previewElement = document.getElementById('pdf-preview-sheet');
    if (!previewElement) return;

    // Construir el documento de impresión con referencias exactas a las hojas de estilo
    printWindow.document.write(`
      <html>
        <head>
          <title>${filename || 'Documento'}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,400..700;1,400..700&display=swap');
            
            body {
              background-color: #ffffff;
              color: #1f2937;
              padding: 20mm;
              font-family: ${fontFamily === 'serif' ? '"Playfair Display", Georgia, serif' : fontFamily === 'mono' ? '"JetBrains Mono", monospace' : '"Inter", sans-serif'};
            }

            /* Estilos personalizados que reflejan la configuración */
            h1, h2, h3, h4 {
              color: ${
                headingColor === 'blue' ? '#1e3a8a' : 
                headingColor === 'indigo' ? '#312e81' : 
                headingColor === 'emerald' ? '#064e3b' : 
                headingColor === 'amber' ? '#78350f' : '#111827'
              };
            }

            h1 {
              font-size: 2.25rem;
              font-weight: 700;
              margin-top: 1.5rem;
              margin-bottom: 1rem;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 0.3rem;
            }

            h2 {
              font-size: 1.75rem;
              font-weight: 600;
              margin-top: 1.5rem;
              margin-bottom: 0.75rem;
              border-bottom: 1px solid #f3f4f6;
              padding-bottom: 0.2rem;
            }

            h3 {
              font-size: 1.35rem;
              font-weight: 600;
              margin-top: 1.25rem;
              margin-bottom: 0.5rem;
            }

            p {
              margin-bottom: 1rem;
              line-height: 1.6;
            }

            blockquote {
              padding: 0.5rem 1rem;
              margin: 1rem 0;
              color: #4b5563;
              border-left: 4px solid #d1d5db;
              background-color: #f9fafb;
            }

            code {
              font-family: "JetBrains Mono", monospace;
              font-size: 0.875em;
              background-color: #f3f4f6;
              padding: 0.2rem 0.4rem;
              border-radius: 0.25rem;
              color: #eb5757;
            }

            pre {
              background-color: #f3f4f6;
              padding: 1rem;
              border-radius: 0.5rem;
              overflow-x: auto;
              margin-bottom: 1rem;
            }

            pre code {
              background-color: transparent;
              padding: 0;
              border-radius: 0;
              color: inherit;
            }

            table {
              border-collapse: collapse;
              width: 100%;
              margin-bottom: 1rem;
            }

            th, td {
              border: 1px solid #e5e7eb;
              padding: 0.5rem 0.75rem;
              text-align: left;
            }

            th {
              background-color: #f9fafb;
            }

            .pdf-page-break-before {
              page-break-before: always;
            }

            @media print {
              body {
                padding: 0;
              }
              .pdf-page-break-before {
                page-break-before: always;
              }
            }
          </style>
        </head>
        <body>
          ${previewElement.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const wordCount = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
  const charCount = markdown.length;

  return (
    <div id="main-app" className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Mensajes de estado flotantes (Toasts) dinámicos */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-white text-slate-800 border border-slate-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="text-emerald-500" size={18} />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Panel de encabezado */}
      <header className="flex flex-col sm:flex-row items-center justify-between min-h-16 h-auto py-3 sm:py-0 px-4 sm:px-6 md:px-8 bg-white border-b border-slate-200 shadow-sm shrink-0 sticky top-0 z-30 gap-3 sm:gap-4">
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <FileText size={18} />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-bold tracking-tight text-slate-800 flex items-center gap-2">
              MarkDraft
            </h1>
          </div>
        </div>
        
        {/* Controles globales / Entradas */}
        <div className="flex items-center gap-2 flex-wrap justify-end w-full sm:w-auto">
          {/* Entrada para el nombre de archivo */}
          <div className="hidden sm:flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            <span className="text-[11px] text-slate-400 mr-1.5 font-mono uppercase tracking-wider">Nombre:</span>
            <input 
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value.replace(/[^a-zA-Z0-9\s-_]/g, ''))}
              placeholder="mi-documento"
              className="bg-transparent text-xs text-slate-700 outline-none w-28 md:w-36 font-semibold"
              id="filename-input"
            />
            <span className="text-[11px] text-slate-400 font-mono">.pdf</span>
          </div>

          {/* Botones de acción rápida */}
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm h-10"
            title="Elegir una plantilla de ejemplo"
            id="templates-toggle-btn"
          >
            <Sparkles size={14} className="text-indigo-500" />
            <span>Plantillas</span>
          </button>

          {/* Activador principal para descargar el PDF */}
          <button
            onClick={generatePDF}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-xs hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200/50 disabled:opacity-50 cursor-pointer h-10"
            id="download-pdf-btn"
          >
            <Download size={14} />
            <span>{isExporting ? 'Exportando...' : 'Exportar PDF'}</span>
          </button>

          {/* Opción de impresión / guardado nativo */}
          <button
            onClick={triggerNativePrint}
            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer shadow-sm flex items-center justify-center h-10 w-10 shrink-0"
            title="Imprimir / Guardar nativo con el navegador"
            id="native-print-btn"
          >
            <Printer size={15} />
          </button>
        </div>
      </header>

      {/* Área de trabajo principal */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden p-4 md:p-6 gap-6 relative">
        
        {/* Cambiador de pestañas móviles y entrada de nombre de archivo */}
        <div className="lg:hidden flex flex-col gap-2.5 mb-1 w-full">
          {/* Nombre de archivo en móvil */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-3 w-full shadow-sm">
            <span className="text-xs text-slate-400 mr-2 font-mono">Nombre:</span>
            <input 
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value.replace(/[^a-zA-Z0-9\s-_]/g, ''))}
              placeholder="mi-documento"
              className="bg-transparent text-sm text-slate-700 outline-none w-full font-bold"
            />
            <span className="text-sm text-slate-400 font-mono">.pdf</span>
          </div>

          {/* Botones de pestañas */}
          <div className="flex border border-slate-200 bg-white p-1 rounded-xl shadow-sm">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex-1 py-3 text-center text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer h-11 ${
                activeTab === 'editor' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'
              }`}
              id="mobile-tab-editor"
            >
              <Edit3 size={15} />
              <span>Editor</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-3 text-center text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer h-11 ${
                activeTab === 'preview' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'
              }`}
              id="mobile-tab-preview"
            >
              <Eye size={15} />
              <span>Vista Previa</span>
            </button>
          </div>
        </div>

        {/* Panel lateral de plantillas predefinidas / superposición modal */}
        {showTemplates && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
              <div className="p-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-indigo-600" />
                  <h3 className="font-bold text-slate-800 text-base">Selecciona una Plantilla</h3>
                </div>
                <button 
                  onClick={() => setShowTemplates(false)}
                  className="p-1 hover:bg-slate-250 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 overflow-y-auto space-y-3 bg-white">
                <p className="text-xs text-slate-500 mb-2">Carga un formato predefinido para empezar a editar o ver cómo queda el diseño PDF final.</p>
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => loadTemplate(tpl.content, tpl.name)}
                    className="w-full text-left p-4 bg-white hover:bg-slate-50 border border-slate-150 hover:border-indigo-200 rounded-xl transition-all flex items-start gap-3.5 group cursor-pointer shadow-sm"
                  >
                    <div className="bg-slate-50 p-2.5 rounded-lg text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all mt-0.5 shadow-sm">
                      <FileText size={16} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{tpl.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{tpl.description}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 self-center transition-colors" />
                  </button>
                ))}
              </div>
              <div className="p-4.5 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                <button
                  onClick={resetToDefault}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-sm shadow-indigo-100"
                >
                  Restaurar Original
                </button>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-sm shadow-indigo-100"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Columna izquierda: Editor Markdown */}
        <section className={`flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm ${
          activeTab === 'editor' ? 'flex' : 'hidden lg:flex'
        }`}>
          {/* Detalles del encabezado del editor / Panel de acción rápida */}
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Edit3 size={12} className="text-slate-400" />
              Editor Markdown
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={clearEditor}
                className="p-1 hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-md transition-colors cursor-pointer"
                title="Vaciar Editor"
                id="clear-editor-btn"
              >
                <Trash2 size={15} />
              </button>
              <button
                onClick={resetToDefault}
                className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
                title="Restaurar Plantilla"
                id="reset-editor-btn"
              >
                <RotateCcw size={15} />
              </button>
              <div className="flex gap-1.5 ml-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
              </div>
            </div>
          </div>

          {/* Contenedor de entrada de área de texto */}
          <div className="flex-1 relative bg-white">
            <textarea
              ref={textareaRef}
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Escribe tu contenido en formato Markdown aquí..."
              className="w-full h-full p-6 bg-white text-slate-800 font-mono text-sm leading-relaxed outline-none resize-none overflow-y-auto placeholder:text-slate-300"
              style={{ caretColor: '#4f46e5' }}
              id="markdown-textarea"
              spellCheck="false"
            />
          </div>
        </section>

        {/* Columna derecha: Vista previa de PDF y panel de configuración */}
        <section className={`flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm ${
          activeTab === 'preview' ? 'flex' : 'hidden lg:flex'
        }`}>
          {/* Personalizador de vista previa / Barra de configuración */}
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
            <div className="flex items-center gap-1.5 shrink-0">
              <Eye size={14} className="text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Vista Previa</span>
            </div>
            
            {/* Menús desplegables de controles de diseño rápido */}
            <div className="flex items-center gap-2 flex-wrap md:justify-end w-full md:w-auto">
              <div className="flex items-center gap-1 bg-slate-200/50 px-2 py-1 rounded-lg text-[11px] text-slate-500 font-medium">
                <Settings2 size={12} className="text-slate-400" />
                <span className="hidden sm:inline">Diseño:</span>
              </div>
              
              {/* Formato */}
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as any)}
                className="bg-white hover:bg-slate-50 text-[11px] text-slate-600 font-semibold px-2 py-1.5 rounded-lg outline-none border border-slate-200 cursor-pointer transition-colors shadow-sm"
                id="setting-paper"
                title="Tamaño de página"
              >
                <option value="A4">A4</option>
                <option value="Letter">Carta</option>
                <option value="Legal">Oficio</option>
              </select>

              {/* Orientación */}
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as any)}
                className="bg-white hover:bg-slate-50 text-[11px] text-slate-600 font-semibold px-2 py-1.5 rounded-lg outline-none border border-slate-200 cursor-pointer transition-colors shadow-sm"
                id="setting-orientation"
                title="Orientación"
              >
                <option value="portrait">Vertical</option>
                <option value="landscape">Horizontal</option>
              </select>

              {/* Márgenes */}
              <select
                value={marginSize}
                onChange={(e) => setMarginSize(e.target.value as any)}
                className="bg-white hover:bg-slate-50 text-[11px] text-slate-600 font-semibold px-2 py-1.5 rounded-lg outline-none border border-slate-200 cursor-pointer transition-colors shadow-sm"
                id="setting-margins"
                title="Márgenes"
              >
                <option value="normal">Normal</option>
                <option value="narrow">Estrecho</option>
                <option value="wide">Ancho</option>
              </select>

              {/* Fuente */}
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value as any)}
                className="bg-white hover:bg-slate-50 text-[11px] text-slate-600 font-semibold px-2 py-1.5 rounded-lg outline-none border border-slate-200 cursor-pointer transition-colors shadow-sm"
                id="setting-font"
                title="Tipografía"
              >
                <option value="sans">Sanz</option>
                <option value="serif">Serif</option>
                <option value="mono">Mono</option>
              </select>

              {/* Color */}
              <select
                value={headingColor}
                onChange={(e) => setHeadingColor(e.target.value as any)}
                className="bg-white hover:bg-slate-50 text-[11px] text-slate-600 font-semibold px-2 py-1.5 rounded-lg outline-none border border-slate-200 cursor-pointer transition-colors shadow-sm"
                id="setting-color"
                title="Color de títulos"
              >
                <option value="default">Gris</option>
                <option value="blue">Azul</option>
                <option value="indigo">Índigo</option>
                <option value="emerald">Verde</option>
                <option value="amber">Ámbar</option>
              </select>
            </div>
          </div>

          {/* Vista previa en tiempo real del documento con estilo PDF */}
          <div className="flex-1 overflow-hidden flex flex-col bg-slate-50/50">
            <Preview 
              markdown={markdown}
              previewRef={previewContainerRef}
              fontFamily={fontFamily}
              pageSize={pageSize}
              orientation={orientation}
              marginSize={marginSize}
              headingColor={headingColor}
            />
          </div>
        </section>

        {/* Hoja de ayuda de Markdown / Panel desplegable */}
        {showHelp && (
          <div className="absolute inset-y-0 right-0 w-full sm:w-96 bg-white border-l border-slate-200 z-50 shadow-2xl flex flex-col overflow-hidden animate-slide-in">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-1.5 text-indigo-600 font-bold">
                <HelpCircle size={18} />
                <span>Guía Rápida de Markdown</span>
              </div>
              <button 
                onClick={() => setShowHelp(false)}
                className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                id="close-help-btn"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 p-5 overflow-y-auto space-y-5 text-sm leading-relaxed text-slate-600 bg-white">
              <div>
                <h4 className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1 text-xs uppercase tracking-wider">Títulos</h4>
                <pre className="bg-slate-50 p-2.5 rounded-lg font-mono text-xs text-indigo-600 border border-slate-100">
                  {`# Título Principal (H1)
## Título Secundario (H2)
### Título de Sección (H3)`}
                </pre>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1 text-xs uppercase tracking-wider">Énfasis</h4>
                <pre className="bg-slate-50 p-2.5 rounded-lg font-mono text-xs text-indigo-600 border border-slate-100">
                  {`**Texto en negrita**
*Texto en cursiva*
~~Texto tachado~~`}
                </pre>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1 text-xs uppercase tracking-wider">Listas</h4>
                <pre className="bg-slate-50 p-2.5 rounded-lg font-mono text-xs text-indigo-600 border border-slate-100">
                  {`- Elemento con viñeta
- Otro elemento

1. Primer paso
2. Segundo paso`}
                </pre>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1 text-xs uppercase tracking-wider">Citas e Información</h4>
                <pre className="bg-slate-50 p-2.5 rounded-lg font-mono text-xs text-indigo-600 border border-slate-100">
                  {`> "Este bloque se verá como una cita 
destacada en el documento PDF"`}
                </pre>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1 text-xs uppercase tracking-wider">Tablas</h4>
                <pre className="bg-slate-50 p-2.5 rounded-lg font-mono text-xs text-indigo-600 border border-slate-100">
                  {`| Artículo | Precio |
| :--- | :---: |
| Laptop | 899 € |
| Ratón | 25 € |`}
                </pre>
              </div>

              <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl text-indigo-800 text-xs leading-relaxed">
                <div className="flex items-start gap-2">
                  <Info size={16} className="shrink-0 mt-0.5 text-indigo-500" />
                  <div>
                    <h5 className="font-bold text-indigo-950 mb-1">💡 Control de Páginas</h5>
                    <p>Puedes forzar un salto de página en tu PDF insertando el siguiente código:</p>
                    <code className="bg-white text-indigo-600 border border-indigo-100 p-1 rounded font-mono block mt-2 text-[10px] select-all">
                      {"<div class=\"pdf-page-break-before\"></div>"}
                    </code>
                    <p className="mt-2 text-[11px] text-indigo-500/80">Esto es ideal para separar capítulos, portadas o secciones grandes.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setShowHelp(false)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer shadow-md shadow-indigo-100"
              >
                Entendido
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Barra de pie de página */}
      <footer className="h-10 bg-white border-t border-slate-200 px-8 flex items-center justify-between text-[11px] text-slate-400 font-medium uppercase tracking-widest shrink-0">
        <div className="flex gap-6">
          <span>Palabras: {wordCount}</span>
          <span>Caracteres: {charCount}</span>
        </div>
        <div className="flex gap-4">
          <span>UTF-8</span>
        </div>
      </footer>

      {/* Superposición de cargador de exportación */}
      {isExporting && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white border border-slate-200 p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl flex flex-col items-center gap-4">
            {/* Cargador giratorio */}
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Exportando PDF</h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">{exportStep}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
