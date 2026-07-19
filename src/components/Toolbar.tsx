import React from 'react';
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  Link, 
  Code, 
  Table, 
  TextQuote, 
  Minus,
  Scissors,
  HelpCircle
} from 'lucide-react';

interface ToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (newValue: string) => void;
  onShowHelp: () => void;
}

export default function Toolbar({ textareaRef, value, onChange, onShowHelp }: ToolbarProps) {
  const insertMarkdown = (before: string, after: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const replacementText = selectedText || defaultText;

    const newValue = 
      value.substring(0, start) + 
      before + 
      replacementText + 
      after + 
      value.substring(end);

    onChange(newValue);

    // Volver a enfocar y establecer la selección
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + replacementText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  const tools = [
    { 
      label: 'Negrita', 
      icon: Bold, 
      action: () => insertMarkdown('**', '**', 'texto') 
    },
    { 
      label: 'Cursiva', 
      icon: Italic, 
      action: () => insertMarkdown('*', '*', 'texto') 
    },
    { 
      label: 'Título 1', 
      icon: Heading1, 
      action: () => insertMarkdown('\n# ', '', 'Título 1') 
    },
    { 
      label: 'Título 2', 
      icon: Heading2, 
      action: () => insertMarkdown('\n## ', '', 'Título 2') 
    },
    { 
      label: 'Lista de viñetas', 
      icon: List, 
      action: () => insertMarkdown('\n- ', '', 'Elemento') 
    },
    { 
      label: 'Lista numerada', 
      icon: ListOrdered, 
      action: () => insertMarkdown('\n1. ', '', 'Elemento') 
    },
    { 
      label: 'Enlace', 
      icon: Link, 
      action: () => insertMarkdown('[', '](https://ejemplo.com)', 'texto del enlace') 
    },
    { 
      label: 'Bloque de código', 
      icon: Code, 
      action: () => insertMarkdown('\n```javascript\n', '\n```\n', '// Código aquí') 
    },
    { 
      label: 'Cita', 
      icon: TextQuote, 
      action: () => insertMarkdown('\n> ', '', 'Cita importante') 
    },
    { 
      label: 'Tabla', 
      icon: Table, 
      action: () => insertMarkdown(
        '\n| Encabezado 1 | Encabezado 2 |\n| :--- | :--- |\n| Fila 1 Columna 1 | Fila 1 Columna 2 |\n| Fila 2 Columna 1 | Fila 2 Columna 2 |\n'
      ) 
    },
    { 
      label: 'Línea horizontal', 
      icon: Minus, 
      action: () => insertMarkdown('\n---\n') 
    },
    { 
      label: 'Salto de página en PDF', 
      icon: Scissors, 
      action: () => insertMarkdown('\n<div class="pdf-page-break-before"></div>\n\n'),
      highlight: true
    }
  ];

  return (
    <div className="flex items-center justify-between flex-wrap gap-1 bg-slate-50 border-b border-slate-200 p-2 rounded-t-2xl">
      <div className="flex items-center flex-wrap gap-1">
        {tools.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <button
              key={index}
              onClick={tool.action}
              type="button"
              className={`p-1.5 rounded-lg transition-colors duration-150 flex items-center justify-center cursor-pointer ${
                tool.highlight 
                  ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' 
                  : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
              title={tool.label}
              aria-label={tool.label}
              id={`toolbar-btn-${index}`}
            >
              <Icon size={16} />
            </button>
          );
        })}
      </div>

      <button
        onClick={onShowHelp}
        type="button"
        className="p-1.5 text-slate-400 hover:text-indigo-500 rounded-lg hover:bg-indigo-50 transition-colors duration-150 cursor-pointer flex items-center gap-1 text-xs font-medium"
        title="Guía de Markdown"
        aria-label="Guía de Markdown"
        id="toolbar-help-btn"
      >
        <HelpCircle size={16} />
        <span className="hidden sm:inline">Guía</span>
      </button>
    </div>
  );
}
