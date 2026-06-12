/* =============================================
   ATLOB CMS — Admin Panel SPA Engine
   ============================================= */

const API = window.location.origin + '/api';

// =============================================
// STATE
// =============================================
const state = {
  token: localStorage.getItem('atlob_token') || null,
  user: JSON.parse(localStorage.getItem('atlob_user') || 'null'),
  currentPage: 'dashboard',
  editingArticle: null,
  categories: [],
  tags: [],
};

// =============================================
// API HELPERS
// =============================================
const api = {
  headers() {
    const h = { 'Content-Type': 'application/json' };
    if (state.token) h['Authorization'] = `Bearer ${state.token}`;
    return h;
  },

  async get(path) {
    const res = await fetch(`${API}${path}`, { headers: this.headers() });
    if (res.status === 401) { logout(); throw new Error('Sesión expirada'); }
    return res.json();
  },

  async post(path, body) {
    const res = await fetch(`${API}${path}`, {
      method: 'POST', headers: this.headers(), body: JSON.stringify(body),
    });
    if (res.status === 401) { logout(); throw new Error('Sesión expirada'); }
    return res.json();
  },

  async put(path, body) {
    const res = await fetch(`${API}${path}`, {
      method: 'PUT', headers: this.headers(), body: JSON.stringify(body),
    });
    if (res.status === 401) { logout(); throw new Error('Sesión expirada'); }
    return res.json();
  },

  async patch(path) {
    const res = await fetch(`${API}${path}`, {
      method: 'PATCH', headers: this.headers(),
    });
    if (res.status === 401) { logout(); throw new Error('Sesión expirada'); }
    return res.json();
  },

  async del(path) {
    const res = await fetch(`${API}${path}`, {
      method: 'DELETE', headers: this.headers(),
    });
    if (res.status === 401) { logout(); throw new Error('Sesión expirada'); }
    return res.json();
  },

  async upload(file, data = {}) {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(data).forEach(([k, v]) => formData.append(k, v));

    const res = await fetch(`${API}/media/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${state.token}` },
      body: formData,
    });
    if (res.status === 401) { logout(); throw new Error('Sesión expirada'); }
    return res.json();
  },
};

