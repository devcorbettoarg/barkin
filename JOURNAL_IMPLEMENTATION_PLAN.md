# Journal — plan de implementación

Estado: pendiente de aprobación. Este documento no implica cambios de interfaz, plantilla ni assets.

## Referencia

- Figma: `Barkin Dev`, nodo `1:15739` — **Journal Overview Desktop**.
- Frame de referencia: 1600 × 4466 px.
- No se descargarán imágenes desde Figma. Las imágenes deberán venir de los artículos de Shopify o de los assets que ya existan en el tema.

## Estructura objetivo

| Orden | Diseño Figma | Comportamiento esperado | Estado actual |
| --- | --- | --- | --- |
| 1 | Announcement bar + header | Navegación global | Ya lo aporta el grupo global del tema. |
| 2 | Hero editorial (596 px) | Destaca un artículo con imagen, título, extracto y CTA “Read Article”. | Falta en el template Journal. |
| 3 | Barra de filtros | Categorías, contador de posts y selector de orden. | Hay filtros por tags, pero con una presentación y capacidades incompletas. |
| 4 | Grid de artículos | 3 columnas × 4 filas (12 artículos), cards con imagen, categoría, fecha, título, CTA y autor. | Existe y muestra 12 artículos; necesita ajuste visual y de metadatos. |
| 5 | Paginación | Control compacto centrado debajo del grid. | Existe la paginación estándar; requiere estilo específico. |
| 6 | Social Media | Intro centrada, CTA y galería horizontal. | La sección reutilizable existe, pero no se inserta en `templates/blog.json`. |
| 7 | Footer | Footer global. | Ya lo aporta el grupo global del tema. |

## Componentes a reutilizar

### Reutilizar sin crear una sección nueva

- `barkin-social-gallery`: coincide con el bloque Social Media de Figma. Solo hay que añadirla después del journal en `templates/blog.json` y configurar textos/enlace/bloques.
- Header, announcement bar y `barkin-footer`: son globales; no se duplican en la plantilla de blog.
- Datos nativos de Shopify Blog: `blog.articles`, `article.image`, `article.tags`, `article.published_at`, `article.author`, `article.excerpt` y `article.url`.

### Extender la sección existente

- `barkin-journal`: debe evolucionar para contener el hero, la barra de utilidades, el grid y la paginación del diseño. Es preferible a crear una segunda sección de grid, porque mantiene la fuente de datos del blog y su paginación en un solo lugar.

### Posible nueva sección o bloque interno

- Hero editorial: puede implementarse dentro de `barkin-journal` como un bloque/configuración del artículo destacado. No recomiendo reutilizar `barkin-hero` directamente: ese componente recibe contenido manual y no está conectado a un objeto `article` de Shopify.

## Decisiones de contenido requeridas antes de implementar

1. **Artículo destacado**
   - Recomendado: selector de artículo en el editor del tema.
   - Alternativa: usar automáticamente el artículo más reciente.
   - Si el artículo destacado también aparece en el grid, decidir si se repite (como contenido editorial) o si se excluye del grid.

2. **Categorías/filtros**
   - Usar tags del blog como categorías.
   - Mostrar “All Posts” en vez de “All articles”.
   - Figma muestra cuatro categorías visibles: `All Posts`, `Grooming`, `Pet Behaviour`, `Home Care`.
   - Recomendación: permitir elegir cuáles tags aparecen y su orden, para que no se publiquen automáticamente todos los tags internos del blog.

3. **Contador**
   - Figma muestra `32 Posts`.
   - Se calculará desde Shopify con `blog.articles_count`, no como texto manual.

4. **Orden**
   - Figma incluye `Sort By`.
   - Shopify Liquid no aporta orden dinámico de artículos del blog desde el frontend de forma nativa.
   - Propuesta inicial: dejar el control como interfaz visual desactivada/oculta hasta definir una fuente de orden real, o implementar solo un selector “Newest” visible que refleje el orden editorial de Shopify. No conviene mostrar una UI que parezca funcional si no puede reordenar resultados.

5. **Textos y enlaces del bloque social**
   - Puede reutilizar la configuración que ya existe en About Us o tener configuración propia para Journal.
   - Confirmar destino del botón “Connect With Us” (Instagram, página social o URL externa).

## Ajustes visuales necesarios

### Hero editorial

- Altura desktop: 596 px.
- Imagen de portada con `object-fit: cover`.
- Gradiente oscuro inferior y lateral izquierdo para legibilidad.
- Contenido inferior izquierdo: ancho aproximado de 473 px.
- Título editorial en DM Serif Display, 56 px / 52 px en desktop.
- CTA enlazado al artículo destacado.

### Barra de filtros

- Ancho completo y borde superior/inferior, inmediatamente después del hero.
- Filtros como enlaces de texto compactos, no como pills con borde.
- Grupo derecho para contador y orden.
- En móvil: scroll horizontal para filtros; contador y orden deben conservarse sin solaparse.

### Cards

- Grid desktop de tres columnas con 12 artículos por página.
- Card con borde fino, imagen superior y metadatos visibles.
- Categoría y fecha en la misma línea; fecha a la derecha.
- Título, botón outline y “Written by …” alineados como en la referencia.
- Usar `article.tags.first`, `article.published_at` y `article.author`; no valores estáticos.
- Definir fallback accesible cuando un artículo no tenga imagen.

### Paginación

- Centrada, compacta y con contenedor/borde acorde a Figma.
- Mantener URLs nativas de Shopify para paginación, historial y SEO.

## Archivos previstos para una futura implementación

| Archivo | Cambio previsto |
| --- | --- |
| `sections/barkin-journal.liquid` | Hero dinámico, configuración editorial, barra de filtros/utilidades y marcado de cards. |
| `assets/barkin-theme.css` | Estilos desktop y mobile específicos de Journal. |
| `templates/blog.json` | Añadir y configurar `barkin-social-gallery` tras el Journal. |
| `snippets/pagination.liquid` | Solo si el estilo existente no permite reproducir la paginación compacta sin afectar otras páginas. |

## Verificación posterior a la aprobación

1. Journal con y sin artículo destacado configurado.
2. Blog sin artículos, con artículos sin imagen y con artículos sin tags.
3. Filtro por cada categoría configurada y estado activo.
4. Conteo correcto de posts.
5. Paginación en segunda página.
6. Desktop de 1600 px y comportamiento mobile.
7. Enlaces, texto alternativo y etiquetas ARIA del hero, filtros y cards.

## Fuera de alcance de esta fase

- Descargar o incorporar assets de Figma.
- Crear o migrar posts del blog.
- Implementar ordenamiento frontend ficticio sin soporte real de Shopify.
- Duplicar header, announcement bar o footer dentro de `blog.json`.
