import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db';

export const Producto = sequelize.define('Productos',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  precio: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    precioOriginal: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    imagen: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    categorias: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    marca:{
        type: DataTypes.STRING,
        allowNull: true,   
    },
    color:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    size:{
        type: DataTypes.JSON,
        allowNull: true,
    },
    weight:{
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    fechaCreacion:{
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    caracteristicas: {
        type: DataTypes.JSON,
        allowNull: true,
    }
})