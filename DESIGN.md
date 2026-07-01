# Power Guns Polígono S.A.S. — Design System

## Paleta de colores

| Token | Nombre | HEX | Uso |
|---|---|---|---|
| `--pg-black` | Obsidiana táctica | `#050403` | Fondo principal del body |
| `--pg-ink` | Negro profundo | `#080706` | Header, footer, zonas premium |
| `--pg-carbon` | Carbón mate | `#0F0D0B` | Secciones alternas |
| `--pg-gunmetal` | Gunmetal oscuro | `#171513` | Cards, formularios, bloques |
| `--pg-iron` | Hierro quemado | `#26231F` | Hover cards, botones secundarios |
| `--pg-border` | Acero sombra | `#3C3A37` | Bordes suaves, divisores |
| `--pg-smoke` | Humo metálico | `#5B5A59` | Solo decoración |
| `--pg-titanium` | Titanio bronce | `#806F67` | Detalles metálicos, badges secundarios |
| `--pg-silver` | Plata envejecida | `#B2AAA7` | Párrafos, subtítulos, menú |
| `--pg-chrome` | Cromo claro | `#CFD1D4` | Textos secundarios importantes |
| `--pg-ice` | Blanco acero | `#F0F3F6` | Texto principal sobre fondo oscuro |
| `--pg-white` | Blanco puro | `#FFFFFF` | Títulos principales puntuales |
| `--pg-brass` | Bronce Power | `#C4871A` | Botones, palabras clave, líneas, iconos |
| `--pg-brass-light` | Bronce claro | `#D4A244` | Hover, brillos, estados activos |
| `--pg-brass-dark` | Bronce quemado | `#8C5E10` | Bordes, sombras, gradientes |
| `--pg-danger` | Rojo óxido | `#B63A2B` | Errores y avisos importantes |

## Proporción visual

- 70% negro / carbón
- 20% plata / grises metálicos  
- 10% bronce Power (solo acentos)

## Aplicación por componente

### Navbar
- fondo: `#080706` al 88% con blur
- texto menú: `#B2AAA7`
- hover menú: `#C4871A`
- borde inferior: `rgba(196,135,26,0.16)`
- botón: `#C4871A` con texto `#050403`

### Hero
- fondo base: `#050403`
- gradiente: `#0F0D0B` hacia transparente
- retícula: `rgba(196,135,26,0.08)`
- título: `#FFFFFF`
- palabra destacada: `#C4871A`
- contorno: stroke `#C4871A`
- párrafo: `#B2AAA7`

### Cards
- fondo: `#171513`
- borde: `rgba(196,135,26,0.12)`
- hover: `#26231F`
- título: `#F0F3F6`
- descripción: `#B2AAA7`
- icono: `#C4871A`

### Cards destacadas
- fondo: `linear-gradient(145deg, #171513, #26231F)`
- borde: `#C4871A`
- badge: `#C4871A`

### Formularios
- fondo input: `#0F0D0B`
- borde: `#3C3A37`
- texto: `#F0F3F6`
- placeholder: `rgba(178,170,167,0.45)`
- label: `#D4A244`
- focus: `#C4871A`

### Footer
- fondo: `#080706`
- texto títulos: `#F0F3F6`
- enlaces: `#B2AAA7`
- hover: `#C4871A`

## Combinaciones seguras

| Fondo | Texto | Uso |
|---|---|---|
| `#050403` | `#F0F3F6` | Títulos y texto principal |
| `#050403` | `#B2AAA7` | Párrafos |
| `#050403` | `#C4871A` | Acentos |
| `#171513` | `#F0F3F6` | Cards |
| `#171513` | `#B2AAA7` | Descripciones |
| `#C4871A` | `#050403` | Botones |
| `#D4A244` | `#050403` | Hover botones |

## Gradientes

```
Fondo hero:
  radial-gradient(circle at 75% 40%, rgba(196,135,26,0.12), transparent 32%),
  radial-gradient(circle at 20% 80%, rgba(128,111,103,0.10), transparent 38%),
  #050403

Overlay oscuro:
  linear-gradient(90deg, rgba(5,4,3,0.92), rgba(5,4,3,0.45), rgba(5,4,3,0.90))

Card premium:
  linear-gradient(145deg, #171513 0%, #0F0D0B 55%, #26231F 100%)
```
