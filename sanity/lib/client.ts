import { createClient } from 'next-sanity';

import { apiVersion, dataset, projectId } from '../env';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Dezactivat când folosim token de autentificare
  token: process.env.SANITY_AUTH_TOKEN,
});
