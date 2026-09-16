import React, { useState } from 'react';
import { Gamepad2, Code2, BookOpen, Download, Terminal, Sparkles } from 'lucide-react';
import { ArcadeGameCanvas } from './components/ArcadeGameCanvas';
import { PythonCodeViewer } from './components/PythonCodeViewer';
import { GuideSection } from './components/GuideSection';
import { PYTHON_GAME_CODE } from './python_game_code';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'guide'>('simulator');

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([PYTHON_GAME_CODE], { type: 'text/x-python' });
    element.href = URL.createObjectURL(file);
    element.download = 'juego_carreras.py';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 border border-blue-400/30">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  Python Tkinter Arcade Runner
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                  2D Endless Runner
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Conducción vertical sin límites con Canvas, POO y bucle asíncrono
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              id="tab-simulator-btn"
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'simulator'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Simulador</span>
            </button>

            <button
              id="tab-code-btn"
              onClick={() => setActiveTab('code')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'code'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Código Python</span>
            </button>

            <button
              id="tab-guide-btn"
              onClick={() => setActiveTab('guide')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'guide'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Documentación</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center space-x-2">
            <button
              id="header-download-btn"
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar .py</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Arcade Simulator Canvas */}
            <div className="lg:col-span-6 flex justify-center">
              <ArcadeGameCanvas />
            </div>

            {/* Right: Quick Instructions & Code Highlight */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-amber-400 font-semibold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Juego Arcade en Python Puro (Tkinter)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Este simulador interactivo reproduce con exactitud las mecánicas de físicas, velocidad incremental, tráfico NPC aleatorio y detección de colisiones programadas en el script de Python con <code className="text-amber-300">tkinter</code>.
                </p>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/90 text-xs space-y-1.5">
                  <span className="font-semibold text-slate-200">Controles de juego:</span>
                  <div className="grid grid-cols-2 gap-2 text-slate-400 font-mono text-[11px] pt-1">
                    <div>◄ / Tecla A: Mover izquierda</div>
                    <div>► / Tecla D: Mover derecha</div>
                    <div>▲ / W / Shift: Nitro Turbo 🚀</div>
                    <div>Espacio / J: Disparar cañón 💥</div>
                    <div>Tecla G: Taller & Garaje 🛒</div>
                    <div>P: Pausar / R: Reiniciar</div>
                  </div>
                </div>
              </div>

              {/* Technical Highlights */}
              <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Ejecución directa en tu computadora</span>
                </h3>
                <p className="text-xs text-slate-400">
                  El código está 100% listo para ejecutarse sin instalar nada más que Python estándar:
                </p>
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <code className="text-xs text-emerald-400 font-mono">python juego_carreras.py</code>
                  <button
                    onClick={handleDownload}
                    className="flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 font-medium"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Obtener archivo</span>
                  </button>
                </div>
              </div>

              {/* Architecture Brief */}
              <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2.5 text-xs text-slate-400">
                <h3 className="font-semibold text-slate-200">Detalles de Arquitectura POO implementada:</h3>
                <ul className="space-y-1.5 list-disc list-inside">
                  <li><strong className="text-slate-300">EndlessRunnerGame:</strong> Gestiona la ventana Tkinter, el Canvas, los carriles y el bucle principal.</li>
                  <li><strong className="text-slate-300">NPCVehicle:</strong> Modela cada obstáculo, su velocidad variable, colores y dibujo geométrico.</li>
                  <li><strong className="text-slate-300">Bucle .after(16):</strong> Mantiene 60 FPS estables sin bloquear eventos de la interfaz.</li>
                  <li><strong className="text-slate-300">Colisión AABB:</strong> Comprobación de intersección de rectángulos con márgenes de tolerancia.</li>
                </ul>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('code')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-1"
                  >
                    <span>Ver código completo comentado</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="h-[calc(100vh-140px)] min-h-[600px]">
            <PythonCodeViewer />
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="max-w-4xl mx-auto py-2">
            <GuideSection />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/50 py-3.5 text-center text-xs text-slate-500">
        <p>Juego 2D Arcade de Conducción en Python • Desarrollado exclusivamente con Tkinter y Random</p>
      </footer>
    </div>
  );
}
