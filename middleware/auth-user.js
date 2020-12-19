'use strict';

const auth = require('basic-auth');
const bcryptjs = require('bcryptjs');
const { User } = require('../models');

// Middleware to authenticate the request using Basic Authentication.
async function authenticateUser(req, res, next) {

    let message; // store the message to display.

    // Parse the user's credentials from the Authorization header.
    const credentials = auth(req);

    // If the user's credentials are available
        // Attempt to retrieve the user from the data store
        // by their emailAddress 
    if(credentials) {
        const user = await User.findOne({
            attributes: ['id', 'firstName', 'lastName', 'password'],
            where: { emailAddress: credentials.name },
            raw: true
        });

        // If a user was found for the provided email address, then check that user's stored hashed     password against the clear text password given using bcryptjs.
        if(user) {
            const authenticated = bcryptjs.compareSync(credentials.pass, user.password);

            // If the password comparison succeeds, set the user on the request so that each following middleware function has access to it.
            if(authenticated) {
                req.currentUser = user; // means that you're adding a property named currentUser to the request object and setting it to the authenticated user
            } else {
                message = `Authentication failure for User: ${user.username}`;
            }

        } else {
            message = `User not found for username: ${credentials.name}`;
        }

    } else {
        message = `Auth header not found`;
    }

    // If user authentication failed...
        // Return a response with a 401 Unauthorized HTTP status code.
    if (message) {
        console.warn(message);
        res.status(401).json({ message: 'Access Denied' });
    // Otherwise proceeds.    
    } else {
        next();
    }


};

module.exports = { authenticateUser };