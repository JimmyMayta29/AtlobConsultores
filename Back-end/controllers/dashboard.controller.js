const { Article, Category, Comment, User, Media } = require('../models');
const { sequelize } = require('../config/db.config');
const { Op } = require('sequelize');

/**
 * GET /api/admin/dashboard/stats
 * General dashboard metrics
 */
const getStats = async (req, res, next) => {
  try {
    // Article counts by status
    const totalArticles = await Article.count();
    const publishedArticles = await Article.count({ where: { status: 'published' } });
    const draftArticles = await Article.count({ where: { status: 'draft' } });
    const archivedArticles = await Article.count({ where: { status: 'archived' } });

    // Total views
    const viewsResult = await Article.sum('views');
    const totalViews = viewsResult || 0;

    // Articles by category
    const articlesByCategory = await Category.findAll({
      attributes: [
        'id', 'name', 'slug', 'color',
        [
          sequelize.literal(
            '(SELECT COUNT(*) FROM articles WHERE articles.category_id = Category.id)'
          ),
          'articleCount',
        ],
      ],
      order: [['order', 'ASC']],
    });

    // Top 5 most viewed articles
    const topArticles = await Article.findAll({
      where: { status: 'published' },
      attributes: ['id', 'title', 'slug', 'views', 'publishedAt'],
      order: [['views', 'DESC']],
      limit: 5,
    });

    // This month's published articles
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const publishedThisMonth = await Article.count({
      where: {
        status: 'published',
        publishedAt: { [Op.gte]: startOfMonth },
      },
    });

    // Pending comments
    const pendingComments = await Comment.count({
      where: { isApproved: false },
    });

    // Recent articles (last 5)
    const recentArticles = await Article.findAll({
      include: [
        { model: User, as: 'author', attributes: ['id', 'name'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'color'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    // Total media
    const totalMedia = await Media.count();

    // Total users
    const totalUsers = await User.count();

    res.json({
      success: true,
      data: {
        articles: {
          total: totalArticles,
          published: publishedArticles,
          drafts: draftArticles,
          archived: archivedArticles,
          publishedThisMonth,
        },
        totalViews,
        articlesByCategory,
        topArticles,
        recentArticles,
        pendingComments,
        totalMedia,
        totalUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats };
