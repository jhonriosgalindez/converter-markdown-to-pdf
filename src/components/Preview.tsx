import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PageSize, PageOrientation } from '../types';

interface PreviewProps {
  markdown: string;
  previewRef: React.RefObject<HTMLDivElement | null>;
  fontFamily: 'sans' | 'serif' | 'mono';
  pageSize: PageSize;
  orientation: PageOrientation;
  marginSize: 'normal' | 'narrow' | 'wide';
  headingColor: 'default' | 'blue' | 'indigo' | 'emerald' | 'amber';
}

export default function Preview({
  markdown,
  previewRef,
  fontFamily,
  pageSize,
  orientation,
  marginSize,
  headingColor
}: PreviewProps) {
  
  // Clases de margen personalizadas
  const marginClasses = {
    normal: 'p-8 md:p-12', // ~2.5 cm
    narrow: 'p-4 md:p-6',   // ~1.5 cm
    wide: 'p-12 md:p-16',   // ~3.5 cm
  }[marginSize];

  // Clases de tipografía personalizadas
  const fontClasses = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono'
  }[fontFamily];

  // Mapeo de acentos de color para los encabezados
  const headingColorClasses = {
    default: '[&_h1]:text-gray-950 [&_h2]:text-gray-900 [&_h3]:text-gray-800 [&_h2]:border-b [&_h2]:border-gray-800',
    blue: '[&_h1]:text-blue-950 [&_h2]:text-blue-900 [&_h3]:text-blue-800 [&_h2]:border-b [&_h2]:border-blue-900',
    indigo: '[&_h1]:text-indigo-950 [&_h2]:text-indigo-900 [&_h3]:text-indigo-800 [&_h2]:border-b [&_h2]:border-indigo-900',
    emerald: '[&_h1]:text-emerald-950 [&_h2]:text-emerald-900 [&_h3]:text-emerald-800 [&_h2]:border-b [&_h2]:border-emerald-900',
    amber: '[&_h1]:text-amber-950 [&_h2]:text-amber-900 [&_h3]:text-amber-800 [&_h2]:border-b [&_h2]:border-amber-900',
  }[headingColor];

  // Ancho y proporción de página según A4/Letter/Legal y Orientación Vertical/Horizontal
  const isA4 = pageSize === 'A4';
  const isLegal = pageSize === 'Legal';
  const isPortrait = orientation === 'portrait';

  const widthMm = isPortrait 
    ? (isA4 ? 210 : (isLegal ? 215.9 : 215.9)) 
    : (isA4 ? 297 : (isLegal ? 355.6 : 279.4));

  const minHeightMm = isPortrait 
    ? (isA4 ? 297 : (isLegal ? 355.6 : 279.4)) 
    : (isA4 ? 210 : (isLegal ? 215.9 : 215.9));

  const pageContainerStyles = {
    width: '100%',
    maxWidth: `${widthMm}mm`,
    minHeight: `${minHeightMm}mm`,
    backgroundColor: '#ffffff',
  };

  // Podemos renderizar un indicador visual para los saltos de página para ayudar al usuario a diseñar su PDF
  const renderers = {
    // Podemos interceptar etiquetas personalizadas si es necesario o simplemente dejar que se renderice el markdown estándar.
    // Por ejemplo, queremos dar estilo visual a las líneas horizontales o a divs específicos de salto
  };

  // Procesaremos o trataremos cadenas de Markdown específicas (como HTML personalizado o marcadores)
  // para renderizar una hermosa línea punteada con un ícono de tijeras en la vista previa del editor.
  const processedMarkdown = markdown
    .replace(/<div class="pdf-page-break-before"><\/div>/g, '\n\n---\n*✂️ SALTO DE PÁGINA (PDF PAGE BREAK) ✂️*\n---\n\n')
    .replace(/<div class="pdf-page-break-after"><\/div>/g, '\n\n---\n*✂️ SALTO DE PÁGINA (PDF PAGE BREAK) ✂️*\n---\n\n');

  return (
    <div className="w-full h-full overflow-y-auto bg-gray-100 p-4 md:p-6 rounded-b-xl border-t border-gray-100 flex flex-col items-center">
      {/* Franja de información sobre las restricciones de la página */}
      <div className="w-full max-w-[210mm] mb-4 flex items-center justify-between text-xs text-gray-500 font-mono px-2">
        <span>Vista Previa del Documento ({pageSize} - {orientation === 'portrait' ? 'Vertical' : 'Horizontal'})</span>
        <span>Márgenes: {marginSize === 'normal' ? 'Normal' : marginSize === 'narrow' ? 'Estrecho' : 'Ancho'}</span>
      </div>

      {/* Representación visual de la hoja impresa */}
      <div 
        ref={previewRef}
        id="pdf-preview-sheet"
        style={pageContainerStyles}
        className={`shadow-lg border border-gray-300 rounded-sm transition-all duration-200 ${marginClasses} ${fontClasses} ${headingColorClasses} markdown-preview text-gray-800 break-words`}
      >
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            // Estilo personalizado para líneas horizontales para identificar saltos de página
            hr: ({node, ...props}) => {
              // Podemos verificar si fue generado por nuestro salto de página
              return <hr className="my-6 border-t-2 border-dashed border-gray-300" {...props} />;
            },
            // Estilo para elementos de tabla hermosos para impresión
            table: ({node, ...props}) => (
              <div className="overflow-x-auto my-6 pdf-page-break-inside-avoid">
                <table className="min-w-full divide-y divide-gray-300 border border-gray-200" {...props} />
              </div>
            )
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}
