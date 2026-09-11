# Barkin White — brief de implementación

Estado: documento de análisis. No contiene cambios de interfaz ni de assets.

## Referencia

- Figma: [Barkin White](https://www.figma.com/design/nxlwuYXZxnkKKzeZIpKN8E/Barkin-White?node-id=0-1)
- Archivo: `nxlwuYXZxnkKKzeZIpKN8E`
- Página inspeccionada: `Page 1` (`0:1`)
- Fecha de revisión: 2026-09-11

El rediseño lleva Barkin hacia una estética claramente más blanca, editorial y ligera: superficies claras, tipografía oscura, bordes finos, imágenes protagonistas y secciones con mucho espacio negativo. El cambio debe tratarse como una actualización transversal del tema, no únicamente como un ajuste de colores.

## Resumen ejecutivo

1. La estructura de páginas ya está definida para desktop y mobile.
2. Header, announcement bar, footer, cards, hero editorial, filtros y bloques de contenido aparecen como piezas reutilizables.
3. La mayor parte del trabajo esperado está en composición, fondos, contraste, espaciado, tratamiento de imágenes y responsive.
4. Conviene conservar la fuente de datos Shopify existente y adaptar las secciones actuales antes de crear otras nuevas.

## Inventario de páginas y frames

| Área | Desktop | Mobile | Referencia Figma | Prioridad |
| --- | --- | --- | --- | --- |
| Home | 1600 × 12567 | 390 × 13607 | `Home Desktop` `1:3484`; `Home Mobile` `1:3570` | Alta |
| Producto | 1600 × 9304 | revisar variante mobile asociada | `Product Page Desktop` `1:3631` | Alta |
| Journal overview | 1600 × 4466 | 390 × 5898 | `Journal Overview Desktop` `1:5464`; `Journal Overview Mobile` `1:5474` | Alta |
| Journal post | 1600 × 4319 | 390 × 5476 | `Blog Post Desktop` `1:5484`; `Blog Post Mobile` `1:5538` | Media |
| About Us | 1600 × 7985 | 390 × 8912 | `About Us Desktop` `1:5548`; `About Us Mbile` `1:5564` | Media |
| Overlays | — | 390 × 844 | `Shop Filter Overlay` `1:5452`; `Journal Filter` `1:5500` | Media |

## Dirección visual

### Color y superficies

- Usar blanco o blanco cálido como superficie principal.
- Reservar fondos oscuros para CTAs, navegación activa, overlays o bloques que necesiten contraste.
- Reducir gradientes y overlays pesados; en los heroes deben existir solo cuando sean necesarios para legibilidad.
- Mantener divisores de 1 px y bordes discretos para separar módulos sin llenar la página de contenedores.
- No asumir que todos los bloques deben tener fondo sólido: el espacio blanco es parte del diseño.

### Tipografía

- Jerarquía editorial con titulares serif grandes en heroes y secciones destacadas.
- Texto auxiliar sans-serif, compacto y de alto contraste.
- Revisar la fuente real configurada en el tema antes de añadir una nueva dependencia.
- En mobile, priorizar saltos de línea naturales y evitar títulos forzados con alturas fijas.

### Imágenes

- Las imágenes ocupan un rol principal en hero, producto, colecciones, editorial y social.
- Usar `object-fit: cover` solo cuando el recorte corresponda al frame de Figma; conservar `object-position` por sección.
- Mantener bordes, recortes escalonados y composiciones superpuestas cuando formen parte de la identidad visual.
- Para Shopify, usar imágenes del producto/artículo y assets existentes del tema; no incorporar imágenes de prueba de Figma sin una decisión de contenido.

## Estructura funcional por página

### Home

Orden observado en desktop:

1. Announcement bar.
2. Header.
3. Hero / Product Quiz (`596 px`).
4. Promise Banner.
5. Best Sellers.
6. Collection Highlight.
7. Product Guarantees.
8. Bloques editoriales de imagen.
9. Quality Ingredients.
10. Problem Solver.
11. Testimonials.
12. Bundle Builder.
13. Blog Post.
14. Social Media.
15. Hero editorial final.
16. FAQ.
17. Footer.

En mobile la secuencia se conserva, pero los módulos se apilan y algunos cambian de nombre o de densidad: `Collection Launch`, `Ingredients Mobile`, `Problem Solver Mobile`, `Bundle Mobile`, `Related Blog Post` y `FAQ Mobile`.

### Producto

La página comienza con el banner superior y un bloque `Product Selling Point` de gran altura. Después aparecen garantías, ingredientes, tipos de pelaje, un bloque editorial de imagen, contenido adicional, upsell, blog relacionado y footer. La implementación debe mantener el producto como fuente de verdad para título, precio, variantes, imágenes, disponibilidad y acciones de compra.

### Journal

El frame de Journal define una composición editorial con:

- Header global.
- Hero editorial de aproximadamente `596 px`.
- Filter Bar de desktop (`152 px`) y Filter Blog Bar de mobile (`131 px`).
- Grid de posts.
- Social Media.
- Footer.

La guía existente en [JOURNAL_IMPLEMENTATION_PLAN.md](JOURNAL_IMPLEMENTATION_PLAN.md) sigue siendo válida para la lógica Shopify. Este documento añade la dirección transversal del nuevo sistema visual.

### About Us

La página reutiliza los mismos primitivos: hero, banner de promesa, intro, bloques editoriales, valores/no negociables, garantías, social, blog, FAQ y footer. Debe compartir tokens y componentes con Home, no crear estilos paralelos.

## Componentes globales que deben revisarse primero

| Componente | Cambio esperado |
| --- | --- |
| Announcement bar | Fondo, altura, contraste y comportamiento responsive. |
| Header | Versión blanca, navegación, logo, iconos y estados sticky/mobile. |
| Button | Sistema consistente para CTA negro, outline y estados hover/focus. |
| Product Intro | Escala tipográfica, anchura, alineación y color sobre imagen/fondo blanco. |
| Hero / Product Quiz | Recortes de imagen, overlay mínimo, posición del contenido y altura responsive. |
| Product cards | Borde, ratio de imagen, metadatos, badges y acciones. |
| Product Guarantees | Iconografía, divisores y layout de cuatro columnas / stack mobile. |
| Social Media | Fondo blanco, gallery spacing, CTA y recorte de thumbnails. |
| FAQ | Separadores, iconos, ancho de lectura y estados abiertos/cerrados. |
| Footer | Superficie, columnas, newsletter, pagos y versión mobile. |

## Plan técnico recomendado

### Fase 1 — fundamentos

- Identificar tokens actuales en `assets/base.css` y estilos Barkin.
- Crear variables compartidas para fondo principal, fondo invertido, texto, texto secundario, borde, acento y estados.
- Normalizar container widths, gutters desktop/mobile, radios y alturas de botones.
- Revisar la carga de fuentes y pesos disponibles.

### Fase 2 — shell global

- Ajustar `layout/theme.liquid`, announcement bar, header y footer.
- Revisar navegación desktop/mobile y overlays.
- Validar que el cambio de superficie no rompa cart drawer, búsqueda, modal de producto ni checkout links.

### Fase 3 — Home y Producto

- Adaptar secciones existentes a la nueva composición blanca.
- Reutilizar bloques actuales de Barkin y evitar duplicar lógica de producto.
- Implementar el responsive de 390 px con alturas basadas en contenido.

### Fase 4 — Journal y About Us

- Llevar a código el hero, filtros, grid, paginación y social del Journal.
- Conectar artículos reales de Shopify y mantener fallbacks para imagen/tag/excerpt.
- Reutilizar la misma arquitectura para About Us.

### Fase 5 — QA visual y funcional

- Comparar screenshots a 1600 px y 390 px.
- Revisar estados sin imagen, sin tag, carrito vacío, búsqueda, menú abierto, filtros y paginación.
- Comprobar contraste, foco visible, alt text, headings y navegación por teclado.

## Archivos del tema probablemente afectados

| Área | Archivos a inspeccionar |
| --- | --- |
| Shell global | `layout/theme.liquid`, `sections/barkin-footer.liquid`, sección/snippet de header y announcement bar |
| Base visual | `assets/base.css`, assets `barkin-*.css` |
| Home | `templates/index.json`, secciones Barkin de hero, showcase, guarantees, social y blog |
| Producto | `templates/product.json`, secciones y snippets de información/product gallery |
| Journal | `templates/blog.json`, `sections/barkin-journal.liquid`, `assets/section-main-blog.css`, `assets/component-article-card.css` |
| Artículo | `templates/article.json`, `assets/section-blog-post.css` |
| About Us | `templates/page.about-us.json`, `assets/barkin-about.css` |
| Interacciones | menú, búsqueda, carrito drawer, filtros y carruseles en `assets/*.js` |

## Riesgos y decisiones pendientes

1. **Tokens exactos:** el archivo presenta una dirección visual clara, pero antes de implementar conviene confirmar colores y tipografías exactas desde variables/styles de Figma.
2. **Contenido real:** varias capas usan nombres o imágenes de prueba. Hay que mapearlas a productos, artículos y assets reales de Shopify.
3. **Orden del Journal:** el diseño muestra `Sort By`, pero Liquid no reordena artículos de blog de forma nativa. No mostrar una interacción falsa.
4. **Hero destacado:** decidir si el artículo/producto destacado se configura manualmente o se toma automáticamente.
5. **Duplicación de bloques:** confirmar qué módulos de Home y About Us son secciones configurables y cuáles son composiciones específicas de una página.
6. **Responsive:** algunos módulos mobile tienen alturas diferentes y nombres distintos; no conviene resolver todo con un simple `display: none`.

## Criterios de aceptación para la implementación

- La interfaz se percibe blanca y editorial en todas las plantillas principales.
- Header, botones, cards, hero, FAQ y footer comparten tokens y estados.
- Home, Producto, Journal y About Us mantienen datos dinámicos de Shopify.
- Desktop de 1600 px y mobile de 390 px siguen la jerarquía y los recortes principales de Figma.
- No se introducen assets de prueba sin una fuente o decisión de contenido.
- Los estados interactivos y accesibles están cubiertos antes de comparar visualmente.

## Próximo paso sugerido

Implementar primero los fundamentos globales y el shell (`Header`, `Button`, `Product Intro`, `Hero`, `Footer`). Después abordar Home y Producto, y finalmente completar Journal y About Us usando [JOURNAL_IMPLEMENTATION_PLAN.md](JOURNAL_IMPLEMENTATION_PLAN.md) como plan específico.

