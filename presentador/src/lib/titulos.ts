/** "Línea Cardio — Demo-molécula" → categoría + producto, para mostrarlos con jerarquía distinta */
export function partirTitulo(titulo: string) {
  const [categoria, ...resto] = titulo.split(' — ')
  const producto = resto.join(' — ')
  return producto ? { categoria, producto } : { categoria: '', producto: titulo }
}