// =============================================
// TOAST NOTIFICATIONS
// =============================================
function toast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`;
  container.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 4000);
}

// =============================================
// AUTH
// =============================================
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const btn = document.getElementById('loginBtn');
  const errorEl = document.getElementById('loginError');

  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
  btn.disabled = true;
  errorEl.textContent = '';

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (data.success) {
      state.token = data.data.token;
      state.user = data.data.user;
      localStorage.setItem('atlob_token', state.token);
      localStorage.setItem('atlob_user', JSON.stringify(state.user));
      showApp();
      toast('Bienvenido, ' + state.user.name, 'success');
    } else {
      errorEl.textContent = data.message || 'Credenciales incorrectas';
    }
  } catch (err) {
    errorEl.textContent = 'Error de conexión con el servidor';
  }

  btn.innerHTML = '<span>Iniciar Sesión</span><i class="fas fa-arrow-right"></i>';
  btn.disabled = false;
}

function logout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('atlob_token');
  localStorage.removeItem('atlob_user');
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('appShell').style.display = 'none';
}

function showApp() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('appShell').style.display = 'flex';
  document.getElementById('userName').textContent = state.user?.name || 'Admin';
  loadCategories();
  loadTags();
  navigateTo('dashboard');
}

// =============================================
// NAVIGATION
// =============================================
function navigateTo(page, data = null) {
  state.currentPage = page;
  state.editingArticle = data;

  // Update sidebar active
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });

  const titles = {
    dashboard: 'Dashboard',
    articles: 'Artículos',
    editor: data ? 'Editar Artículo' : 'Nuevo Artículo',
    categories: 'Categorías',
    media: 'Biblioteca de Media',
    tags: 'Etiquetas',
  };
  document.getElementById('pageTitle').textContent = titles[page] || page;

  const container = document.getElementById('pageContainer');
  container.innerHTML = '<div class="spinner"></div>';

  const renderers = {
    dashboard: renderDashboard,
    articles: renderArticles,
    editor: renderEditor,
    categories: renderCategories,
    media: renderMedia,
    tags: renderTags,
  };

  if (renderers[page]) renderers[page](container);
}

// =============================================
// LOAD SHARED DATA
// =============================================
async function loadCategories() {
  try {
    const res = await api.get('/categories');
    if (res.success) state.categories = res.data;
  } catch (e) { console.error(e); }
}

async function loadTags() {
  try {
    const res = await api.get('/tags');
    if (res.success) state.tags = res.data;
  } catch (e) { console.error(e); }
}

// =============================================
// DASHBOARD PAGE
// =============================================
async function renderDashboard(container) {
  try {
    const res = await api.get('/dashboard/stats');
    if (!res.success) { container.innerHTML = '<p>Error cargando dashboard</p>'; return; }
    const d = res.data;

    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card-admin">
          <div class="stat-icon blue"><i class="fas fa-newspaper"></i></div>
          <div class="stat-value">${d.articles.total}</div>
          <div class="stat-label">Artículos Totales</div>
        </div>
        <div class="stat-card-admin">
          <div class="stat-icon green"><i class="fas fa-check-circle"></i></div>
          <div class="stat-value">${d.articles.published}</div>
          <div class="stat-label">Publicados</div>
        </div>
        <div class="stat-card-admin">
          <div class="stat-icon orange"><i class="fas fa-edit"></i></div>
          <div class="stat-value">${d.articles.drafts}</div>
          <div class="stat-label">Borradores</div>
        </div>
        <div class="stat-card-admin">
          <div class="stat-icon purple"><i class="fas fa-eye"></i></div>
          <div class="stat-value">${d.totalViews.toLocaleString()}</div>
          <div class="stat-label">Vistas Totales</div>
        </div>
        <div class="stat-card-admin">
          <div class="stat-icon red"><i class="fas fa-comments"></i></div>
          <div class="stat-value">${d.pendingComments}</div>
          <div class="stat-label">Comentarios Pendientes</div>
        </div>
        <div class="stat-card-admin">
          <div class="stat-icon blue"><i class="fas fa-images"></i></div>
          <div class="stat-value">${d.totalMedia}</div>
          <div class="stat-label">Archivos Media</div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:24px;">
        <div class="panel">
          <div class="panel-header"><h3>📊 Top Artículos</h3></div>
          <div class="panel-body" style="padding:0;">
            <table class="admin-table">
              <thead><tr><th>Título</th><th style="text-align:right">Vistas</th></tr></thead>
              <tbody>
                ${d.topArticles.map(a => `
                  <tr>
                    <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${a.title}</td>
                    <td style="text-align:right;font-weight:600;">${a.views.toLocaleString()}</td>
                  </tr>
                `).join('') || '<tr><td colspan="2" style="text-align:center;color:var(--text-muted);">Sin datos</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header"><h3>📁 Artículos por Categoría</h3></div>
          <div class="panel-body">
            <div class="category-list">
              ${d.articlesByCategory.map(c => `
                <div class="category-item">
                  <span class="category-dot" style="background:${c.color}"></span>
                  <span class="cat-name">${c.name}</span>
                  <span class="cat-count">${c.dataValues?.articleCount || c.articleCount || 0} artículos</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="panel" style="margin-top:24px;">
        <div class="panel-header">
          <h3>🕐 Actividad Reciente</h3>
          <button class="btn btn-sm btn-secondary" onclick="navigateTo('articles')">Ver todos</button>
        </div>
        <div class="panel-body" style="padding:0;">
          <table class="admin-table">
            <thead><tr><th>Artículo</th><th>Categoría</th><th>Estado</th><th>Fecha</th></tr></thead>
            <tbody>
              ${d.recentArticles.map(a => `
                <tr style="cursor:pointer" onclick="editArticle(${a.id})">
                  <td>
                    <div class="article-row">
                      <div class="article-info">
                        <h4>${a.title}</h4>
                        <span class="article-sub">${a.author?.name || 'Admin'}</span>
                      </div>
                    </div>
                  </td>
                  <td>${a.category ? `<span class="badge-category" style="background:${a.category.color}">${a.category.name}</span>` : '—'}</td>
                  <td><span class="badge badge-${a.status}">${a.status === 'published' ? 'Publicado' : a.status === 'draft' ? 'Borrador' : 'Archivado'}</span></td>
                  <td style="font-size:13px;color:var(--text-muted)">${new Date(a.createdAt).toLocaleDateString('es-PE')}</td>
                </tr>
              `).join('') || '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);">Sin artículos</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger)">Error: ${err.message}</p>`;
  }
}

