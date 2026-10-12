# Tipografías del manual

Los `.ttf` de esta carpeta no son fuentes propias: son **Instrument Sans** e **IBM Plex Mono**,
las mismas que usa la app, convertidas a TrueType estático porque ReportLab no lee `woff2` ni
fuentes variables.

| Archivo | Origen | Peso |
| --- | --- | --- |
| `IOSans-Regular.ttf` | Instrument Sans | 400 |
| `IOSans-Medium.ttf` | Instrument Sans | 550 |
| `IOSans-Bold.ttf` | Instrument Sans | 700 |
| `IOMono-Regular.ttf` | IBM Plex Mono | 400 |
| `IOMono-Medium.ttf` | IBM Plex Mono | 500 |

El prefijo `IO` es solo el nombre con el que se registran dentro del PDF; **no implica autoría**.

## Licencia

Las dos están bajo **SIL Open Font License 1.1**, que permite usarlas, modificarlas y
redistribuirlas, y que **exige distribuir el texto de la licencia junto con los archivos**. Por eso
están acá:

- `OFL-InstrumentSans.txt` — Copyright 2022 The Instrument Sans Project Authors.
- `OFL-IBMPlexMono.txt` — Copyright © 2017 IBM Corp., con Reserved Font Name "Plex".

Dos cosas que la OFL pide y conviene no olvidar:

1. **No se pueden vender por separado.** Acompañan al software, no son el producto.
2. **El Reserved Font Name.** IBM Plex reserva el nombre "Plex": una versión modificada no puede
   llamarse así. Por eso los archivos se llaman `IOMono` y no `IOPlex`.

## Cómo se regeneran

Desde los `woff2` de `@fontsource` que ya están en `node_modules`, instanciando la fuente variable
en cada peso con `fontTools`:

```python
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

f = TTFont(origen_woff2)
instancer.instantiateVariableFont(f, {'wght': 550}, inplace=True)
f.flavor = None
f.save(destino_ttf)
```
