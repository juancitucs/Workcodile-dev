const { ObjectId } = require('mongodb');

// Mocks
const mockUserFindOne = jest.fn();
const mockUserFindById = jest.fn();
const mockUserFindByIdAndUpdate = jest.fn();
const mockUserSave = jest.fn();
const mockBcryptCompare = jest.fn();
const mockBcryptHash = jest.fn();
const mockBcryptGenSalt = jest.fn();
const mockJwtSign = jest.fn();
const mockSendVerificationCodeEmail = jest.fn();
const mockSendPasswordResetCodeEmail = jest.fn();
const mockGetFileUrl = jest.fn();

jest.mock('../models/User', () => {
    const MockUser = function (data) {
        Object.assign(this, data);
        this.save = mockUserSave;
    };
    MockUser.findOne = mockUserFindOne;
    MockUser.findById = mockUserFindById;
    MockUser.findByIdAndUpdate = mockUserFindByIdAndUpdate;
    return MockUser;
});

jest.mock('bcrypt', () => ({
    compare: (...args) => mockBcryptCompare(...args),
    hash: (...args) => mockBcryptHash(...args),
    genSalt: (...args) => mockBcryptGenSalt(...args),
}));

jest.mock('jsonwebtoken', () => ({
    sign: (...args) => mockJwtSign(...args),
}));

jest.mock('../services/email/email.service', () => ({
    sendVerificationCodeEmail: (...args) => mockSendVerificationCodeEmail(...args),
    sendPasswordResetCodeEmail: (...args) => mockSendPasswordResetCodeEmail(...args),
}));

jest.mock('../services/storage/storage.service', () => ({
    getFileUrl: (...args) => mockGetFileUrl(...args),
}));

jest.mock('../config/env', () => ({
    jwt: { secret: 'test-secret', expiresIn: '1h' },
    mongo: { uri: 'mongodb://fake' },
}));

const {
    sendVerificationCode,
    verifyAndRegister,
    login,
    getMe,
    updateUserTheme,
    updateProfile,
    getUserById,
    forgotPassword,
    resetPassword,
} = require('../controllers/authController');

