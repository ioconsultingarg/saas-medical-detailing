import type { ComponentType } from 'react'
import { C1Portada, C2Desafio, C3Mecanismo, C4Eficacia, C5Seguridad, C6Posologia } from './Cardio'
import { R1Portada, R2Problema, R3Mecanismo, R4Tecnica, R5Adherencia, R6Posologia } from './Respira'

export const componentesDiapositiva: Record<string, ComponentType> = {
  c1: C1Portada,
  c2: C2Desafio,
  c3: C3Mecanismo,
  c4: C4Eficacia,
  c5: C5Seguridad,
  c6: C6Posologia,
  r1: R1Portada,
  r2: R2Problema,
  r3: R3Mecanismo,
  r4: R4Tecnica,
  r5: R5Adherencia,
  r6: R6Posologia,
}
