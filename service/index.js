// importa bibliotecas
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mysql = require('mysql');

// parse application/json
app.use(bodyParser.json());

// enable cors
const cors = require('cors');
app.use(cors());
app.options('*', cors());

// cria conexao com banco de dados, seja o do Heroku ou o local
if(process.env.JAWSDB_URL){
  var conn = mysql.createConnection(process.env.JAWSDB_URL)  
} else {
  var conn = mysql.createConnection({
    host: 'localhost',
    port: '4407',
    user: 'root',
    password: '',
    database: 'sd_arduino'
  });
}

// define porta a ser utilizada
var PORT = process.env.PORT || 3000;

//connect to database
conn.connect((err) =>{
  if(err) throw err;
  console.log('MySQL Connected...');

  app.get('/',(req, res) => {
    res.send('Welcome to sd_restful!')
  });
});


/* a partir daqui sao definidas as APIs a serem utilizadas. */

// API Get, que devolve os dados das medicoes
app.get('/api/data_col',(req, res) => {
  // monta a query
  let sql = "SELECT DATE_FORMAT(DTA_TIMESTAMP,'%d/%m/%Y %H:%i:%s') as timestamp, DTA_MOISTURE as moisture, DTA_TEMPERATURE as temperature, DTA_LUMINOSITY as luminosity FROM data_collection ORDER BY DTA_TIMESTAMP";
  // roda a query e pega o retorno
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    
    // devolve json de resposta
    res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
  });
});

// API Post, que é utilizada para pegar os dados do arduino e salvar no banco
app.post('/api/data_col',(req, res) => {
  // pega a data atual
  let timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
  // mapeia o que veio no json pra uma "pseudo-query"
  let data = {DTA_TIMESTAMP: timestamp, DTA_MOISTURE: req.body.moisture, DTA_TEMPERATURE: req.body.temperature, DTA_LUMINOSITY: req.body.luminosity};
  // monta querendo, pendente dos campos mapeados
  let sql = "INSERT INTO data_collection SET ?";
  // une os campos mapeados com a query e roda ela
  let query = conn.query(sql, data,(err, results) => {
    if(err) throw err;
    
    // devolve json de resposta
    res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
  });
});

// ativa o servidor
app.listen(PORT,() =>{
  console.log('Server started on port '+ PORT + ' ...');
});