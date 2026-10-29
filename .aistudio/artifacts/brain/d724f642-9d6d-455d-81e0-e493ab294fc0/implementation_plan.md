# Rediseño Dinámico y Orgánico de Servicios - Atlob Consultores

Rediseño de la sección de **Servicios** (`#servicios`) en `/Front-end/index.html` y `/Front-end/css/main.css`, replicando con precisión milimétrica la interacción visual, tipográfica y cromática presentada en las referencias `image_2e0e2acd.png` e `image_5b36f035.png`.

> [!IMPORTANT]
> **Decisiones Clave de UX y Animación**:
> - **Acordeón Horizontal Dinámico (Bloque 1)**: En escritorio, los paneles inician con un panel activo expandido y 3 colapsados en tiras verticales blancas con ícono y texto vertical a 90°. Al pasar el cursor (`mouseenter`) o navegar con el teclado (`focus`), el panel objetivo se expande suavemente (`flex: 3.8`, `transition: flex 0.55s cubic-bezier(0.25, 1, 0.5, 1)`) adoptando el fondo azul noche oscuro, la cabecera con el ícono lineal dorado, la descripción, etiquetas y el botón naranja "Solicitar", mientras los demás se repliegan orgánicamente.
> - **Tarjetas con Ondas Orgánicas (Bloque 2)**: Visual de cabecera en azul marino profundo con curva/onda orgánica de tono secundario, ícono lineal dorado central, etiquetas interactivas y enlaces directos de acción.
> - **Preservación Estricta**: No se toca el Header, Footer, Bloque 3 ("Inteligencia Financiera" / Dashboards) ni otras secciones del sitio.

---

## 1. Concepto y Experiencia de Usuario

### Bloque 1: Servicios Contables y Tributarios (Acordeón Horizontal)
- **Estado Colapsado**:
  - Fondo blanco puro (`#ffffff`), esquinas redondeadas naturales (`border-radius: 24px`), borde suave (`1px solid #e2e8f0`).
  - Cabecera con chip redondeado celeste (`background: #eef5fc; color: #1e6091; width: 44px; height: 44px;`) que aloja el ícono del servicio.
  - Título orientado verticalmente en dirección ascendente (`writing-mode: vertical-rl; transform: rotate(180deg); font-weight: 700; color: #0c2a4a;`).
- **Estado Expandido**:
  - Fondo azul noche corporativo (`#0b2545`), padding amplio (`28px`).
  - Vitrina visual superior: Contenedor con gradiente radial suave (`#1c3c62` a `#0d2238`), esquinas redondeadas (`16px`) y altura de `160px`, centrando un ícono lineal minimalista en dorado cálido (`#f5b72e`).
  - Tipografía jerarquizada: Título `h3` blanco (`#ffffff`), descripción en gris azulado (`#d1dced`), fila de etiquetas/pills oscuras con borde sutil.
  - Barra de acciones inferior: Enlace blanco "Ver más →" a la izquierda y botón píldora naranja "Solicitar" (`#f27405`) a la derecha con elevación sutil.

### Bloque 2: Consultoría y Finanzas (Tarjetas con Onda Orgánica)
- Tres tarjetas en cuadrícula responsiva con esquinas superiores redondeadas (`24px`).
- Cabecera visual en azul marino profundo con fondo de onda curva/orgánica integrada (SVG wave vector) y el ícono de línea dorada (`#f5b72e`).
- Cuerpo inferior blanco con título en azul oscuro, párrafo de descripción, etiquetas celestes redondeadas y pie con enlace "Ver más →" y "Solicitar información" en azul corporativo.

---

## 2. Arquitectura de Componentes y Flujo de Interacción

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             SECCIÓN #servicios                                   │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  [1. Servicios Contables y Tributarios]                                          │
│  ┌──────────────────────┬────────────┬────────────┬────────────┐                 │
│  │  EXPANDIDO (#0b2545) │ COLAPSADO  │ COLAPSADO  │ COLAPSADO  │                 │
│  │  ┌────────────────┐  │  ┌──────┐  │  ┌──────┐  │  ┌──────┐  │                 │
│  │  │  Vitrina Oro   │  │  │ [icon│  │  │ [icon│  │  │ [icon│  │                 │
│  │  │  (Ícono Línea) │  │  └──────┘  │  └──────┘  │  └──────┘  │                 │
│  │  └────────────────┘  │     │      │     │      │     │      │                 │
│  │  Título H3 Blanco    │     │ T    │     │ G    │     │ A    │                 │
│  │  Descripción gris    │     │ E    │     │ E    │     │ U    │                 │
│  │  [Pills de etiquetas]│     │ X    │     │ S    │     │ D    │                 │
│  │  "Ver más"  [Solic.] │     │ T    │     │ T    │     │ I    │                 │
│  │                      │     │ O    │     │ I    │     │ T    │                 │
│  └──────────────────────┴────────────┴────────────┴────────────┘                 │
│                                                                                  │
│  [2. Consultoría y Finanzas]                                                     │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌───────────────────┐ │
│  │ Cabecera Onda + Oro     │  │ Cabecera Onda + Oro     │  │ Cabecera Onda +   │ │
│  │ Título & Descripción    │  │ Título & Descripción    │  │ Título & Desc.    │ │
│  │ [Pills]                 │  │ [Pills]                 │  │ [Pills]           │ │
│  │ "Ver más" | "Solicitar" │  │ "Ver más" | "Solicitar" │  │ "Ver más" | "Sol."│ │
│  └─────────────────────────┘  └─────────────────────────┘  └───────────────────┘ │
│                                                                                  │
│  [3. Reportes y Dashboards] (Sin modificaciones, preservado intacto)             │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Plan de Modificación Detallado

### A. Archivos a modificar
1. `/Front-end/index.html` (líneas ~153–315):
   - Estructuración semántica de Bloque 1 con el contenedor `.services-accordion-wrapper` y paneles `.service-accordion-item` que contienen simultáneamente:
     - La vista colapsada: `.accordion-collapsed-view` (ícono superior en chip celeste y texto vertical).
     - La vista expandida: `.accordion-expanded-view` (vitrina superior con ícono dorado, título, texto, pills y botón naranja "Solicitar").
   - Estructuración semántica de Bloque 2 con `.consulting-card-header` integrando el gráfico de onda SVG orgánico y el ícono lineal dorado.
   - Script ligero inline (o listener en JS existente) para manejar el estado activo con transiciones CSS de alta fidelidad, asegurando compatibilidad completa con teclado (`Tab`, `Enter`).

2. `/Front-end/css/main.css`:
   - Reglas específicas bajo el prefijo `#servicios .services-accordion-wrapper` y `#servicios .services-consulting-grid`.
   - Transiciones aceleradas por GPU (`transform`, `opacity`, `flex`).
   - Media queries a partir de `992px` y `768px` para alternar de acordeón horizontal a tarjetas expandidas apiladas verticalmente en dispositivos móviles y tablets.
   - Regla `@media (prefers-reduced-motion: reduce)` para accesibilidad universal.

### B. Control de Aislamiento y No-Regresión
- Ninguna clase genérica global será alterada (los selectores se limitan a `#servicios`).
- Se conservan todos los enlaces, IDs y textos existentes de Atlob Consultores.
- Se compila y verifica con `compile_applet` y prueba de respuesta HTTP 200 en `http://localhost:3000/index.html`.