// =============================================
// ARTICLES PAGE
// =============================================
async function renderArticles(container) {
  try {
    const res = await api.get('/articles/admin?limit=50');
    if (!res.success) { container.innerHTML = '<p>Error cargando artículos</p>'; return; }

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
        <div class="btn-group">
          <button class="btn btn-primary" onclick="navigateTo('editor')">
            <i class="fas fa-plus"></i> Nuevo Artículo
          </button>
        </div>
      </div>

      <div class="panel">
        <div class="panel-body" style="padding:0;">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Artículo</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Vistas</th>
                <th>Fecha</th>
                <th style="text-align:right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${res.data.map(a => `
                <tr>
                  <td>
                    <div class="article-row">
                      ${a.featuredImage ? `<img src="${a.featuredImage}" class="article-thumb" alt="">` : '<div class="article-thumb" style="background:var(--bg-input);display:flex;align-items:center;justify-content:center;"><i class="fas fa-image" style="color:var(--text-muted);font-size:14px;"></i></div>'}
                      <div class="article-info">
                        <h4>${a.title}</h4>
                        <span class="article-sub">${a.author?.name || 'Admin'} ${a.isFeatured ? '⭐' : ''}</span>
                      </div>
                    </div>
                  </td>
                  <td>${a.category ? `<span class="badge-category" style="background:${a.category.color}">${a.category.name}</span>` : '—'}</td>
                  <td><span class="badge badge-${a.status}">${a.status === 'published' ? 'Publicado' : a.status === 'draft' ? 'Borrador' : 'Archivado'}</span></td>
                  <td style="font-size:13px;">${(a.views || 0).toLocaleString()}</td>
                  <td style="font-size:13px;color:var(--text-muted)">${new Date(a.updatedAt).toLocaleDateString('es-PE')}</td>
                  <td>
                    <div class="btn-group" style="justify-content:flex-end;">
                      <button class="btn btn-sm btn-ghost" onclick="editArticle(${a.id})" title="Editar"><i class="fas fa-pen"></i></button>
                      ${a.status === 'draft' ? `<button class="btn btn-sm btn-success" onclick="publishArticle(${a.id})" title="Publicar"><i class="fas fa-paper-plane"></i></button>` : ''}
                      ${a.status === 'published' ? `<button class="btn btn-sm btn-warning" onclick="featureArticle(${a.id})" title="Destacar"><i class="fas fa-star"></i></button>` : ''}
                      <button class="btn btn-sm btn-danger" onclick="deleteArticle(${a.id}, '${a.title.replace(/'/g, "\\'")}')" title="Eliminar"><i class="fas fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              `).join('') || '<tr><td colspan="6"><div class="empty-state"><i class="fas fa-newspaper"></i><h3>Sin artículos</h3><p>Crea tu primer artículo para la revista</p></div></td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger)">Error: ${err.message}</p>`;
  }
}

// =============================================
// ARTICLE ACTIONS
// =============================================
async function editArticle(id) {
  try {
    const res = await api.get(`/articles/admin/${id}`);
    if (res.success) {
      navigateTo('editor', res.data);
    }
  } catch (err) { toast(err.message, 'error'); }
}

