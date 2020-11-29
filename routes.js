'use strict';

const express = require('express');
const { asyncHandler } = require('./middleware/async-handler');
//const { authenticateUser } = require('./middleware/auth-user');
const { User, Course } = require('./models');

// Construct a router instance
const router = express.Router();

// GET /api/users 200 - Returns the currently authenticated user.
router.get('/users',  asyncHandler(async(req, res) => {
    const users = await User.findAll();

    res.json( users );

}));

// POST /api/users 201 - Creates a user, sets the Location header to "/", and returns no content.
router.post('/users', asyncHandler(async (req, res) => {

    try {
        await User.create(req.body);
        res.status(201).json({ "message": "Account succesfully created!"});
    } catch(error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });   
            } else {
            throw error;
            }
    }

}));

// GET /api/courses 200 - Returns a list of courses (including the user that owns each course).
router.get('/courses', asyncHandler(async(req, res) => {
    let courses = await Course.findAll({
        include: [{
            model: User,
            as: 'owner',
        }]
    })
    res.json(courses);
}));

// GET /api/courses/:id 200 - Returns the course (including the user that owns the course) for the provided course ID. OKKKKKKKKK
router.get('/courses/:id', asyncHandler(async(req, res) => {

    try{

        const { id } = req.params;
        const course = await Course.findOne({
            where: { id: id },
            include: [{
                model: User,
                as: 'owner'
            }]
        });
        if(course) {
            res.status(200).json(course);
        } else {
            res.status(400).json({"message": "This course does not exist."});
        }
        
    } catch (error) {
        return res.status(500).send(error.message);
    }
    
}));





module.exports = router;