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
        res.status(500).json({ error: error.message });
    }

});

// POST /api/users 201 - Creates a user, sets the Location header to "/", and returns no content.
router.post('/users', async(req, res, next) => {

    let user = req.body;

    try {
        if (user.password) user.password = bcryptjs.hashSync(user.password);
        user = await User.create(req.body);
        res.location('/');
        res.status(201).end();
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
        const courses = await Course.findAll({
            attributes: {exclude: ['createdAt', 'updatedAt']},
            include: {
                model: User,
                attributes:  ['id', 'firstName', 'lastName', 'emailAddress']
            }
        });
        res.json(courses);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }

});

// GET /api/courses/:id 200 - Returns the course (including the user that owns the course) for the provided course ID.
router.get('/courses/:id', async(req, res) => {

    try{
        const { id } = req.params;
        const course = await Course.findOne({
            where: { id: id },
            attributes: {exclude: ['createdAt', 'updatedAt']},
            include: [{
                model: User,
                attributes: {exclude: ['emailAddress', 'password', 'createdAt', 'updatedAt']},
            }]
        });
        if(course) {
            res.status(200).json(course);
        } else {
            res.status(404).json({"message": "This course does not exist."});
        }
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    
});

// POST /api/courses 201 - Creates a course, sets the Location header to the URI for the course, and returns no content.
router.post('/courses', authenticateUser, async (req, res, next) => {

    try {
        const course = await Course.create(req.body);
        res.location('/api/courses/' + course.id)
        res.status(201).end();
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
router.put('/courses/:id', authenticateUser, async (req, res, next) => {

        const user = req.currentUser;
        let course = await Course.findByPk(req.params.id, {
            include: User,
        });

        if (course) {

            // check if the currentUser owns the requested course.
            if (course.userId === user.id) {

                try {
                    const [updated] = await Course.update(req.body, {
                        where: { id: req.params.id }
                    });
                    if (updated) {
                        res.status(204).end();
                    } else {
                        res.sendStatus(400);
                    }

                } catch (error) {
                    if (error.name === 'SequelizeValidationError') {
                        const errors = error.errors.map(err => err.message);
                        res.status(400).json({ errors });
                    } else {
                        next(error);
                    }
                }

            } else {
                // access not allowed.
                res.sendStatus(403);
            }

        } else {
            res.sendStatus(404);
        }

    });

// DELETE /api/courses/:id 204 - Deletes a course and returns no content.
router.delete('/courses/:id', authenticateUser, async(req, res) => {

    const user = req.currentUser;
    let course = await Course.findByPk(req.params.id, {
        include: User,
    });

    if(course) {

        // check if the currentUser owns the requested course.
        if(course.userId === user.id) {

            try {
                await course.destroy();
                res.status(204).end();
            } catch(error) {
                res.status(500).json({ error: error.message });
            }

        } else {
            // access not allowed.
            res.sendStatus(403);
        }

    } else {
        res.sendStatus(404);
    }

});


module.exports = router;