async function publishArticle(id) {
  if (!confirm('¿Publicar este artículo?')) return;
  try {
    const res = await api.patch(`/articles/admin/${id}/publish`);
    if (res.success) {
      toast('Artículo publicado', 'success');
      navigateTo('articles');
    } else { toast(res.message, 'error'); }
  } catch (err) { toast(err.message, 'error'); }
}

async function featureArticle(id) {
  try {
    const res = await api.patch(`/articles/admin/${id}/featured`);
    if (res.success) {
      toast('Artículo marcado como destacado ⭐', 'success');
      navigateTo('articles');
    } else { toast(res.message, 'error'); }
  } catch (err) { toast(err.message, 'error'); }
}

async function deleteArticle(id, title) {
  if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return;
  try {
    const res = await api.del(`/articles/admin/${id}`);
    if (res.success) {
      toast('Artículo eliminado', 'success');
      navigateTo('articles');
    } else { toast(res.message, 'error'); }
  } catch (err) { toast(err.message, 'error'); }
}

// =============================================
// EDITOR PAGE
// =============================================
async function renderEditor(container) {
  const a = state.editingArticle;
  const isEdit = !!a;

  const catOptions = state.categories.map(c =>
    `<option value="${c.id}" ${a && a.categoryId == c.id ? 'selected' : ''}>${c.name}</option>`
  ).join('');

  const selectedTags = a && a.tags ? a.tags.map(t => t.id) : [];

  container.innerHTML = `
    <form id="articleForm" class="editor-layout">
      <div class="editor-main">
        <div class="panel">
          <div class="panel-body">
            <div class="form-field">
              <input type="text" id="edTitle" class="input-title" placeholder="Título del artículo..." value="${a ? a.title : ''}" required>
            </div>
            <div class="form-field">
              <label>Contenido (Markdown)</label>
              <textarea id="edContent" placeholder="Escribe en Markdown...&#10;&#10;## Subtítulo&#10;&#10;Párrafo de texto con **negritas** y *cursivas*.">${a ? a.content : ''}</textarea>
              <span class="help-text">Soporta Markdown: ## títulos, **negritas**, *cursivas*, [enlaces](url), etc.</span>
            </div>
            <div class="form-field">
              <label>Extracto</label>
              <input type="text" id="edExcerpt" placeholder="Resumen breve para tarjetas y SEO (máx. 160 chars)..." value="${a ? (a.excerpt || '') : ''}" maxlength="500">
            </div>
          </div>
        </div>

        <!-- Preview -->
        <div class="panel">
          <div class="panel-header">
            <h3>👁 Vista Previa</h3>
            <button type="button" class="btn btn-sm btn-secondary" onclick="updatePreview()">Actualizar</button>
          </div>
          <div class="panel-body">
            <div id="previewArea" class="preview-panel">
              <p style="color:#999;">Escribe contenido y haz clic en "Actualizar" para ver la vista previa.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="editor-sidebar">
        <!-- Publish Box -->
        <div class="panel">
          <div class="panel-header"><h3>📤 Publicación</h3></div>
          <div class="panel-body">
            <div class="form-field">
              <label>Estado</label>
              <select id="edStatus">
                <option value="draft" ${a && a.status === 'draft' ? 'selected' : ''}>Borrador</option>
                <option value="published" ${a && a.status === 'published' ? 'selected' : ''}>Publicado</option>
                <option value="archived" ${a && a.status === 'archived' ? 'selected' : ''}>Archivado</option>
              </select>
            </div>
            <div class="btn-group" style="flex-direction:column;">
              <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;">
                <i class="fas fa-save"></i> ${isEdit ? 'Guardar Cambios' : 'Crear Artículo'}
              </button>
              ${isEdit ? `
                <button type="button" class="btn btn-secondary" style="width:100%;justify-content:center;" onclick="navigateTo('articles')">
                  <i class="fas fa-times"></i> Cancelar
                </button>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Category -->
        <div class="panel">
          <div class="panel-header"><h3>📁 Categoría</h3></div>
          <div class="panel-body">
            <div class="form-field" style="margin:0;">
              <select id="edCategory">
                <option value="">Sin categoría</option>
                ${catOptions}
              </select>
            </div>
          </div>
        </div>

        <!-- Tags -->
        <div class="panel">
          <div class="panel-header"><h3>🏷 Etiquetas</h3></div>
          <div class="panel-body">
            <div class="tags-input-wrap" id="tagsWrap">
              <input type="text" id="tagInput" placeholder="Agregar etiqueta...">
            </div>
            <div id="tagSuggestions" style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px;">
              ${state.tags.map(t => `
                <button type="button" class="btn btn-sm btn-ghost tag-suggestion" data-id="${t.id}" data-name="${t.name}" onclick="addTagFromSuggestion(this)" style="font-size:12px;padding:4px 8px;${selectedTags.includes(t.id) ? 'display:none;' : ''}">
                  + ${t.name}
                </button>
              `).join('')}
            </div>
            <input type="hidden" id="edTags" value="${selectedTags.join(',')}">
          </div>
        </div>

        <!-- Featured Image -->
        <div class="panel">
          <div class="panel-header"><h3>🖼 Imagen Destacada</h3></div>
          <div class="panel-body">
            <div class="form-field" style="margin:0;">
              <input type="text" id="edImage" placeholder="/uploads/articles/imagen.jpg" value="${a ? (a.featuredImage || '') : ''}">
              <span class="help-text">URL de la imagen o sube una en Media</span>
            </div>
            <div id="imagePreview" style="margin-top:12px;">
              ${a && a.featuredImage ? `<img src="${a.featuredImage}" style="width:100%;border-radius:8px;max-height:200px;object-fit:cover;">` : ''}
            </div>
          </div>
        </div>

        <!-- SEO -->
        <div class="panel">
          <div class="panel-header"><h3>🔍 SEO</h3></div>
          <div class="panel-body">
            <div class="form-field">
              <label>Meta Título</label>
              <input type="text" id="edMetaTitle" placeholder="Auto-generado si se deja vacío" value="${a ? (a.metaTitle || '') : ''}" maxlength="60">
            </div>
            <div class="form-field" style="margin:0;">
              <label>Meta Descripción</label>
              <input type="text" id="edMetaDesc" placeholder="Auto-generado si se deja vacío" value="${a ? (a.metaDescription || '') : ''}" maxlength="160">
            </div>
          </div>
        </div>
      </div>
    </form>
  `;

  // Render existing tags
  if (a && a.tags) {
    a.tags.forEach(t => addTagChip(t.id, t.name));
  }

  // Form submit
  document.getElementById('articleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveArticle(isEdit ? a.id : null);
  });

  // Image preview
  document.getElementById('edImage').addEventListener('input', (e) => {
    const url = e.target.value;
    const preview = document.getElementById('imagePreview');
    if (url) {
      preview.innerHTML = `<img src="${url}" style="width:100%;border-radius:8px;max-height:200px;object-fit:cover;" onerror="this.style.display='none'">`;
    } else {
      preview.innerHTML = '';
    }
  });
}

function updatePreview() {
  const content = document.getElementById('edContent').value;
  const preview = document.getElementById('previewArea');
  // Basic client-side markdown render
  let html = content
    .replace(/^### (.*)/gm, '<h3>$1</h3>')
    .replace(/^## (.*)/gm, '<h2>$1</h2>')
    .replace(/^# (.*)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.*)/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.*)/gm, '<li>$2</li>');

  // Paragraphs
  html = html.split('\n').map(line => {
    line = line.trim();
    if (!line) return '';
    if (line.startsWith('<')) return line;
    return `<p>${line}</p>`;
  }).join('\n');

  preview.innerHTML = html || '<p style="color:#999;">Sin contenido</p>';
}

// Tag handling
function addTagChip(id, name) {
  const wrap = document.getElementById('tagsWrap');
  const input = document.getElementById('tagInput');
  const chip = document.createElement('span');
  chip.className = 'tag-chip';
  chip.dataset.id = id;
  chip.innerHTML = `${name} <span class="remove-tag" onclick="removeTag(this, ${id})"><i class="fas fa-times"></i></span>`;
  wrap.insertBefore(chip, input);

  // Update hidden input
  const hiddenInput = document.getElementById('edTags');
  const current = hiddenInput.value ? hiddenInput.value.split(',').map(Number) : [];
  if (!current.includes(Number(id))) {
    current.push(Number(id));
    hiddenInput.value = current.join(',');
  }
}

function removeTag(el, id) {
  el.closest('.tag-chip').remove();
  const hiddenInput = document.getElementById('edTags');
  const current = hiddenInput.value.split(',').map(Number).filter(t => t !== id);
  hiddenInput.value = current.join(',');

  // Show suggestion again
  const suggestion = document.querySelector(`.tag-suggestion[data-id="${id}"]`);
  if (suggestion) suggestion.style.display = '';
}

function addTagFromSuggestion(btn) {
  const id = btn.dataset.id;
  const name = btn.dataset.name;
  addTagChip(id, name);
  btn.style.display = 'none';
}

async function saveArticle(id) {
  const title = document.getElementById('edTitle').value.trim();
  const content = document.getElementById('edContent').value.trim();

  if (!title || !content) {
    toast('Título y contenido son obligatorios', 'error');
    return;
  }

  const tagsStr = document.getElementById('edTags').value;
  const tags = tagsStr ? tagsStr.split(',').map(Number).filter(Boolean) : [];

  const body = {
    title,
    content,
    excerpt: document.getElementById('edExcerpt').value.trim() || null,
    status: document.getElementById('edStatus').value,
    categoryId: document.getElementById('edCategory').value || null,
    featuredImage: document.getElementById('edImage').value.trim() || null,
    metaTitle: document.getElementById('edMetaTitle').value.trim() || null,
    metaDescription: document.getElementById('edMetaDesc').value.trim() || null,
    tags,
  };

  try {
    let res;
    if (id) {
      res = await api.put(`/articles/admin/${id}`, body);
    } else {
      res = await api.post('/articles/admin', body);
    }

    if (res.success) {
      toast(id ? 'Artículo actualizado' : 'Artículo creado', 'success');
      navigateTo('articles');
    } else {
      toast(res.message || 'Error guardando', 'error');
    }
  } catch (err) {
    toast('Error: ' + err.message, 'error');
  }
}

// =============================================
// CATEGORIES PAGE
// =============================================
async function renderCategories(container) {
  try {
    const res = await api.get('/categories');
    if (!res.success) return;

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; margin-bottom:24px;">
        <h3 style="font-size:16px;">Gestión de Categorías</h3>
        <button class="btn btn-primary" onclick="showCategoryModal()">
          <i class="fas fa-plus"></i> Nueva Categoría
        </button>
      </div>
      <div class="panel">
        <div class="panel-body" style="padding:0;">
          <table class="admin-table">
            <thead><tr><th>Color</th><th>Nombre</th><th>Slug</th><th>Artículos</th><th style="text-align:right">Acciones</th></tr></thead>
            <tbody>
              ${res.data.map(c => `
                <tr>
                  <td><span class="category-dot" style="background:${c.color};display:inline-block;"></span></td>
                  <td style="font-weight:500;"><i class="${c.icon}" style="margin-right:8px;color:${c.color}"></i>${c.name}</td>
                  <td style="color:var(--text-muted);font-size:13px;">${c.slug}</td>
                  <td>${c.dataValues?.articleCount ?? c.articleCount ?? 0}</td>
                  <td>
                    <div class="btn-group" style="justify-content:flex-end;">
                      <button class="btn btn-sm btn-ghost" onclick="showCategoryModal(${JSON.stringify(c).replace(/"/g, '&quot;')})"><i class="fas fa-pen"></i></button>
                      <button class="btn btn-sm btn-danger" onclick="deleteCategory(${c.id}, '${c.name}')"><i class="fas fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger)">Error: ${err.message}</p>`;
  }
}

function showCategoryModal(cat = null) {
  const isEdit = !!cat;
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.id = 'catModal';
  backdrop.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${isEdit ? 'Editar' : 'Nueva'} Categoría</h3>
        <button class="modal-close" onclick="closeModal('catModal')"><i class="fas fa-times"></i></button>
      </div>
      <form id="catForm">
        <div class="modal-body">
          <div class="form-field"><label>Nombre</label><input type="text" id="catName" value="${cat?.name || ''}" required></div>
          <div class="form-field"><label>Descripción</label><input type="text" id="catDesc" value="${cat?.description || ''}"></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div class="form-field"><label>Color</label><input type="color" id="catColor" value="${cat?.color || '#2563eb'}" style="height:44px;padding:4px;"></div>
            <div class="form-field"><label>Icono (FontAwesome)</label><input type="text" id="catIcon" value="${cat?.icon || 'fas fa-folder'}" placeholder="fas fa-folder"></div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="closeModal('catModal')">Cancelar</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Guardar' : 'Crear'}</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(backdrop);

  document.getElementById('catForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
      name: document.getElementById('catName').value,
      description: document.getElementById('catDesc').value,
      color: document.getElementById('catColor').value,
      icon: document.getElementById('catIcon').value,
    };
    try {
      let res;
      if (isEdit) {
        res = await api.put(`/categories/${cat.id}`, body);
      } else {
        res = await api.post('/categories', body);
      }
      if (res.success) {
        toast(isEdit ? 'Categoría actualizada' : 'Categoría creada', 'success');
        closeModal('catModal');
        loadCategories();
        navigateTo('categories');
      } else { toast(res.message, 'error'); }
    } catch (err) { toast(err.message, 'error'); }
  });
}

async function deleteCategory(id, name) {
  if (!confirm(`¿Eliminar categoría "${name}"?`)) return;
  try {
    const res = await api.del(`/categories/${id}`);
    if (res.success) {
      toast('Categoría eliminada', 'success');
      loadCategories();
      navigateTo('categories');
    } else { toast(res.message, 'error'); }
  } catch (err) { toast(err.message, 'error'); }
}

// =============================================
// TAGS PAGE
// =============================================
async function renderTags(container) {
  try {
    const res = await api.get('/tags');
    if (!res.success) return;

    container.innerHTML = `
      <div style="display:flex; gap:12px; margin-bottom:24px;">
        <input type="text" id="newTagInput" placeholder="Nombre del nuevo tag..." style="flex:1;padding:11px 14px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:var(--radius-sm);color:var(--text-primary);font-size:14px;">
        <button class="btn btn-primary" onclick="createTag()"><i class="fas fa-plus"></i> Crear</button>
      </div>
      <div class="panel">
        <div class="panel-body">
          <div style="display:flex; flex-wrap:wrap; gap:10px;">
            ${res.data.map(t => `
              <div class="tag-chip" style="padding:8px 14px;font-size:13px;">
                ${t.name}
                <span class="remove-tag" onclick="deleteTag(${t.id}, '${t.name}')" style="cursor:pointer;margin-left:4px;"><i class="fas fa-times"></i></span>
              </div>
            `).join('') || '<div class="empty-state"><i class="fas fa-tags"></i><h3>Sin etiquetas</h3></div>'}
          </div>
        </div>
      </div>
    `;

    document.getElementById('newTagInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); createTag(); }
    });
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger)">Error: ${err.message}</p>`;
  }
}

