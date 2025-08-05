import { Router } from 'express';
import { filtrarProductos ,crearProducto, obtenerProductos, actualizarProducto, eliminarProducto, cargarProductos, buscarProductosPorNombre } from '../controllers/productoController';

const router = Router();

import { verificarToken } from '../middleware/usuarios';

router.post('/crearProducto', verificarToken, crearProducto);
router.get('/buscarProductos', buscarProductosPorNombre);
router.get('/listarProductos', obtenerProductos);
router.put('/:id', verificarToken, actualizarProducto);
router.delete('/:id', verificarToken,  eliminarProducto);
router.get('/cargarProductos',cargarProductos);
router.get('/:id', obtenerProductos);


router.post('/filtrar', filtrarProductos)
router.get('/productos', obtenerProductos)



export default router;
