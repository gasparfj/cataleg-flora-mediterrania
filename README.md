<<<<<<< HEAD
# Catàleg de flora mediterrània de les Illes Balears

Aplicació web interactiva per explorar plantes autòctones de les Illes Balears segons l'hàbitat, consultar-ne les característiques botàniques i ecològiques i visualitzar-ne fotografies.

El projecte és una **adaptació digital independent** de dades procedents del catàleg del viver forestal de les Illes Balears **CEFOR Menut**. No és una web oficial del viver.

## Font de la informació

La informació de les espècies s'ha transcrit i estructurat a partir de la publicació:

> **CEFOR Menut. _Catàleg de plantes autòctones del viver forestal de les Illes Balears_.**
>
> [Enllaç al catàleg facilitat com a font](https://share.google/n5QRI3KQwYWcIXkZl)

Les taules del catàleg són la font de les dades de distribució per illes, endemisme, mida adulta, èpoques de floració i fructificació, colors de floració, tipus de fruit, necessitats hídriques, insolació, port, tolerància a la salinitat, interès per a pol·linitzadors i fauna, resistència a herbívors i altres característiques assenyalades mitjançant símbols.

**Criteri de transcripció:** els símbols s'han interpretat segons la llegenda del document original. Quan una dada no consta a la font, pot quedar buida o com a `null`; això no equival necessàriament a una resposta negativa. És recomanable contrastar les dades amb el catàleg original abans d'utilitzar-les per prendre decisions de plantació.

**Autoria i drets:** la citació anterior atribueix la font de les dades, però no implica que el text, les taules o les fotografies originals tinguin una llicència oberta. Abans de reutilitzar o publicar fotografies de tercers, cal comprovar-ne els permisos i acreditar-ne l'autoria i la llicència corresponents.

## Funcionalitats

- Portada amb els grans hàbitats i fotografia de portada opcional.
- Catàleg d'espècies separat per hàbitat.
- Cerca per nom comú, nom científic i sinònims.
- Filtres segons les característiques disponibles a cada hàbitat.
- Fitxes individuals amb dades botàniques, ecològiques i galeria d'imatges.
- Disseny adaptable a ordinadors i dispositius mòbils.
- Fotografies opcionals: les fitxes continuen funcionant encara que no se n'hagi afegit cap.

## Tecnologies

React, TypeScript, Vite i CSS.

## Estructura del projecte

```text
public/
├── habitats.json
├── plantes/
│   ├── alzinar.json
│   ├── dunes-i-savinar.json
│   ├── muntanya.json
│   ├── penyals.json
│   ├── pinar.json
│   ├── ribera-i-torrents.json
│   ├── salobrars-i-costa.json
│   └── ullastrar.json
└── images/
    ├── habitats/
    │   └── pinar.jpg
    └── plantes/
        └── pinar/
            └── pinus-halepensis/
                ├── planta-sencera.jpg
                └── flor.jpg
src/
├── App.tsx
├── App.css
└── main.tsx
```

## Instal·lació i execució local

Cal tenir instal·lats Node.js i npm.

```bash
npm install
npm run dev
```

Per generar la versió de producció:

```bash
npm run build
```

## Afegir o modificar hàbitats

Cada hàbitat s'inscriu a `public/habitats.json` i apunta a un fitxer de plantes independent:

```json
{
  "id": "pinar",
  "nom": "Pinar",
  "fitxer": "/plantes/pinar.json",
  "imatge_portada": "/images/habitats/pinar.jpg"
}
```

Si encara no tens fotografia de portada, utilitza `"imatge_portada": null`.

**Nota sobre les rutes:** aquesta estructura situa `habitats.json` directament dins de `public/`, de manera que `App.tsx` l'ha de carregar amb `fetch("/habitats.json")`. Els fitxers de plantes es carreguen amb les rutes absolutes `/plantes/nom-del-fitxer.json`.

## Afegir fotografies de plantes

1. Crea una carpeta per a l'espècie dins de `public/images/plantes/<habitat>/<id-planta>/`.
2. Desa-hi les fotografies, per exemple `planta-sencera.jpg`, `fulles.jpg`, `flor.jpg` i `fruit.jpg`.
3. Actualitza el camp `imatges` de la planta al JSON de l'hàbitat corresponent.

Exemple:

```json
{
  "id": "pinus-halepensis-planta-sencera",
  "vista": "planta_sencera",
  "nom_vista": "Planta sencera",
  "url": "/images/plantes/pinar/pinus-halepensis/planta-sencera.jpg",
  "principal": true,
  "credit": null,
  "llicencia": null,
  "text_alternatiu": "Exemplar de Pinus halepensis",
  "estat": "publicada"
}
```

La primera fotografia amb `principal: true` i una URL vàlida es fa servir com a imatge principal de la planta. Les altres fotografies disponibles es mostren a la galeria. Si no hi ha cap URL, es mostra un espai reservat.

## Abast i limitacions

El catàleg és un projecte de consulta i divulgació en desenvolupament. Les dades s'han digitalitzat a partir de taules i símbols, i poden requerir revisió. L'absència d'una característica al JSON no s'ha d'interpretar automàticament com a absència biològica d'aquella característica.

## Crèdits

- **Font de les dades botàniques:** CEFOR Menut, _Catàleg de plantes autòctones del viver forestal de les Illes Balears_.
- **Aplicació web i estructuració de dades:** projecte independent «Catàleg de flora mediterrània de les Illes Balears».
- **Fotografies:** autoria i condicions d'ús indicades a cada fitxa, quan s'incorporin.
=======

{
  "fonts": [
    {
      "id": "cefor-menut",
      "titol": "Catàleg de plantes autòctones del viver forestal de les Illes Balears",
      "autor": "CEFOR Menut",
      "tipus": "cataleg",
      "url": "https://share.google/n5QRI3KQwYWcIXkZl",
      "descripcio": "Font principal de les dades botàniques del catàleg digital, incloent-hi la distribució, les dimensions, la floració, la fructificació i les característiques ecològiques de les espècies."
    }
  ]
}
>>>>>>> c1bcbd8 (Afegir fonts.json (referencies))