async function createTag() {
  const input = document.getElementById('newTagInput');
  const name = input.value.trim();
  if (!name) return;
  try {
    const res = await api.post('/tags', { name });
    if (res.success) {
      toast('Tag creado', 'success');
      loadTags();
      navigateTo('tags');
    } else { toast(res.message, 'error'); }
  } catch (err) { toast(err.message, 'error'); }
}

async function deleteTag(id, name) {
  if (!confirm(`¿Eliminar tag "${name}"?`)) return;
  try {
    const res = await api.del(`/tags/${id}`);
    if (res.success) {
      toast('Tag eliminado', 'success');
      loadTags();
      navigateTo('tags');
    } else { toast(res.message, 'error'); }
  } catch (err) { toast(err.message, 'error'); }
}

// =============================================
// MEDIA PAGE
// =============================================
async function renderMedia(container) {
  try {
    const res = await api.get('/media?limit=50');

    container.innerHTML = `
      <div class="drop-zone" id="dropZone">
        <i class="fas fa-cloud-upload-alt"></i>
        <p>Arrastra archivos aquí o haz clic para seleccionar</p>
        <p class="drop-zone-hint">Máximo 5MB — JPG, PNG, WebP, GIF, PDF, Excel</p>
        <input type="file" id="fileInput" style="display:none" accept="image/*,.pdf,.xlsx,.xls" multiple>
      </div>

      <div class="media-grid" id="mediaGrid">
        ${res.success && res.data.length > 0 ? res.data.map(m => `
          <div class="media-card">
            <div class="media-actions">
              <button class="btn-icon" onclick="copyMediaUrl('${m.url}')" title="Copiar URL"><i class="fas fa-copy"></i></button>
              <button class="btn-icon" onclick="deleteMedia(${m.id})" title="Eliminar"><i class="fas fa-trash"></i></button>
            </div>
            ${m.mimeType?.startsWith('image/') ? `<img src="${m.thumbnailUrl || m.url}" alt="${m.originalName}" loading="lazy">` : `<div style="height:140px;display:flex;align-items:center;justify-content:center;background:var(--bg-input);"><i class="fas fa-file" style="font-size:32px;color:var(--text-muted)"></i></div>`}
            <div class="media-card-info">
              <div class="filename">${m.originalName}</div>
              <div class="filesize">${(m.size / 1024).toFixed(1)} KB</div>
            </div>
          </div>
        `).join('') : '<div class="empty-state" style="grid-column:1/-1;"><i class="fas fa-images"></i><h3>Sin archivos</h3><p>Sube imágenes para tus artículos</p></div>'}
      </div>
    `;

    // Drop zone events
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', async (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      const files = e.dataTransfer.files;
      for (const file of files) await uploadFile(file);
    });

    fileInput.addEventListener('change', async (e) => {
      for (const file of e.target.files) await uploadFile(file);
    });
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger)">Error: ${err.message}</p>`;
  }
}

