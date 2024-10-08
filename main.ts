import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'

const csvFilePath = path.resolve( __dirname, './disasters.csv' )
const outputJsonPath = path.resolve( __dirname, 'direcciones.json' )

interface CsvRow {
  date: string
  'natural-disaster': string
  address: string
}

const direccionesCount: { [key: string]: number } = {}

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row: CsvRow) => {
    if (row.address) {
      const normalizedAddress = row.address.trim().toLowerCase() // Normalizar a minúsculas
      if (direccionesCount[normalizedAddress]) {
        direccionesCount[normalizedAddress] += 1
      } else {
        direccionesCount[normalizedAddress] = 1
      }
    }
  })
  .on('end', () => {
    // Obtener las direcciones únicas y ordenarlas alfabéticamente
    const uniqueList: string[] = Object.keys(direccionesCount).sort((a, b) => a.localeCompare(b))
    console.log('Direcciones únicas (normalizadas y ordenadas):', uniqueList)
    console.log('Frecuencia de cada dirección:', direccionesCount)

    // Crear un nuevo objeto ordenado
    const direccionesJson: { [key: string]: number } = {}
    uniqueList.forEach(address => {
      direccionesJson[address] = direccionesCount[address]
    })

    // Escribir el objeto JSON ordenado en el archivo direcciones.json
    fs.writeFile(outputJsonPath, JSON.stringify(direccionesJson, null, 2), 'utf8', (err) => {
      if (err) {
        console.error('Error al escribir el archivo JSON:', err.message)
      } else {
        console.log(`Archivo JSON generado exitosamente en ${outputJsonPath}`)
      }
    })
  })
  .on('error', (err: Error) => {
    console.error('Error al leer el archivo CSV:', err.message)
  })
