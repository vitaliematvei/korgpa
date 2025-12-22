import { defineType } from 'sanity';

export default defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(), // Numele este obligatoriu
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(), // Slug-ul (URL-ul) este obligatoriu
    },
    {
      name: 'price',
      title: 'Price (EUR)',
      type: 'number',
      validation: (Rule) => Rule.required().min(0.01),
    },
    {
      name: 'gallery',
      title: 'Product Gallery',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    },
    {
      name: 'image',
      title: 'Product Image',
      type: 'image',
      options: {
        hotspot: true, // Permite crop mai bun
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'details',
      title: 'Details',
      type: 'array',
      of: [{ type: 'block' }], // Folosim Rich Text pentru descrieri detaliate
    },
    {
      name: 'youtube',
      title: 'YouTube Link',
      type: 'url',
      description: 'Link către videoclipul YouTube al produsului',
    },
    {
      name: 'price_id',
      title: 'Stripe Price ID',
      type: 'string',
    },
  ],
});
