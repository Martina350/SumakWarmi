import { Category } from '../types/index.ts';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-menstrual',
    name: 'Cuidado Menstrual',
    slug: 'cuidado-menstrual',
    description: 'Alternativas seguras, reutilizables y conscientes para el ciclo menstrual.',
  },
  {
    id: 'cat-corporal',
    name: 'Cuidado Corporal e Higiene',
    slug: 'cuidado-corporal',
    description: 'Productos de higiene íntima suave y compresas térmicas para tu bienestar diario.',
  },
  {
    id: 'cat-alimenticio',
    name: 'Alimenticio & Infusiones',
    slug: 'alimenticio',
    description: 'Tés botánicos y bocados formulados para momentos de relajación y acompañamiento.',
  },
];
