import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, Terminal } from 'lucide-react';
import { PYTHON_GAME_CODE } from '../python_game_code';

export const PythonCodeViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PYTHON_GAME_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = PYTHON_GAME_CODE;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([PYTHON_GAME_CODE], { type: 'text/x-python' });
    element.href = URL.createObjectURL(file);
    element.download = 'juego_carreras.py';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const lines = PYTHON_GAME_CODE.trim().split('\n');

  return (
    <div id="python-code-viewer" className="flex flex-col h-full bg-slate-900 border border-slate-700/80 rounded-xl overflow-hidden shadow-xl">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-800/90 border-b border-slate-700 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-md border border-blue-500/30">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-semibold text-slate-100">juego_carreras.py</span>
              <span className="px-2 py-0.5 text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                Python 3 • Tkinter
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">100% autocontenido • Sin dependencias externas</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="copy-python-code-btn"
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-700/80 hover:bg-slate-700 hover:text-white border border-slate-600 rounded-lg transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copiar Código</span>
              </>
            )}
          </button>

          <button
            id="download-python-code-btn"
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar .py</span>
          </button>
        </div>
      </div>

      {/* Terminal execution quick banner */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-xs font-mono text-slate-400">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300">Ejecución en consola:</span>
          <code className="px-2 py-0.5 bg-slate-900 text-cyan-300 rounded border border-slate-800">
            python juego_carreras.py
          </code>
        </div>
        <span className="text-slate-500 hidden sm:inline">{lines.length} líneas de código</span>
      </div>

      {/* Code Display Area */}
      <div className="relative flex-1 overflow-x-auto overflow-y-auto max-h-[640px] font-mono text-xs bg-slate-950 p-4 select-text">
        <pre className="table w-full">
          <tbody>
            {lines.map((line, idx) => {
              const isComment = line.trim().startsWith('#') || line.trim().startsWith('"""') || line.trim().startsWith('==');
              const isClassOrDef = line.trim().startsWith('class ') || line.trim().startsWith('def ');
              const isImport = line.trim().startsWith('import ') || line.trim().startsWith('from ');

              let lineClass = 'text-slate-300';
              if (isComment) lineClass = 'text-emerald-400/90 italic';
              else if (isClassOrDef) lineClass = 'text-amber-300 font-semibold';
              else if (isImport) lineClass = 'text-cyan-400 font-medium';

              return (
                <tr key={idx} className="hover:bg-slate-900/60 leading-relaxed">
                  <td className="w-12 pr-4 text-right select-none text-slate-600 border-r border-slate-800/80 align-top">
                    {idx + 1}
                  </td>
                  <td className={`pl-4 align-top whitespace-pre font-mono ${lineClass}`}>
                    {line}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </pre>
      </div>
    </div>
  );
};
