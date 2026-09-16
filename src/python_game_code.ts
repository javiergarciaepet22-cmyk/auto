/**
 * Código fuente Python completo y funcional para el juego Arcade de Carreras con Tkinter.
 * Incluye mecánicas de Monedas en pista, Taller/Garaje con autos comprables, personalización de color y neón, mejoras de motor, Nitro y Cañón.
 */
export const PYTHON_GAME_CODE = `"""
======================================================================
  JUEGO ARCADE DE CONDUCCIÓN 2D CON GARAJE, MONEDAS Y PERSONALIZACIÓN
  Desarrollado exclusivamente con Python 3 y la librería estándar 'tkinter'.
======================================================================
  Novedades y Características:
    - 💰 SISTEMA DE DINERO: Recoge monedas doradas en la pista, obtén
      recompensas por esquivar autos y destruir enemigos.
    - 🛒 TIENDA DE AUTOS Y GARAJE: Pulsa [G] en cualquier momento para
      entrar al taller. Compra bólidos más rápidos y equipa nuevos modelos.
    - 🎨 PERSONALIZACIÓN: Cambia el color de carrocería con [C], activa
      luces de neón bajo el chasis (Underglow) con [N] y mejora el motor con [1/2/3].
    - 🚀 NITRO TURBO: Pulsa [FLECHA ARRIBA] o [W] para propulsión extrema.
    - 💥 CAÑONES FRONTALES: Pulsa [ESPACIO] para disparar ráfagas de plasma.
    - 🚔 VARIEDAD DE TRÁFICO: Patrullas policiales con sirenas parpadeantes,
      camiones pesados y autos deportivos.
======================================================================
  Controles de Juego:
    - ◄ / Tecla A             : Mover izquierda
    - ► / Tecla D             : Mover derecha
    - ▲ / Tecla W / Shift     : Activar Nitro Turbo
    - Espacio / Tecla J       : Disparar proyectil plasma
    - Tecla G                 : Abrir / Cerrar Tienda y Garaje
    - Tecla P                 : Pausar / Reanudar partida
    - Tecla R (en Game Over)  : Reiniciar carrera
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
        glow = self.canvas.create_oval(
            self.x - w2 - 2, self.y - h2 - 2,
            self.x + w2 + 2, self.y + h2 + 2,
            fill="#00ffff", outline=""
        )
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


class CoinPickup:
    """Moneda dorada brillante recolectable en el asfalto."""

    def __init__(self, canvas, x, y, value=15):
        self.canvas = canvas
        self.x = x
        self.y = y
        self.value = value
        self.size = 20
        self.angle = random.uniform(0, 6.28)
        self.parts = []
        self.draw()

    def draw(self):
        r = self.size / 2
        # Halo de resplandor dorado
        glow = self.canvas.create_oval(
            self.x - r - 4, self.y - r - 4,
            self.x + r + 4, self.y + r + 4,
            fill="#78350f", outline=""
        )
        # Moneda exterior
        outer = self.canvas.create_oval(
            self.x - r, self.y - r,
            self.x + r, self.y + r,
            fill="#eab308", outline="#fef08a", width=2
        )
        # Símbolo de dinero
        symbol = self.canvas.create_text(
            self.x, self.y,
            text="$", fill="#713f12",
            font=("System", 10, "bold")
        )
        self.parts = [glow, outer, symbol]

    def move(self, dy):
        self.y += dy
        for part in self.parts:
            self.canvas.move(part, 0, dy)

    def get_bounds(self):
        r = self.size / 2
        return (self.x - r, self.y - r, self.x + r, self.y + r)

    def destroy(self):
        for part in self.parts:
            self.canvas.delete(part)
        self.parts.clear()


class FloatingText:
    """Texto flotante que aparece al ganar dinero o destruir un auto."""

    def __init__(self, canvas, x, y, text, color="#fbbf24"):
        self.canvas = canvas
        self.age = 0
        self.lifetime = 25
        self.text_id = canvas.create_text(
            x, y, text=text, fill=color,
            font=("System", 11, "bold")
        )

    def update(self):
        self.age += 1
        self.canvas.move(self.text_id, 0, -1.5)
        return self.age < self.lifetime

    def destroy(self):
        self.canvas.delete(self.text_id)


class Explosion:
    """Efecto de partículas de explosión geométrica."""

    def __init__(self, canvas, x, y, color="#f39c12"):
        self.canvas = canvas
        self.particles = []
        self.lifetime = 16
        self.age = 0

        for _ in range(16):
            angle = random.uniform(0, 2 * math.pi)
            speed = random.uniform(2.5, 7.5)
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
        for pt in self.particles:
            pt["vx"] *= 0.94
            pt["vy"] *= 0.94
            self.canvas.move(pt["id"], pt["vx"], pt["vy"])
        return self.age < self.lifetime

    def destroy(self):
        for pt in self.particles:
            self.canvas.delete(pt["id"])
        self.particles.clear()


class NPCVehicle:
    """Vehículo controlado por IA (Sedán, Camión o Patrulla)."""

    def __init__(self, canvas, x, y, width, height, speed_offset, color, accent, vehicle_type="sport"):
        self.canvas = canvas
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.speed_offset = speed_offset
        self.color = color
        self.accent = accent
        self.vehicle_type = vehicle_type
        self.beacon_timer = 0
        self.beacon_id = None
        self.parts = []
        self.draw()

    def draw(self):
        w2 = self.width / 2
        h2 = self.height / 2

        # Ruedas
        for wx in (self.x - w2 - 2, self.x + w2 - 5):
            for wy in (self.y - h2 + 8, self.y + h2 - 22):
                wheel = self.canvas.create_rectangle(
                    wx, wy, wx + 7, wy + 14,
                    fill="#111111", outline="#222222"
                )
                self.parts.append(wheel)

        if self.vehicle_type == "truck":
            # Camión pesado con remolque
            body = self.canvas.create_rectangle(
                self.x - w2, self.y - h2,
                self.x + w2, self.y + h2,
                fill=self.color, outline="#0f172a", width=2
            )
            cab = self.canvas.create_rectangle(
                self.x - w2 + 4, self.y + h2 - 28,
                self.x + w2 - 4, self.y + h2 - 4,
                fill=self.accent, outline="#0f172a"
            )
            windshield = self.canvas.create_rectangle(
                self.x - w2 + 6, self.y + h2 - 22,
                self.x + w2 - 6, self.y + h2 - 14,
                fill="#0f172a", outline=""
            )
            hl1 = self.canvas.create_rectangle(self.x - w2 + 5, self.y + h2 - 4, self.x - w2 + 13, self.y + h2 - 1, fill="#fef08a", outline="")
            hl2 = self.canvas.create_rectangle(self.x + w2 - 13, self.y + h2 - 4, self.x + w2 - 5, self.y + h2 - 1, fill="#fef08a", outline="")
            self.parts.extend([body, cab, windshield, hl1, hl2])
            return

        # Auto estándar o patrulla
        chassis = self.canvas.create_rectangle(
            self.x - w2, self.y - h2,
            self.x + w2, self.y + h2,
            fill=self.color, outline=self.accent, width=2
        )
        self.parts.append(chassis)

        # Parabrisas
        windshield = self.canvas.create_polygon(
            self.x - w2 + 6, self.y + 6,
            self.x + w2 - 6, self.y + 6,
            self.x + w2 - 9, self.y + 20,
            self.x - w2 + 9, self.y + 20,
            fill="#0f172a", outline=""
        )
        roof = self.canvas.create_rectangle(
            self.x - w2 + 7, self.y - 14,
            self.x + w2 - 7, self.y + 4,
            fill=self.accent, outline=""
        )
        self.parts.extend([windshield, roof])

        # Sirena de policía
        if self.vehicle_type == "police":
            self.beacon_id = self.canvas.create_rectangle(
                self.x - 8, self.y - 6,
                self.x + 8, self.y - 1,
                fill="#3b82f6", outline=""
            )
            self.parts.append(self.beacon_id)

        # Faros delanteros
        faro_izq = self.canvas.create_oval(self.x - w2 + 4, self.y + h2 - 6, self.x - w2 + 12, self.y + h2 - 1, fill="#fef08a", outline="")
        faro_der = self.canvas.create_oval(self.x + w2 - 12, self.y + h2 - 6, self.x + w2 - 4, self.y + h2 - 1, fill="#fef08a", outline="")
        self.parts.extend([faro_izq, faro_der])

    def move(self, dy):
        total_dy = dy + self.speed_offset
        self.y += total_dy
        for part in self.parts:
            self.canvas.move(part, 0, total_dy)

        # Animar sirena de policía
        if self.vehicle_type == "police" and self.beacon_id:
            self.beacon_timer += 1
            if self.beacon_timer % 8 == 0:
                is_blue = (self.beacon_timer // 8) % 2 == 0
                self.canvas.itemconfig(self.beacon_id, fill="#3b82f6" if is_blue else "#ef4444")

    def get_bounds(self):
        return (
            self.x - self.width / 2 + 4,
            self.y - self.height / 2 + 5,
            self.x + self.width / 2 - 4,
            self.y + self.height / 2 - 5
        )

    def destroy(self):
        for part in self.parts:
            self.canvas.delete(part)
        self.parts.clear()


class EndlessRunnerGame:
    """Controlador principal del juego de carreras arcade."""

    # Catálogo de vehículos disponibles en el garaje
    CARS = [
        {
            "id": "apex_runner",
            "name": "Apex Runner ST",
            "price": 0,
            "speed": 7.0,
            "nitro": 100,
            "ammo": 8,
            "body": "sport",
            "color": "#0284c7"
        },
        {
            "id": "muscle_gt",
            "name": "V8 Thunder Muscle",
            "price": 350,
            "speed": 8.2,
            "nitro": 125,
            "ammo": 10,
            "body": "muscle",
            "color": "#e11d48"
        },
        {
            "id": "cyber_phantom",
            "name": "Cyber Phantom 2099",
            "price": 800,
            "speed": 9.6,
            "nitro": 150,
            "ammo": 12,
            "body": "cyber",
            "color": "#8b5cf6"
        },
        {
            "id": "veloce_hyper",
            "name": "Veloce F-Proto",
            "price": 1500,
            "speed": 11.2,
            "nitro": 180,
            "ammo": 14,
            "body": "hyper",
            "color": "#10b981"
        },
        {
            "id": "titan_enforcer",
            "name": "Titan Juggernaut EX",
            "price": 2400,
            "speed": 9.2,
            "nitro": 220,
            "ammo": 20,
            "body": "tank",
            "color": "#f59e0b"
        }
    ]

    PAINTS = [
        "#0284c7", "#ef4444", "#8b5cf6", "#10b981",
        "#f59e0b", "#f43f5e", "#18181b", "#f8fafc"
    ]

    NEONS = ["#00f0ff", "#ff007f", "#39ff14", "#ffe600", "none"]

    def __init__(self, root):
        self.root = root
        self.root.title("Python Tkinter - Arcade Highway Runner con Garaje")
        self.root.resizable(False, False)

        # Dimensiones del Canvas
        self.width = 440
        self.height = 640

        # Autopista
        self.road_left = 55
        self.road_right = 385
        self.road_width = 330
        self.lanes = [110, 220, 330]

        # Progreso y Monedas
        self.money = 250  # Fondo inicial para divertirse comprando
        self.unlocked_cars = ["apex_runner"]
        self.selected_car_idx = 0
        self.engine_upgrade = 0
        self.custom_color = self.CARS[0]["color"]
        self.neon_color = "#00f0ff"

        # Estado del Auto Jugador
        self.player_x = 220
        self.player_y = 530
        self.player_w = 44
        self.player_h = 76

        # Dinámica y Combate
        self.base_speed = 7.0
        self.road_speed = 7.0
        self.nitro_gauge = 100
        self.nitro_active = False
        self.ammo_count = 8
        self.ammo_max = 8
        self.shoot_cooldown = 0
        self.score = 0
        self.high_score = 0

        # Listas de entidades
        self.npcs = []
        self.projectiles = []
        self.explosions = []
        self.coins = []
        self.floating_texts = []

        # Controles
        self.key_left = False
        self.key_right = False
        self.key_nitro = False
        self.game_over = False
        self.is_paused = False
        self.in_garage = False

        # Garaje UI
        self.garage_inspect_idx = 0

        # Canvas
        self.canvas = tk.Canvas(
            root, width=self.width, height=self.height,
            bg="#102219", highlightthickness=0
        )
        self.canvas.pack()

        # Configurar elementos gráficos fijos
        self.init_road()
        self.init_hud()
        self.bind_events()

        # Arrancar bucle
        self.update_player_stats()
        self.draw_player()
        self.game_loop()

    def update_player_stats(self):
        car = self.CARS[self.selected_car_idx]
        self.base_speed = car["speed"] + self.engine_upgrade * 0.7
        self.road_speed = self.base_speed
        self.nitro_max = car["nitro"]
        self.nitro_gauge = self.nitro_max
        self.ammo_max = car["ammo"]
        self.ammo_count = self.ammo_max
        if self.custom_color is None:
            self.custom_color = car["color"]

    def init_road(self):
        # Asfalto central
        self.road_bg = self.canvas.create_rectangle(
            self.road_left, 0, self.road_right, self.height,
            fill="#1e293b", outline=""
        )

        # Arcenes (curbs)
        self.curbs = []
        curb_h = 30
        for y in range(-curb_h, self.height + curb_h, curb_h):
            is_red = (y // curb_h) % 2 == 0
            c_color = "#ef4444" if is_red else "#f8fafc"
            c_left = self.canvas.create_rectangle(self.road_left - 10, y, self.road_left, y + curb_h, fill=c_color, outline="")
            c_right = self.canvas.create_rectangle(self.road_right, y, self.road_right + 10, y + curb_h, fill=c_color, outline="")
            self.curbs.extend([c_left, c_right])

        # Rayas divisorias
        self.stripes = []
        stripe_h = 45
        step = stripe_h + 35
        for l in (1, 2):
            x = self.road_left + l * (self.road_width / 3)
            for y in range(-step, self.height + step, step):
                stripe = self.canvas.create_rectangle(x - 3, y, x + 3, y + stripe_h, fill="#eab308", outline="")
                self.stripes.append(stripe)

        # Postes de luz en los laterales (Mejora gráfica)
        self.light_posts = []
        for y in range(0, self.height + 200, 200):
            p_left = self.canvas.create_rectangle(self.road_left - 24, y - 4, self.road_left - 12, y + 4, fill="#64748b", outline="")
            l_left = self.canvas.create_oval(self.road_left - 18, y - 3, self.road_left - 12, y + 3, fill="#fef08a", outline="")
            p_right = self.canvas.create_rectangle(self.road_right + 12, y - 4, self.road_right + 24, y + 4, fill="#64748b", outline="")
            l_right = self.canvas.create_oval(self.road_right + 12, y - 3, self.road_right + 18, y + 3, fill="#fef08a", outline="")
            self.light_posts.extend([p_left, l_left, p_right, l_right])

    def init_hud(self):
        # Marco superior
        self.top_hud = self.canvas.create_rectangle(
            self.road_left, 10, self.road_right, 58,
            fill="#0f172a", outline="#334155", width=2
        )
        self.hud_score = self.canvas.create_text(
            self.road_left + 14, 26, text="PTS: 0",
            fill="#ffffff", font=("System", 10, "bold"), anchor="w"
        )
        self.hud_speed = self.canvas.create_text(
            self.width / 2, 26, text="84 km/h",
            fill="#38bdf8", font=("System", 10, "bold")
        )
        self.hud_wallet = self.canvas.create_text(
            self.road_right - 14, 26, text=f"💰 \${self.money}",
            fill="#fbbf24", font=("System", 10, "bold"), anchor="e"
        )
        self.hud_car_name = self.canvas.create_text(
            self.road_left + 14, 44, text="AUTO: APEX RUNNER",
            fill="#94a3b8", font=("System", 8), anchor="w"
        )
        self.hud_garage_hint = self.canvas.create_text(
            self.road_right - 14, 44, text="[G] ABRIR GARAJE",
            fill="#38bdf8", font=("System", 8, "bold"), anchor="e"
        )

        # Marco inferior (Nitro & Balas)
        bot_y = self.height - 44
        self.bot_hud = self.canvas.create_rectangle(
            self.road_left, bot_y, self.road_right, bot_y + 36,
            fill="#0f172a", outline="#374151", width=2
        )
        self.nitro_bg = self.canvas.create_rectangle(
            self.road_left + 10, bot_y + 8, self.road_left + 130, bot_y + 28,
            fill="#1f2937", outline=""
        )
        self.nitro_bar = self.canvas.create_rectangle(
            self.road_left + 10, bot_y + 8, self.road_left + 130, bot_y + 28,
            fill="#06b6d4", outline=""
        )
        self.nitro_text = self.canvas.create_text(
            self.road_left + 16, bot_y + 18, text="NITRO 100%",
            fill="#ffffff", font=("System", 8, "bold"), anchor="w"
        )
        self.ammo_text = self.canvas.create_text(
            self.road_right - 14, bot_y + 18, text="CAÑÓN: 8/8 ••••••••",
            fill="#fbbf24", font=("System", 9, "bold"), anchor="e"
        )

        self.player_parts = []
        self.garage_elements = []

    def draw_player(self):
        for part in self.player_parts:
            self.canvas.delete(part)
        self.player_parts.clear()

        x = self.player_x
        y = self.player_y
        w2 = self.player_w / 2
        h2 = self.player_h / 2
        car = self.CARS[self.selected_car_idx]

        # Resplandor de Neón Underglow
        if self.neon_color != "none":
            neon = self.canvas.create_oval(
                x - 28, y - 36, x + 28, y + 36,
                fill=self.neon_color, outline=""
            )
            self.player_parts.append(neon)

        # Ruedas
        for wx in (x - w2 - 2, x + w2 - 5):
            for wy in (y - h2 + 8, y + h2 - 22):
                wheel = self.canvas.create_rectangle(
                    wx, wy, wx + 7, wy + 14,
                    fill="#111111", outline="#222222"
                )
                self.player_parts.append(wheel)

        # Carrocería específica por modelo
        if car["body"] == "tank":
            chassis = self.canvas.create_rectangle(
                x - w2 - 3, y - h2, x + w2 + 3, y + h2,
                fill=self.custom_color, outline="#1c1917", width=3
            )
            # Cañones cuádruples
            c1 = self.canvas.create_rectangle(x - 17, y - h2 - 7, x - 14, y - h2, fill="#475569", outline="")
            c2 = self.canvas.create_rectangle(x - 7, y - h2 - 9, x - 4, y - h2, fill="#475569", outline="")
            c3 = self.canvas.create_rectangle(x + 4, y - h2 - 9, x + 7, y - h2, fill="#475569", outline="")
            c4 = self.canvas.create_rectangle(x + 14, y - h2 - 7, x + 17, y - h2, fill="#475569", outline="")
            self.player_parts.extend([chassis, c1, c2, c3, c4])
        elif car["body"] == "hyper":
            chassis = self.canvas.create_polygon(
                x - w2 + 8, y - h2,
                x + w2 - 8, y - h2,
                x + w2, y - 10,
                x + w2 - 3, y + h2,
                x - w2 + 3, y + h2,
                x - w2, y - 10,
                fill=self.custom_color, outline="#042f2e", width=2
            )
            spoiler = self.canvas.create_rectangle(x - w2 - 4, y + h2 - 7, x + w2 + 4, y + h2 - 2, fill="#0f172a", outline="")
            self.player_parts.extend([chassis, spoiler])
        elif car["body"] == "muscle":
            chassis = self.canvas.create_rectangle(
                x - w2, y - h2, x + w2, y + h2,
                fill=self.custom_color, outline="#47141f", width=2
            )
            # Doble franja
            s1 = self.canvas.create_rectangle(x - 7, y - h2, x - 3, y + h2, fill="#ffffff", outline="")
            s2 = self.canvas.create_rectangle(x + 3, y - h2, x + 7, y + h2, fill="#ffffff", outline="")
            scoop = self.canvas.create_rectangle(x - 6, y - h2 + 8, x + 6, y - h2 + 18, fill="#1e293b", outline="")
            self.player_parts.extend([chassis, s1, s2, scoop])
        else:
            chassis = self.canvas.create_rectangle(
                x - w2, y - h2, x + w2, y + h2,
                fill=self.custom_color, outline="#1e293b", width=2
            )
            stripe = self.canvas.create_rectangle(x - 3, y - h2, x + 3, y + h2, fill="#ecf0f1", outline="")
            self.player_parts.extend([chassis, stripe])

        # Cabina y parabrisas común
        windshield = self.canvas.create_polygon(
            x - w2 + 6, y - 6,
            x + w2 - 6, y - 6,
            x + w2 - 9, y - 20,
            x - w2 + 9, y - 20,
            fill="#0f172a", outline=""
        )
        roof = self.canvas.create_rectangle(
            x - w2 + 7, y - 5, x + w2 - 7, y + 14,
            fill="#1e293b", outline=""
        )
        # Faros delanteros
        hl1 = self.canvas.create_oval(x - w2 + 5, y - h2 + 2, x - w2 + 11, y - h2 + 6, fill="#fef08a", outline="")
        hl2 = self.canvas.create_oval(x + w2 - 11, y - h2 + 2, x + w2 - 5, y - h2 + 6, fill="#fef08a", outline="")
        self.player_parts.extend([windshield, roof, hl1, hl2])

    def bind_events(self):
        self.root.bind("<KeyPress>", self.on_key_press)
        self.root.bind("<KeyRelease>", self.on_key_release)

    def on_key_press(self, e):
        k = e.keysym.lower()
        if self.in_garage:
            if k in ("left", "a"):
                self.garage_inspect_idx = (self.garage_inspect_idx - 1) % len(self.CARS)
                self.render_garage()
            elif k in ("right", "d"):
                self.garage_inspect_idx = (self.garage_inspect_idx + 1) % len(self.CARS)
                self.render_garage()
            elif k in ("return", "space"):
                self.buy_or_equip_garage_car()
            elif k == "c":
                # Cambiar pintura
                curr = self.PAINTS.index(self.custom_color) if self.custom_color in self.PAINTS else 0
                self.custom_color = self.PAINTS[(curr + 1) % len(self.PAINTS)]
                self.render_garage()
            elif k == "n":
                # Cambiar neón underglow
                curr = self.NEONS.index(self.neon_color) if self.neon_color in self.NEONS else 0
                self.neon_color = self.NEONS[(curr + 1) % len(self.NEONS)]
                self.render_garage()
            elif k in ("1", "e"):
                # Mejorar motor ($200)
                if self.engine_upgrade < 3 and self.money >= (self.engine_upgrade + 1) * 200:
                    self.money -= (self.engine_upgrade + 1) * 200
                    self.engine_upgrade += 1
                    self.update_player_stats()
                    self.render_garage()
            elif k in ("escape", "g"):
                self.toggle_garage()
            return

        if k in ("left", "a"):
            self.key_left = True
        elif k in ("right", "d"):
            self.key_right = True
        elif k in ("up", "w", "shift_l", "shift_r"):
            self.key_nitro = True
        elif k in ("space", "j"):
            if self.game_over:
                self.reset_game()
            else:
                self.fire_weapon()
        elif k == "r":
            if self.game_over:
                self.reset_game()
        elif k == "p":
            if not self.game_over:
                self.is_paused = not self.is_paused
        elif k == "g":
            self.toggle_garage()

    def on_key_release(self, e):
        k = e.keysym.lower()
        if k in ("left", "a"):
            self.key_left = False
        elif k in ("right", "d"):
            self.key_right = False
        elif k in ("up", "w", "shift_l", "shift_r"):
            self.key_nitro = False

    def toggle_garage(self):
        self.in_garage = not self.in_garage
        if self.in_garage:
            self.garage_inspect_idx = self.selected_car_idx
            self.render_garage()
        else:
            self.clear_garage()
            self.update_player_stats()
            self.draw_player()

    def buy_or_equip_garage_car(self):
        car = self.CARS[self.garage_inspect_idx]
        if car["id"] in self.unlocked_cars:
            self.selected_car_idx = self.garage_inspect_idx
            self.custom_color = car["color"]
            self.update_player_stats()
        elif self.money >= car["price"]:
            self.money -= car["price"]
            self.unlocked_cars.append(car["id"])
            self.selected_car_idx = self.garage_inspect_idx
            self.custom_color = car["color"]
            self.update_player_stats()
        self.render_garage()

    def clear_garage(self):
        for el in self.garage_elements:
            self.canvas.delete(el)
        self.garage_elements.clear()

    def render_garage(self):
        self.clear_garage()
        # Fondo oscuro semitransparente del taller
        bg = self.canvas.create_rectangle(20, 20, self.width - 20, self.height - 20, fill="#090d16", outline="#38bdf8", width=2)
        title = self.canvas.create_text(self.width / 2, 50, text="🛒 TALLER & GARAJE DE AUTOS", fill="#fef08a", font=("System", 13, "bold"))
        wallet_txt = self.canvas.create_text(self.width / 2, 75, text=f"TU DINERO: 💰 \${self.money}", fill="#fbbf24", font=("System", 11, "bold"))

        car = self.CARS[self.garage_inspect_idx]
        is_owned = car["id"] in self.unlocked_cars
        is_equipped = self.selected_car_idx == self.garage_inspect_idx

        # Selector de autos
        nav_txt = self.canvas.create_text(self.width / 2, 115, text=f"◄ {car['name'].upper()} ►", fill="#ffffff", font=("System", 12, "bold"))
        hint_nav = self.canvas.create_text(self.width / 2, 135, text="[◄/►] Cambiar de Modelo", fill="#94a3b8", font=("System", 8))

        # Pedestal con el auto dibujado
        pedestal = self.canvas.create_oval(self.width / 2 - 50, 220, self.width / 2 + 50, 265, fill="#1e293b", outline="#38bdf8")
        preview_body = self.canvas.create_rectangle(self.width / 2 - 20, 170, self.width / 2 + 20, 240, fill=self.custom_color, outline="#ffffff", width=2)
        preview_roof = self.canvas.create_rectangle(self.width / 2 - 13, 190, self.width / 2 + 13, 220, fill="#0f172a", outline="")

        # Stats
        stats_y = 285
        s1 = self.canvas.create_text(self.width / 2, stats_y, text=f"Velocidad: {int(car['speed'] * 12 + self.engine_upgrade * 8)} km/h", fill="#38bdf8", font=("System", 10))
        s2 = self.canvas.create_text(self.width / 2, stats_y + 22, text=f"Tanque Nitro: {car['nitro']}%", fill="#f59e0b", font=("System", 10))
        s3 = self.canvas.create_text(self.width / 2, stats_y + 44, text=f"Munición Cañón: {car['ammo']} proyectiles", fill="#ef4444", font=("System", 10))

        # Botón de acción (Equipar o Comprar)
        if is_equipped:
            btn_txt = "AUTO ACTIVO EN PISTA"
            btn_color = "#10b981"
        elif is_owned:
            btn_txt = "PULSA [ENTER] PARA EQUIPAR"
            btn_color = "#06b6d4"
        elif self.money >= car["price"]:
            btn_txt = f"COMPRAR POR \${car['price']} [ENTER]"
            btn_color = "#eab308"
        else:
            btn_txt = f"FALTAN \${car['price'] - self.money} PARA COMPRAR"
            btn_color = "#64748b"

        action_lbl = self.canvas.create_text(self.width / 2, 375, text=btn_txt, fill=btn_color, font=("System", 11, "bold"))

        # Personalización & Mejoras
        cust_box = self.canvas.create_rectangle(40, 410, self.width - 40, 560, fill="#111827", outline="#374151")
        c_title = self.canvas.create_text(self.width / 2, 428, text="PERSONALIZACIÓN & TALLER", fill="#e2e8f0", font=("System", 9, "bold"))
        c1 = self.canvas.create_text(self.width / 2, 452, text="[C] Cambiar Color de Pintura", fill="#93c5fd", font=("System", 9))
        c2 = self.canvas.create_text(self.width / 2, 474, text="[N] Neón Underglow (Luz de suelo)", fill="#f472b6", font=("System", 9))
        eng_cost = (self.engine_upgrade + 1) * 200
        eng_str = f"[1] Mejorar Motor (+Velocidad) - \${eng_cost}" if self.engine_upgrade < 3 else "Motor al Máximo Nivel (3/3)"
        c3 = self.canvas.create_text(self.width / 2, 498, text=eng_str, fill="#fef08a", font=("System", 9))

        exit_hint = self.canvas.create_text(self.width / 2, 590, text="Pulsa [G] o [ESC] para Volver a la Carrera", fill="#38bdf8", font=("System", 10, "bold"))

        self.garage_elements.extend([
            bg, title, wallet_txt, nav_txt, hint_nav, pedestal, preview_body,
            preview_roof, s1, s2, s3, action_lbl, cust_box, c_title, c1, c2, c3, exit_hint
        ])

    def fire_weapon(self):
        if self.ammo_count > 0 and self.shoot_cooldown <= 0 and not self.game_over and not self.is_paused and not self.in_garage:
            self.ammo_count -= 1
            self.shoot_cooldown = 10
            self.update_ammo_hud()

            is_titan = self.CARS[self.selected_car_idx]["body"] == "tank"
            if is_titan:
                # Disparo cuádruple masivo para el Titan
                self.projectiles.append(Projectile(self.canvas, self.player_x - 16, self.player_y - self.player_h / 2 - 6))
                self.projectiles.append(Projectile(self.canvas, self.player_x - 6, self.player_y - self.player_h / 2 - 8))
                self.projectiles.append(Projectile(self.canvas, self.player_x + 6, self.player_y - self.player_h / 2 - 8))
                self.projectiles.append(Projectile(self.canvas, self.player_x + 16, self.player_y - self.player_h / 2 - 6))
            else:
                self.projectiles.append(Projectile(self.canvas, self.player_x - 11, self.player_y - self.player_h / 2 - 6))
                self.projectiles.append(Projectile(self.canvas, self.player_x + 11, self.player_y - self.player_h / 2 - 6))

    def update_ammo_hud(self):
        bullets = "•" * min(12, self.ammo_count)
        self.canvas.itemconfig(self.ammo_text, text=f"CAÑÓN: {self.ammo_count}/{self.ammo_max} {bullets}")

    def reset_game(self):
        self.game_over = False
        self.score = 0
        self.player_x = 220
        self.update_player_stats()

        for npc in self.npcs:
            npc.destroy()
        self.npcs.clear()

        for p in self.projectiles:
            p.destroy()
        self.projectiles.clear()

        for coin in self.coins:
            coin.destroy()
        self.coins.clear()

        for exp in self.explosions:
            exp.destroy()
        self.explosions.clear()

        if hasattr(self, "game_over_box"):
            for el in self.game_over_elements:
                self.canvas.delete(el)
            self.game_over_elements.clear()

        self.draw_player()
        self.game_loop()

    def game_loop(self):
        if self.in_garage:
            self.root.after(30, self.game_loop)
            return

        if not self.game_over and not self.is_paused:
            # Nitro
            if self.key_nitro and self.nitro_gauge > 0:
                self.nitro_active = True
                self.nitro_gauge = max(0, self.nitro_gauge - 0.75)
                self.road_speed = self.base_speed * 1.8
            else:
                self.nitro_active = False
                self.road_speed = self.base_speed

            # Puntos y velocidad
            self.score += 0.5 if self.nitro_active else 0.25
            car = self.CARS[self.selected_car_idx]
            self.base_speed = min(17.0, car["speed"] + self.engine_upgrade * 0.7 + self.score / 300)

            if self.shoot_cooldown > 0:
                self.shoot_cooldown -= 1

            # Desplazar asfalto y postes
            for stripe in self.stripes:
                self.canvas.move(stripe, 0, self.road_speed)
                coords = self.canvas.coords(stripe)
                if coords[1] > self.height:
                    self.canvas.move(stripe, 0, -(self.height + 80))

            for curb in self.curbs:
                self.canvas.move(curb, 0, self.road_speed)
                coords = self.canvas.coords(curb)
                if coords[1] > self.height:
                    self.canvas.move(curb, 0, -(self.height + 60))

            for post in self.light_posts:
                self.canvas.move(post, 0, self.road_speed)
                coords = self.canvas.coords(post)
                if coords[1] > self.height + 50:
                    self.canvas.move(post, 0, -(self.height + 200))

            # Dirección del jugador
            dx = 0
            spd_x = 7.5 * (1.2 if self.nitro_active else 1.0)
            if self.key_left:
                dx -= spd_x
            if self.key_right:
                dx += spd_x

            if dx != 0:
                min_x = self.road_left + self.player_w / 2 + 6
                max_x = self.road_right - self.player_w / 2 - 6
                new_x = max(min_x, min(max_x, self.player_x + dx))
                move_dx = new_x - self.player_x
                self.player_x = new_x
                for part in self.player_parts:
                    self.canvas.move(part, move_dx, 0)

            # Spawning de Monedas ($)
            if random.random() < 0.025:
                spawn_x = random.choice(self.lanes)
                self.coins.append(CoinPickup(self.canvas, spawn_x, -30))

            # Movimiento y colisión de monedas
            surviving_coins = []
            for coin in self.coins:
                coin.move(self.road_speed)
                dist = math.hypot(coin.x - self.player_x, coin.y - self.player_y)
                if dist < 32:
                    self.money += coin.value
                    self.floating_texts.append(FloatingText(self.canvas, coin.x, coin.y, f"+\${coin.value}"))
                    coin.destroy()
                elif coin.y < self.height + 40:
                    surviving_coins.append(coin)
                else:
                    coin.destroy()
            self.coins = surviving_coins

            # Spawning de NPCs
            if random.random() < 0.038 and len(self.npcs) < 5:
                spawn_x = random.choice(self.lanes)
                too_close = any(abs(n.x - spawn_x) < 25 and n.y < 130 for n in self.npcs)
                if not too_close:
                    type_roll = random.random()
                    v_type = "police" if type_roll < 0.2 else "truck" if type_roll < 0.45 else "sport"
                    w = 48 if v_type == "truck" else self.player_w
                    h = 100 if v_type == "truck" else self.player_h
                    color = "#1e293b" if v_type == "police" else random.choice(["#e74c3c", "#f39c12", "#9b59b6", "#1abc9c", "#3498db"])
                    accent = "#ffffff" if v_type == "police" else "#ffffff"
                    spd_offset = random.uniform(-1.0, 3.5)
                    self.npcs.append(NPCVehicle(self.canvas, spawn_x, -h - 10, w, h, spd_offset, color, accent, v_type))

            # Proyectiles
            active_projectiles = []
            destroyed_indices = set()
            for p in self.projectiles:
                p.move()
                hit = False
                p_bounds = p.get_bounds()
                for i, npc in enumerate(self.npcs):
                    if i in destroyed_indices:
                        continue
                    n_bounds = npc.get_bounds()
                    collides = not (
                        p_bounds[2] < n_bounds[0] or p_bounds[0] > n_bounds[2] or
                        p_bounds[3] < n_bounds[1] or p_bounds[1] > n_bounds[3]
                    )
                    if collides:
                        hit = True
                        destroyed_indices.add(i)
                        self.score += 75
                        self.money += 30  # $30 por destruir enemigo
                        self.floating_texts.append(FloatingText(self.canvas, npc.x, npc.y, "+$30"))
                        self.explosions.append(Explosion(self.canvas, npc.x, npc.y, npc.color))
                        break

                if not hit and p.y > -20:
                    active_projectiles.append(p)
                else:
                    p.destroy()
            self.projectiles = active_projectiles

            if destroyed_indices:
                surviving_npcs = []
                for idx, npc in enumerate(self.npcs):
                    if idx in destroyed_indices:
                        npc.destroy()
                    else:
                        surviving_npcs.append(npc)
                self.npcs = surviving_npcs

            # Explosiones
            self.explosions = [exp for exp in self.explosions if exp.update() or not exp.destroy()]

            # Textos flotantes
            self.floating_texts = [ft for ft in self.floating_texts if ft.update() or not ft.destroy()]

            # Mover y comprobar colisiones de NPCs con el Jugador
            p_bounds = (
                self.player_x - self.player_w / 2 + 4,
                self.player_y - self.player_h / 2 + 5,
                self.player_x + self.player_w / 2 - 4,
                self.player_y + self.player_h / 2 - 5
            )

            surviving_npcs = []
            for npc in self.npcs:
                npc.move(self.road_speed)
                n_bounds = npc.get_bounds()
                collides = not (
                    p_bounds[2] < n_bounds[0] or p_bounds[0] > n_bounds[2] or
                    p_bounds[3] < n_bounds[1] or p_bounds[1] > n_bounds[3]
                )

                if collides:
                    self.trigger_game_over()
                    return

                if npc.y < self.height + 120:
                    surviving_npcs.append(npc)
                else:
                    # Esquivado con éxito: recargar y sumar plata
                    npc.destroy()
                    self.score += 25
                    self.money += 5
                    self.nitro_gauge = min(self.nitro_max, self.nitro_gauge + 25)
                    self.ammo_count = min(self.ammo_max, self.ammo_count + 2)
                    self.update_ammo_hud()

            self.npcs = surviving_npcs

            # Actualizar HUD
            self.canvas.itemconfig(self.hud_score, text=f"PTS: {int(self.score)}")
            self.canvas.itemconfig(self.hud_speed, text=f"{int(self.road_speed * 12)} km/h")
            self.canvas.itemconfig(self.hud_wallet, text=f"💰 \${self.money}")
            car_name = self.CARS[self.selected_car_idx]["name"].upper()
            self.canvas.itemconfig(self.hud_car_name, text=f"AUTO: {car_name}")

            nitro_pct = self.nitro_gauge / self.nitro_max
            bar_w = 120 * nitro_pct
            self.canvas.coords(self.nitro_bar, self.road_left + 10, self.height - 36, self.road_left + 10 + bar_w, self.height - 16)
            self.canvas.itemconfig(self.nitro_bar, fill="#06b6d4" if self.nitro_gauge > 25 else "#f43f5e")
            self.canvas.itemconfig(self.nitro_text, text=f"NITRO {int(nitro_pct * 100)}%")

        self.root.after(16, self.game_loop)

    def trigger_game_over(self):
        self.game_over = True
        self.game_over_elements = []

        overlay = self.canvas.create_rectangle(0, 0, self.width, self.height, fill="#000000", stipple="gray75")
        box = self.canvas.create_rectangle(40, self.height / 2 - 130, self.width - 40, self.height / 2 + 130, fill="#111827", outline="#ef4444", width=3)
        t1 = self.canvas.create_text(self.width / 2, self.height / 2 - 80, text="¡GAME OVER!", fill="#ef4444", font=("System", 20, "bold"))
        t2 = self.canvas.create_text(self.width / 2, self.height / 2 - 40, text=f"Puntaje Final: {int(self.score)}", fill="#ffffff", font=("System", 13))
        t3 = self.canvas.create_text(self.width / 2, self.height / 2 - 15, text=f"Billetera Actual: \${self.money}", fill="#fbbf24", font=("System", 12, "bold"))
        t4 = self.canvas.create_text(self.width / 2, self.height / 2 + 35, text="Presiona [ESPACIO] o [R] para reiniciar", fill="#ffffff", font=("System", 11, "bold"))
        t5 = self.canvas.create_text(self.width / 2, self.height / 2 + 65, text="o pulsa [G] para ir al TALLER & GARAJE", fill="#38bdf8", font=("System", 10, "bold"))

        self.game_over_elements.extend([overlay, box, t1, t2, t3, t4, t5])


if __name__ == "__main__":
    root = tk.Tk()
    app = EndlessRunnerGame(root)
    root.mainloop()
`;
