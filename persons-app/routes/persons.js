const express = require('express');
const router = express.Router();
const moment = require('moment');
const fs = require('fs');
const path = require('path');

const personsFilePath = path.join(__dirname, '../data/persons.json');
const accessFilePath = path.join(__dirname, '../data/access.json');

// Middleware para inicializar archivos JSON si están vacíos
function initializeFile(filePath, defaultContent, callback) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Si el archivo no existe, crearlo con el contenido predeterminado
        fs.writeFile(filePath, defaultContent, (err) => {
          if (err) {
            console.error(`Error al inicializar ${path.basename(filePath)}:`, err);
          } else {
            console.log(`Archivo ${path.basename(filePath)} inicializado correctamente`);
          }
          callback();
        });
      } else {
        console.error(`Error al leer ${path.basename(filePath)}:`, err);
        callback(err);
      }
    } else {
      if (!data) {
        // Si el archivo está vacío, inicializarlo con el contenido predeterminado
        fs.writeFile(filePath, defaultContent, (err) => {
          if (err) {
            console.error(`Error al inicializar ${path.basename(filePath)}:`, err);
          } else {
            console.log(`Archivo ${path.basename(filePath)} inicializado correctamente`);
          }
        });
      }
      callback();
    }
  });
}

// Middleware para inicializar archivos JSON si están vacíos
router.use((req, res, next) => {
  initializeFile(accessFilePath, '[]', (err) => {
    if (err) return next(err);
    initializeFile(personsFilePath, '[]', next);
  });
});

// Ruta para obtener personas
router.get('/', (req, res) => {
  // Añadir fecha y hora actual al archivo access.json
  const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
  fs.readFile(accessFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error al leer el archivo de acceso');
    }

    let accessData = [];
    if (data) {
      try {
        accessData = JSON.parse(data);
      } catch (e) {
        console.error('Error parsing access.json:', e);
        accessData = [];
      }
    }
    accessData.push({ timestamp });
    fs.writeFile(accessFilePath, JSON.stringify(accessData, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error al escribir en el archivo de acceso');
      }

      // Leer personas y filtrar por edad
      fs.readFile(personsFilePath, 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error al leer el archivo de personas');
        }

        let persons = [];
        if (data) {
          try {
            persons = JSON.parse(data);
          } catch (e) {
            console.error('Error parsing persons.json:', e);
            return res.status(500).send('Error al analizar el archivo de personas');
          }
        }
        const minAgeDays = parseInt(process.env.MIN_AGE_DAYS, 10);
        const filteredPersons = persons.filter(person => {
          const birthDate = moment(person.birthDate);
          const today = moment();
          const ageInDays = today.diff(birthDate, 'days');
          return ageInDays > minAgeDays;
        });

        res.render('persons', { persons: filteredPersons, moment: moment });
      });
    });
  });
});

module.exports = router;
