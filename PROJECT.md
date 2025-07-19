# Beschreibung

Projekt ERiC zur Generierung von ER Diagreammen aus einer textuellen Beschreibung

# Technologie

- Browseranwendung
- React
- React Flow
- Ohm als Domain Specific Language parser
- Speicherung im Browser Store

# Vorgaben

- Saubere Strukturierung
- Clean Code

# Projektstruktur (Stand: Aktuell)

```mermaid
graph TD
  App["App.js"]
  App --> Components
  App --> Utils
  App --> Tests

  Components --> CustomNode
  Components --> CustomHandle
  Components --> DownloadButton

  Utils --> UtilsJS
  UtilsJS --> hasDuplicates
  UtilsJS --> getEdgeParams

  Tests --> AppTests
  Tests --> UtilsTests
  Tests --> ParserTests
  Tests --> ComponentTests
  Tests --> IntegrationTests
```
