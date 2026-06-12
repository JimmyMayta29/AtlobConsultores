import os
import re
from datetime import datetime

# --- CONFIGURACIÓN DE RUTAS ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENTRADAS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'entradas')
PLANTILLA_ARTICULO = os.path.join(BASE_DIR, 'revista', 'post-template.html')
REVISTA_INDEX = os.path.join(BASE_DIR, 'revista', 'index.html')
POSTS_SALIDA_DIR = os.path.join(BASE_DIR, 'revista', 'posts')

# Mapeo de categorías a archivos físicos
CATEGORY_MAP = {
    'TRIBUTARIO': os.path.join(BASE_DIR, 'revista', 'tributario.html'),
    'CONTABILIDAD': os.path.join(BASE_DIR, 'revista', 'contabilidad.html'),
    'AUDITORIA': os.path.join(BASE_DIR, 'revista', 'auditoria.html'),
    'LABORAL': os.path.join(BASE_DIR, 'revista', 'laboral.html'),
}

def leer_archivo(ruta):
    if not os.path.exists(ruta): return ""
    with open(ruta, 'r', encoding='utf-8') as f:
        return f.read()

def escribir_archivo(ruta, contenido):
    with open(ruta, 'w', encoding='utf-8') as f:
        f.write(contenido)

def parse_markdown(content):
    """Parsea archivos .md con front-matter simple delimitado por ---"""
    meta = {}
    body = content
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            header = parts[1]
            body = parts[2]
            # Parse simple key: value
            for line in header.split('\n'):
                if ':' in line:
                    k, v = line.split(':', 1)
                    meta[k.strip()] = v.strip()
    
    # Un "conversor" ultra-básico de MD a HTML para párrafos y títulos
    html_body = body.strip()
    # Títulos
    html_body = re.sub(r'^### (.*)', r'<h3>\1</h3>', html_body, flags=re.M)
    html_body = re.sub(r'^## (.*)', r'<h2>\1</h2>', html_body, flags=re.M)
    # Negritas
    html_body = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html_body)
    # Enlaces
    html_body = re.sub(r'\[(.*?)\]\((.*?)\)', r'<a href="\2">\1</a>', html_body)
    
    # Párrafos (líneas que no empiezan con tags html)
    lines = html_body.split('\n')
    processed_lines = []
    for line in lines:
        line = line.strip()
        if line and not line.startswith('<'):
            processed_lines.append(f"<p>{line}</p>")
        else:
            processed_lines.append(line)
    
    return meta, "\n".join(processed_lines)

def generar_tarjeta(datos, href_link):
    return f"""
                    <article class="magazine-post-card reveal from-bottom" data-category="{datos['categoria']}">
                        <div class="post-card-img">
                            <span class="post-category-badge">{datos['categoria']}</span>
                            <img src="{datos['imagen']}" alt="{datos['titulo']}" loading="lazy">
                        </div>
                        <div class="post-card-content">
                            <div class="post-meta">
                                <i class="far fa-calendar"></i> {datos['fecha']}
                                <span style="margin: 0 5px">•</span>
                                <i class="far fa-clock"></i> {datos['tiempo_lectura']} min
                            </div>
                            <h3 class="post-title"><a href="{href_link}">{datos['titulo']}</a></h3>
                            <p class="post-excerpt">{datos['extracto']}</p>
                            <a href="{href_link}" class="post-read-more">Ver detalles <i class="fas fa-long-arrow-alt-right"></i></a>
                        </div>
                    </article>"""

def generar_destacado(datos, href_link):
    return f"""
                <section class="featured-post-container reveal from-bottom">
                    <div class="featured-post-card">
                        <div class="featured-image">
                            <img src="{datos['imagen']}" alt="Destacado">
                        </div>
                        <div class="featured-content">
                            <span class="post-category-badge">LO ÚLTIMO: {datos['categoria']}</span>
                            <h2>{datos['titulo']}</h2>
                            <p>{datos['extracto']}</p>
                            <a href="{href_link}" class="btn-pill">
                                <span>Leer ahora</span>
                                <span class="btn-pill-arrow"><i class="fas fa-arrow-right"></i></span>
                            </a>
                        </div>
                    </div>
                </section>"""

