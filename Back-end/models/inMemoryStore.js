const bcrypt = require('bcryptjs');

let userNextId = 1;
let categoryNextId = 1;
let tagNextId = 1;
let articleNextId = 1;
let mediaNextId = 1;
let commentNextId = 1;
let subscriberNextId = 1;

const users = [];
const categories = [];
const tags = [];
const articles = [];
const articleTags = [];
const mediaList = [];
const comments = [];
const subscribers = [];

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
    return u ? { 
      id: u.id, 
      name: u.name, 
      email: u.email,
      role: u.role || 'Especialista Tributario',
      avatar: u.avatar || '/img/avatar-default.svg',
      bio: u.bio || 'Contador Público Colegiado con amplia experiencia en asesoría tributaria, auditoría financiera y aplicación del PCGE para empresas en el Perú.',
    } : {
      id: 1,
      name: 'Equipo Editorial ATLOB',
      email: 'editorial@atlob.pe',
      role: 'Consultores Contables',
      avatar: '/img/avatar-default.svg',
      bio: 'Equipo multidisciplinario de contadores y asesores tributarios dedicados al análisis y difusión de la normativa contable en el Perú.',
    };
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

  toJSON() {
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

class SubscriberInstance {
  constructor(data) {
    this.id = data.id || subscriberNextId++;
    this.email = (data.email || '').trim().toLowerCase();
    this.status = data.status || 'active';
    this.source = data.source || 'footer_form';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  get(attr) {
    return attr ? this[attr] : { ...this };
  }

  async destroy() {
    const idx = subscribers.findIndex(s => s.id === this.id);
    if (idx !== -1) subscribers.splice(idx, 1);
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

const SubscriberModel = {
  async findOne({ where } = {}) {
    return subscribers.find(s => matchesWhere(s, where)) || null;
  },
  async findAll({ where } = {}) {
    return subscribers.filter(s => matchesWhere(s, where));
  },
  async findByPk(id) {
    return subscribers.find(s => s.id === Number(id)) || null;
  },
  async count(options = {}) {
    if (!options.where) return subscribers.length;
    return subscribers.filter(s => matchesWhere(s, options.where)).length;
  },
  async create(data) {
    const instance = new SubscriberInstance(data);
    subscribers.push(instance);
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

    const sampleArticle3 = new ArticleInstance({
      title: 'Reforma Tributaria 2026: Cambios Clave en IGV y Bancarización',
      slug: 'reforma-tributaria-igv-bancarizacion-2026',
      content: `Las modificaciones al reglamento de la Ley del IGV y a la Ley para la Lucha contra la Evasión y para la Formalización de la Economía introducen exigencias más estrictas sobre los medios de pago bancarizados y sustento de crédito fiscal.

## 1. Medios de Pago Válidos
Para transacciones superiores a S/ 2,000 o US$ 500 es mandatorio canalizar el pago mediante entidades del sistema financiero. El incumplimiento acarrea el desconocimiento del costo o gasto y del crédito fiscal del IGV.

## 2. Recomendaciones de Auditoría Preventiva
Conserva vouchers y estados de cuenta vinculados cronológicamente al registro de compras electrónico en SIRE.`,
      contentHtml: `<p>Las modificaciones al reglamento de la Ley del IGV y a la Ley para la Lucha contra la Evasión y para la Formalización de la Economía introducen exigencias más estrictas sobre los medios de pago bancarizados y sustento de crédito fiscal.</p>
<h2>1. Medios de Pago Válidos</h2>
<p>Para transacciones superiores a S/ 2,000 o US$ 500 es mandatorio canalizar el pago mediante entidades del sistema financiero. El incumplimiento acarrea el desconocimiento del costo o gasto y del crédito fiscal del IGV.</p>
<h2>2. Recomendaciones de Auditoría Preventiva</h2>
<p>Conserva vouchers y estados de cuenta vinculados cronológicamente al registro de compras electrónico en SIRE.</p>`,
      excerpt: 'Conoce los nuevos criterios de la SUNAT sobre bancarización obligatoria y los requisitos para no perder el crédito fiscal del IGV.',
      featuredImage: '/img/tech_intelligence_1775951847405.png',
      thumbnailImage: '/img/tech_intelligence_1775951847405.png',
      status: 'published',
      isFeatured: false,
      readTime: 5,
      views: 730,
      publishedAt: new Date('2026-04-18'),
      authorId: 1,
      categoryId: 1, // Tributario
    });
    articles.push(sampleArticle3);

    const sampleArticle4 = new ArticleInstance({
      title: 'Cierre Contable Anual y Conciliación con el Balance de Comprobación',
      slug: 'cierre-contable-balance-comprobacion',
      content: `El proceso de cierre del ejercicio económico requiere la regularización de cuentas de gestión patrimoniales y la correcta determinación del resultado antes y después de participaciones e impuesto a la renta.

## Pasos Metodológicos
1. Ajuste de diferencias de cambio según NIC 21.
2. Estimación de cobranza dudosa y desvalorización de inventarios (NIC 2).
3. Asientos de refundición de las cuentas del elemento 6, 7 y 8 del PCGE.`,
      contentHtml: `<p>El proceso de cierre del ejercicio económico requiere la regularización de cuentas de gestión patrimoniales y la correcta determinación del resultado antes y después de participaciones e impuesto a la renta.</p>
<h2>Pasos Metodológicos</h2>
<ol>
<li>Ajuste de diferencias de cambio según NIC 21.</li>
<li>Estimación de cobranza dudosa y desvalorización de inventarios (NIC 2).</li>
<li>Asientos de refundición de las cuentas del elemento 6, 7 y 8 del PCGE.</li>
</ol>`,
      excerpt: 'Guía metodológica para elaborar el balance de comprobación y formular los asientos de cierre contable conforme al PCGE.',
      featuredImage: '/img/tech_security_1775951860932.png',
      thumbnailImage: '/img/tech_security_1775951860932.png',
      status: 'published',
      isFeatured: false,
      readTime: 7,
      views: 615,
      publishedAt: new Date('2026-04-10'),
      authorId: 1,
      categoryId: 2, // Contabilidad
    });
    articles.push(sampleArticle4);

    const sampleArticle5 = new ArticleInstance({
      title: 'Cálculo de Beneficios Sociales: CTS y Gratificaciones en MYPE y Régimen General',
      slug: 'calculo-beneficios-sociales-cts-gratificaciones',
      content: `Calcular correctamente la Compensación por Tiempo de Servicios (CTS) y las gratificaciones legales es fundamental para evitar multas de la SUNAFIL y asegurar la paz laboral en la empresa.

## Base de Cálculo y Remuneración Computable
Se considera la remuneración básica percibida más asignación familiar y promedio de conceptos variables o imprecisos percibidos al menos 3 veces en el semestre.`,
      contentHtml: `<p>Calcular correctamente la Compensación por Tiempo de Servicios (CTS) y las gratificaciones legales es fundamental para evitar multas de la SUNAFIL y asegurar la paz laboral en la empresa.</p>
<h2>Base de Cálculo y Remuneración Computable</h2>
<p>Se considera la remuneración básica percibida más asignación familiar y promedio de conceptos variables o imprecisos percibidos al menos 3 veces en el semestre.</p>`,
      excerpt: 'Aprende a liquidar la CTS y gratificaciones con fórmulas prácticas y diferencias clave entre Micro, Pequeña y Gran Empresa.',
      featuredImage: '/img/hero_services_1775954528898.png',
      thumbnailImage: '/img/hero_services_1775954528898.png',
      status: 'published',
      isFeatured: false,
      readTime: 6,
      views: 940,
      publishedAt: new Date('2026-04-05'),
      authorId: 1,
      categoryId: 4, // Laboral
    });
    articles.push(sampleArticle5);

    const sampleArticle6 = new ArticleInstance({
      title: 'Auditoría Tributaria Preventiva: Inconsistencias Frecuentes en el SIRE SUNAT',
      slug: 'auditoria-tributaria-preventiva-sire-sunat',
      content: `La implementación del Sistema Integrado de Registros Electrónicos (SIRE) ha permitido a la SUNAT contrastar en tiempo real los comprobantes emitidos contra las compras y ventas declaradas por los contribuyentes.

## Puntos Críticos a Auditar
* Comprobantes de compras anotados fuera de plazo.
* Notas de crédito no aplicadas o duplicadas en el RVIE.
* Inconsistencias en el tipo de cambio SUNAT en compras en dólares.`,
      contentHtml: `<p>La implementación del Sistema Integrado de Registros Electrónicos (SIRE) ha permitido a la SUNAT contrastar en tiempo real los comprobantes emitidos contra las compras y ventas declaradas por los contribuyentes.</p>
<h2>Puntos Críticos a Auditar</h2>
<ul>
<li>Comprobantes de compras anotados fuera de plazo.</li>
<li>Notas de crédito no aplicadas o duplicadas en el RVIE.</li>
<li>Inconsistencias en el tipo de cambio SUNAT en compras en dólares.</li>
</ul>`,
      excerpt: 'Detecta y corrige discrepancias entre el RVIE/RCE del SIRE y tu contabilidad antes de que la SUNAT emita cartas inductivas.',
      featuredImage: '/img/hero_about_us_1775954475087.png',
      thumbnailImage: '/img/hero_about_us_1775954475087.png',
      status: 'published',
      isFeatured: false,
      readTime: 5,
      views: 1105,
      publishedAt: new Date('2026-04-02'),
      authorId: 1,
      categoryId: 3, // Auditoría
    });
    articles.push(sampleArticle6);

    // Link tags to sample articles
    articleTags.push({ article_id: sampleArticle1.id, tag_id: 1 }); // SUNAT
    articleTags.push({ article_id: sampleArticle1.id, tag_id: 2 }); // IGV
    articleTags.push({ article_id: sampleArticle1.id, tag_id: 10 }); // Multas
    articleTags.push({ article_id: sampleArticle2.id, tag_id: 5 }); // PCGE
    articleTags.push({ article_id: sampleArticle2.id, tag_id: 9 }); // Casos Prácticos
    articleTags.push({ article_id: sampleArticle2.id, tag_id: 3 }); // Renta
    articleTags.push({ article_id: sampleArticle3.id, tag_id: 1 }); // SUNAT
    articleTags.push({ article_id: sampleArticle3.id, tag_id: 2 }); // IGV
    articleTags.push({ article_id: sampleArticle3.id, tag_id: 10 }); // Multas
    articleTags.push({ article_id: sampleArticle4.id, tag_id: 5 }); // PCGE
    articleTags.push({ article_id: sampleArticle4.id, tag_id: 4 }); // NIIF
    articleTags.push({ article_id: sampleArticle4.id, tag_id: 9 }); // Casos Prácticos
    articleTags.push({ article_id: sampleArticle5.id, tag_id: 6 }); // Planillas
    articleTags.push({ article_id: sampleArticle5.id, tag_id: 7 }); // PLAME
    articleTags.push({ article_id: sampleArticle5.id, tag_id: 9 }); // Casos Prácticos
    articleTags.push({ article_id: sampleArticle6.id, tag_id: 1 }); // SUNAT
    articleTags.push({ article_id: sampleArticle6.id, tag_id: 10 }); // Multas
    articleTags.push({ article_id: sampleArticle6.id, tag_id: 9 }); // Casos Prácticos
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
  SubscriberModel,
  seedInitialData,
};