describe('Auth Controller', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { body: {}, params: {}, user: { id: 'user123' }, headers: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();

        mockUserSave.mockResolvedValue(true);
        mockBcryptGenSalt.mockResolvedValue('salt');
        mockBcryptHash.mockResolvedValue('hashed');
        mockJwtSign.mockReturnValue('fake-jwt-token');
        mockGetFileUrl.mockReturnValue('https://files.test.com/test.jpg');
    });

    describe('sendVerificationCode', () => {
        it('should send verification code for new user', async () => {
            mockUserFindOne.mockResolvedValue(null);
            req.body = { name: 'New User', email: 'new@test.com', password: 'Pass1234' };

            await sendVerificationCode(req, res, next);

            expect(mockUserFindOne).toHaveBeenCalledWith({ email: 'new@test.com' });
            expect(mockUserSave).toHaveBeenCalled();
            expect(mockSendVerificationCodeEmail).toHaveBeenCalledWith(
                'new@test.com', 'New User', expect.any(String)
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Verification code sent. Please check your email to complete registration.',
            });
        });

        it('should resend code for unverified existing user', async () => {
            const existingUser = {
                _id: new ObjectId(),
                name: 'Existing',
                email: 'exist@test.com',
                isVerified: false,
                save: mockUserSave,
            };
            mockUserFindOne.mockResolvedValue(existingUser);
            req.body = { name: 'Existing', email: 'exist@test.com', password: 'Pass1234' };

            await sendVerificationCode(req, res, next);

            expect(mockUserSave).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(next).not.toHaveBeenCalled();
        });

        it('should reject verified existing user', async () => {
            mockUserFindOne.mockResolvedValue({
                _id: new ObjectId(),
                email: 'verified@test.com',
                isVerified: true,
            });
            req.body = { name: 'Test', email: 'verified@test.com', password: 'Pass1234' };

            await sendVerificationCode(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User already exists and is verified.',
            });
        });

        it('should call next on error', async () => {
            const error = new Error('DB error');
            mockUserFindOne.mockRejectedValue(error);
            req.body = { name: 'Test', email: 'test@test.com', password: 'Pass1234' };

            await sendVerificationCode(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('login', () => {
        it('should login with valid credentials', async () => {
            const user = {
                _id: new ObjectId(),
                email: 'user@test.com',
                password: 'hashed',
                isVerified: true,
                name: 'Test User',
                toObject: () => ({ _id: 'abc', name: 'Test User', email: 'user@test.com', password: 'hashed' }),
            };
            mockUserFindOne.mockResolvedValue(user);
            mockBcryptCompare.mockResolvedValue(true);
            req.body = { email: 'user@test.com', password: 'Pass1234' };

            await login(req, res, next);

            expect(mockBcryptCompare).toHaveBeenCalledWith('Pass1234', 'hashed');
            expect(mockJwtSign).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                token: 'fake-jwt-token',
                user: expect.objectContaining({ name: 'Test User' }),
            });
        });

        it('should reject non-existent user', async () => {
            mockUserFindOne.mockResolvedValue(null);
            req.body = { email: 'nonexist@test.com', password: 'Pass1234' };

            await login(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
        });

        it('should reject wrong password', async () => {
            mockUserFindOne.mockResolvedValue({
                _id: new ObjectId(),
                password: 'hashed',
                isVerified: true,
            });
            mockBcryptCompare.mockResolvedValue(false);
            req.body = { email: 'user@test.com', password: 'wrong' };

            await login(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
        });

        it('should reject unverified user', async () => {
            mockUserFindOne.mockResolvedValue({
                _id: new ObjectId(),
                password: 'hashed',
                isVerified: false,
            });
            mockBcryptCompare.mockResolvedValue(true);
            req.body = { email: 'unverified@test.com', password: 'Pass1234' };

            await login(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Please confirm your email address to log in.',
            });
        });

        it('should remove password from response', async () => {
            const user = {
                _id: new ObjectId(),
                password: 'hashed',
                isVerified: true,
                name: 'Test',
                email: 'test@test.com',
                toObject: () => ({
                    _id: 'abc', name: 'Test', email: 'test@test.com', password: 'hashed',
                }),
            };
            mockUserFindOne.mockResolvedValue(user);
            mockBcryptCompare.mockResolvedValue(true);
            req.body = { email: 'test@test.com', password: 'Pass1234' };

            await login(req, res, next);

            const responseBody = res.json.mock.calls[0][0];
            expect(responseBody.user.password).toBeUndefined();
        });
    });

    describe('getMe', () => {
        it('should return current user', async () => {
            mockUserFindById.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue({
                        _id: new ObjectId(),
                        name: 'Current User',
                        email: 'current@test.com',
                        avatar_key: 'avatars/me.jpg',
                    }),
                }),
            });

            await getMe(req, res, next);

            expect(mockUserFindById).toHaveBeenCalledWith('user123');
            expect(res.json).toHaveBeenCalled();
        });

        it('should return 404 if user not found', async () => {
            mockUserFindById.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue(null),
                }),
            });

            await getMe(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        });
    });

    describe('verifyAndRegister', () => {
        it('should verify user with valid code', async () => {
            const user = {
                _id: new ObjectId(),
                email: 'verify@test.com',
                isVerified: false,
                verificationCode: '123456',
                name: 'Verify User',
                save: mockUserSave,
                toObject: () => ({ _id: 'abc', name: 'Verify User', email: 'verify@test.com' }),
            };
            mockUserFindOne.mockResolvedValue(user);
            req.body = { email: 'verify@test.com', verificationCode: '123456' };

            await verifyAndRegister(req, res, next);

            expect(user.isVerified).toBe(true);
            expect(user.verificationCode).toBeUndefined();
            expect(mockUserSave).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ token: 'fake-jwt-token' })
            );
        });

        it('should reject invalid code', async () => {
            mockUserFindOne.mockResolvedValue(null);
            req.body = { email: 'bad@test.com', verificationCode: '000000' };

            await verifyAndRegister(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Invalid verification code or it has expired.',
            });
        });
    });

    describe('forgotPassword', () => {
        it('should send reset code for existing user', async () => {
            const user = {
                _id: new ObjectId(),
                email: 'reset@test.com',
                name: 'Reset User',
                save: mockUserSave,
            };
            mockUserFindOne.mockResolvedValue(user);
            req.body = { email: 'reset@test.com' };

            await forgotPassword(req, res, next);

            expect(mockSendPasswordResetCodeEmail).toHaveBeenCalledWith(
                'reset@test.com', 'Reset User', expect.any(String)
            );
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return generic message for non-existent user (security)', async () => {
            mockUserFindOne.mockResolvedValue(null);
            req.body = { email: 'nobody@test.com' };

            await forgotPassword(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'If a user with that email exists, a password reset code has been sent.',
            });
        });
    });

    describe('resetPassword', () => {
        it('should reset password with valid code', async () => {
            const user = {
                _id: new ObjectId(),
                password: 'old-hash',
                save: mockUserSave,
            };
            mockUserFindOne.mockResolvedValue(user);
            mockBcryptHash.mockResolvedValue('new-hash');
            req.body = { code: '654321', password: 'NewPass123' };

            await resetPassword(req, res, next);

            expect(user.password).toBe('new-hash');
            expect(mockUserSave).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Password has been reset successfully.',
            });
        });

        it('should reject invalid reset code', async () => {
            mockUserFindOne.mockResolvedValue(null);
            req.body = { code: '000000', password: 'NewPass123' };

            await resetPassword(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Invalid reset code or it has expired.',
            });
        });
    });

    describe('updateProfile', () => {
        it('should update user profile fields', async () => {
            const user = {
                _id: 'user123',
                name: 'Old Name',
                bio: '',
                interests: [],
                avatar_key: '',
                socialLinks: [],
                save: mockUserSave,
                toObject: () => ({
                    _id: 'user123', name: 'Updated Name', bio: 'New bio',
                    interests: ['Coding'], avatar_key: 'new-avatar', socialLinks: [],
                }),
            };
            mockUserFindById.mockResolvedValue(user);
            req.body = {
                name: 'Updated Name',
                bio: 'New bio',
                interests: ['Coding'],
                avatar_key: 'new-avatar',
            };

            await updateProfile(req, res, next);

            expect(user.name).toBe('Updated Name');
            expect(user.bio).toBe('New bio');
            expect(user.interests).toEqual(['Coding']);
            expect(user.avatar_key).toBe('new-avatar');
            expect(mockUserSave).toHaveBeenCalled();
        });

        it('should return 404 if user not found', async () => {
            mockUserFindById.mockResolvedValue(null);
            req.body = { name: 'New Name' };

            await updateProfile(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        });
    });

    describe('updateUserTheme', () => {
        it('should update theme to dark', async () => {
            mockUserFindByIdAndUpdate.mockReturnValue({
                select: jest.fn().mockResolvedValue({ _id: 'user123', theme: 'dark' }),
            });
            req.body = { theme: 'dark' };

            await updateUserTheme(req, res, next);

            expect(mockUserFindByIdAndUpdate).toHaveBeenCalledWith(
                'user123', { theme: 'dark' }, { new: true }
            );
        });

        it('should reject invalid theme value', async () => {
            req.body = { theme: 'blue' };

            await updateUserTheme(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid theme' });
        });
    });

    describe('getUserById', () => {
        it('should return user by ID', async () => {
            const userId = new ObjectId();
            mockUserFindById.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue({
                        _id: userId,
                        name: 'Target User',
                        email: 'target@test.com',
                    }),
                }),
            });
            req.params.id = userId.toString();

            await getUserById(req, res, next);

            expect(mockUserFindById).toHaveBeenCalledWith(userId.toString());
            expect(res.json).toHaveBeenCalled();
        });

        it('should return 404 for non-existent user', async () => {
            mockUserFindById.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue(null),
                }),
            });
            req.params.id = new ObjectId().toString();

            await getUserById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        });
    });
});
