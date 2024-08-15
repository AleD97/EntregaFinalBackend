const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');

// Ruta para agregar un producto al carrito, creando el carrito si no existe
router.post('/:productId/add', async (req, res) => {
    const userId = req.user ? req.user._id : "defaultUserId"; // Suponiendo que tienes autenticación de usuario
    const productId = req.params.productId;

    try {
        // Buscar el carrito del usuario
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            // Si no existe un carrito, creamos uno nuevo
            cart = new Cart({ userId, products: [] });
            await cart.save();
            req.session.carritoId = cart._id;  // Guardar el carritoId en la sesión
        } else {
            req.session.carritoId = cart._id;  // Actualizar el carritoId en la sesión si ya existe
        }

        // Verificar si el producto ya está en el carrito
        const productInCart = cart.products.find(item => item.product.toString() === productId);

        if (productInCart) {
            productInCart.quantity += 1;
        } else {
            cart.products.push({ product: productId, quantity: 1 });
        }

        await cart.save();  // Guardar el carrito actualizado en la base de datos

        res.json({ status: 'success', message: 'Producto agregado al carrito', cartId: cart._id, cart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

module.exports = router;