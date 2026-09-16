import React from 'react';
import { CheckCircle2, Gamepad2, Layers, Cpu, Compass, Terminal, Zap, Crosshair, RefreshCw, ShoppingBag, Coins, Palette } from 'lucide-react';

export const GuideSection: React.FC = () => {
  return (
    <div id="guide-section" className="space-y-6 text-slate-300">
      {/* Overview Cards with New Garage and Progression Mechanics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center space-x-2 text-amber-400 font-semibold mb-2 text-sm">
            <Coins className="w-4 h-4" />
            <span>Monedas y Economía</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Recoge monedas doradas en el asfalto (+$15-$25), esquiva autos de forma segura (+$5) o destrúyelos con tus cañones (+$30).
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center space-x-2 text-cyan-400 font-semibold mb-2 text-sm">
            <ShoppingBag className="w-4 h-4" />
            <span>Taller & Catálogo de Autos</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Pulsa <strong className="text-slate-200">[G]</strong> para abrir el garaje. Compra bólidos como el Muscle V8, Cyber Phantom, Hypercar Veloce o Titan Enforcer.
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center space-x-2 text-pink-400 font-semibold mb-2 text-sm">
            <Palette className="w-4 h-4" />
            <span>Pinturas y Neón Underglow</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Personaliza el color de carrocería entre 8 tonos y activa luces de neón bajo el chasis (Cyan, Rosa Eléctrico, Lima, Ámbar).
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold mb-2 text-sm">
            <Zap className="w-4 h-4" />
            <span>Mejoras de Rendimiento</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Invierte tu dinero en subir de nivel el motor (más velocidad base), capacidad del tanque de nitro y cartuchos de munición.
          </p>
        </div>
      </div>

      {/* Checklist of Met Requirements */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Mecánicas y Mejoras Implementadas</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-start space-x-2.5 p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200">1. Gráficos Enriquecidos:</strong>
              <p className="text-slate-400 mt-0.5">
                Farolas con conos de luz en el asfalto, arcenes alternados, patrullas con sirena destellante, camiones pesados y efectos de neón en el suelo.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200">2. Variedad de Autos Comprables:</strong>
              <p className="text-slate-400 mt-0.5">
                5 modelos con carrocerías vectoriales únicas: Sport, Muscle con toma de aire, Cyber con alerones angulares, Hypercar Le Mans y Blindado Titan.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200">3. Personalización Completa:</strong>
              <p className="text-slate-400 mt-0.5">
                Selector de color primario, luces de suelo de neón underglow y mejoras de velocidad de motor, nitro y cañones.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200">4. 100% Python Estándar Tkinter:</strong>
              <p className="text-slate-400 mt-0.5">
                Tanto el simulador web como el archivo <code className="text-emerald-300">juego_carreras.py</code> cuentan con el garaje completo sin instalar módulos externos.
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
            <span className="font-semibold text-amber-300">Paso 1: Guardar o Descargar el archivo</span>
            <p className="text-slate-400">
              Descarga el archivo haciendo clic en el botón superior <strong className="text-white">"Descargar .py"</strong> o cópialo desde la pestaña <strong className="text-white">"Código Python"</strong> y guárdalo como <code className="text-cyan-300">juego_carreras.py</code>.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
            <span className="font-semibold text-amber-300">Paso 2: Abrir terminal o consola</span>
            <p className="text-slate-400">
              Abre PowerShell, Símbolo del sistema (CMD) o la Terminal de macOS/Linux en la carpeta donde guardaste el archivo.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
            <span className="font-semibold text-amber-300">Paso 3: Ejecutar con Python</span>
            <div className="p-2.5 bg-slate-900 rounded font-mono text-emerald-400 text-xs select-all">
              python juego_carreras.py
            </div>
            <p className="text-slate-400 text-[11px]">
              Se abrirá al instante una ventana nativa de Tkinter con la carretera en movimiento continuo a 60 FPS, monedas, garaje interactivo con la tecla [G], sistema de nitro y cañón.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
