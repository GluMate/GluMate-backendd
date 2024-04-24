import { check } from 'express-validator';

export const validateEmailPassword = [
    check('email').isEmail().withMessage('Invalid email address'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')   
];

export const validateEmail = [
    check('email').isEmail().withMessage('Invalid email address')  
];
