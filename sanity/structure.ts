import type { StructureResolver } from 'sanity/structure';
import ProductListPane from './ProductListPane';

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.component(ProductListPane).id('products-root-pane').title('Products');
