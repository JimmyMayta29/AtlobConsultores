const User = require('./user.model');
const Article = require('./article.model');
const Category = require('./category.model');
const Tag = require('./tag.model');
const ArticleTag = require('./articleTag.model');
const Media = require('./media.model');
const Comment = require('./comment.model');

// =============================================
// ASSOCIATIONS
// =============================================

// User 1:N Article (author)
User.hasMany(Article, { foreignKey: 'author_id', as: 'articles' });
Article.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

// Category 1:N Article
Category.hasMany(Article, { foreignKey: 'category_id', as: 'articles' });
Article.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Article N:M Tag (through ArticleTag)
Article.belongsToMany(Tag, {
  through: ArticleTag,
  foreignKey: 'article_id',
  otherKey: 'tag_id',
  as: 'tags',
});
Tag.belongsToMany(Article, {
  through: ArticleTag,
  foreignKey: 'tag_id',
  otherKey: 'article_id',
  as: 'articles',
});

// Article 1:N Comment
Article.hasMany(Comment, { foreignKey: 'article_id', as: 'comments' });
Comment.belongsTo(Article, { foreignKey: 'article_id', as: 'article' });

// Comment self-relation (nested replies)
Comment.hasMany(Comment, { foreignKey: 'parent_id', as: 'replies' });
Comment.belongsTo(Comment, { foreignKey: 'parent_id', as: 'parent' });

// Article 1:N Media
Article.hasMany(Media, { foreignKey: 'article_id', as: 'media' });
Media.belongsTo(Article, { foreignKey: 'article_id', as: 'article' });

// User 1:N Media (uploader)
User.hasMany(Media, { foreignKey: 'uploaded_by', as: 'uploads' });
Media.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

module.exports = {
  User,
  Article,
  Category,
  Tag,
  ArticleTag,
  Media,
  Comment,
};
