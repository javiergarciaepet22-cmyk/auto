import React from 'react';
import { CheckCircle2, Gamepad2, Layers, Cpu, Compass, Terminal, Zap, Crosshair, RefreshCw } from 'lucide-react';

export const GuideSection: React.FC = () => {
  return (
    <div id="guide-section" className="space-y-6 text-slate-300">
      {/* Overview Cards with New Combat Mechanics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center space-x-2 text-cyan-400 font-semibold mb-2 text-sm">
            <Zap className="w-4 h-4" />
            <span>Nitro Turbo Propulsor</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Mantén presionado <strong className="text-slate-200">Flecha Arriba, W o Shift</strong> para activar el turbo. Aumenta la velocidad un 80% y las llamas vectoriales en el Canvas duplican tu puntuación por segundo.
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center space-x-2 text-amber-400 font-semibold mb-2 text-sm">
            <Crosshair className="w-4 h-4" />
            <span>Cañón Frontal & Explosiones</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Pulsa <strong className="text-slate-200">Espacio o J</strong> para disparar plasma frontal. Los autos enemigos impactados explotan en chispas geométricas en el Canvas otorgando +75 puntos cada uno.
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold mb-2 text-sm">
            <RefreshCw className="w-4 h-4" />
            <span>Recarga al Esquivar</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Cada auto NPC que rebasa la parte inferior de la pantalla sin chocar contigo otorga <strong className="text-emerald-300">+25% de Nitro</strong> y <strong className="text-amber-300">+2 balas de cañón</strong>.
          </p>
        </div>
      </div>

      {/* Checklist of Met Requirements */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Verificación de Nuevas Mecánicas Solicitadas</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-start space-x-2.5 p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200">1. Sistema de Nitro Turbo:</strong>
              <p className="text-slate-400 mt-0.5">
                Acelerador con medidor porcentual en el HUD, escape con animación de llamaradas y física reactiva de velocidad.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200">2. Cañón para Explotar Tráfico:</strong>
              <p className="text-slate-400 mt-0.5">
                Proyectiles de plasma dual que detectan colisión con los NPCs y generan una animación de explosión radial en el Canvas de Tkinter.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200">3. Recarga Automática al Esquivar:</strong>
              <p className="text-slate-400 mt-0.5">
                Al rebasar a un NPC de forma segura (llegar a <code className="text-emerald-300">y &gt; canvas_height</code>), el juego incrementa automáticamente el nitro y suma munición.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200">4. 100% Librería Estándar Tkinter:</strong>
              <p className="text-slate-400 mt-0.5">
                Cero dependencias externas. Se ejecuta con cualquier instalación estándar de Python 3 sin requerir Pygame.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How to run instruction steps */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>Cómo Iniciar el Juego en tu Computadora</span>
        </h3>

        <div className="space-y-3 text-xs leading-relaxed">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
            <span className="font-semibold text-amber-300">Paso 1: Guardar el archivo</span>
            <p className="text-slate-400">
              Guarda el código provisto en un archivo con el nombre <code className="text-slate-200 font-mono">juego_carreras.py</code> (puedes usar el botón "Descargar .py").
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
            <span className="font-semibold text-amber-300">Paso 2: Abrir una terminal o línea de comandos</span>
            <p className="text-slate-400">
              Navega con el comando <code className="text-slate-200 font-mono">cd</code> a la carpeta donde guardaste el archivo.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
            <span className="font-semibold text-amber-300">Paso 3: Ejecutar con Python 3</span>
            <div className="flex items-center space-x-2 mt-1">
              <code className="px-3 py-1.5 bg-slate-900 text-emerald-400 font-mono text-xs rounded border border-slate-700">
                python juego_carreras.py
              </code>
              <span className="text-slate-500">(o <code className="text-slate-400">python3 juego_carreras.py</code> en macOS/Linux)</span>
            </div>
          </div>

          <div className="flex items-start space-x-2 p-3 bg-blue-950/30 border border-blue-800/40 rounded-lg text-slate-300">
            <Compass className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p>
              ¡Y listo! Se abrirá instantáneamente la ventana nativa de Tkinter con la carretera vertical, el medidor de nitro, cañón y autos enemigos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
