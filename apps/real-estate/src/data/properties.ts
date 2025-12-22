/**
 * Mock Property Data
 * 5 real properties in São Paulo (2025 market data)
 */

import { config } from "../config/env.js";
import type { Property } from "./types.js";

const { BASE_URL } = config;

export const PROPERTIES: Property[] = [
    {
        id: "prop-001",
        title: "Apartamento de Luxo nos Jardins",
        price: 1850000,
        type: "apartamento",
        address: "Rua Estados Unidos, 1500 - Jardim América, São Paulo - SP",
        bedrooms: 3,
        bathrooms: 3,
        area: 145,
        lat: -23.5669,
        lng: -46.6725,
        image: `${BASE_URL}/images/prop-001.png`,
        description:
            "Apartamento de alto padrão com acabamento premium, vista panorâmica e sacada gourmet. Condomínio completo com piscina, academia, salão de festas e segurança 24h.",
    },
    {
        id: "prop-002",
        title: "Casa Moderna em Pinheiros",
        price: 2200000,
        type: "casa",
        address: "Rua Fradique Coutinho, 850 - Pinheiros, São Paulo - SP",
        bedrooms: 4,
        bathrooms: 3,
        area: 220,
        lat: -23.5615,
        lng: -46.6893,
        image: `${BASE_URL}/images/prop-002.jpg`,
        description:
            "Casa reformada com arquitetura contemporânea, jardim com deck, churrasqueira e piscina aquecida. Localização privilegiada perto do metrô Fradique Coutinho.",
    },
    {
        id: "prop-003",
        title: "Apartamento Charmoso na Vila Madalena",
        price: 980000,
        type: "apartamento",
        address: "Rua Harmonia, 344 - Vila Madalena, São Paulo - SP",
        bedrooms: 2,
        bathrooms: 2,
        area: 75,
        lat: -23.5483,
        lng: -46.6925,
        image: `${BASE_URL}/images/prop-003.png`,
        description:
            "Apartamento decorado com estilo contemporâneo, sacada com churrasqueira e iluminação natural. Região vibrante com bares, galerias de arte e restaurantes.",
    },
    {
        id: "prop-004",
        title: "Apartamento Corporativo no Itaim Bibi",
        price: 1450000,
        type: "apartamento",
        address:
            "Av. Brigadeiro Faria Lima, 2232 - Itaim Bibi, São Paulo - SP",
        bedrooms: 2,
        bathrooms: 2,
        area: 95,
        lat: -23.5826,
        lng: -46.6855,
        image: `${BASE_URL}/images/prop-004.jpg`,
        description:
            "Apartamento mobiliado de alto padrão, ideal para executivos. Prédio moderno com coworking, academia 24h, spa e localização estratégica na Faria Lima.",
    },
    {
        id: "prop-005",
        title: "Casa Espaçosa em Moema",
        price: 1750000,
        type: "casa",
        address:
            "Rua Ministro Jesuíno Cardoso, 567 - Moema, São Paulo - SP",
        bedrooms: 4,
        bathrooms: 4,
        area: 280,
        lat: -23.6004,
        lng: -46.6695,
        image: `${BASE_URL}/images/prop-005.jpg`,
        description:
            "Casa ampla com quintal, piscina, área gourmet completa e hidromassagem. Excelente para famílias, perto do Parque Ibirapuera, escolas e comércio.",
    },
];
