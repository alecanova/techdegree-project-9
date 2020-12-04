'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

  class User extends Model {};

  User.init({

    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "A first name is required"
        },
        notEmpty: {
          msg: "Please provide your first name",
        }, 
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "A last name is required"
        },
        notEmpty: {
          msg: "Please provide your last name",
        }, 
      }
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: "The email you entered already exists"
      },
      validate: {
        notNull: {
          msg: "An email is required"
        },
        isEmail: {
          msg: "Please provide a valid email address"
        }
      }
    },
    password: {
      type: DataTypes.VIRTUAL,
      allowNull: false,
      validate: {
        notNull: {
          msg: "A passsword is required"
        },
        notEmpty: {
          msg: "Please provide a password"
        },
        len: {
          args: [8, 16],
          msg: 'The password should be between 8 and 16 characters in length'
        }
      }
    },
  }, {
    sequelize,
    modelName: 'User',

  });

  User.associate = (models) => {
    User.hasMany(models.Course, {
      as: 'owner', //alias
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
      },
    });
  };

  return User;

};