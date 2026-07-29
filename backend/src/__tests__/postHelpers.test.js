const { ObjectId } = require('mongodb');
const {
    addUserVoteStatus,
    addUrlsToItems,
    sortComments,
    findCommentRecursive,
} = require('../services/post.service');

describe('Post Service - Helper Functions', () => {
    describe('addUserVoteStatus', () => {
        it('should set user_vote to null when no userId', () => {
            const item = { upvoted_by: [], downvoted_by: [] };
            addUserVoteStatus(item, null);
            expect(item.user_vote).toBeNull();
        });

        it('should set user_vote to up when user upvoted', () => {
            const uid = new ObjectId();
            const item = { upvoted_by: [uid], downvoted_by: [] };
            addUserVoteStatus(item, uid.toString());
            expect(item.user_vote).toBe('up');
        });

        it('should set user_vote to down when user downvoted', () => {
            const uid = new ObjectId();
            const item = { upvoted_by: [], downvoted_by: [uid] };
            addUserVoteStatus(item, uid.toString());
            expect(item.user_vote).toBe('down');
        });

        it('should set user_vote to null when user has not voted', () => {
            const uid = new ObjectId();
            const otherUid = new ObjectId();
            const item = { upvoted_by: [otherUid], downvoted_by: [] };
            addUserVoteStatus(item, uid.toString());
            expect(item.user_vote).toBeNull();
        });

        it('should apply to nested comments and replies', () => {
            const uid = new ObjectId();
            const item = {
                upvoted_by: [],
                downvoted_by: [],
                comments: [
                    {
                        upvoted_by: [uid],
                        downvoted_by: [],
                        replies: [{ upvoted_by: [], downvoted_by: [uid], replies: [] }],
                    },
                ],
            };
            addUserVoteStatus(item, uid.toString());
            expect(item.comments[0].user_vote).toBe('up');
            expect(item.comments[0].replies[0].user_vote).toBe('down');
        });
    });

    describe('addUrlsToItems', () => {
        it('should set avatar URL from avatar_key', () => {
            const items = [{ author: { avatar_key: 'avatars/test.jpg' } }];
            addUrlsToItems(items);
            expect(items[0].author.avatar).toContain('avatars/test.jpg');
        });

        it('should set attachment URLs from object_key', () => {
            const items = [{ attachments: [{ object_key: 'files/doc.pdf' }] }];
            addUrlsToItems(items);
            expect(items[0].attachments[0].url).toContain('files/doc.pdf');
        });

        it('should handle null items', () => {
            expect(() => addUrlsToItems(null)).not.toThrow();
        });

        it('should handle items without author or attachments', () => {
            const items = [{ title: 'test' }];
            expect(() => addUrlsToItems(items)).not.toThrow();
        });
    });

    describe('sortComments', () => {
        it('should sort comments by score descending', () => {
            const comments = [{ score: 1 }, { score: 5 }, { score: 3 }];
            sortComments(comments);
            expect(comments[0].score).toBe(5);
            expect(comments[1].score).toBe(3);
            expect(comments[2].score).toBe(1);
        });

        it('should handle null comments', () => {
            expect(() => sortComments(null)).not.toThrow();
        });

        it('should sort nested replies recursively', () => {
            const comments = [
                {
                    score: 1,
                    replies: [{ score: 10 }, { score: 2 }],
                },
            ];
            sortComments(comments);
            expect(comments[0].replies[0].score).toBe(10);
            expect(comments[0].replies[1].score).toBe(2);
        });
    });

    describe('findCommentRecursive', () => {
        it('should find a comment by ID', () => {
            const targetId = new ObjectId();
            const comments = [
                { _id: new ObjectId(), content: 'first' },
                { _id: targetId, content: 'target' },
            ];
            const found = findCommentRecursive(comments, targetId);
            expect(found).not.toBeNull();
            expect(found.content).toBe('target');
        });

        it('should find nested replies', () => {
            const targetId = new ObjectId();
            const comments = [
                {
                    _id: new ObjectId(),
                    replies: [{ _id: targetId, content: 'nested' }],
                },
            ];
            const found = findCommentRecursive(comments, targetId);
            expect(found).not.toBeNull();
            expect(found.content).toBe('nested');
        });

        it('should return null if not found', () => {
            const comments = [{ _id: new ObjectId() }];
            const found = findCommentRecursive(comments, new ObjectId());
            expect(found).toBeNull();
        });
    });
});
