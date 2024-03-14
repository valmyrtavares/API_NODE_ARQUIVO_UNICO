const express = require('express');
const mysql = require('mysql');

//Configuração do banco de dados
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'phrases',
};

const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados', err);
    return;
  }
  console.log('Conectado ao bando de dados MySQL');
});

//Criar a aplicação Express

const app = express();
const port = 4000;

//Middware para permitir solicitações de origens diferentes(cors)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

//Middware para permitir o uso de JSON
app.use(express.json());

//Middware para permitir o uso de x-www-form-urlenconded
app.use(express.urlencoded({ extended: true }));

//Rota para obter todas as frases
app.get('/phrases', (req, res) => {
  const sql = 'SELECT * FROM phrase';
  connection.query(sql, (err, results) => {
    if (err) {
      console.log('Erro para obter frases', err);
      res.status(500).send('Erro ao obter');
      return;
    }
    res.json(results);
  });
});

app.get('/phrases/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'SELECT * FROM phrase WHERE id = ?';
  connection.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Erro ao obter frase pelo id', err);
      res.status(500).send('Erro ao obter frase pelo ID');
      return;
    }
    if (results.length === 0) {
      res.status(404).send('Frase não encontrada');
      return;
    }
    res.json(results[0]);
  });
});

//Rota para adicionar uma nova frase
app.post('/phrases', (req, res) => {
  const { author, txt } = req.body;
  const sql = 'INSERT INTO phrase (author, txt) VALUES (?, ?)';
  connection.query(sql, [author, txt], (err, results) => {
    if (err) {
      console.error('Erro ao adicionar a frase', err);
      res.status(500).send('Erro ao adicionar a frase');
      return;
    }
    res.status(201).send('Frase adicionada com sucesso');
  });
});

//Rota para excluir uma frase

app.delete('/phrases/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM phrase WHERE id = ?';
  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.log('Erro ao excluir frase', err);
      res.status(500);
      return;
    }
    res.send('Frase excluida com sucesso');
  });
});

app.put('/phrases/:id', (req, res) => {
  const id = req.params.id;
  const { author, txt } = req.body;
  if (!id) {
    res.status(400).send('ID NÃO FORNECIDO');
    return;
  }
  if (!author || !txt) {
    res.status(400).send('Autor ou texto não foram enviados');
    return;
  }
  const sql = 'UPDATE phrase SET author = ?, txt = ? WHERE id = ?';
  connection.query(sql, [author, txt, id], (err, result) => {
    if (err) {
      console.error('Erro ao editar frase:', err);
      res.status(500).send('Erro ao editar frase');
      return;
    }
    res.send('Frase editada com sucesso');
  });
});

// INICIAR O SERVIDOR
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost${port}`);
});
