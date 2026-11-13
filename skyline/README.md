# Skyline de datos

Portafolio 3D de Axel Martínez: una ciudad nocturna hecha de gráficas de barras. La portada es un **gráfico real** (incidentes viales confirmados en la Ciudad de México, 24 horas × 7 días) levantado como torres. Al bajar con el scroll vuelas por una avenida donde cada uno de los 11 proyectos es una torre con su rayo de luz.

- **Sin paso de compilación:** HTML, CSS y JavaScript con módulos ES. three.js se carga desde un CDN con la versión fija (0.169.0) mediante un *import map*.
- **Sin archivos pesados:** la ciudad, el cielo, el tráfico y el polvo de datos se dibujan en tiempo real con shaders. La carpeta pesa menos de 1 MB.
- **Bilingüe** (español/inglés), **sonido ambiente opcional** (sintetizado, silenciado por defecto) y panel de detalle por proyecto con galería.

## Probarlo en tu equipo

Los módulos ES no cargan desde `file://`; usa cualquier servidor estático:

```bash
python -m http.server 4180
```

y abre <http://localhost:4180>.

## Estructura

| Archivo | Para qué sirve |
|---|---|
| `index.src.html` | La página (fuente). Todo el texto es HTML real: se lee sin JavaScript y lo indexan los buscadores |
| `build.py` | Genera `index.html` insertando las 11 tarjetas desde `projects.json` |
| `projects.json` | **Única fuente** de los proyectos (textos ES/EN, alturas de torre) y de los datos del gráfico de portada |
| `main.js` | La escena 3D, el vuelo de cámara, el panel, los idiomas y el sonido |
| `styles.css` | Diseño: noche profunda, un acento cian y ámbar solo para lo seleccionado |
| `media/manifest.json` | Galería de cada proyecto y capa de video opcional |
| `assets/charts/` | La gráfica real de cada proyecto |
| `docs/higgsfield-prompts.md` | Prompts para generar arte cinematográfico y dónde ponerlo |

Después de editar `index.src.html` o `projects.json`, ejecuta `python build.py`.

## Cómo funciona el vuelo

Cada sección de la página es una *parada* (`data-stop`). Hay 16, en este orden: portada, acerca, 11 proyectos, método, perfil y contacto. La cámara sigue una curva suave que pasa por una pose clave por parada y el scroll decide en qué punto de la curva está. Si agregas o quitas una sección con `data-stop`, agrega o quita su pose en `main.js` (bloque `KEYS`).

Al abrir un proyecto la cámara se desprende del scroll, vuela a esa torre y el scroll se bloquea hasta cerrar el panel.

## Agregar medios a un proyecto

Cada proyecto acepta cualquier número de imágenes o videos, o ninguno. Edita `media/manifest.json`:

```json
"choques-cdmx": [
  { "type": "image", "src": "media/choques-cdmx/mapa.webp",
    "caption": { "es": "Mapa de calor", "en": "Heat map" } },
  { "type": "video", "src": "media/choques-cdmx/ambiente.mp4",
    "poster": "media/choques-cdmx/ambiente.jpg",
    "caption": { "es": "Ambiente", "en": "Ambient" } }
]
```

- Los videos se cargan **solo cuando su diapositiva está visible**, van silenciados, en bucle, y se detienen al cambiar de diapositiva o cerrar el panel.
- Las imágenes se amplían al hacer clic.
- La gráfica real del proyecto siempre es la primera diapositiva.

### Capa de video cinematográfica (opcional)

Un video corto con partículas de luz sobre negro se mezcla encima de toda la escena en modo *screen*. Genera uno con el prompt 1 de `docs/higgsfield-prompts.md`, guárdalo como `assets/higgsfield/overlay.mp4` y cambia en `media/manifest.json`:

```json
"overlay": "assets/higgsfield/overlay.mp4"
```

## Rendimiento y accesibilidad

- **Calidad adaptable:** si el equipo va lento, el sitio baja la resolución de dibujo poco a poco hasta un 60%. En celulares usa menos edificios, menos partículas, menos tráfico, sin aberración cromática y sin hover.
- **`prefers-reduced-motion`:** sin vuelo suave, sin animación de entrada, sin tráfico ni polvo en movimiento. Las secciones siguen siendo legibles.
- **Teclado:** menú de proyectos en la cabecera; `Esc` cierra el panel; `←` y `→` cambian de proyecto; el foco queda atrapado dentro del panel abierto.
- **Sin WebGL:** si el navegador no puede dibujar 3D, queda el contenido HTML completo sobre un fondo oscuro.
- **Medición:** en la consola, `__skyline.stats()` muestra llamadas de dibujo, triángulos y resolución actual.

## Publicarlo

Es un sitio estático: sirve cualquier hosting.

- **GitHub Pages:** sube esta carpeta (con `.nojekyll`) a un repositorio y activa Pages.
- **Vercel / Netlify:** importa la carpeta; no hay comando de compilación y el directorio de salida es la raíz.

## Limitaciones

- Requiere conexión para las fuentes (Google Fonts) y para three.js desde el CDN.
- Los datos del gráfico de portada están copiados dentro de `projects.json` desde el proyecto [choques-cdmx](https://github.com/martinezramirezaxelalejandro04-ui/choques-cdmx).
- Las alturas de las torres de proyecto son decorativas: no comparan los proyectos entre sí.
