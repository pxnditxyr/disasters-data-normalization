import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const csvFilePath = path.resolve(__dirname, 'datos.csv'); // Reemplaza 'datos.csv' con la ruta a tu archivo CSV
const outputJsonPath = path.resolve(__dirname, 'direcciones.json'); // Ruta para el archivo JSON de salida

interface CsvRow {
  date: string;
  'natural-disaster': string;
  address: string;
}

const uniqueAddresses: Set<string> = new Set();

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row: CsvRow) => {
    if (row.address) {
      const normalizedAddress = row.address.trim().toLowerCase(); // Normalizar a minúsculas
      uniqueAddresses.add(normalizedAddress);
    }
  })
  .on('end', () => {
    // Convertir el Set a un arreglo y ordenar de la A a la Z
    const uniqueList: string[] = Array.from(uniqueAddresses).sort((a, b) => a.localeCompare(b));
    console.log('Direcciones únicas (normalizadas y ordenadas):', uniqueList);

    // Crear un objeto donde cada clave es una dirección única normalizada y ordenada, y el valor es true
    const direccionesJson: { [key: string]: boolean } = {};
    uniqueList.forEach(address => {
      direccionesJson[address] = true;
    });

    // Escribir el objeto JSON en el archivo direcciones.json
    fs.writeFile(outputJsonPath, JSON.stringify(direccionesJson, null, 2), 'utf8', (err) => {
      if (err) {
        console.error('Error al escribir el archivo JSON:', err.message);
      } else {
        console.log(`Archivo JSON generado exitosamente en ${outputJsonPath}`);
      }
    });
  })
  .on('error', (err: Error) => {
    console.error('Error al leer el archivo CSV:', err.message);
  });
