# Prompts para Higgsfield

El sitio ya se ve completo sin estos archivos: la ciudad, las luces y el humo se dibujan en tiempo real con shaders. Higgsfield sirve para **sumar capas de cine encima**. Cada archivo es opcional y el sitio no se rompe si falta.

**Antes de empezar**

- Tu plan gratuito tiene pocos créditos. Revisa el costo de cada modelo en Higgsfield antes de generar y empieza por el prompt 1 (video corto) y el prompt 2 (imagen).
- **No escribas datos personales en los prompts** (nombre, correo, empresa). Todos los de abajo son genéricos a propósito.
- Descarga los resultados y colócalos en `assets/higgsfield/` con el nombre indicado.

---

## 1. Capa de partículas y luz (video, recomendado)

Se coloca encima de toda la escena con modo de mezcla "screen": el negro desaparece y solo suma luz.

**Modelo:** cualquier modelo de video. **Duración:** 5 a 8 segundos. **Formato:** 16:9, 1080p o menos.

```
Slow drifting cyan and amber light particles and thin streaks of light rising through
darkness, soft volumetric haze, shallow depth of field, anamorphic bokeh, cinematic,
pure black background, seamless loop, no text, no people, no logos.
```

**Archivo:** `assets/higgsfield/overlay.mp4` (idealmente menos de 4 MB; comprímelo si pesa más).

**Activarlo:** en `media/manifest.json` cambia `"overlay": null` por `"overlay": "assets/higgsfield/overlay.mp4"`.

---

## 2. Imagen de portada para redes (imagen, recomendado)

Es la tarjeta que se ve al compartir el enlace en LinkedIn o WhatsApp.

**Formato:** 1200 × 630 (o 16:9).

```
Cinematic wide shot at night of a futuristic city made entirely of glowing bar-chart
towers, cyan and amber neon light, low fog, camera flying low between the towers,
volumetric light beams rising from the tallest buildings, anamorphic lens flare, ultra
detailed, dark navy palette, no text, no letters, no logos.
```

**Archivo:** `assets/higgsfield/og.jpg`. Luego en `index.src.html` agrega dentro de `<head>`:

```html
<meta property="og:image" content="https://TU-USUARIO.github.io/skyline/assets/higgsfield/og.jpg">
```

y ejecuta `python build.py`.

---

## 3. Videos para la galería de cada proyecto (opcional)

Cada torre abre un panel con una galería. Estos videos cortos se suman a la gráfica real del proyecto. Úsalos como ambiente, nunca como si fueran datos: **la gráfica de verdad es la que vale**.

**Línea que se dibuja sola** (para Pruebas A/B, Vida de una tendencia, Calor extremo):

```
Macro shot of a glowing cyan line chart drawing itself across dark navy glass, subtle
grid, soft bloom, tiny particles, shallow depth of field, slow camera push-in,
seamless loop, no text, no numbers.
```

**Cuadrícula que pulsa** (para Choques CDMX, Aire CDMX):

```
Top-down view of a dark grid of small square cells pulsing with cyan light like a heat
map, waves of brightness travelling across the grid, soft bloom, minimal, cinematic,
seamless loop, no text, no numbers.
```

**Barras que suben** (para Canasta Básica MX, Farmacias MX, Paid Media Kit):

```
Row of slender glowing bars rising and settling in different heights on a dark reflective
surface, cyan with one amber bar, fog, soft volumetric light, slow orbiting camera,
seamless loop, no text, no numbers.
```

**Cómo agregarlos:** guarda el archivo en `media/<id-del-proyecto>/` y súmalo a `media/manifest.json`:

```json
"choques-cdmx": [
  {
    "type": "video",
    "src": "media/choques-cdmx/ambiente.mp4",
    "poster": "media/choques-cdmx/ambiente.jpg",
    "caption": { "es": "Ambiente: cuadrícula de calor", "en": "Ambient: heat grid" }
  }
]
```

Para una imagen usa `"type": "image"`. Cada proyecto acepta cualquier número de elementos, incluso ninguno.

---

## Consejos

- Genera primero a la resolución más baja: sobre una escena oscura casi no se nota la diferencia y consume menos créditos.
- Si un video no cierra bien en bucle, recórtalo a los primeros 5 segundos.
- Comprime con `ffmpeg -i entrada.mp4 -vcodec libx264 -crf 28 -an salida.mp4` (sin audio, el sitio los reproduce silenciados).
