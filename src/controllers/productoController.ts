import { Request, Response } from 'express';
import { Producto } from '../models/producto';
import { sequelize } from '../config/db';
import { literal, Op } from 'sequelize';
import { Usuario } from '../models/usuarios'; 
import { Carrito } from '../models/carrito'; 

export async function verificarPermisosAdministrador(usuarioId: number): Promise<boolean> {
  const usuario = await Usuario.findByPk(usuarioId);
  if (!usuario) return false;

  const { verificado, admin } = usuario.get();
  return verificado === true && admin === true;
}

export async function verificarVerificado(usuarioId: number): Promise<boolean> {
  const usuario = await Usuario.findByPk(usuarioId);
  if (!usuario) return false;

  const { verificado } = usuario.get();
  return verificado === true;
}


export const crearProducto = async (req: Request, res: Response): Promise<void> => {
  const usuarioId = (req as any).user?.id;

  const autorizado = await verificarPermisosAdministrador(usuarioId);
  if (!autorizado) {
    res.status(403).json({ error: 'No tenes los permisos para realizar esta acción.' });
    return;
  }

  const t = await sequelize.transaction();
  try {
    const { nombre, precio, talles, categoria, imagen } = req.body;
    const nuevaProducto = await Producto.create({ nombre, precio, talles, categoria, imagen }, { transaction: t });
    await t.commit();
    res.status(201).json(nuevaProducto);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: 'Error al crear la producto' });
  }
};





export const actualizarProducto = async (req: Request, res: Response): Promise<void> => {
  const usuarioId = (req as any).user?.id;

  const autorizado = await verificarPermisosAdministrador(usuarioId);
  if (!autorizado) {
    res.status(403).json({ error: 'No tenés permisos para realizar esta acción.' });
    return;
  }

  const { id } = req.params;
  const t = await sequelize.transaction();
  try {
    await Producto.update(req.body, { where: { id }, transaction: t });
    await t.commit();
    res.sendStatus(204);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: 'Error al actualizar la producto' });
  }
};



export const eliminarProducto = async (req: Request, res: Response): Promise<void> => {
  const usuarioId = (req as any).user?.id;

  const autorizado = await verificarPermisosAdministrador(usuarioId);
  if (!autorizado) {
    res.status(403).json({ error: 'No tenés permisos para realizar esta acción.' });
    return;
  }

  const { id } = req.params;
  const t = await sequelize.transaction();
  try {
    await Producto.destroy({ where: { id }, transaction: t });
    await t.commit();
    res.sendStatus(204);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: 'Error al eliminar la producto' });
  }
};



export const obtenerProducto = async (req: Request, res: Response) => {
  try {
    const id = req.params.id; 
    const producto = await Producto.findByPk(id);

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrada' });
    }

    res.status(200).json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la producto' });
  }
};

export const cargarProductos = async (req: Request, res: Response) => {
  try {
    const productos = await Producto.findAll(); 
    res.status(200).json(productos);
  } catch (error) {
    console.error("Error al listar productos:", error);
    res.status(500).json({ error: 'Error al obtener las productos' });
  }
};

export const buscarProductosPorNombre = async (req: Request, res: Response) => {
  const { nombre } = req.query;
  try {
    const productos = await Producto.findAll({
      where: nombre
        ? { nombre: { [Op.like]: `%${nombre}%` } }
        : {}
    });
    res.json(productos);
  } catch (error: any) {
    console.error('Error en buscarProductosPorNombre:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const obtenerProductos = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);

    const offset = (page - 1) * limit;
    const { rows: productos, count: total } = await Producto.findAndCountAll({
      limit, 
      offset
    });

    res.status(200).json({
      total,
      page,
      limit,
      data: productos
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las productos' });
  }
};

export const filtrarProductos = async (req: Request, res: Response) => {//talles todavia no
  try {
    const { minimo, maximo, categoria, talles } = req.body;
    const whereClause: any = {};

    if (minimo !== undefined && maximo !== undefined) {
      whereClause.precio = { [Op.between]: [minimo, maximo] };
    } else if (minimo !== undefined) {
      whereClause.precio = { [Op.gte]: minimo };
    } else if (maximo !== undefined) {
      whereClause.precio = { [Op.lte]: maximo };
    }

    if (categoria) {
      whereClause.categoria = categoria;
    }

    const tallesConditions: any[] = [];
    if (talles && typeof talles === 'object') {
      for (const [talle, cantidad] of Object.entries(talles)) {
        tallesConditions.push(
          literal(`("talles"->>'${talle}')::int >= ${cantidad}`)
        );

      }
    }

    const productos = await Producto.findAll({
      where: {
        ...whereClause,
        ...(tallesConditions.length > 0 ? { [Op.and]: tallesConditions } : {})
      }
    });

    res.status(200).json(productos);
  } catch (error) {
    console.error('Error en filtrarProductos:', error);
    res.status(500).json({ error: 'Error al filtrar las productos' });
  }
};
