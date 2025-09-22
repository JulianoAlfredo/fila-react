export default function returnFilaById(idFila) {
  switch (idFila) {
    case 1:
      return 'recepção'
    case 2:
      return 'enfermagem'
    case 3:
      return 'médico'
    case 4:
      return 'finalização'
    default:
      return 'desconhecido'
  }
}
