const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const Post = require('../models/Post');
const User = require('../models/User');
const { getFileUrl } = require('./storage/storage.service');
const xpService = require('./xpService');

const postAggregationPipeline = [
    {
        $addFields: {
            effective_author_id: { $ifNull: ['$author', '$author_id'] },
        },
    },
    {
        $lookup: {
            from: 'users',
            localField: 'effective_author_id',
            foreignField: '_id',
            as: 'author',
        },
    },
    { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$comments', preserveNullAndEmptyArrays: true } },
    {
        $addFields: {
            'comments.authorId': {
                $cond: {
                    if: { $eq: [{ $type: '$comments.author' }, 'object'] },
                    then: '$comments.author._id',
                    else: '$comments.author',
                },
            },
        },
    },
    {
        $lookup: {
            from: 'users',
            localField: 'comments.authorId',
            foreignField: '_id',
            as: 'comments.authorInfo',
        },
    },
    { $unwind: { path: '$comments.authorInfo', preserveNullAndEmptyArrays: true } },
    {
        $addFields: {
            'comments.author': {
                $cond: {
                    if: '$comments.authorInfo',
                    then: {
                        _id: '$comments.authorInfo._id',
                        name: '$comments.authorInfo.name',
                        avatar_key: '$comments.authorInfo.avatar_key',
                        level: '$comments.authorInfo.level',
                    },
                    else: {
                        _id: '$comments.author',
                        name: 'Usuario Anónimo',
                        avatar_key: null,
                        avatar: null,
                        level: 1,
                    },
                },
            },
            'comments.attachments': '$comments.attachments',
        },
    },
    {
        $group: {
            _id: '$_id',
            title: { $first: '$title' },
            content: { $first: '$content' },
            course_id: { $first: '$course_id' },
            createdAt: { $first: '$createdAt' },
            updatedAt: { $first: '$updatedAt' },
            hashtags: { $first: '$hashtags' },
            attachments: { $first: '$attachments' },
            views: { $first: '$views' },
            upvote_count: { $first: { $size: { $ifNull: ['$upvoted_by', []] } } },
            downvote_count: { $first: { $size: { $ifNull: ['$downvoted_by', []] } } },
            upvoted_by: { $first: '$upvoted_by' },
            downvoted_by: { $first: '$downvoted_by' },
            author: { $first: '$author' },
            comments: {
                $push: {
                    _id: '$comments._id',
                    author: '$comments.author',
                    content: '$comments.content',
                    attachments: '$comments.attachments',
                    createdAt: '$comments.createdAt',
                    score: '$comments.score',
                    replies: '$comments.replies',
                    parentId: '$comments.parentId',
                    upvoted_by: '$comments.upvoted_by',
                    downvoted_by: '$comments.downvoted_by',
                },
            },
        },
    },
    {
        $project: {
            title: 1,
            content: 1,
            course_id: 1,
            createdAt: 1,
            updatedAt: 1,
            hashtags: 1,
            attachments: 1,
            views: 1,
            upvote_count: 1,
            downvote_count: 1,
            upvoted_by: 1,
            downvoted_by: 1,
            author: {
                _id: '$author._id',
                name: '$author.name',
                avatar_key: '$author.avatar_key',
                level: '$author.level',
            },
            comments: {
                $filter: {
                    input: '$comments',
                    as: 'comment',
                    cond: {
                        $and: [{ $ne: ['$$comment', {}] }, { $eq: ['$$comment.parentId', null] }],
                    },
                },
            },
        },
    },
];

function addUserVoteStatus(item, currentUserId) {
    if (!currentUserId) {
        item.user_vote = null;
        return;
    }
    const uid = new ObjectId(currentUserId);

    if (item.upvoted_by && item.upvoted_by.some((id) => id.equals(uid))) {
        item.user_vote = 'up';
    } else if (item.downvoted_by && item.downvoted_by.some((id) => id.equals(uid))) {
        item.user_vote = 'down';
    } else {
        item.user_vote = null;
    }

    if (item.comments) {
        item.comments.forEach((comment) => {
            addUserVoteStatus(comment, currentUserId);
            if (comment.replies) {
                comment.replies.forEach((r) => addUserVoteStatus(r, currentUserId));
            }
        });
    }
}

function addUrlsToItems(items) {
    if (!items) {
        return;
    }
    for (const item of items) {
        if (item.author && item.author.avatar_key) {
            item.author.avatar = getFileUrl(item.author.avatar_key);
        }
        if (item.attachments) {
            item.attachments.forEach((att) => {
                if (att.object_key) {
                    att.url = getFileUrl(att.object_key);
                }
            });
        }
        if (item.comments) {
            addUrlsToItems(item.comments);
        }
        if (item.replies) {
            addUrlsToItems(item.replies);
        }
    }
}

function sortComments(comments) {
    if (!comments) {
        return;
    }
    comments.sort((a, b) => (b.score || 0) - (a.score || 0));
    for (const c of comments) {
        if (c.replies) {
            sortComments(c.replies);
        }
    }
}

function findCommentRecursive(comments, targetCommentId) {
    for (const comment of comments) {
        if (comment._id.equals(targetCommentId)) {
            return comment;
        }
        if (comment.replies && comment.replies.length > 0) {
            const found = findCommentRecursive(comment.replies, targetCommentId);
            if (found) {
                return found;
            }
        }
    }
    return null;
}

async function populateAuthors(comments) {
    for (const comment of comments) {
        let authorId = null;
        if (comment.author && comment.author._id) {
            authorId = new ObjectId(comment.author._id);
        } else if (comment.author) {
            authorId = new ObjectId(comment.author);
        }

        if (authorId) {
            const author = await User.findById(authorId);
            if (author) {
                comment.author = {
                    _id: author._id,
                    name: author.name,
                    avatar_key: author.avatar_key,
                    level: author.level || 1,
                };
            } else {
                comment.author = { name: 'Usuario Eliminado' };
            }
        } else {
            comment.author = { name: 'Usuario Anónimo' };
        }

        if (comment.replies && comment.replies.length > 0) {
            await populateAuthors(comment.replies);
        }
    }
}

async function getAggregatedPost(postId) {
    const posts = await mongoose.connection.db
        .collection('posts')
        .aggregate([{ $match: { _id: new ObjectId(postId) } }, ...postAggregationPipeline])
        .toArray();
    return posts[0];
}

async function getPaginatedPosts(page, limit) {
    const skip = (page - 1) * limit;
    const totalPosts = await Post.countDocuments();
    const posts = await mongoose.connection.db
        .collection('posts')
        .aggregate([
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            ...postAggregationPipeline,
        ])
        .toArray();

    return {
        posts,
        totalPosts,
        totalPages: Math.ceil(totalPosts / limit),
        hasNextPage: page * limit < totalPosts,
    };
}

async function createPostDocument(data) {
    const { title, content, course, hashtags, attachments, authorId } = data;
    const newPost = {
        title,
        content,
        course_id: course,
        hashtags,
        attachments: attachments || [],
        author: new ObjectId(authorId),
        createdAt: new Date(),
        updatedAt: new Date(),
        upvote_count: 0,
        downvote_count: 0,
        upvoted_by: [],
        downvoted_by: [],
        comments: [],
        views: 0,
    };

    const result = await mongoose.connection.db.collection('posts').insertOne(newPost);
    await xpService.addXP(authorId, 10, { totalPosts: 1 });
    return result.insertedId;
}

async function handleVote(userId, post, voteType) {
    if (!['up', 'down'].includes(voteType)) {
        throw new Error('Invalid vote type');
    }

    const uid = new ObjectId(userId);
    const alreadyUp = post.upvoted_by ? post.upvoted_by.some((id) => id.equals(uid)) : false;
    const alreadyDown = post.downvoted_by ? post.downvoted_by.some((id) => id.equals(uid)) : false;

    const collection = mongoose.connection.db.collection('posts');
    let voteAdded = false;

    if (voteType === 'up') {
        if (alreadyUp) {
            await collection.updateOne(
                { _id: post._id },
                { $inc: { upvote_count: -1 }, $pull: { upvoted_by: uid } },
            );
        } else {
            const update = { $inc: { upvote_count: 1 }, $addToSet: { upvoted_by: uid } };
            if (alreadyDown) {
                update.$inc.downvote_count = -1;
                update.$pull = { downvoted_by: uid };
            }
            await collection.updateOne({ _id: post._id }, update);
            voteAdded = true;
            if (post.author.toString() !== userId) {
                await xpService.addXP(post.author.toString(), 5, { totalLikesReceived: 1 });
            }
        }
    } else {
        if (alreadyDown) {
            await collection.updateOne(
                { _id: post._id },
                { $inc: { downvote_count: -1 }, $pull: { downvoted_by: uid } },
            );
        } else {
            const update = { $inc: { downvote_count: 1 }, $addToSet: { downvoted_by: uid } };
            if (alreadyUp) {
                update.$inc.upvote_count = -1;
                update.$pull = { upvoted_by: uid };
            }
            await collection.updateOne({ _id: post._id }, update);
            voteAdded = true;
        }
    }

    return { voteAdded };
}

module.exports = {
    getPaginatedPosts,
    getAggregatedPost,
    createPostDocument,
    handleVote,
    addUserVoteStatus,
    addUrlsToItems,
    sortComments,
    findCommentRecursive,
    populateAuthors,
};
