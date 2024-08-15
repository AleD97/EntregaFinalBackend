const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');  // Importa express-session
const { create } = require('express-handlebars');
const path = require('path');

const app = express();

// Configurar Handlebars como motor de plantillas
const hbs = create({
    extname: '.handlebars',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware para parsear JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar las sesiones
app.use(session({
    secret: 'mi-secreto', // Cambia esto a un valor más seguro
    resave: false,
    saveUninitialized: true,
}));

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/mi-tienda')
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error al conectar a MongoDB:', err));

// Definir las rutas principales
app.use('/api/products', require('./routes/products'));
app.use('/api/carts', require('./routes/carts'));

// Ruta para la vista principal
app.get('/', (req, res) => {
    res.render('index', { title: 'Mi Tienda' });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
