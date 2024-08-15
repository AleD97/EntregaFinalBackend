const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /products
router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query, format } = req.query;
        const filter = {};

        // Filtrar por categoría o disponibilidad
        if (query) {
            filter.$or = [
                { category: query },
                { availability: query }
            ];
        }

        // Ordenamiento por precio
        const sortOption = sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {};

        // Paginación y ejecución de la consulta
        const products = await Product.find(filter)
            .sort(sortOption)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        // Total de productos para calcular páginas
        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);

        // Obtener el carritoId desde la sesión (o de donde lo tengas almacenado)
        const carritoId = req.session.carritoId || "defaultCarritoId"; // Asegúrate de tener el carritoId real

        // Verificar si el formato solicitado es JSON
        if (format === 'json') {
            return res.json({
                status: 'success',
                payload: products,
                totalPages,
                prevPage: page > 1 ? parseInt(page) - 1 : null,
                nextPage: page < totalPages ? parseInt(page) + 1 : null,
                page: parseInt(page),
                hasPrevPage: page > 1,
                hasNextPage: page < totalPages,
                prevLink: page > 1 ? `/products?limit=${limit}&page=${parseInt(page) - 1}&sort=${sort}&query=${query}&format=json` : null,
                nextLink: page < totalPages ? `/products?limit=${limit}&page=${parseInt(page) + 1}&sort=${sort}&query=${query}&format=json` : null
            });
        }

        // Si no se solicita JSON, renderizar la vista
        res.render('index', {
            title: 'Productos',
            products,
            carritoId: req.session.carritoId, 
            totalPages,
            prevPage: page > 1 ? parseInt(page) - 1 : null,
            nextPage: page < totalPages ? parseInt(page) + 1 : null,
            page: parseInt(page),
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            prevLink: page > 1 ? `/products?limit=${limit}&page=${parseInt(page) - 1}&sort=${sort}&query=${query}` : null,
            nextLink: page < totalPages ? `/products?limit=${limit}&page=${parseInt(page) + 1}&sort=${sort}&query=${query}` : null
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

router.get('/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).render('404', { title: 'Producto no encontrado' });
        }

        res.render('product-details', {
            title: product.name,
            product
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

module.exports = router;
