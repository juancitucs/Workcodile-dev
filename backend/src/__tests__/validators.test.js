const { validationResult } = require('express-validator');
const {
    register,
    login,
    verifyCode,
    forgotPassword,
    resetPassword,
    updateProfile,
    updateTheme,
} = require('../validators/auth.validator');
const { createPost, votePost, addComment, voteComment, updatePost } = require('../validators/post.validator');

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

        describe('addComment', () => {
            it('should pass with valid comment', async () => {
                const result = await runValidators(addComment, { content: 'Nice post!' });
                expect(result.isEmpty()).toBe(true);
            });

            it('should fail without content', async () => {
                const result = await runValidators(addComment, {});
                expect(result.isEmpty()).toBe(false);
            });

            it('should fail with content exceeding max length', async () => {
                const result = await runValidators(addComment, { content: 'x'.repeat(5001) });
                expect(result.isEmpty()).toBe(false);
            });

            it('should pass with valid parentId', async () => {
                const id = new (require('mongodb').ObjectId)().toString();
                const result = await runValidators(addComment, { content: 'Reply', parentId: id });
                expect(result.isEmpty()).toBe(true);
            });
        });

        describe('voteComment', () => {
            it('should pass with up vote', async () => {
                const result = await runValidators(voteComment, { vote: 'up' });
                expect(result.isEmpty()).toBe(true);
            });

            it('should fail with invalid vote', async () => {
                const result = await runValidators(voteComment, { vote: 'maybe' });
                expect(result.isEmpty()).toBe(false);
            });
        });

        describe('updatePost', () => {
            it('should pass with valid data', async () => {
                const result = await runValidators(updatePost, {
                    title: 'Updated Title',
                    content: 'Updated content',
                });
                expect(result.isEmpty()).toBe(true);
            });

            it('should fail without title', async () => {
                const result = await runValidators(updatePost, { content: 'Content' });
                expect(result.isEmpty()).toBe(false);
            });
        });
    });

    describe('Additional Auth Validators', () => {
        describe('forgotPassword', () => {
            it('should pass with valid email', async () => {
                const result = await runValidators(forgotPassword, { email: 'test@example.com' });
                expect(result.isEmpty()).toBe(true);
            });

            it('should fail with invalid email', async () => {
                const result = await runValidators(forgotPassword, { email: 'not-email' });
                expect(result.isEmpty()).toBe(false);
            });
        });

        describe('resetPassword', () => {
            it('should pass with valid data', async () => {
                const result = await runValidators(resetPassword, {
                    code: '123456',
                    password: 'NewPass123',
                });
                expect(result.isEmpty()).toBe(true);
            });

            it('should fail with short code', async () => {
                const result = await runValidators(resetPassword, {
                    code: '123',
                    password: 'NewPass123',
                });
                expect(result.isEmpty()).toBe(false);
            });

            it('should fail with weak password', async () => {
                const result = await runValidators(resetPassword, {
                    code: '123456',
                    password: 'weak',
                });
                expect(result.isEmpty()).toBe(false);
            });
        });

        describe('updateProfile', () => {
            it('should pass with valid data', async () => {
                const result = await runValidators(updateProfile, {
                    name: 'New Name',
                    bio: 'New bio',
                });
                expect(result.isEmpty()).toBe(true);
            });

            it('should pass with valid socialLinks', async () => {
                const result = await runValidators(updateProfile, {
                    socialLinks: [{ name: 'GitHub', url: 'https://github.com/test' }],
                });
                expect(result.isEmpty()).toBe(true);
            });

            it('should fail with invalid URL in socialLinks', async () => {
                const result = await runValidators(updateProfile, {
                    socialLinks: [{ name: 'Bad', url: 'not-a-url' }],
                });
                expect(result.isEmpty()).toBe(false);
            });
        });

        describe('updateTheme', () => {
            it('should pass with light theme', async () => {
                const result = await runValidators(updateTheme, { theme: 'light' });
                expect(result.isEmpty()).toBe(true);
            });

            it('should pass with dark theme', async () => {
                const result = await runValidators(updateTheme, { theme: 'dark' });
                expect(result.isEmpty()).toBe(true);
            });

            it('should fail with invalid theme', async () => {
                const result = await runValidators(updateTheme, { theme: 'blue' });
                expect(result.isEmpty()).toBe(false);
            });
        });
    });
});
