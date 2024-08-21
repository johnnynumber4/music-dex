import { ObjectId } from 'mongodb';
import { dbProjectionUsers } from '.';

export async function findComments(db, postId, before, limit = 10) {
  try {
    return await db
      .collection('comments')
      .aggregate([
        {
          $match: {
            postId: new ObjectId(postId),
            ...(before && { createdAt: { $lt: before } }),
          },
        },
        { $sort: { _id: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'creator',
          },
        },
        { $unwind: '$creator' },
        { $project: dbProjectionUsers('creator.') },
      ])
      .toArray();
  } catch (error) {
    console.error('Error finding comments:', error);
    throw new Error('Failed to find comments');
  }
}

export async function insertComment(db, postId, { content, author }) {
  try {
    const comment = {
      content,
      postId: new ObjectId(postId),
      author, // Ensure this is the correct Discord user ID or identifier
      createdAt: new Date(),
    };
    const { insertedId } = await db.collection('comments').insertOne(comment);
    comment._id = insertedId;
    return comment;
  } catch (error) {
    console.error('Error inserting comment:', error);
    throw new Error('Failed to insert comment');
  }
}
