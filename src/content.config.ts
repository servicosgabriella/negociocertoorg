import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			authorSlug: z.string().optional(),
			authorName: z.string().optional(),
			authorRole: z.string().optional(),
			authorImage: z.string().optional(),
			authorHref: z.string().optional(),
			categoria: z.string().optional(),
			category: z.string().optional(),
			categoryHref: z.string().optional(),
			thumb: z.string().optional(),
			heroImage: image().optional(),
			coverImage: z.string().optional(),
			coverAlt: z.string().optional(),
			breadcrumb: z
				.array(
					z.object({
						label: z.string(),
						href: z.string().optional(),
					})
				)
				.optional(),
			faq: z
				.array(
					z.object({
						question: z.string(),
						answer: z.string(),
					})
				)
				.optional(),
		}),
});

export const collections = { blog };