async function uploadFile(file) {
  try {
    toast(`Subiendo ${file.name}...`, 'info');
    const res = await api.upload(file);
    if (res.success) {
      toast(`${file.name} subido exitosamente`, 'success');
      navigateTo('media');
    } else {
      toast(res.message || 'Error subiendo archivo', 'error');
    }
  } catch (err) {
    toast('Error: ' + err.message, 'error');
  }
}

function copyMediaUrl(url) {
  const fullUrl = window.location.origin + url;
  navigator.clipboard.writeText(fullUrl).then(() => {
    toast('URL copiada al portapapeles', 'success');
  });
}

async function deleteMedia(id) {
  if (!confirm('¿Eliminar este archivo?')) return;
  try {
    const res = await api.del(`/media/${id}`);
    if (res.success) {
      toast('Archivo eliminado', 'success');
      navigateTo('media');
    } else { toast(res.message, 'error'); }
  } catch (err) { toast(err.message, 'error'); }
}

// =============================================
// MODAL UTILS
// =============================================
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// =============================================
// INIT
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  // Login form
  document.getElementById('loginForm').addEventListener('submit', handleLogin);

  // Logout
  document.getElementById('btnLogout').addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('¿Cerrar sesión?')) logout();
  });

  // Sidebar navigation
  document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(el.dataset.page);
      // Close mobile sidebar
      document.getElementById('sidebar').classList.remove('open');
    });
  });

  // Mobile menu toggle
  document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Check auth state
  if (state.token && state.user) {
    showApp();
  }
});
