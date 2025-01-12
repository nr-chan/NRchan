const express = require('express');
const router = express.Router();
const Thread = require('../models/thread');
const { redisCacheMiddleware } = require('../utils/redis');
router.get('/', (_, res) => {
  res.json(['p', 'cp', 'n', 's', 'v', 'k', 'a', 'c', 'T', 'Sp', 'Ph', 'm', 'G', 'r', 'd', 'Con', 'GIF', 'Rnt']); // Example boards
});

router.get('/data',redisCacheMiddleware(),async (_, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: "$board",
          totalThreads: { $sum: 1 },
          totalPosts: {
            $sum: { $add: [{ $size: "$replies" }, 1] }
          }
        }
      },
      {
        $project: {
          board: "$_id",
          totalThreads: 1,
          totalPosts: 1,
          _id: 0
        }
      }
    ];

    const results = await Thread.aggregate(pipeline);

    if (!results || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No board found'
      });
    }


    return res.status(200).json(results);

  } catch (error) {
    console.error('Error fetching board data:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
})

router.get('/stats',redisCacheMiddleware(), async (_, res) => {
  try {

    const results = await Thread.aggregate([
      // Step 1: Group threads by posterID
      {
        $group: {
          _id: "$posterID",
          threadCount: { $sum: 1 },
          replyCount: { $sum: 0 }, // Initialize replyCount to 0 for threads
          totalCount:{ $sum: 1}
        }
      },
      // Step 2: Add replies from the replies collection
      {
        $unionWith: {
          coll: "replies",
          pipeline: [
            {
              $group: {
                _id: "$posterID",
                threadCount: { $sum: 0 }, // Initialize threadCount to 0 for replies
                replyCount: { $sum: 1 }, // Count replies
                totalCount:{ $sum: 1}
              }
            }
          ]
        }
      },
      // Step 3: Merge thread and reply counts for each posterID
      {
        $group: {
          _id: "$_id",
          threadCount: { $sum: "$threadCount" },
          replyCount: { $sum: "$replyCount" },
          totalCount: {$sum: "$totalCount"}
        }
      },
      // Step 4: Format the output
      {
        $project: {
          posterID: "$_id",
          threadCount: 1,
          replyCount: 1,
          totalCount: 1,
          _id: 0
        }
      },
      // Step 5: (Optional) Sort by thread count or reply count
      {
        $sort: { totalCount: -1 }
      }
    ]);

    if (!results || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No uuid found'
      });
    }


    return res.status(200).json(results);

  } catch (error) {
    console.error('Error fetching uuid stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
})
module.exports = router;