def compilar():
    print("--- EJECUTANDO MOTOR ATLOB ENGINE v2.0 ---")
    
    # 1. Obtener todas las entradas (.md)
    archivos = [f for f in os.listdir(ENTRADAS_DIR) if f.endswith('.md')]
    if not archivos:
        print("No se encontraron archivos .md en entradas/")
        return

    # 2. Procesar cada archivo y guardarlos en una lista de objetos
    articulos = []
    plantilla = leer_archivo(PLANTILLA_ARTICULO)

    for arch in archivos:
        raw_content = leer_archivo(os.path.join(ENTRADAS_DIR, arch))
        meta, html_body = parse_markdown(raw_content)
        
        # Normalizar datos
        slug = meta.get('slug', arch.replace('.md', '.html'))
        categoria = meta.get('category', 'GENERAL').upper()
        imagen = meta.get('image', '/img/default.jpg')
        if not imagen.startswith('/'): imagen = '/' + imagen.lstrip('./')
        
        datos = {
            'titulo': meta.get('title', 'Sin Título'),
            'categoria': categoria,
            'imagen': imagen,
            'fecha': meta.get('date', datetime.now().strftime("%d %b, %Y")),
            'tiempo_lectura': meta.get('read_time', '5'),
            'autor': meta.get('author', 'Equipo ATLOB'),
            'extracto': meta.get('excerpt', 'Clic para leer el artículo completo.'),
            'contenido': html_body,
            'slug': slug
        }
        
        # Generar Archivo Individual
        final_html = plantilla
        for key, value in datos.items():
            final_html = final_html.replace('{{' + key.upper() + '}}', str(value))
        
        os.makedirs(POSTS_SALIDA_DIR, exist_ok=True)
        escribir_archivo(os.path.join(POSTS_SALIDA_DIR, slug), final_html)
        print(f"[OK] Articulo generado: revista/posts/{slug}")
        
        articulos.append(datos)

    # 3. Ordenar por fecha (simulado, asumiendo que el nombre de archivo ayuda o por meta)
    # Por ahora simplemente los mantendremos en el orden leido
    
    # 4. Inyectar en INDEX y CATEGORÍAS
    def inject_to_page(file_path, list_of_posts, filter_cat=None):
        content = leer_archivo(file_path)
        if not content: return
        
        # Filtrar posts
        if filter_cat:
            filtered = [p for p in list_of_posts if p['categoria'] == filter_cat]
        else:
            filtered = list_of_posts
            
        # Generar HTML Grilla
        cards_html = "".join([generar_tarjeta(p, f"./posts/{p['slug']}") for p in filtered])
        
        # Reemplazar GRID HOOK
        pattern_grid = r'(<!-- POSTS_HOOK_START -->)(.*?)(<!-- POSTS_HOOK_END -->)'
        replacement_grid = f"\\1\n{cards_html}\n                    \\3"
        content = re.sub(pattern_grid, replacement_grid, content, flags=re.DOTALL)
        
        # Reemplazar FEATURED HOOK (Solo si el archivo lo tiene y no hay filtro o es el primero)
        if "<!-- FEATURED_HOOK_START -->" in content and filtered:
            destacado_html = generar_destacado(filtered[0], f"./posts/{filtered[0]['slug']}")
            pattern_feat = r'(<!-- FEATURED_HOOK_START -->)(.*?)(<!-- FEATURED_HOOK_END -->)'
            replacement_feat = f"\\1\n{destacado_html}\n                \\3"
            content = re.sub(pattern_feat, replacement_feat, content, flags=re.DOTALL)
        
        escribir_archivo(file_path, content)
        print(f"[EXITO] Actualizado: {os.path.basename(file_path)} ({len(filtered)} posts)")

    # Actualizar Index
    inject_to_page(REVISTA_INDEX, articulos)
    
    # Actualizar Categorías
    for cat, path in CATEGORY_MAP.items():
        if os.path.exists(path):
            inject_to_page(path, articulos, filter_cat=cat)

    print("--- PROCESO FINALIZADO CON EXITO ---")

if __name__ == "__main__":
    compilar()
