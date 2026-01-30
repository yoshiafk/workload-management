import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export const Cost = sequelize.define('Cost', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    resourceName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    roleType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tierLevel: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    minMonthlyCost: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    maxMonthlyCost: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    monthlyCost: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    perDayCost: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    perHourCost: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    coaId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'COAs',
            key: 'id'
        }
    }
}, {
    tableName: 'Costs'
});

export default Cost;
