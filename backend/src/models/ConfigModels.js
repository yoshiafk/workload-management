import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Phase - Project phases based on SDLC
 */
export const Phase = sequelize.define('Phase', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    category: {
        type: DataTypes.ENUM('Project', 'Support', 'Terminal'),
        allowNull: false,
        defaultValue: 'Project'
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    isTerminal: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: 'Phases'
});

/**
 * TaskTemplate - Reusable task definitions
 */
export const TaskTemplate = sequelize.define('TaskTemplate', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phaseId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    category: {
        type: DataTypes.ENUM('Project', 'Support', 'Terminal'),
        allowNull: false,
        defaultValue: 'Project'
    }
}, {
    tableName: 'TaskTemplates'
});

/**
 * TaskEstimate - Normalized estimates per complexity level
 * Better for querying and maintainability than JSON
 */
export const TaskEstimate = sequelize.define('TaskEstimate', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    taskTemplateId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    complexityLevel: {
        type: DataTypes.STRING,
        allowNull: false
    },
    days: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0
    },
    hours: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'TaskEstimates',
    indexes: [
        {
            unique: true,
            fields: ['taskTemplateId', 'complexityLevel']
        }
    ]
});

// Phase - TaskTemplate association
Phase.hasMany(TaskTemplate, { foreignKey: 'phaseId', as: 'tasks' });
TaskTemplate.belongsTo(Phase, { foreignKey: 'phaseId', as: 'phase' });

// TaskTemplate - TaskEstimate association (no FK constraints)
TaskTemplate.hasMany(TaskEstimate, { foreignKey: 'taskTemplateId', as: 'estimates', constraints: false });
TaskEstimate.belongsTo(TaskTemplate, { foreignKey: 'taskTemplateId', as: 'taskTemplate', constraints: false });
