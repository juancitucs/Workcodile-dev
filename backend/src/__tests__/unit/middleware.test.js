const jwt = require('jsonwebtoken');
const config = require('../../config/env');
const authMiddleware = require('../../middleware/authMiddleware');
const optionalAuthMiddleware = require('../../middleware/optionalAuthMiddleware');
const errorHandler = require('../../middleware/errorHandler');

describe('Middleware', () => {
    describe('authMiddleware', () => {
        it('should return 401 without token', () => {
            const req = { header: () => null };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const next = jest.fn();

            authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'No token, authorization denied' });
            expect(next).not.toHaveBeenCalled();
        });

        it('should set req.user with valid token', () => {
            const user = { id: '123' };
            const token = jwt.sign({ user }, config.jwt.secret, { expiresIn: '1h' });
            const req = { header: () => token };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            authMiddleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(req.user).toEqual(user);
        });

        it('should return 401 with invalid token', () => {
            const req = { header: () => 'invalid-token' };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const next = jest.fn();

            authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('optionalAuthMiddleware', () => {
        it('should call next without token', () => {
            const req = { header: () => null };
            const res = {};
            const next = jest.fn();

            optionalAuthMiddleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(req.user).toBeUndefined();
        });

        it('should set req.user with valid token', () => {
            const user = { id: '123' };
            const token = jwt.sign({ user }, config.jwt.secret, { expiresIn: '1h' });
            const req = { header: () => token };
            const res = {};
            const next = jest.fn();

            optionalAuthMiddleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(req.user).toEqual(user);
        });

        it('should call next even with invalid token', () => {
            const req = { header: () => 'invalid-token' };
            const res = {};
            const next = jest.fn();

            optionalAuthMiddleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(req.user).toBeUndefined();
        });
    });

    describe('errorHandler', () => {
        it('should return 500 for generic errors', () => {
            const err = new Error('Something went wrong');
            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const _next = jest.fn();

            errorHandler(err, req, res, _next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Something went wrong' });
        });

        it('should return 400 for validation errors', () => {
            const err = new Error('Validation failed');
            err.name = 'ValidationError';
            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const _next = jest.fn();

            errorHandler(err, req, res, _next);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 for CastError', () => {
            const err = new Error('Cast error');
            err.name = 'CastError';
            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const _next = jest.fn();

            errorHandler(err, req, res, _next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid ID format' });
        });

        it('should return 409 for duplicate key errors', () => {
            const err = new Error('Duplicate');
            err.code = 11000;
            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const _next = jest.fn();

            errorHandler(err, req, res, _next);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ message: 'Duplicate key error' });
        });
    });
});
