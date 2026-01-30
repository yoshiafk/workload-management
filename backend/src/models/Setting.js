import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const Setting = sequelize.define('Setting', {
    key: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    value: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {}
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'general'
    },
    updatedBy: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'Settings',
    timestamps: true
});

export default Setting;
