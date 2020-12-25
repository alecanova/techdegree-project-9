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
        notEmpty: {
          msg: "Please provide your first name",
        }, 
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Please provide your last name",
        }, 
      }
    },
    
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: "The email you entered already exists"
      },
      validate: {
        notEmpty: {
          args: true, 
          msg: "An email is required"
        },
        isEmail: {
          args: true,
          msg: "Please provide a valid email address"
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "A passsword is required"
        },
      }
    },
  }, {
    sequelize,
    modelName: 'User',

  });

  User.associate = (models) => {
    User.hasMany(models.Course, {
      foreignKey: {
        fieldName: 'userId',
      },
    });
  };

  return User;

};