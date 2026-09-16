import React, { useState } from 'react';
import { X, Check, Lock, ShoppingBag, Palette, Wrench, Zap, Gauge, Crosshair, Sparkles, Coins } from 'lucide-react';
import { CAR_CATALOG, COLOR_OPTIONS, NEON_OPTIONS, CarModel, CustomizationSettings } from '../types';

interface GarageModalProps {
  isOpen: boolean;
  onClose: () => void;
  customization: CustomizationSettings;
  onUpdateCustomization: (newSettings: CustomizationSettings) => void;
  onPlaySound?: (freq: number, type: OscillatorType, dur: number) => void;
}

export const GarageModal: React.FC<GarageModalProps> = ({
  isOpen,
  onClose,
  customization,
  onUpdateCustomization,
  onPlaySound
}) => {
  const [activeTab, setActiveTab] = useState<'cars' | 'paint' | 'upgrades'>('cars');
  const [previewCarId, setPreviewCarId] = useState<string>(customization.selectedCarId);

  if (!isOpen) return null;

  const currentCar = CAR_CATALOG.find(c => c.id === previewCarId) || CAR_CATALOG[0];
  const isSelectedCarPurchased = customization.purchasedCars.includes(currentCar.id);
  const isEquipped = customization.selectedCarId === currentCar.id;

  const handleBuyCar = (car: CarModel) => {
    if (customization.wallet >= car.price && !customization.purchasedCars.includes(car.id)) {
      const newPurchased = [...customization.purchasedCars, car.id];
      const newWallet = customization.wallet - car.price;
      onUpdateCustomization({
        ...customization,
        purchasedCars: newPurchased,
        selectedCarId: car.id,
        primaryColor: car.defaultColor,
        wallet: newWallet
      });
      if (onPlaySound) onPlaySound(880, 'sine', 0.25);
    }
  };

  const handleEquipCar = (carId: string) => {
    const car = CAR_CATALOG.find(c => c.id === carId);
    if (!car) return;
    onUpdateCustomization({
      ...customization,
      selectedCarId: carId,
      primaryColor: customization.primaryColor || car.defaultColor
    });
    if (onPlaySound) onPlaySound(600, 'triangle', 0.15);
  };

  const handleColorSelect = (hex: string) => {
    onUpdateCustomization({
      ...customization,
      primaryColor: hex
    });
    if (onPlaySound) onPlaySound(720, 'sine', 0.08);
  };

  const handleNeonSelect = (hex: string) => {
    onUpdateCustomization({
      ...customization,
      neonUnderglow: hex
    });
    if (onPlaySound) onPlaySound(800, 'sine', 0.08);
  };

  const handleUpgrade = (type: 'engine' | 'nitro' | 'ammo') => {
    const currentLevel = type === 'engine' ? customization.engineLevel : type === 'nitro' ? customization.nitroLevel : customization.ammoLevel;
    if (currentLevel >= 3) return;
    const cost = (currentLevel + 1) * 200;
    if (customization.wallet < cost) return;

    onUpdateCustomization({
      ...customization,
      wallet: customization.wallet - cost,
      engineLevel: type === 'engine' ? currentLevel + 1 : customization.engineLevel,
      nitroLevel: type === 'nitro' ? currentLevel + 1 : customization.nitroLevel,
      ammoLevel: type === 'ammo' ? currentLevel + 1 : customization.ammoLevel,
    });
    if (onPlaySound) onPlaySound(950, 'triangle', 0.2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Taller & Concesionario de Autos
              </h2>
              <p className="text-xs text-slate-400">
                Personaliza la carrocería, neones y compra bólidos de alta velocidad
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Wallet display */}
            <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-amber-500/15 border border-amber-500/40 rounded-xl text-amber-300 font-mono font-bold text-sm shadow-inner">
              <Coins className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <span>${customization.wallet.toLocaleString()}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Tabs Navigation */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40 gap-3">
          <button
            onClick={() => setActiveTab('cars')}
            className={`flex items-center space-x-2 py-3 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'cars'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>Vehículos ({CAR_CATALOG.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('paint')}
            className={`flex items-center space-x-2 py-3 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'paint'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Pintura & Neón</span>
          </button>

          <button
            onClick={() => setActiveTab('upgrades')}
            className={`flex items-center space-x-2 py-3 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'upgrades'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Taller de Rendimiento</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* VEHICLES TAB */}
          {activeTab === 'cars' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Car Catalog List */}
              <div className="lg:col-span-5 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Modelos Disponibles
                </span>
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {CAR_CATALOG.map(car => {
                    const isPurchased = customization.purchasedCars.includes(car.id);
                    const isCurrent = customization.selectedCarId === car.id;
                    const isInspecting = previewCarId === car.id;

                    return (
                      <div
                        key={car.id}
                        onClick={() => setPreviewCarId(car.id)}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                          isInspecting
                            ? 'bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-950/50'
                            : 'bg-slate-900/60 hover:bg-slate-800/50 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-8 rounded-sm shadow-sm"
                            style={{
                              backgroundColor: isCurrent ? customization.primaryColor : car.defaultColor,
                              border: '1px solid rgba(255,255,255,0.2)'
                            }}
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-white">{car.name}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded">
                                  EN USO
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">
                              Vel. Base: {Math.round(car.baseSpeed * 12)} km/h
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          {isPurchased ? (
                            <span className="text-xs font-semibold text-emerald-400 flex items-center justify-end space-x-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>En Garaje</span>
                            </span>
                          ) : (
                            <span className="text-xs font-bold font-mono text-amber-400 flex items-center justify-end space-x-1">
                              <Coins className="w-3.5 h-3.5" />
                              <span>${car.price}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Interactive Showcase & Stats */}
              <div className="lg:col-span-7 bg-slate-950/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">{currentCar.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{currentCar.description}</p>
                    </div>
                    {isSelectedCarPurchased ? (
                      <span className="px-2.5 py-1 text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg">
                        Desbloqueado
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-lg flex items-center space-x-1">
                        <Lock className="w-3 h-3" />
                        <span>${currentCar.price}</span>
                      </span>
                    )}
                  </div>

                  {/* Visual Car Stage Preview */}
                  <div className="my-6 py-6 bg-radial-gradient from-slate-800/40 via-slate-900/60 to-transparent rounded-xl border border-slate-800/80 flex flex-col items-center justify-center relative overflow-hidden">
                    {/* Road markings underneath */}
                    <div className="absolute inset-y-0 w-24 border-x border-dashed border-amber-400/20 flex items-center justify-center">
                      <div className="w-1.5 h-full bg-amber-400/15" />
                    </div>

                    {/* Underglow Glow Effect */}
                    {customization.neonUnderglow !== 'none' && isEquipped && (
                      <div
                        className="absolute w-24 h-32 rounded-full blur-xl opacity-80"
                        style={{ backgroundColor: customization.neonUnderglow }}
                      />
                    )}

                    {/* Car Silhouette Rendering */}
                    <div
                      className="relative z-10 w-16 h-28 rounded-lg shadow-2xl flex flex-col items-center justify-between p-1.5 transition-all duration-300"
                      style={{
                        backgroundColor: isEquipped ? customization.primaryColor : currentCar.defaultColor,
                        border: '2px solid rgba(255,255,255,0.4)',
                        boxShadow: `0 10px 25px -5px ${isEquipped ? customization.primaryColor : currentCar.defaultColor}88`
                      }}
                    >
                      {/* Top cannons */}
                      <div className="w-full flex justify-between px-1">
                        <div className="w-1.5 h-3 bg-slate-700 rounded-t" />
                        <div className="w-1.5 h-3 bg-slate-700 rounded-t" />
                      </div>

                      {/* Windshield */}
                      <div className="w-10 h-6 bg-slate-900/90 rounded-t border border-slate-700/80 mt-1" />

                      {/* Roof with race stripe */}
                      <div className="w-10 h-7 bg-slate-800/60 rounded flex items-center justify-center">
                        <div className="w-2 h-full bg-white/40" />
                      </div>

                      {/* Rear Window & Spoiler */}
                      <div className="w-10 h-4 bg-slate-900/90 rounded-b border border-slate-700/80" />

                      {/* Rear Exhaust pipes */}
                      <div className="w-full flex justify-between px-1.5">
                        <div className="w-1.5 h-2 bg-amber-500/80 rounded-b" />
                        <div className="w-1.5 h-2 bg-amber-500/80 rounded-b" />
                      </div>
                    </div>
                  </div>

                  {/* Technical Specs Comparison Bars */}
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 font-medium mb-1">
                        <span className="flex items-center space-x-1.5">
                          <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Velocidad Punta:</span>
                        </span>
                        <span className="font-mono text-cyan-300">
                          {Math.round(currentCar.baseSpeed * 12 + customization.engineLevel * 6)} km/h
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                          style={{ width: `${(currentCar.baseSpeed / 13) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 font-medium mb-1">
                        <span className="flex items-center space-x-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>Tanque de Nitro:</span>
                        </span>
                        <span className="font-mono text-amber-300">{currentCar.nitroCapacity}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-300"
                          style={{ width: `${(currentCar.nitroCapacity / 220) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 font-medium mb-1">
                        <span className="flex items-center space-x-1.5">
                          <Crosshair className="w-3.5 h-3.5 text-rose-400" />
                          <span>Munición de Cañón:</span>
                        </span>
                        <span className="font-mono text-rose-300">
                          {currentCar.ammoCapacity + customization.ammoLevel * 2} proyectiles
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-400 rounded-full transition-all duration-300"
                          style={{ width: `${(currentCar.ammoCapacity / 20) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buy / Equip Actions */}
                <div className="pt-5 border-t border-slate-800/80 mt-4">
                  {isSelectedCarPurchased ? (
                    <button
                      onClick={() => handleEquipCar(currentCar.id)}
                      disabled={isEquipped}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition ${
                        isEquipped
                          ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 cursor-default'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>{isEquipped ? 'AUTO EQUIPADO' : 'EQUIPAR ESTE VEHÍCULO'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuyCar(currentCar)}
                      disabled={customization.wallet < currentCar.price}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition ${
                        customization.wallet >= currentCar.price
                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/20'
                          : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>
                        {customization.wallet >= currentCar.price
                          ? `COMPRAR POR $${currentCar.price.toLocaleString()}`
                          : `FALTAN $${(currentCar.price - customization.wallet).toLocaleString()} PARA COMPRAR`}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PAINT & NEON TAB */}
          {activeTab === 'paint' && (
            <div className="space-y-6">
              {/* Color Paint Swatches */}
              <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <Palette className="w-4 h-4 text-cyan-400" />
                      <span>Pintura de Carrocería</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Personaliza el acabado cromático de tu auto activo
                    </p>
                  </div>
                  <div
                    className="w-6 h-6 rounded-full border border-white/40 shadow-inner"
                    style={{ backgroundColor: customization.primaryColor }}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                  {COLOR_OPTIONS.map(c => {
                    const isSelected = customization.primaryColor.toLowerCase() === c.hex.toLowerCase();
                    return (
                      <button
                        key={c.hex}
                        onClick={() => handleColorSelect(c.hex)}
                        className={`flex items-center space-x-2.5 p-2 rounded-xl border text-xs font-medium transition ${
                          isSelected
                            ? 'bg-slate-800 border-cyan-400 text-white shadow-md'
                            : 'bg-slate-900 hover:bg-slate-800/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-full border border-white/20 shadow-sm shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="truncate">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Neon Underglow Lights */}
              <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Luz Neón Bajo el Chasis (Underglow)</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Proyecta un resplandor neón sobre el asfalto nocturno mientras conduces
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {NEON_OPTIONS.map(n => {
                    const isSelected = customization.neonUnderglow === n.hex;
                    return (
                      <button
                        key={n.hex}
                        onClick={() => handleNeonSelect(n.hex)}
                        className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-xs font-medium transition ${
                          isSelected
                            ? 'bg-slate-800 border-cyan-400 text-white shadow-md'
                            : 'bg-slate-900 hover:bg-slate-800/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-full border border-white/20 shadow-sm shrink-0"
                          style={{
                            backgroundColor: n.hex === 'none' ? '#334155' : n.hex,
                            boxShadow: n.hex !== 'none' ? `0 0 10px ${n.hex}` : undefined
                          }}
                        />
                        <span className="truncate">{n.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* UPGRADES TAB */}
          {activeTab === 'upgrades' && (
            <div className="space-y-4">
              <span className="text-xs text-slate-400 block">
                Invierte tu plata ganada en carreras para potenciar la aceleración, capacidad de combustible y munición.
              </span>

              {/* Engine Upgrade */}
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl">
                    <Gauge className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Centralita & Turbo V8</h4>
                    <p className="text-[11px] text-slate-400">
                      Incrementa +8 km/h la velocidad máxima y aceleración por nivel.
                    </p>
                    <div className="flex items-center space-x-1.5 mt-1.5">
                      {[1, 2, 3].map(lvl => (
                        <div
                          key={lvl}
                          className={`w-6 h-1.5 rounded-full ${
                            customization.engineLevel >= lvl ? 'bg-cyan-400' : 'bg-slate-800'
                          }`}
                        />
                      ))}
                      <span className="text-[10px] text-slate-400 font-mono ml-1">
                        Nivel {customization.engineLevel}/3
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  {customization.engineLevel >= 3 ? (
                    <span className="text-xs font-bold text-emerald-400">MÁXIMO</span>
                  ) : (
                    <button
                      onClick={() => handleUpgrade('engine')}
                      disabled={customization.wallet < (customization.engineLevel + 1) * 200}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition ${
                        customization.wallet >= (customization.engineLevel + 1) * 200
                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Mejorar por ${(customization.engineLevel + 1) * 200}
                    </button>
                  )}
                </div>
              </div>

              {/* Nitro Upgrade */}
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Inyección Óxido Nitroso</h4>
                    <p className="text-[11px] text-slate-400">
                      Recarga +10% más rápido al esquivar y mayor duración de aceleración.
                    </p>
                    <div className="flex items-center space-x-1.5 mt-1.5">
                      {[1, 2, 3].map(lvl => (
                        <div
                          key={lvl}
                          className={`w-6 h-1.5 rounded-full ${
                            customization.nitroLevel >= lvl ? 'bg-amber-400' : 'bg-slate-800'
                          }`}
                        />
                      ))}
                      <span className="text-[10px] text-slate-400 font-mono ml-1">
                        Nivel {customization.nitroLevel}/3
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  {customization.nitroLevel >= 3 ? (
                    <span className="text-xs font-bold text-emerald-400">MÁXIMO</span>
                  ) : (
                    <button
                      onClick={() => handleUpgrade('nitro')}
                      disabled={customization.wallet < (customization.nitroLevel + 1) * 200}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition ${
                        customization.wallet >= (customization.nitroLevel + 1) * 200
                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Mejorar por ${(customization.nitroLevel + 1) * 200}
                    </button>
                  )}
                </div>
              </div>

              {/* Ammo Upgrade */}
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl">
                    <Crosshair className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Batería de Proyectiles Plasma</h4>
                    <p className="text-[11px] text-slate-400">
                      Aumenta +2 la capacidad máxima de munición del cañón.
                    </p>
                    <div className="flex items-center space-x-1.5 mt-1.5">
                      {[1, 2, 3].map(lvl => (
                        <div
                          key={lvl}
                          className={`w-6 h-1.5 rounded-full ${
                            customization.ammoLevel >= lvl ? 'bg-rose-400' : 'bg-slate-800'
                          }`}
                        />
                      ))}
                      <span className="text-[10px] text-slate-400 font-mono ml-1">
                        Nivel {customization.ammoLevel}/3
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  {customization.ammoLevel >= 3 ? (
                    <span className="text-xs font-bold text-emerald-400">MÁXIMO</span>
                  ) : (
                    <button
                      onClick={() => handleUpgrade('ammo')}
                      disabled={customization.wallet < (customization.ammoLevel + 1) * 200}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition ${
                        customization.wallet >= (customization.ammoLevel + 1) * 200
                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Mejorar por ${(customization.ammoLevel + 1) * 200}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Auto activo: <strong className="text-white">{CAR_CATALOG.find(c => c.id === customization.selectedCarId)?.name}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
          >
            Listo, Volver a la Pista
          </button>
        </div>
      </div>
    </div>
  );
};
