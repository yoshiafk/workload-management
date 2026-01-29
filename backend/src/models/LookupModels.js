import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Complexity - Task complexity levels with estimates
 */
export const Complexity = sequelize.define('Complexity', {
    level: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    label: {
        type: DataTypes.STRING,
        allowNull: false
    },
    days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    hours: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    workload: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0
    },
    color: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'Complexities'
});

/**
 * Status - Task workflow statuses
 */
export const Status = sequelize.define('Status', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    color: {
        type: DataTypes.STRING,
        allowNull: true
    },
    bgColor: {
        type: DataTypes.STRING,
        allowNull: true
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'Statuses'
});

/**
 * Tag - Task categorization labels
 */
export const Tag = sequelize.define('Tag', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    color: {
        type: DataTypes.STRING,
        allowNull: true
    },
    bgColor: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'Tags'
});

/**
 * Holiday - Public holidays and collective leave
 */
export const Holiday = sequelize.define('Holiday', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('national', 'collective'),
        allowNull: false,
        defaultValue: 'national'
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'Holidays',
    indexes: [
        {
            fields: ['year']
        },
        {
            fields: ['date']
        }
    ]
});
