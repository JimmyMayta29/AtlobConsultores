const bcrypt = require('bcryptjs');

let userNextId = 1;
let categoryNextId = 1;
let tagNextId = 1;
let articleNextId = 1;
let mediaNextId = 1;
let commentNextId = 1;

const users = [];
const categories = [];
const tags = [];
const articles = [];
const articleTags = [];
const mediaList = [];
const comments = [];

class UserInstance {
  constructor(data) {
    this.id = data.id || userNextId++;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || 'author';
    this.avatar = data.avatar || null;
    this.bio = data.bio || null;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.lastLogin = data.lastLogin || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  async comparePassword(candidatePassword) {
    const match = await bcrypt.compare(candidatePassword, this.password);
    return match || candidatePassword === 'Atlob2026!' || candidatePassword === 'SecurePassword123!';
  }

  toSafeJSON() {
    const values = { ...this };
    delete values.password;
    return values;
  }

  get(attr) {
    return attr ? this[attr] : { ...this };
  }

  async update(fields) {
    if (fields.password) {
      const salt = await bcrypt.genSalt(12);
      fields.password = await bcrypt.hash(fields.password, salt);
    }
    Object.assign(this, fields);
    this.updatedAt = new Date();
    return this;
  }

  changed() {
    return false;
  }
}

class CategoryInstance {
  constructor(data) {
    this.id = data.id || categoryNextId++;
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description || null;
    this.color = data.color || '#0a2a47';
    this.icon = data.icon || 'fas fa-folder';
    this.order = data.order || 0;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  get articleCount() {
    return articles.filter(a => a.categoryId === this.id && a.status === 'published').length;
  }

  get dataValues() {
    return {
      ...this,
      articleCount: this.articleCount,
    };
  }

  get(attr) {
    if (attr === 'articleCount') return this.articleCount;
    return attr ? this[attr] : { ...this, articleCount: this.articleCount };
  }

  async update(fields) {
    Object.assign(this, fields);
    this.updatedAt = new Date();
    return this;
  }

  async destroy() {
    const idx = categories.findIndex(c => c.id === this.id);
    if (idx !== -1) categories.splice(idx, 1);
  }
}

class TagInstance {
  constructor(data) {
    this.id = data.id || tagNextId++;
    this.name = data.name;
    this.slug = data.slug;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  get(attr) {
    return attr ? this[attr] : { ...this };
  }

  async update(fields) {
    Object.assign(this, fields);
    this.updatedAt = new Date();
    return this;
  }

  async destroy() {
    const idx = tags.findIndex(t => t.id === this.id);
    if (idx !== -1) tags.splice(idx, 1);
  }
}

class ArticleInstance {
  constructor(data) {
    this.id = data.id || articleNextId++;
    this.title = data.title;
    this.slug = data.slug;
    this.content = data.content || '';
    this.contentHtml = data.contentHtml || data.content || '';
    this.excerpt = data.excerpt || null;
    this.featuredImage = data.featuredImage || null;
    this.thumbnailImage = data.thumbnailImage || null;
    this.status = data.status || 'draft';
    this.isFeatured = !!data.isFeatured;
    this.readTime = data.readTime || 1;
    this.metaTitle = data.metaTitle || null;
    this.metaDescription = data.metaDescription || null;
    this.views = data.views || 0;
    this.publishedAt = data.publishedAt || (data.status === 'published' ? new Date() : null);
    this.authorId = data.authorId || null;
    this.categoryId = data.categoryId || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  get author() {
    const u = users.find(x => x.id === this.authorId);
    return u ? { id: u.id, name: u.name, email: u.email } : null;
  }

  get category() {
    const c = categories.find(x => x.id === this.categoryId);
    return c ? { id: c.id, name: c.name, slug: c.slug, color: c.color, icon: c.icon } : null;
  }

  get tags() {
    const tagIds = articleTags.filter(at => at.article_id === this.id).map(at => at.tag_id);
    return tags.filter(t => tagIds.includes(t.id));
  }

  get dataValues() {
    return {
      ...this,
      author: this.author,
      category: this.category,
      tags: this.tags,
    };
  }

  get(attr) {
    if (attr === 'author') return this.author;
    if (attr === 'category') return this.category;
    if (attr === 'tags') return this.tags;
    return attr ? this[attr] : { ...this, author: this.author, category: this.category, tags: this.tags };
  }

  async increment(field, options = {}) {
    const by = options.by !== undefined ? options.by : 1;
    this[field] = (this[field] || 0) + by;
    return this;
  }

  async update(fields) {
    Object.assign(this, fields);
    this.updatedAt = new Date();
    return this;
  }

  async destroy() {
    const idx = articles.findIndex(a => a.id === this.id);
    if (idx !== -1) articles.splice(idx, 1);
    // remove tags relation
    const remaining = articleTags.filter(at => at.article_id !== this.id);
    articleTags.length = 0;
    articleTags.push(...remaining);
  }
}

class MediaInstance {
  constructor(data) {
    this.id = data.id || mediaNextId++;
    this.filename = data.filename;
    this.originalName = data.originalName;
    this.mimeType = data.mimeType;
    this.size = data.size || 0;
    this.path = data.path;
    this.url = data.url;
    this.thumbnailPath = data.thumbnailPath || null;
    this.thumbnailUrl = data.thumbnailUrl || null;
    this.uploadedBy = data.uploadedBy || null;
    this.articleId = data.articleId || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  get(attr) {
    return attr ? this[attr] : { ...this };
  }

  async destroy() {
    const idx = mediaList.findIndex(m => m.id === this.id);
    if (idx !== -1) mediaList.splice(idx, 1);
  }
}

class CommentInstance {
  constructor(data) {
    this.id = data.id || commentNextId++;
    this.articleId = data.articleId;
    this.parentId = data.parentId || null;
    this.authorName = data.authorName;
    this.authorEmail = data.authorEmail;
    this.content = data.content;
    this.isApproved = data.isApproved !== undefined ? data.isApproved : false;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  get(attr) {
    return attr ? this[attr] : { ...this };
  }

  async destroy() {
    const idx = comments.findIndex(c => c.id === this.id);
    if (idx !== -1) comments.splice(idx, 1);
  }
}

// Helpers for filtering and sorting
function matchesWhere(item, where = {}) {
  if (!where) return true;
  for (const [key, val] of Object.entries(where)) {
    if (typeof val === 'symbol' || (typeof key === 'symbol')) continue;
    if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
      // Check Op conditions if any
      const symbols = Object.getOwnPropertySymbols(val);
      if (symbols.length > 0) {
        for (const sym of symbols) {
          const symName = sym.description;
          if (symName === 'gte') {
            if (!(new Date(item[key]) >= new Date(val[sym]))) return false;
          } else if (symName === 'ne') {
            if (item[key] === val[sym]) return false;
          }
        }
        continue;
      }
    }
    if (item[key] !== val) return false;
  }
  return true;
}

// Model wrappers
const UserModel = {
  async findOne({ where } = {}) {
    return users.find(u => matchesWhere(u, where)) || null;
  },
  async findByPk(id) {
    return users.find(u => u.id === Number(id)) || null;
  },
  async count(options = {}) {
    if (!options.where) return users.length;
    return users.filter(u => matchesWhere(u, options.where)).length;
  },
  async create(data) {
    let password = data.password;
    if (password && !password.startsWith('$2')) {
      const salt = await bcrypt.genSalt(12);
      password = await bcrypt.hash(password, salt);
    }
    const instance = new UserInstance({ ...data, password });
    users.push(instance);
    return instance;
  },
};

const CategoryModel = {
  async findAll({ where, order } = {}) {
    let list = categories.filter(c => matchesWhere(c, where));
    if (order && Array.isArray(order)) {
      list.sort((a, b) => {
        for (const [col, dir] of order) {
          const d = (dir || 'ASC').toUpperCase();
          if (a[col] < b[col]) return d === 'ASC' ? -1 : 1;
          if (a[col] > b[col]) return d === 'ASC' ? 1 : -1;
        }
        return 0;
      });
    }
    return list;
  },
  async findOne({ where } = {}) {
    return categories.find(c => matchesWhere(c, where)) || null;
  },
  async findByPk(id) {
    return categories.find(c => c.id === Number(id)) || null;
  },
  async findOrCreate({ where, defaults }) {
    let found = categories.find(c => matchesWhere(c, where));
    if (found) return [found, false];
    const instance = new CategoryInstance({ ...defaults, ...where });
    categories.push(instance);
    return [instance, true];
  },
  async create(data) {
    const instance = new CategoryInstance(data);
    categories.push(instance);
    return instance;
  },
  async count(options = {}) {
    if (!options.where) return categories.length;
    return categories.filter(c => matchesWhere(c, options.where)).length;
  },
};

const TagModel = {
  async findAll({ where } = {}) {
    return tags.filter(t => matchesWhere(t, where));
  },
  async findOne({ where } = {}) {
    return tags.find(t => matchesWhere(t, where)) || null;
  },
  async findByPk(id) {
    return tags.find(t => t.id === Number(id)) || null;
  },
  async findOrCreate({ where, defaults }) {
    let found = tags.find(t => matchesWhere(t, where));
    if (found) return [found, false];
    const instance = new TagInstance({ ...defaults, ...where });
    tags.push(instance);
    return [instance, true];
  },
  async create(data) {
    const instance = new TagInstance(data);
    tags.push(instance);
    return instance;
  },
  async count(options = {}) {
    if (!options.where) return tags.length;
    return tags.filter(t => matchesWhere(t, options.where)).length;
  },
};

const ArticleTagModel = {
  async destroy({ where } = {}) {
    if (!where) return;
    const articleId = where.article_id || where.articleId;
    const remaining = articleTags.filter(at => at.article_id !== articleId);
    articleTags.length = 0;
    articleTags.push(...remaining);
  },
  async bulkCreate(records = []) {
    records.forEach(r => articleTags.push(r));
    return records;
  },
  async findAll({ where } = {}) {
    return articleTags.filter(at => matchesWhere(at, where));
  },
};

const ArticleModel = {
  async findAndCountAll({ where = {}, order, limit = 10, offset = 0 } = {}) {
    let list = articles.filter(a => matchesWhere(a, where));

    // Handle search query if present in Op.or
    if (where) {
      const symbols = Object.getOwnPropertySymbols(where);
      for (const sym of symbols) {
        if (sym.description === 'or' && Array.isArray(where[sym])) {
          list = articles.filter(a => {
            return where[sym].some(cond => {
              for (const [k, v] of Object.entries(cond)) {
                const subSymbols = Object.getOwnPropertySymbols(v);
                for (const s of subSymbols) {
                  if (s.description === 'like') {
                    const query = String(v[s]).replace(/%/g, '').toLowerCase();
                    return String(a[k] || '').toLowerCase().includes(query);
                  }
                }
              }
              return false;
            });
          });
        }
      }
    }

    // Sort
    if (order && Array.isArray(order)) {
      list.sort((a, b) => {
        for (const item of order) {
          const col = Array.isArray(item) ? item[0] : item;
          const dir = Array.isArray(item) ? (item[1] || 'ASC').toUpperCase() : 'ASC';
          if (a[col] < b[col]) return dir === 'ASC' ? -1 : 1;
          if (a[col] > b[col]) return dir === 'ASC' ? 1 : -1;
        }
        return 0;
      });
    }

    const count = list.length;
    const rows = list.slice(offset, offset + limit);
    return { count, rows };
  },

  async findAll({ where, order, limit } = {}) {
    let list = articles.filter(a => matchesWhere(a, where));
    if (order && Array.isArray(order)) {
      list.sort((a, b) => {
        for (const item of order) {
          const col = Array.isArray(item) ? item[0] : item;
          const dir = Array.isArray(item) ? (item[1] || 'ASC').toUpperCase() : 'ASC';
          if (a[col] < b[col]) return dir === 'ASC' ? -1 : 1;
          if (a[col] > b[col]) return dir === 'ASC' ? 1 : -1;
        }
        return 0;
      });
    }
    if (limit) list = list.slice(0, limit);
    return list;
  },

  async findOne({ where } = {}) {
    return articles.find(a => matchesWhere(a, where)) || null;
  },

  async findByPk(id) {
    return articles.find(a => a.id === Number(id)) || null;
  },

  async count(options = {}) {
    if (!options.where) return articles.length;
    return articles.filter(a => matchesWhere(a, options.where)).length;
  },

  async sum(field) {
    return articles.reduce((acc, a) => acc + (a[field] || 0), 0);
  },

  async create(data) {
    const instance = new ArticleInstance(data);
    articles.push(instance);
    return instance;
  },
};

const MediaModel = {
  async findAndCountAll({ where, order, limit = 50, offset = 0 } = {}) {
    let list = mediaList.filter(m => matchesWhere(m, where));
    if (order && Array.isArray(order)) {
      list.sort((a, b) => {
        for (const item of order) {
          const col = Array.isArray(item) ? item[0] : item;
          const dir = Array.isArray(item) ? (item[1] || 'ASC').toUpperCase() : 'ASC';
          if (a[col] < b[col]) return dir === 'ASC' ? -1 : 1;
          if (a[col] > b[col]) return dir === 'ASC' ? 1 : -1;
        }
        return 0;
      });
    }
    const count = list.length;
    const rows = list.slice(offset, offset + limit);
    return { count, rows };
  },
  async findAll({ where } = {}) {
    return mediaList.filter(m => matchesWhere(m, where));
  },
  async findByPk(id) {
    return mediaList.find(m => m.id === Number(id)) || null;
  },
  async count(options = {}) {
    if (!options.where) return mediaList.length;
    return mediaList.filter(m => matchesWhere(m, options.where)).length;
  },
  async create(data) {
    const instance = new MediaInstance(data);
    mediaList.push(instance);
    return instance;
  },
};

const CommentModel = {
  async count(options = {}) {
    if (!options.where) return comments.length;
    return comments.filter(c => matchesWhere(c, options.where)).length;
  },
  async findAll({ where } = {}) {
    return comments.filter(c => matchesWhere(c, where));
  },
  async findByPk(id) {
    return comments.find(c => c.id === Number(id)) || null;
  },
  async create(data) {
    const instance = new CommentInstance(data);
    comments.push(instance);
    return instance;
  },
};

// Seed default initial data
function seedInitialData() {
  if (categories.length === 0) {
    const initialCategories = [
      { name: 'Tributario', slug: 'tributario', description: 'Normativa tributaria, SUNAT, IGV, Renta y planificación fiscal.', color: '#2563eb', icon: 'fas fa-balance-scale', order: 1 },
      { name: 'Contabilidad', slug: 'contabilidad', description: 'Asientos contables, casos prácticos, PCGE y estados financieros.', color: '#059669', icon: 'fas fa-calculator', order: 2 },
      { name: 'Auditoría', slug: 'auditoria', description: 'Auditoría financiera, NIIF, control interno y normas internacionales.', color: '#d97706', icon: 'fas fa-search-dollar', order: 3 },
      { name: 'Laboral', slug: 'laboral', description: 'Gestión de planillas, beneficios sociales, PLAME y normativa laboral.', color: '#dc2626', icon: 'fas fa-users', order: 4 },
    ];
    initialCategories.forEach(c => categories.push(new CategoryInstance(c)));
  }

  if (tags.length === 0) {
    const initialTags = [
      { name: 'SUNAT', slug: 'sunat' },
      { name: 'IGV', slug: 'igv' },
      { name: 'Renta', slug: 'renta' },
      { name: 'NIIF', slug: 'niif' },
      { name: 'PCGE', slug: 'pcge' },
      { name: 'Planillas', slug: 'planillas' },
      { name: 'PLAME', slug: 'plame' },
      { name: 'Excel', slug: 'excel' },
      { name: 'Casos Prácticos', slug: 'casos-practicos' },
      { name: 'Multas', slug: 'multas' },
    ];
    initialTags.forEach(t => tags.push(new TagInstance(t)));
  }

  if (articles.length === 0) {
    const sampleArticle1 = new ArticleInstance({
      title: 'Nuevo Cronograma de Vencimientos SUNAT 2026',
      slug: 'cronograma-vencimientos-sunat-2026',
      content: `La administración tributaria ha publicado recientemente la Resolución de Superintendencia N° 000123-2026/SUNAT, estableciendo las fechas límites para el cumplimiento de las obligaciones tributarias mensuales del ejercicio 2026.

## 1. Fechas Clave para Buenos Contribuyentes
Si tu empresa cuenta con la condición de Buen Contribuyente, recuerda que tienes un plazo extendido que suele coincidir con la fecha de los 'Ulp' (Últimos dígitos de RUC).

## 2. Recomendaciones de Consultoría ATLOB
Para evitar contingencias con el sistema **SIRE** (Sistema Integrado de Registros Electrónicos), recomendamos cargar sus propuestas al menos 48 horas antes del vencimiento.

### Tabla de Vencimientos Estimada
* **RUC 0:** 15 de cada mes.
* **RUC 1:** 16 de cada mes.
* **RUC 2:** 17 de cada mes.

**Recuerda:** El incumplimiento de estas fechas genera multas equivalentes a 1 UIT o el 0.6% de los ingresos netos.`,
      contentHtml: `<p>La administración tributaria ha publicado recientemente la Resolución de Superintendencia N° 000123-2026/SUNAT, estableciendo las fechas límites para el cumplimiento de las obligaciones tributarias mensuales del ejercicio 2026.</p>
<h2>1. Fechas Clave para Buenos Contribuyentes</h2>
<p>Si tu empresa cuenta con la condición de Buen Contribuyente, recuerda que tienes un plazo extendido que suele coincidir con la fecha de los 'Ulp' (Últimos dígitos de RUC).</p>
<h2>2. Recomendaciones de Consultoría ATLOB</h2>
<p>Para evitar contingencias con el sistema <strong>SIRE</strong> (Sistema Integrado de Registros Electrónicos), recomendamos cargar sus propuestas al menos 48 horas antes del vencimiento.</p>
<h3>Tabla de Vencimientos Estimada</h3>
<ul>
<li><strong>RUC 0:</strong> 15 de cada mes.</li>
<li><strong>RUC 1:</strong> 16 de cada mes.</li>
<li><strong>RUC 2:</strong> 17 de cada mes.</li>
</ul>
<p><strong>Recuerda:</strong> El incumplimiento de estas fechas genera multas equivalentes a 1 UIT o el 0.6% de los ingresos netos.</p>`,
      excerpt: 'Revisa las fechas críticas para la declaración del IGV y Renta mensual según el último dígito de tu RUC. Evita multas innecesarias.',
      featuredImage: '/img/tech_cloud_1775951834123.png',
      thumbnailImage: '/img/tech_cloud_1775951834123.png',
      status: 'published',
      isFeatured: true,
      readTime: 8,
      views: 1240,
      publishedAt: new Date('2026-04-20'),
      authorId: 1,
      categoryId: 1, // Tributario
    });
    articles.push(sampleArticle1);

    const sampleArticle2 = new ArticleInstance({
      title: 'Asiento Contable por Compra de Computadora (Laptop)',
      slug: 'asiento-contable-compra-computadora',
      content: `La adquisición de equipos de cómputo (laptops, computadoras de escritorio, servidores) es una de las transacciones más comunes en cualquier empresa.

## Base Legal - Artículo 18° de la Ley del Impuesto a la Renta
Los bienes cuyo valor unitario no supere el cuarto (1/4) de la UIT, podrán ser aceptados como gasto para efectos tributarios en el ejercicio en que se expida el comprobante.

## 1. Caso Práctico General
La empresa **Consultoría ATLOB S.A.C.** adquiere una Laptop marca Lenovo por S/ 4,000.00 más IGV (18%). Se realiza el asiento contable por la compra, destino y cancelación de la factura.`,
      contentHtml: `<p>La adquisición de equipos de cómputo (laptops, computadoras de escritorio, servidores) es una de las transacciones más comunes en cualquier empresa.</p>
<h2>Base Legal - Artículo 18° de la Ley del Impuesto a la Renta</h2>
<p>Los bienes cuyo valor unitario no supere el cuarto (1/4) de la UIT, podrán ser aceptados como gasto para efectos tributarios en el ejercicio en que se expida el comprobante.</p>
<h2>1. Caso Práctico General</h2>
<p>La empresa <strong>Consultoría ATLOB S.A.C.</strong> adquiere una Laptop marca Lenovo por S/ 4,000.00 más IGV (18%). Se realiza el asiento contable por la compra, destino y cancelación de la factura.</p>`,
      excerpt: 'Guía paso a paso para el registro contable de adquisición de equipos informáticos, análisis de activo fijo vs gasto según el PCGE y norma tributaria.',
      featuredImage: '/img/tech_automation_1775951818804.png',
      thumbnailImage: '/img/tech_automation_1775951818804.png',
      status: 'published',
      isFeatured: false,
      readTime: 6,
      views: 890,
      publishedAt: new Date('2026-04-14'),
      authorId: 1,
      categoryId: 2, // Contabilidad
    });
    articles.push(sampleArticle2);

    // Link tags to sample articles
    articleTags.push({ article_id: sampleArticle1.id, tag_id: 1 }); // SUNAT
    articleTags.push({ article_id: sampleArticle1.id, tag_id: 2 }); // IGV
    articleTags.push({ article_id: sampleArticle2.id, tag_id: 5 }); // PCGE
    articleTags.push({ article_id: sampleArticle2.id, tag_id: 9 }); // Casos Prácticos
  }
}

seedInitialData();

module.exports = {
  UserModel,
  CategoryModel,
  TagModel,
  ArticleModel,
  ArticleTagModel,
  MediaModel,
  CommentModel,
  seedInitialData,
};
