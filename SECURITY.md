# Política de seguridad

## Qué es este repositorio

IO-Pharma es una **demostración** de una plataforma de e-detailing y CRM para laboratorios
farmacéuticos. Todo lo que contiene es ficticio: los médicos, los laboratorios, las droguerías, los
productos (*Lipvera* y *Respirel* no existen), los lotes, los CUIT y las cuentas de acceso.

**No hay datos reales de pacientes, de profesionales de la salud ni de ninguna empresa.** La app
corre enteramente en el navegador: no tiene servidor, no tiene base de datos y no envía información
a ningún lado.

Las credenciales que aparecen en la pantalla de ingreso son públicas a propósito, para que
cualquiera pueda recorrer la demo. No protegen nada.

## Cómo reportar un problema

Si encontrás una vulnerabilidad, escribinos a **io.consulting.arg@gmail.com** con el asunto
`[seguridad] io-pharma`. Respondemos dentro de los 5 días hábiles.

Por favor no abras un issue público para un problema de seguridad.

Al reportar ayuda incluir:

- Qué encontraste y dónde (archivo y línea, o la URL de la demo).
- Cómo reproducirlo.
- Qué impacto tendría si la plataforma estuviera en producción con datos reales.

## Alcance

Entra en alcance el código de este repositorio y la demo publicada en
`https://ioconsultingarg.github.io/saas-medical-detailing/`.

Queda **fuera de alcance**, por ser decisiones conscientes de una demostración:

- La validación de credenciales en el navegador y el rol guardado en `localStorage`. En producción
  eso va en el token y en las políticas de la base de datos.
- La ausencia de backend, de cifrado en tránsito propio y de control de acceso real.
- Los datos de ejemplo visibles en el código fuente.

Estas decisiones están documentadas en `11-STACK-TECNICO-OPCIONES.md`, junto con lo que corresponde
hacer cuando la plataforma pase a producción.

## Versiones con soporte

Se mantiene únicamente la rama `main`, que es la que se publica.
