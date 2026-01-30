import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Member - Team member profiles
 */
const Member = sequelize.define('Member', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    roleType: {
        type: DataTypes.STRING,
        allowNull: true
    },
    roleTierId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    costCenterId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    defaultCoaId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    maxCapacity: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: false,
        defaultValue: 1.0
    },
    maxHoursPerWeek: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 40
    },
    hourlyRate: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'Members'
});

export default Member;
