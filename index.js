let express = require('express');
const nunjucks = require('nunjucks');
// Importamos y configuramos dotenv
require('dotenv').config();

let app = express();

nunjucks.configure('views', {
    autoescape: true,
    express: app
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const MongoClient = require('mongodb').MongoClient;
const MONGO_URL = process.env.MONGO_URL;

app.get('/', (req, res) => {
    MongoClient.connect(MONGO_URL, { useUnifiedTopology: true }, (err, db) => {
        const dbo = db.db(process.env.DATABASE);
        // ORDENAMOS POR PLATO (-1: ↑ a ↓) (1: ↓ a ↑)
        //dbo.collection(process.env.COLECCION).find().sort({ "plato": 1 }).limit(20).toArray((err, platos) => {
        dbo.collection(process.env.COLECCION).find().sort({ "id": 1 }).toArray((err, id) => {
            res.render('index.html', { data: id });
        })
    });
});

/* 
app.get('/comidas/:id', (req, res)=>{
    MongoClient.connect(MONGO_URL,{ useUnifiedTopology: true }, (err, db) => {  
    const dbo = db.db(process.env.DATABASE);  
    const id = parseInt(req.params.id);
    dbo.collection(process.env.COLECCION).findOne({"id":id}, function(err, data) {
        if (err) throw err;
        if(data){res.render('comidas.html', { data: id })}
        else{
            res.send("No encontrado");
        }
        db.close();
        });
      });
  });
*/

app.get('/comidas/:id', (req, res)=>{	  
    MongoClient.connect(MONGO_URL,{ useUnifiedTopology: true }, (err, db) => {  
    const dbo = db.db(process.env.DATABASE);  
    const id = parseInt(req.params.id);
    dbo.collection(process.env.COLECCION).findOne({"id":id}, function(err, data) {
        if (err) throw err;
        if(data){
            res.send(`<h1>${data.plato}  (${data.categoria})</h1>
            <p>Comida: ${data.plato}</p>
            <p>Categoria: ${data.categoria}</p>
            <p>Descripción: ${data.descripcion}</p>
            <p>Precio: ${data.precio}</p>
            <img src=https://picsum.photos/200/300 alt="Image Test">
            <p><a href="/">Regresar a la Home</a></p>
            `);
        }
        else{
            res.send("No encontrado");
        }
        db.close();
        });
      });
  });


  app.all('/altaCategorias', function(req, res){
    res.render('altaCategorias.html');
});


app.get('/altaComidas', (req, res) => {
    MongoClient.connect(MONGO_URL, { useUnifiedTopology: true }, (err, db) => {
        const dbo = db.db(process.env.DATABASE);
        // ORDENAMOS POR PLATO (-1: ↑ a ↓) (1: ↓ a ↑)
        //dbo.collection(process.env.COLECCION).find().sort({ "plato": 1 }).limit(20).toArray((err, platos) => {
        dbo.collection("categorias").find().sort({ "id": 1 }).toArray((err, categorias) => {
            //console.log(categorias)
            res.render('altaComidas.html', { categorias: categorias });
        })
    });
});

// ALTA PLATOS - COMIDAS (Busca primero y luego agrega si no existe)


app.all('/altaComida', (req, res)=>{
    // Verificamos si están viniendo por POST datos del formulario. En ese caso hacemos el insertOne en la base de datos
    if(req.body.id && req.body.plato && req.body.descripcion && req.body.categoria && req.body.precio)
    {
      MongoClient.connect(MONGO_URL,{ useUnifiedTopology: true }, (err, db) => {  
      const dbo = db.db(process.env.DATABASE)
      //const d = new Date();
      //const n = d.getTime()
  
      // Insertamos los campos que llegan del formulario:
      dbo.collection(process.env.COLECCION).insertOne(
          {
            id: parseInt(req.body.id),
            plato: req.body.plato,
            descripcion: req.body.descripcion,
            categoria: req.body.categoria,
            precio: parseInt(req.body.precio)
          },
          function (err, res) {
              db.close();
              if (err) {              
                //return console.log(err);    
                res.send("Error " + err);
              }
          })
          res.render('altaComidasExistosa.html',{mensaje:"Alta exitosa de "+req.body.plato});        
      })
    }
    else{
      // Ingresamos al formualario sin insertar datos
      res.render('altaComidas.html');      
    }
  })

// BUSCAR COMIDAS

app.get('/buscador', (req, res)=>{
    let termino = req.query.busqueda;  
    // Creamos la expresión regular para poder verificar que contenga el término el nombre en la base de datos. La i significa no sensible a may/min
    let expresiontermino = new RegExp(termino,"i");
    MongoClient.connect(MONGO_URL,{ useUnifiedTopology: true }, (err, db) => {  
    const dbo = db.db(process.env.DATABASE);    
    dbo.collection(process.env.COLECCION).find({"plato":{$regex: expresiontermino }}).toArray(function(err, data) {	      
        res.render('altaComidas.html',{termino:termino,data:data});
      });
  });
  });

//

app.listen(8080);