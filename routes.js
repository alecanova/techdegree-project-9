'use strict';

const express = require('express');
const bcryptjs = require('bcryptjs');
const { authenticateUser } = require('./middleware/auth-user');
const { User, Course } = require('./models');


// Construct a router instance
const router = express.Router();

// GET /api/users 200 - Returns the currently authenticated user.
router.get('/users', authenticateUser, (req, res) => {

    try {
        const { password, ...user } = req.currentUser
        res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }

});

// POST /api/users 201 - Creates a user, sets the Location header to "/", and returns no content.
router.post('/users', async(req, res) => {

    let user = req.body;

    try {
        if (user.password) user.password = bcryptjs.hashSync(user.password);
        user = await User.create(req.body);
        res.location('/');
        res.status(201).json({ "message": "User successfully created!"});
    } catch(error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });   
        } else {
            next(error);
        }
    }

});

// GET /api/courses 200 - Returns a list of courses (including the user that owns each course).
router.get('/courses', async(req, res) => {

    try {
        let courses = await Course.findAll({
            attributes: {exclude: ['createdAt', 'updatedAt']},
            include: [{
                model: User,
                as: 'owner',
            }]
        })
        res.json(courses);
    } catch(error) {
        return res.status(500).json({ error: error.message });
    }

});

// GET /api/courses/:id 200 - Returns the course (including the user that owns the course) for the provided course ID.
router.get('/courses/:id', async(req, res) => {

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
        return res.status(500).json({ error: error.message });
    }
    
});

// POST /api/courses 201 - Creates a course, sets the Location header to the URI for the course, and returns no content.
router.post('/courses', authenticateUser, async (req, res) => {

    try {
        const course = await Course.create(req.body);
        res.location('/api/courses/' + course.id)
        res.status(201).json({ "message": "Course succesfully created!"});
    } catch(error) { 
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });   
        } else {
            next(error);
        }      
    }

});          

// PUT /api/courses/:id 204 - Updates a course and returns no content.
router.put('/courses/:id', authenticateUser, async(req, res) => {

    try {
        const { id } = req.params;
        const [ updated ] = await Course.update(req.body, {
            where: { id: id },
        });
        if (updated) {
            const updatedCourse = await Course.findOne({ where: { id: id } });
            return res.status(200).json({ course: updatedCourse });
        } else {
            throw new Error('Course not found');
        }
    } catch(error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });   
        } else {
            next(error);
        }      
    }

});

// DELETE /api/courses/:id 204 - Deletes a course and returns no content.
router.delete('/courses/:id', authenticateUser, async(req, res) => {

    try {
        const { id } = req.params;
        const deleted = await Course.destroy(req.body, {
            where: { id: id },
        });
        if(deleted) {
            res.status(204).json({ "message": "Course succesfully deleted." });
        }
        throw new Error("Course not found.");
    } catch(error) {
        res.status(500).json({ error: error.message });
    }

});





module.exports = router;