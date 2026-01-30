import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Allocation = sequelize.define('Allocation', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    memberId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Members',
            key: 'id'
        }
    },
    phaseId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    taskId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    complexityId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    workloadPercent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'open'
    },
    statusUpdatedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    progress: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 100
        }
    },
    demandNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    activityName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true
    },
    priority: {
        type: DataTypes.STRING,
        allowNull: true
    },
    ticketId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

export default Allocation;
