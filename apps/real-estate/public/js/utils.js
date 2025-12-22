/**
 * Utility functions for widget
 */

/**
 * Format price in Brazilian Real
 * @param {number} price - Price in BRL
 * @returns {string} Formatted price
 */
export function formatPrice(price) {
    return `R$ ${price.toLocaleString('pt-BR')}`;
}

/**
 * Format price in short form (thousands)
 * @param {number} price - Price in BRL  
 * @returns {string} Short price (e.g., "R$ 1.850k")
 */
export function formatPriceShort(price) {
    return `R$ ${Math.round(price / 1000)}k`;
}

/**
 * Check if string is a valid image URL
 * @param {string} str - String to check
 * @returns {boolean} True if valid URL
 */
export function isImageUrl(str) {
    return str && (str.startsWith('http') || str.startsWith('/'));
}

/**
 * Generate image HTML tag
 * @param {Object} property - Property object
 * @param {string} size - Size variant ('card' or 'infoWindow')
 * @returns {string} HTML string
 */
export function getImageTag(property, size = 'card') {
    if (isImageUrl(property.image)) {
        if (size === 'card') {
            return `<img src="${property.image}" alt="${property.title}" class="property-image" onerror="this.style.display='none'" />`;
        } else {
            return `<img src="${property.image}" class="info-window-image" onerror="this.style.display='none'" />`;
        }
    }

    // Fallback emoji  
    const fontSize = size === 'card' ? '4rem' : '3rem';
    return `<div style="display: flex; align-items: center; justify-content: center; font-size: ${fontSize}; height: ${size === 'card' ? '200px' : '120px'};">${property.image || '🏠'}</div>`;
}
