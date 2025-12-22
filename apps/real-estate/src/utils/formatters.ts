/**
 * Utility Functions for Formatting
 */

/**
 * Format price in Brazilian Real currency
 * @param price - Price in BRL
 * @returns Formatted price string (e.g., "R$ 1.850.000")
 */
export function formatPrice(price: number): string {
    return `R$ ${price.toLocaleString("pt-BR")}`;
}

/**
 * Format price in short form (thousands)
 * @param price - Price in BRL
 * @returns Short formatted price (e.g., "R$ 1.850k")
 */
export function formatPriceShort(price: number): string {
    return `R$ ${Math.round(price / 1000)}k`;
}

/**
 * Format property details
 * @param bedrooms - Number of bedrooms
 * @param bathrooms - Number of bathrooms
 * @param area - Area in m²
 * @returns Formatted details string
 */
export function formatPropertyDetails(
    bedrooms: number,
    bathrooms: number,
    area: number
): string {
    return `${bedrooms} quartos • ${bathrooms} banheiros • ${area}m²`;
}
