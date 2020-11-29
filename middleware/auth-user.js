'use strict';

const auth = require('basic-auth');
const bcrypt = require('bcrypt');
const { User } = require('../models');

// Middleware to authenticate the request using basic-auth.
exports.authenticateUser = async (req, res, next) => {
     
    let message; // store the message to display
    const credentials = auth(req); // Parse the user's credentials from the Authorization header.

    // If the user's credentials are available...
        // Attempt to retrieve the user from the data store
    if(credentials) {
        const user = await User.findOne( {where: {emailAddress: credentials.emailAddress} } );

        // If a user was successfully retrieved from the data store...
            // Use the bcrypt npm package to compare the user's password
            // (from the Authorization header) to the user's password
            // that was retrieved from the data store.
        if(user) {
            const authenticated = bcrypt
            .compareSync(credentials.pass, user.confirmedPassword); //*check confirmed password**** */

            // If the passwords match..._
                // Store the retrieved user object on the request object
                //  so any middleware functions that follow this middleware function
                //  will have access to the user's information.
            if(authenticated) {
                console.log(`Authentication successful for: ${user.firstName} ${user.lastName}`);
                req.currentUser = user; // adding property `currentUser` to the authenticate user.
            } else {
                message = `Authentication denied for: ${user.firstName} ${user.lastName}`;
            }
        } else {
            message = `User not found for: ${credentials.emailAddress}`;
        }
    } else {
        message = 'Auth header not found';
    }

    // If user authentication failed...
        // Return a response with a 401 Unauthorized HTTP status code.
    if (message) {
        console.warn(message);
        res.status(401).json({ message: 'Access Denied' });
    
    // Or if user authentication succeeded...
    // Call the next() method.
    } else {
        next();
    }

};