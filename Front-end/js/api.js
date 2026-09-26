/**
 * API Helper for Consultoría ATLOB
 * Handles communication with the Backend CMS
 */

const API_BASE_URL = '/api';

const atlobApi = {
    /**
     * Get published articles
     * @param {Object} params - Query parameters (page, limit, category)
     * @returns {Promise<Object>}
     */
    getArticles: async (params = {}) => {
        try {
            const query = new URLSearchParams(params).toString();
            const response = await fetch(`${API_BASE_URL}/articles?${query}`);
            if (!response.ok) throw new Error('Error al obtener artículos');
            return await response.json();
        } catch (error) {
            console.error('API Error (getArticles):', error);
            return { success: false, data: [] };
        }
    },

    /**
     * Get a single article by its slug
     * @param {string} slug
     * @returns {Promise<Object>}
     */
    getArticleBySlug: async (slug) => {
        try {
            const response = await fetch(`${API_BASE_URL}/articles/slug/${slug}`);
            if (!response.ok) throw new Error('Error al obtener artículo');
            return await response.json();
        } catch (error) {
            console.error('API Error (getArticleBySlug):', error);
            return { success: false, data: null };
        }
    },

    /**
     * Format a date to local string
     * @param {string} dateString 
     * @returns {string} Formatted date (e.g. 20 Abril, 2026)
     */
    formatDate: (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    },
    
    /**
     * Resolve image URL (if it's a relative path from backend)
     */
    resolveImageUrl: (path) => {
        if (!path) return '/iconos/vistaoficina.jpg'; // Fallback
        if (path.startsWith('http')) return path;
        // Check if path already contains '/uploads/'
        if (path.startsWith('/uploads/')) {
            return path;
        }
        if (path.startsWith('/')) {
            return path;
        }
        return `/uploads/${path}`;
    }
};
