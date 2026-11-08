# Visual design system

## Intent

Trigger.dev-inspired **developer tool clarity**: near-black canvas, strong typographic rhythm, thin separators, crisp terminal surfaces, restrained lime accent, meaningful transitions. Distinct Artisyn identity lives in the supplied blue/teal/purple brand icon; lime is the interface/action accent, not an alteration of the brand mark.

## Palette

| Token          | Value                | Use                                    |
| -------------- | -------------------- | -------------------------------------- |
| Background     | `#090D12`            | Main canvas                            |
| Surface        | `#0F151D`            | Cards, panels                          |
| Raised surface | `#131B26`            | Header, terminal chrome                |
| Border         | `#27313D`            | Fine outlines and dividers             |
| Text           | `#F3F6F9`            | Titles and important content           |
| Muted          | `#A1AFBD`            | Secondary copy                         |
| Accent         | `#C5F277`            | Selected state, CTA, positive activity |
| Icon gradient  | Purple → blue → teal | Brand mark only                        |

Use one strong accent per interaction. Avoid colored full-height swimlanes. Do not use green meaning for every visual detail.

## Typography

- Display: Inter or modern system sans, large tight-tracked headlines.
- Body: 14–18 px, 1.6–1.75 line height, 60–75-character line length for paragraphs.
- Technical UI: JetBrains Mono / system monospace, 11–13 px.
- Avoid dense monospaced prose across a whole page.

## Components

- Maximum reading width 1200 px; desktop two-column only where there is useful contrasting content.
- Cards with 1 px subtle outline, 8–12 px radius, simple surface fill.
- CTAs lime and dark text; secondary CTA outlined.
- Interactive lifecycle framed as a code/operations tool, with small labels and unmistakable state.
- Terminal UI is **illustrative**; always add SIMULATED label.

## Motion

- 150–250ms microtransition for tab/step changes.
- Use small opacity/y changes, no excessive blurs, bounces, or perpetual visual noise.
- Respect `prefers-reduced-motion`; transitions should remain comprehensible with motion off.

## Identity assets

- `artisyn-logo-original.png`: original high resolution logo (white/light background).
- `artisyn-wordmark-light.png`: cropped derived PNG; light-background use only.
- `artisyn-mark.svg`: manually simplified colored brand symbol on transparent background, optimized for dark navigation.
- `favicon.svg` and raster variants: compact purple/blue/teal spark-in-hexagon identity on dark square.

Original provided artwork and derivative icon differ slightly, by design; obtain final brand approval if used publicly.
