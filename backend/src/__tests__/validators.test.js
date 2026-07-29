const { validationResult } = require('express-validator');
const { register, login, verifyCode } = require('../validators/auth.validator');
const { createPost, votePost } = require('../validators/post.validator');

function runValidators(validators, body) {
    const req = { body, params: {}, query: {} };
    return new Promise((resolve) => {
        let validationChain = Promise.resolve();
        validators.forEach((v) => {
            validationChain = validationChain.then(() => v.run(req));
        });
        validationChain.then(() => {
            resolve(validationResult(req));
        });
    });
}

describe('Validators', () => {
    describe('Auth Validators', () => {
        describe('register', () => {
            it('should pass with valid data', async () => {
                const result = await runValidators(register, {
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'Test1234',
                });
                expect(result.isEmpty()).toBe(true);
            });

            it('should fail without name', async () => {
                const result = await runValidators(register, {
                    email: 'test@example.com',
                    password: 'Test1234',
                });
                expect(result.isEmpty()).toBe(false);
            });

            it('should fail with invalid email', async () => {
                const result = await runValidators(register, {
                    name: 'Test',
                    email: 'not-an-email',
                    password: 'Test1234',
                });
                expect(result.isEmpty()).toBe(false);
            });

            it('should fail with short password', async () => {
                const result = await runValidators(register, {
                    name: 'Test',
                    email: 'test@example.com',
                    password: '12',
                });
                expect(result.isEmpty()).toBe(false);
            });
        });

        describe('login', () => {
            it('should pass with valid credentials', async () => {
                const result = await runValidators(login, {
                    email: 'test@example.com',
                    password: 'password',
                });
                expect(result.isEmpty()).toBe(true);
            });

            it('should fail without email', async () => {
                const result = await runValidators(login, { password: 'pass' });
                expect(result.isEmpty()).toBe(false);
            });
        });

        describe('verifyCode', () => {
            it('should pass with valid code', async () => {
                const result = await runValidators(verifyCode, {
                    email: 'test@example.com',
                    verificationCode: '123456',
                });
                expect(result.isEmpty()).toBe(true);
            });

            it('should fail with wrong length code', async () => {
                const result = await runValidators(verifyCode, {
                    email: 'test@example.com',
                    verificationCode: '123',
                });
                expect(result.isEmpty()).toBe(false);
            });
        });
    });

    describe('Post Validators', () => {
        describe('createPost', () => {
            it('should pass with valid post data', async () => {
                const result = await runValidators(createPost, {
                    title: 'Test Post',
                    content: 'This is test content',
                    course: 'INF101',
                });
                expect(result.isEmpty()).toBe(true);
            });

            it('should fail without title', async () => {
                const result = await runValidators(createPost, {
                    content: 'Content',
                    course: 'INF101',
                });
                expect(result.isEmpty()).toBe(false);
            });

            it('should fail without course', async () => {
                const result = await runValidators(createPost, {
                    title: 'Title',
                    content: 'Content',
                });
                expect(result.isEmpty()).toBe(false);
            });
        });

        describe('votePost', () => {
            it('should pass with up vote', async () => {
                const result = await runValidators(votePost, { vote: 'up' });
                expect(result.isEmpty()).toBe(true);
            });

            it('should pass with down vote', async () => {
                const result = await runValidators(votePost, { vote: 'down' });
                expect(result.isEmpty()).toBe(true);
            });

            it('should fail with invalid vote', async () => {
                const result = await runValidators(votePost, { vote: 'invalid' });
                expect(result.isEmpty()).toBe(false);
            });
        });
    });
});
