/**
 * Property Data Type Definition
 */

export type Property = {
    id: string;
    title: string;
    price: number;
    type: "casa" | "apartamento";
    address: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    lat: number;
    lng: number;
    image: string;
    description: string;
};
