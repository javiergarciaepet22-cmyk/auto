/**
 * Código fuente Python completo y funcional para el juego Arcade de Carreras con Tkinter.
 * Incluye mecánicas de Nitro, Disparos frontales y recarga de Nitro y Balas al esquivar autos.
 */
export const PYTHON_GAME_CODE = `"""
======================================================================
  JUEGO ARCADE DE CONDUCCIÓN SIN LÍMITES 2D (ENDLESS HIGHWAY RUNNER)
  Desarrollado exclusivamente con Python 3 y la librería estándar 'tkinter'.
======================================================================
  Nuevas Mecánicas Arcade:
    - 🚀 NITRO TURBO: Pulsa [FLECHA ARRIBA] o [W] o [SHIFT] para activar
      aceleración extrema y arrasar la carretera.
    - 💥 CAÑÓN / DISPARO: Pulsa [ESPACIO] o [J] para disparar ráfagas
      de plasma frontal y detonar autos enemigos.
    - ⚡ RECARGA POR ESQUIVAR: Cada vez que esquivas con éxito un auto
      NPC (sin chocar), recargas combustible de Nitro y Munición.
======================================================================
  Controles:
    - Flecha Izquierda / A   : Mover auto a la izquierda
    - Flecha Derecha   / D   : Mover auto a la derecha
    - Flecha Arriba / W / Shift : Activar Nitro Turbo
    - Barra Espaciadora / J  : Disparar proyectil
    - Tecla R (en Game Over) : Reiniciar partida
    - Tecla P                : Pausar / Reanudar juego
======================================================================
"""

import tkinter as tk
import random
import math


class Projectile:
    """Proyectil láser/plasma disparado por el auto del jugador."""

    def __init__(self, canvas, x, y, width=6, height=18, speed=16):
        self.canvas = canvas
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.speed = speed
        self.parts = []
        self.draw()

    def draw(self):
        w2 = self.width / 2
        h2 = self.height / 2
        # Brillo exterior cyan
        glow = self.canvas.create_oval(
            self.x - w2 - 2, self.y - h2 - 2,
            self.x + w2 + 2, self.y + h2 + 2,
            fill="#00ffff", outline=""
        )
        # Núcleo interior blanco intenso
        core = self.canvas.create_rectangle(
            self.x - w2 + 1, self.y - h2,
            self.x + w2 - 1, self.y + h2,
            fill="#ffffff", outline=""
        )
        self.parts = [glow, core]

    def move(self):
        self.y -= self.speed
        for part in self.parts:
            self.canvas.move(part, 0, -self.speed)

    def get_bounds(self):
        return (
            self.x - self.width / 2,
            self.y - self.height / 2,
            self.x + self.width / 2,
            self.y + self.height / 2
        )

    def destroy(self):
        for part in self.parts:
            self.canvas.delete(part)
        self.parts.clear()


class Explosion:
    """Efecto de partículas de explosión geométrica tras destruir un auto."""

    def __init__(self, canvas, x, y, color="#f39c12"):
        self.canvas = canvas
        self.particles = []
        self.lifetime = 14
        self.age = 0

        # Crear 14 chispas vectoriales con velocidades radiales
        for _ in range(14):
            angle = random.uniform(0, 2 * math.pi)
            speed = random.uniform(2.5, 7.0)
            vx = math.cos(angle) * speed
            vy = math.sin(angle) * speed
            size = random.randint(4, 9)
            p_color = random.choice(["#ff4757", "#ffa502", "#eccc68", "#ffffff", color])
            p = self.canvas.create_oval(
                x - size / 2, y - size / 2,
                x + size / 2, y + size / 2,
                fill=p_color, outline=""
            )
            self.particles.append({"id": p, "vx": vx, "vy": vy, "size": size})

    def update(self):
        self.age += 1
        for p in self.particles:
            self.canvas.move(p["id"], p["vx"], p["vy"])
        return self.age >= self.lifetime

    def destroy(self):
        for p in self.particles:
            self.canvas.delete(p["id"])
        self.parts.clear()


class NPCVehicle:
    """Representa un vehículo enemigo/tráfico en la autopista."""

    COLORS = [
        ("#e74c3c", "#c0392b"),  # Rojo deportivo
        ("#f39c12", "#d68910"),  # Naranja / Dorado
        ("#9b59b6", "#8e44ad"),  # Púrpura
        ("#1abc9c", "#16a085"),  # Turquesa
        ("#3498db", "#2980b9"),  # Azul cian
        ("#e67e22", "#d35400"),  # Ámbar
    ]

    def __init__(self, canvas, x, y, width=44, height=76, speed=4):
        self.canvas = canvas
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.speed = speed
        self.color_primary, self.color_secondary = random.choice(self.COLORS)
        self.parts = []
        self.draw()

    def draw(self):
        """Dibuja el coche NPC con detalles geométricos en el Canvas."""
        w2 = self.width / 2
        h2 = self.height / 2
        x, y = self.x, self.y

        # Ruedas laterales (neumáticos negros)
        wheel_w, wheel_h = 7, 14
        wheels_coords = [
            (x - w2 - 2, y - h2 + 8),   # Delantera izq
            (x + w2 - 5, y - h2 + 8),   # Delantera der
            (x - w2 - 2, y + h2 - 22),  # Trasera izq
            (x + w2 - 5, y + h2 - 22),  # Trasera der
        ]
        for wx, wy in wheels_coords:
            wheel = self.canvas.create_rectangle(
                wx, wy, wx + wheel_w, wy + wheel_h,
                fill="#111111", outline="#333333"
            )
            self.parts.append(wheel)

        # Chasis principal
        chassis = self.canvas.create_rectangle(
            x - w2, y - h2, x + w2, y + h2,
            fill=self.color_primary, outline=self.color_secondary, width=2
        )
        self.parts.append(chassis)

        # Parabrisas delantero (apunta hacia abajo, vienen en contra/más lentos)
        windshield = self.canvas.create_polygon(
            x - w2 + 6, y + 4,
            x + w2 - 6, y + 4,
            x + w2 - 9, y + 18,
            x - w2 + 9, y + 18,
            fill="#1a252f", outline="#2c3e50"
        )
        self.parts.append(windshield)

        # Techo del auto
        roof = self.canvas.create_rectangle(
            x - w2 + 7, y - 14, x + w2 - 7, y + 3,
            fill=self.color_secondary, outline=""
        )
        self.parts.append(roof)

        # Cristal trasero
        rear_glass = self.canvas.create_rectangle(
            x - w2 + 8, y - 24, x + w2 - 8, y - 16,
            fill="#2c3e50", outline=""
        )
        self.parts.append(rear_glass)

        # Faros delanteros (inferiores)
        h1 = self.canvas.create_oval(x - w2 + 4, y + h2 - 6, x - w2 + 12, y + h2 - 1, fill="#f1c40f", outline="")
        h2 = self.canvas.create_oval(x + w2 - 12, y + h2 - 6, x + w2 - 4, y + h2 - 1, fill="#f1c40f", outline="")
        self.parts.extend([h1, h2])

        # Luces de posición traseras (superiores)
        t1 = self.canvas.create_rectangle(x - w2 + 4, y - h2 + 1, x - w2 + 11, y - h2 + 5, fill="#e74c3c", outline="")
        t2 = self.canvas.create_rectangle(x + w2 - 11, y - h2 + 1, x + w2 - 4, y - h2 + 5, fill="#e74c3c", outline="")
        self.parts.extend([t1, t2])

    def move(self, road_speed):
        """Mueve el NPC relativo a la carretera y su velocidad interna."""
        delta_y = road_speed + self.speed
        self.y += delta_y
        for part in self.parts:
            self.canvas.move(part, 0, delta_y)

    def get_bounds(self):
        """Retorna la caja de colisión (x1, y1, x2, y2) con un margen ajustado."""
        margin_x = 4
        margin_y = 5
        return (
            self.x - self.width / 2 + margin_x,
            self.y - self.height / 2 + margin_y,
            self.x + self.width / 2 - margin_x,
            self.y + self.height / 2 - margin_y
        )

    def destroy(self):
        """Elimina todos los elementos visuales del Canvas."""
        for part in self.parts:
            self.canvas.delete(part)
        self.parts.clear()


class EndlessRunnerGame:
    """Clase principal del videojuego arcade de conducción con Nitro y Arma."""

    def __init__(self, root):
        self.root = root
        self.root.title("Arcade Highway Runner 2D - Nitro & Weapons (Python Tkinter)")
        self.root.resizable(False, False)

        # Dimensiones de la ventana
        self.canvas_width = 460
        self.canvas_height = 680

        # Configuración de la carretera
        self.grass_width = 50
        self.road_left = self.grass_width
        self.road_right = self.canvas_width - self.grass_width
        self.road_width = self.road_right - self.road_left
        self.lane_count = 3
        self.lane_width = self.road_width / self.lane_count
        self.lanes_center_x = [
            self.road_left + self.lane_width * (i + 0.5)
            for i in range(self.lane_count)
        ]

        # Parámetros del auto del jugador
        self.player_width = 44
        self.player_height = 76
        self.player_x = self.lanes_center_x[1]
        self.player_y = self.canvas_height - 110
        self.player_speed_x = 7.5
        self.player_parts = []
        self.nitro_flames = []

        # Estado del juego
        self.is_running = False
        self.game_over = False
        self.is_paused = False
        self.score = 0
        self.high_score = 0
        self.base_road_speed = 7.0
        self.road_speed = 7.0
        self.min_spawn_cooldown = 42
        self.spawn_timer = 0

        # Mecánica de Nitro
        self.nitro_gauge = 100.0   # 0 a 100%
        self.nitro_max = 100.0
        self.is_nitro_active = False

        # Mecánica de Munición y Arma
        self.ammo_count = 8        # Balas actuales
        self.ammo_max = 12
        self.shoot_cooldown = 0

        # Control de teclas activas
        self.keys = {
            "left": False,
            "right": False,
            "nitro": False,
            "shoot": False
        }

        # Listas de entidades
        self.stripes = []
        self.roadside_markers = []
        self.npcs = []
        self.projectiles = []
        self.explosions = []

        # Creación del Canvas
        self.canvas = tk.Canvas(
            self.root,
            width=self.canvas_width,
            height=self.canvas_height,
            bg="#27ae60",
            highlightthickness=0
        )
        self.canvas.pack()

        # Enlazar eventos del teclado
        self.root.bind("<KeyPress>", self.on_key_press)
        self.root.bind("<KeyRelease>", self.on_key_release)

        # Construir entorno inicial y comenzar
        self.setup_environment()
        self.reset_game()
        self.game_loop()

    def setup_environment(self):
        """Dibuja el asfalto estático, bordillos y medidores del HUD."""
        # Asfalto central
        self.canvas.create_rectangle(
            self.road_left, 0, self.road_right, self.canvas_height,
            fill="#2c3e50", outline=""
        )

        # Bordillos / Franjas de seguridad laterales (rojo y blanco)
        curb_h = 30
        for y in range(-curb_h, self.canvas_height + curb_h * 2, curb_h):
            color = "#e74c3c" if (y // curb_h) % 2 == 0 else "#ecf0f1"
            c1 = self.canvas.create_rectangle(
                self.road_left - 10, y, self.road_left, y + curb_h,
                fill=color, outline=""
            )
            c2 = self.canvas.create_rectangle(
                self.road_right, y, self.road_right + 10, y + curb_h,
                fill=color, outline=""
            )
            self.roadside_markers.append((c1, c2, y, curb_h))

        # Líneas divisorias discontinuas de carriles
        stripe_h = 45
        gap_h = 35
        step = stripe_h + gap_h
        for lane_divider in range(1, self.lane_count):
            div_x = self.road_left + lane_divider * self.lane_width
            for y in range(-step, self.canvas_height + step, step):
                stripe = self.canvas.create_rectangle(
                    div_x - 3, y, div_x + 3, y + stripe_h,
                    fill="#f1c40f", outline=""
                )
                self.stripes.append((stripe, div_x, y, stripe_h, gap_h))

        # Marcador principal de puntaje en pantalla (HUD)
        self.hud_bg = self.canvas.create_rectangle(
            self.road_left, 10, self.road_right, 50,
            fill="#1a252f", outline="#f39c12", width=2
        )
        self.score_text = self.canvas.create_text(
            self.canvas_width / 2, 30,
            text="PUNTUACIÓN: 0  |  VEL: 84 km/h",
            fill="#ffffff", font=("Helvetica", 11, "bold")
        )

        # Barras de Nitro y Munición inferiores en el Canvas
        hud_bot_y = self.canvas_height - 38
        self.hud_bot_bg = self.canvas.create_rectangle(
            self.road_left, hud_bot_y, self.road_right, self.canvas_height - 10,
            fill="#111827", outline="#374151", width=2
        )

        # Barra de Nitro (azul cyan brillante)
        self.nitro_bar_bg = self.canvas.create_rectangle(
            self.road_left + 10, hud_bot_y + 8, self.road_left + 140, hud_bot_y + 20,
            fill="#1f2937", outline="#4b5563"
        )
        self.nitro_bar_fill = self.canvas.create_rectangle(
            self.road_left + 10, hud_bot_y + 8, self.road_left + 140, hud_bot_y + 20,
            fill="#06b6d4", outline=""
        )
        self.nitro_label = self.canvas.create_text(
            self.road_left + 75, hud_bot_y + 14,
            text="NITRO [W/▲]", fill="#ffffff", font=("Helvetica", 8, "bold")
        )

        # Indicador de Balas / Cañón (naranja ámbar)
        self.ammo_text = self.canvas.create_text(
            self.road_right - 80, hud_bot_y + 14,
            text=f"BALAS: {self.ammo_count}/{self.ammo_max} [ESP]",
            fill="#f59e0b", font=("Helvetica", 9, "bold")
        )

    def draw_player(self):
        """Dibuja el coche del jugador y las llamas del Nitro si está activo."""
        for part in self.player_parts + self.nitro_flames:
            self.canvas.delete(part)
        self.player_parts.clear()
        self.nitro_flames.clear()

        w2 = self.player_width / 2
        h2 = self.player_height / 2
        x, y = self.player_x, self.player_y

        # Si el Nitro está activo, dibujar llamaradas propulsoras traseras
        if self.is_nitro_active:
            flame_len = random.randint(18, 30)
            flame_w = 6
            f1 = self.canvas.create_polygon(
                x - 14 - flame_w / 2, y + h2,
                x - 14 + flame_w / 2, y + h2,
                x - 14, y + h2 + flame_len,
                fill="#00f0ff", outline="#ffffff"
            )
            f2 = self.canvas.create_polygon(
                x + 14 - flame_w / 2, y + h2,
                x + 14 + flame_w / 2, y + h2,
                x + 14, y + h2 + flame_len,
                fill="#00f0ff", outline="#ffffff"
            )
            self.nitro_flames.extend([f1, f2])

        # Ruedas (neumáticos oscuros con rines)
        wheel_w, wheel_h = 8, 16
        wheels = [
            (x - w2 - 2, y - h2 + 8),
            (x + w2 - 6, y - h2 + 8),
            (x - w2 - 2, y + h2 - 24),
            (x + w2 - 6, y + h2 - 24),
        ]
        for wx, wy in wheels:
            w_item = self.canvas.create_rectangle(
                wx, wy, wx + wheel_w, wy + wheel_h,
                fill="#111111", outline="#444444"
            )
            self.player_parts.append(w_item)

        # Chasis deportivo azul eléctrico (cambia de brillo con nitro)
        chassis_fill = "#0284c7"
        chassis_border = "#38bdf8" if self.is_nitro_active else "#1b4f72"
        chassis = self.canvas.create_rectangle(
            x - w2, y - h2, x + w2, y + h2,
            fill=chassis_fill, outline=chassis_border, width=2
        )
        self.player_parts.append(chassis)

        # Franjas de carreras deportivas centrales (blancas o fluorescentes)
        stripe_color = "#fef08a" if self.is_nitro_active else "#ecf0f1"
        stripe1 = self.canvas.create_rectangle(
            x - 3, y - h2, x + 3, y + h2,
            fill=stripe_color, outline=""
        )
        self.player_parts.append(stripe1)

        # Doble cañón montado en el frente
        cannon_l = self.canvas.create_rectangle(x - 12, y - h2 - 4, x - 9, y - h2 + 4, fill="#475569", outline="#0f172a")
        cannon_r = self.canvas.create_rectangle(x + 9, y - h2 - 4, x + 12, y - h2 + 4, fill="#475569", outline="#0f172a")
        self.player_parts.extend([cannon_l, cannon_r])

        # Parabrisas delantero (mira hacia arriba)
        windshield = self.canvas.create_polygon(
            x - w2 + 6, y - 6,
            x + w2 - 6, y - 6,
            x + w2 - 9, y - 20,
            x - w2 + 9, y - 20,
            fill="#1a252f", outline="#34495e"
        )
        self.player_parts.append(windshield)

        # Techo
        roof = self.canvas.create_rectangle(
            x - w2 + 7, y - 5, x + w2 - 7, y + 14,
            fill="#1f618d", outline=""
        )
        self.player_parts.append(roof)

        # Parabrisas trasero
        rear_glass = self.canvas.create_rectangle(
            x - w2 + 8, y + 16, x + w2 - 8, y + 24,
            fill="#1a252f", outline=""
        )
        self.player_parts.append(rear_glass)

        # Faros delanteros luminosos
        fl1 = self.canvas.create_oval(x - w2 + 4, y - h2 + 1, x - w2 + 12, y - h2 + 6, fill="#f9e79f", outline="")
        fl2 = self.canvas.create_oval(x + w2 - 12, y - h2 + 1, x + w2 - 4, y - h2 + 6, fill="#f9e79f", outline="")
        self.player_parts.extend([fl1, fl2])

        # Luces de freno traseras
        tl1 = self.canvas.create_rectangle(x - w2 + 4, y + h2 - 6, x - w2 + 11, y + h2 - 2, fill="#e74c3c", outline="")
        tl2 = self.canvas.create_rectangle(x + w2 - 11, y + h2 - 6, x + w2 - 4, y + h2 - 2, fill="#e74c3c", outline="")
        self.player_parts.extend([tl1, tl2])

    def get_player_bounds(self):
        """Retorna la caja de colisión del jugador con márgenes para precisión."""
        margin_x = 4
        margin_y = 5
        return (
            self.player_x - self.player_width / 2 + margin_x,
            self.player_y - self.player_height / 2 + margin_y,
            self.player_x + self.player_width / 2 - margin_x,
            self.player_y + self.player_height / 2 - margin_y
        )

    def on_key_press(self, event):
        """Captura pulsaciones de teclas para movimiento, nitro, disparo o reinicio."""
        key = event.keysym.lower()

        if key in ("left", "a"):
            self.keys["left"] = True
        elif key in ("right", "d"):
            self.keys["right"] = True
        elif key in ("up", "w", "shift_l", "shift_r"):
            self.keys["nitro"] = True
        elif key in ("space", "j"):
            if self.game_over:
                self.reset_game()
            else:
                self.shoot()
        elif key == "r":
            if self.game_over:
                self.reset_game()
        elif key == "p":
            if not self.game_over:
                self.is_paused = not self.is_paused

    def on_key_release(self, event):
        """Detecta cuando el usuario suelta las teclas."""
        key = event.keysym.lower()
        if key in ("left", "a"):
            self.keys["left"] = False
        elif key in ("right", "d"):
            self.keys["right"] = False
        elif key in ("up", "w", "shift_l", "shift_r"):
            self.keys["nitro"] = False

    def shoot(self):
        """Dispara proyectiles gemelos hacia adelante si hay munición disponible."""
        if self.ammo_count > 0 and self.shoot_cooldown <= 0 and not self.game_over and not self.is_paused:
            self.ammo_count -= 1
            self.shoot_cooldown = 10  # Enfriamiento en fotogramas (~160 ms)

            # Dos disparos frontales desde los cañones
            p1 = Projectile(self.canvas, self.player_x - 11, self.player_y - self.player_height / 2 - 6)
            p2 = Projectile(self.canvas, self.player_x + 11, self.player_y - self.player_height / 2 - 6)
            self.projectiles.extend([p1, p2])

    def update_road(self):
        """Anima la carretera hacia abajo para crear la sensación de velocidad."""
        step = 45 + 35
        new_stripes = []
        for stripe, div_x, y, sh, gh in self.stripes:
            new_y = y + self.road_speed
            if new_y > self.canvas_height:
                new_y -= (self.canvas_height + step)
            self.canvas.coords(stripe, div_x - 3, new_y, div_x + 3, new_y + sh)
            new_stripes.append((stripe, div_x, new_y, sh, gh))
        self.stripes = new_stripes

        curb_h = 30
        total_span = self.canvas_height + curb_h * 3
        new_curbs = []
        for c1, c2, y, ch in self.roadside_markers:
            new_y = y + self.road_speed
            if new_y > self.canvas_height + curb_h:
                new_y -= total_span
            self.canvas.coords(c1, self.road_left - 10, new_y, self.road_left, new_y + ch)
            self.canvas.coords(c2, self.road_right, new_y, self.road_right + 10, new_y + ch)
            new_curbs.append((c1, c2, new_y, ch))
        self.roadside_markers = new_curbs

    def update_player(self):
        """Calcula el movimiento horizontal del jugador y estado de Nitro."""
        # 1. Gestión de Nitro
        if self.keys["nitro"] and self.nitro_gauge > 0:
            self.is_nitro_active = True
            self.nitro_gauge = max(0.0, self.nitro_gauge - 0.75)
            self.road_speed = self.base_road_speed * 1.8
        else:
            self.is_nitro_active = False
            self.road_speed = self.base_road_speed

        # Redibujar auto (para actualizar llamas de nitro si cambiaron)
        self.draw_player()

        # 2. Movimiento horizontal
        dx = 0
        speed_x = self.player_speed_x * (1.3 if self.is_nitro_active else 1.0)
        if self.keys["left"]:
            dx -= speed_x
        if self.keys["right"]:
            dx += speed_x

        if dx != 0:
            new_x = self.player_x + dx
            min_x = self.road_left + self.player_width / 2 + 6
            max_x = self.road_right - self.player_width / 2 - 6

            new_x = max(min_x, min(max_x, new_x))
            actual_dx = new_x - self.player_x
            self.player_x = new_x

            # Mover partes del auto
            for part in self.player_parts + self.nitro_flames:
                self.canvas.move(part, actual_dx, 0)

    def spawn_npc(self):
        """Genera un auto NPC en un carril disponible con velocidad variable."""
        self.spawn_timer += 1
        if self.spawn_timer >= self.min_spawn_cooldown:
            self.spawn_timer = 0
            lane_idx = random.randint(0, self.lane_count - 1)
            spawn_x = self.lanes_center_x[lane_idx]

            too_close = False
            for npc in self.npcs:
                if abs(npc.x - spawn_x) < 20 and npc.y < 120:
                    too_close = True
                    break

            if not too_close:
                npc_speed = random.uniform(-1.0, 3.5)
                new_npc = NPCVehicle(
                    self.canvas,
                    x=spawn_x,
                    y=-self.player_height,
                    width=self.player_width,
                    height=self.player_height,
                    speed=npc_speed
                )
                self.npcs.append(new_npc)

    def update_projectiles_and_combat(self):
        """Mueve los disparos y detecta impacto contra autos enemigos."""
        active_projectiles = []
        destroyed_npc_indices = set()

        for p in self.projectiles:
            p.move()
            p_box = p.get_bounds()
            hit = False

            # Comprobar colisión con cada NPC
            for i, npc in enumerate(self.npcs):
                if i in destroyed_npc_indices:
                    continue
                n_box = npc.get_bounds()
                if self.check_collision(p_box, n_box):
                    hit = True
                    destroyed_npc_indices.add(i)
                    # Crear explosión visual
                    self.explosions.append(Explosion(self.canvas, npc.x, npc.y, npc.color_primary))
                    # Puntos bonus por destrucción
                    self.score += 75
                    break

            if hit:
                p.destroy()
            elif p.y > -20:
                active_projectiles.append(p)
            else:
                p.destroy()

        self.projectiles = active_projectiles

        # Eliminar NPCs destruidos por disparos
        if destroyed_npc_indices:
            remaining_npcs = []
            for i, npc in enumerate(self.npcs):
                if i in destroyed_npc_indices:
                    npc.destroy()
                else:
                    remaining_npcs.append(npc)
            self.npcs = remaining_npcs

        # Actualizar partículas de explosiones activas
        active_explosions = []
        for exp in self.explosions:
            if exp.update():
                exp.destroy()
            else:
                active_explosions.append(exp)
        self.explosions = active_explosions

    def update_npcs(self):
        """Mueve los NPCs, detecta choques y recarga Nitro + Munición al esquivarlos."""
        survived_npcs = []
        p_box = self.get_player_bounds()

        for npc in self.npcs:
            npc.move(self.road_speed)
            n_box = npc.get_bounds()

            # Detección de colisión jugador vs NPC
            if self.check_collision(p_box, n_box):
                # Si el nitro está activo y a máxima potencia, crea una explosión épica antes de Game Over
                self.explosions.append(Explosion(self.canvas, self.player_x, self.player_y, "#ff4757"))
                self.trigger_game_over()
                return

            if npc.y < self.canvas_height + 100:
                survived_npcs.append(npc)
            else:
                # =======================================================
                # ¡AUTO ESQUIVADO CON ÉXITO!
                # Recarga de Nitro y Balas como solicitó el usuario:
                # =======================================================
                npc.destroy()
                self.score += 25

                # 1. Recargar Nitro (+25% por auto esquivado)
                self.nitro_gauge = min(self.nitro_max, self.nitro_gauge + 25.0)

                # 2. Recargar Munición (+2 balas por auto esquivado)
                self.ammo_count = min(self.ammo_max, self.ammo_count + 2)

        self.npcs = survived_npcs

    def check_collision(self, box1, box2):
        """Comprueba solapamiento entre dos cajas rectangulares (x1, y1, x2, y2)."""
        b1_x1, b1_y1, b1_x2, b1_y2 = box1
        b2_x1, b2_y1, b2_x2, b2_y2 = box2

        return not (
            b1_x2 < b2_x1 or
            b1_x1 > b2_x2 or
            b1_y2 < b2_y1 or
            b1_y1 > b2_y2
        )

    def update_hud(self):
        """Actualiza todos los indicadores numéricos y barras de estado."""
        # 1. Marcador superior de puntaje y velocidad
        speed_display = int(self.road_speed * 12)
        self.canvas.itemconfig(
            self.score_text,
            text=f"PUNTOS: {int(self.score)}  |  VEL: {speed_display} km/h"
        )

        # 2. Barra de Nitro inferior
        nitro_pct = self.nitro_gauge / self.nitro_max
        bar_w = 130 * nitro_pct
        hud_bot_y = self.canvas_height - 38
        self.canvas.coords(
            self.nitro_bar_fill,
            self.road_left + 10, hud_bot_y + 8,
            self.road_left + 10 + bar_w, hud_bot_y + 20
        )
        nitro_color = "#00f0ff" if self.nitro_gauge > 20 else "#e11d48"
        self.canvas.itemconfig(self.nitro_bar_fill, fill=nitro_color)

        # 3. Contador de balas
        ammo_display = "•" * self.ammo_count
        self.canvas.itemconfig(
            self.ammo_text,
            text=f"BALAS: {self.ammo_count}/{self.ammo_max} {ammo_display}"
        )

        # Asegurar elementos de HUD siempre al frente
        self.canvas.tag_raise(self.hud_bg)
        self.canvas.tag_raise(self.score_text)
        self.canvas.tag_raise(self.hud_bot_bg)
        self.canvas.tag_raise(self.nitro_bar_bg)
        self.canvas.tag_raise(self.nitro_bar_fill)
        self.canvas.tag_raise(self.nitro_label)
        self.canvas.tag_raise(self.ammo_text)

    def trigger_game_over(self):
        """Maneja el estado de fin de partida y dibuja la pantalla de Game Over."""
        self.game_over = True
        self.is_running = False

        if self.score > self.high_score:
            self.high_score = self.score

        self.go_bg = self.canvas.create_rectangle(
            40, self.canvas_height / 2 - 130,
            self.canvas_width - 40, self.canvas_height / 2 + 130,
            fill="#111111", outline="#e74c3c", width=4
        )

        self.go_title = self.canvas.create_text(
            self.canvas_width / 2, self.canvas_height / 2 - 70,
            text="¡GAME OVER!",
            fill="#e74c3c", font=("Helvetica", 24, "bold")
        )

        self.go_score = self.canvas.create_text(
            self.canvas_width / 2, self.canvas_height / 2 - 15,
            text=f"Puntaje Final: {int(self.score)}\\nMejor Récord: {int(self.high_score)}",
            fill="#ecf0f1", font=("Helvetica", 14, "bold"), justify=tk.CENTER
        )

        self.go_hint = self.canvas.create_text(
            self.canvas_width / 2, self.canvas_height / 2 + 65,
            text="Presiona [ESPACIO] o [R]\\npara volver a jugar",
            fill="#f1c40f", font=("Helvetica", 12, "bold"), justify=tk.CENTER
        )

    def reset_game(self):
        """Reinicia variables, limpia NPCs y proyectiles, y restaura el estado."""
        for attr in ("go_bg", "go_title", "go_score", "go_hint"):
            if hasattr(self, attr):
                self.canvas.delete(getattr(self, attr))

        for npc in self.npcs:
            npc.destroy()
        self.npcs.clear()

        for p in self.projectiles:
            p.destroy()
        self.projectiles.clear()

        for exp in self.explosions:
            exp.destroy()
        self.explosions.clear()

        self.player_x = self.lanes_center_x[1]
        self.score = 0
        self.base_road_speed = 7.0
        self.road_speed = 7.0
        self.min_spawn_cooldown = 42
        self.spawn_timer = 0
        self.game_over = False
        self.is_paused = False
        self.is_running = True
        self.is_nitro_active = False
        self.nitro_gauge = 100.0
        self.ammo_count = 8
        self.shoot_cooldown = 0
        self.keys = {"left": False, "right": False, "nitro": False, "shoot": False}

        self.draw_player()
        self.update_hud()

    def game_loop(self):
        """Bucle principal ejecutado periódicamente mediante .after() a ~60 FPS."""
        if self.is_running and not self.is_paused:
            # 1. Aumentar puntaje por supervivencia (el nitro duplica los puntos por segundo)
            score_gain = 0.5 if self.is_nitro_active else 0.25
            self.score += score_gain

            # 2. Dificultad progresiva suave en la velocidad base
            self.base_road_speed = min(15.0, 7.0 + (self.score / 250.0))
            self.min_spawn_cooldown = max(20, int(42 - (self.score / 300.0)))

            if self.shoot_cooldown > 0:
                self.shoot_cooldown -= 1

            # 3. Actualizar lógicas
            self.update_road()
            self.update_player()
            self.spawn_npc()
            self.update_projectiles_and_combat()
            self.update_npcs()
            self.update_hud()

        self.root.after(16, self.game_loop)


if __name__ == "__main__":
    ventana_principal = tk.Tk()
    juego = EndlessRunnerGame(ventana_principal)
    ventana_principal.mainloop()
\`;
`;
