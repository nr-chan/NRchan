const express = require('express');
const router = express.Router();
const Thread = require('../models/thread');

router.get('/', async (_, res) => {
  try {
    const pipeline = [
      {
        $facet: {
          'threads': [
            {
              $project: {
                _id: 1,
                type: { $literal: 'thread' },
                board: 1,
                subject: 1,
                content: 1,
                image: 1,
                created: 1,
                lastBump: 1,
                posterID: 1
              }
            },
            {
              $sort: { lastBump: -1 }
            },
            {
              $limit: 10
            }
          ],
          'replies': [
            {
              $lookup: {
                from: 'threads',
                localField: 'threadID',
                foreignField: '_id',
                as: 'thread'
              }
            },
            {
              $unwind: '$thread'
            },
            {
              $project: {
                _id: 1,
                type: { $literal: 'reply' },
                board: '$thread.board',
                content: 1,
                image: 1,
                created: 1,
                threadID: 1,
                posterID: 1
              }
            },
            {
              $sort: { created: -1 }
            },
            {
              $limit: 10
            }
          ]
        }
      },
      {
        $project: {
          combined: {
            $concatArrays: ['$threads', '$replies']
          }
        }
      },
      {
        $unwind: '$combined'
      },
      {
        $sort: {
          'combined.lastBump': -1,
          'combined.created': -1
        }
      },
      {
        $limit: 10
      }
    ];

    const results = await Thread.aggregate(pipeline);

    if (!results || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No recent posts found'
      });
    }

    const formattedResults = results.map(item => item.combined);

    return res.status(200).json({
      success: true,
      count: formattedResults.length,
      data: formattedResults
    });

  } catch (error) {
    console.error('Error fetching recent posts:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
