import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer'
import { addressToCoordinates } from './direcciones'

// Definir la ruta al archivo CSV original y al archivo CSV de salida
const csvFilePath = path.resolve(__dirname, './disasters.csv') // Archivo CSV original
const outputCsvPath = path.resolve(__dirname, 'disasters_with_coordinates.csv') // Archivo CSV de salida

interface CsvRow {
  date: string
  'natural-disaster': string
  address: string
  // Puedes agregar más campos si tu CSV original tiene más columnas
}

interface CsvRowWithCoordinates {
  date: string
  'natural-disaster': string
  longitude: number
  latitude: number
  // Agrega más campos si es necesario
}

// Crear un CSV Writer para el archivo de salida
const csvWriter = createCsvWriter({
  path: outputCsvPath,
  header: [
    { id: 'date', title: 'date' },
    { id: 'naturalDisaster', title: 'natural-disaster' },
    { id: 'longitude', title: 'longitude' },
    { id: 'latitude', title: 'latitude' },
    // Agrega más encabezados si es necesario
  ],
})

const records: CsvRowWithCoordinates[] = []

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row: CsvRow) => {
    // Normalizar la dirección
    const normalizedAddress = row.address.trim().toLowerCase()

    // Buscar las coordenadas en el objeto addressToCoordinates
    const coordinates = addressToCoordinates[normalizedAddress]

    if (coordinates) {
      // Si se encuentran coordenadas, agregarlas al registro
      records.push({
        date: row.date,
        naturalDisaster: row['natural-disaster'],
        longitude: coordinates.longitude,
        latitude: coordinates.latitude,
      })
    } else {
      // Si no se encuentran coordenadas, manejar el caso
      // Puedes optar por omitir el registro, asignar valores predeterminados, o registrar un error
      console.warn(`Coordenadas no encontradas para la dirección: "${row.address}"`)
      // Opcional: Asignar valores predeterminados
      records.push({
        date: row.date,
        naturalDisaster: row['natural-disaster'],
        longitude: 0, // Valor predeterminado o puedes usar 'null' si modificas la interfaz
        latitude: 0, // Valor predeterminado
      })
    }
  })
  .on('end', async () => {
    try {
      await csvWriter.writeRecords(records)
      console.log(`Archivo CSV con coordenadas generado exitosamente en ${outputCsvPath}`)
    } catch (error) {
      console.error('Error al escribir el archivo CSV de salida:', error)
    }
  })
  .on('error', (err: Error) => {
    console.error('Error al leer el archivo CSV:', err.message)
  })
