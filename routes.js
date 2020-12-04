'use strict';

const express = require('express');
// const { asyncHandler } = require('./middleware/async-handler');
//const { authenticateUser } = require('./middleware/auth-user');
const { User, Course } = require('./models');

// Construct a router instance
const router = express.Router();

// GET /api/users 200 - Returns the currently authenticated user.
router.get('/users', async(req, res) => {

    try {
        const users = await User.findAll();
        res.status(200).json({ users });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }

});

// POST /api/users 201 - Creates a user, sets the Location header to "/", and returns no content.
router.post('/users', async (req, res) => {

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

});

// GET /api/courses 200 - Returns a list of courses (including the user that owns each course).
router.get('/courses', async(req, res) => {

    try {
        let courses = await Course.findAll({
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

// GET /api/courses/:id 200 - Returns the course (including the user that owns the course) for the provided course ID. OKKKKKKKKK
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
router.post('/courses', async (req, res) => {

    try {
        await Course.create(req.body);
        res.status(201).json({ "message": "Course succesfully created!"});
    } catch(error) { 
        res.status(500).json({ error: error.message });      
    }

});          

// PUT /api/courses/:id 204 - Updates a course and returns no content.
router.put('/courses/:id', async(req, res) => {

    try {
        const { id } = req.params;
        const [ updated ] = await Course.update(req.body, {
            where: { id: id },
        });
        if (updated) {
            const updatedCourse = await Course.findOne({ where: { id: id } });
            return res.status(200).json({ course: updatedCourse });
        }
        throw new Error('Course not found');
    } catch(error) {
        res.status(500).json({ error: error.message });
    }

});

// DELETE /api/courses/:id 204 - Deletes a course and returns no content.
router.delete('/courses/:id', async(req, res) => {

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