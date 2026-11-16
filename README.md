# Catàleg de flora mediterrània — web

Aplicació React + TypeScript pensada per llegir el catàleg JSON existent.

## Posar-la en marxa

1. Crea un projecte React amb Vite i TypeScript:
   ```bash
   npm create vite@latest cataleg-flora -- --template react-ts
   cd cataleg-flora
   npm install
   ```
2. Substitueix `src/App.tsx` i `src/App.css` pels fitxers d'aquesta carpeta.
3. Copia el teu catàleg complet a `public/data/plantes.json`.
4. Executa:
   ```bash
   npm run dev
   ```

## Estructura esperada

```text
cataleg-flora/
├── public/
│   └── data/
│       └── plantes.json
└── src/
    ├── App.tsx
    ├── App.css
    └── main.tsx
```

El JSON pot ser un objecte amb `nom_catalog` i `plantes`, com el que has compartit, o directament una llista d'espècies.

## Com afegir fotografies més endavant

Cada planta pot tenir una llista `imatges`. Per exemple:

```json
"imatges": [
  {
    "id": "anagyris-foetida-planta-sencera",
    "vista": "planta_sencera",
    "nom_vista": "Planta sencera",
    "url": "/imatges/anagyris-foetida/planta-sencera.jpg",
    "principal": true,
    "text_alternatiu": "Exemplar de garrover del dimoni",
    "estat": "publicada"
  },
  {
    "id": "anagyris-foetida-flor",
    "vista": "flor",
    "nom_vista": "Flor",
    "url": null,
    "principal": false,
    "estat": "pendent"
  }
]
```

Desa els fitxers d'imatge, per exemple, a `public/imatges/anagyris-foetida/` i posa la ruta pública a `url`. Si `url` és `null`, la web manté un requadre reservat.

## Com funciona

- La portada mostra automàticament els hàbitats trobats a `habitat` (i usa `grup` com a alternativa).
- En entrar a un hàbitat apareixen les espècies corresponents.
- La cerca consulta el nom comú, el nom científic i els sinònims.
- Els filtres es generen a partir dels valors presents en les plantes d'aquell hàbitat.
- La fitxa individual mostra característiques, ecologia, usos i espais per a fotografies.
- Per afegir nous hàbitats o espècies, només cal actualitzar `plantes.json`.

No incloguis `...` dins del JSON: el fitxer ha de ser JSON complet i vàlid.
