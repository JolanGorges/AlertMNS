import { json, type RequestHandler, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import prisma from '$lib/prisma';

const deleteSchema = z.object({
	id: z.string().length(15)
});

const patchSchema = z.object({
	id: z.string().length(15),
	email: z.string().email().optional(),
	username: z.string().min(3).max(32).optional(),
	groupId: z.string().uuid().nullable().optional(),
	forceReset: z.boolean().optional()
});

const getSchema = z.object({
	search: z.string().optional(),
	offset: z.number().optional(),
	limit: z.number().max(10).optional(),
	count: z.boolean().optional(),
	onlyWithoutGroup: z.boolean().optional(),
	all: z.boolean().optional()
});

export const PATCH: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	} else if (!locals.user.isAdmin) {
		redirect(302, '/');
	}

	const result = patchSchema.safeParse(await request.json());

	if (!result.success) {
		const errors = { username: '', email: '' };
		result.error.errors.forEach((error) => {
			if (error.path[0] === 'username') {
				errors.username = "Le nom d'utilisateur doit faire entre 3 et 32 caractères.";
			} else if (error.path[0] === 'email') {
				errors.email = "L'adresse email n'est pas valide.";
			}
		});
		return new Response(JSON.stringify(errors), { status: 400 });
	}

	const user = await prisma.user.findUnique({
		where: {
			id: result.data.id
		}
	});

	if (!user) {
		return new Response(null, { status: 404 });
	}

	const update: any = {};

	if (result.data.email) {
		update.email = result.data.email;
	}

	if (result.data.username) {
		update.username = result.data.username;
	}

	if (result.data.groupId === null) {
		update.group = {
			disconnect: true
		};
	} else if (result.data.groupId) {
		update.group = {
			connect: {
				id: result.data.groupId
			}
		};
	}

	if (result.data.forceReset) {
		update.force_reset = Number(result.data.forceReset);
	}

	await prisma.user.update({
		where: {
			id: result.data.id
		},
		data: update
	});

	return new Response();
};

export const DELETE: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	} else if (!locals.user.isAdmin) {
		redirect(302, '/');
	}

	const result = deleteSchema.safeParse({
		id: url.searchParams.get('id')
	});
	if (!result.success) {
		return new Response(null, { status: 400 });
	}
	const user = await prisma.user.findUnique({
		where: {
			id: result.data.id
		}
	});
	if (!user) {
		return new Response(null, { status: 404 });
	}

	await prisma.user.delete({
		where: {
			id: result.data.id
		}
	});

	const conversations = await prisma.conversation.findMany({
		select: {
			id: true,
			users: {
				select: {
					id: true
				}
			}
		}
	});

	conversations.forEach(async (conversation) => {
		if (conversation.users.length <= 1) {
			await prisma.conversation.delete({
				where: {
					id: conversation.id
				}
			});
		}
	});

	return new Response();
};

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	const result = getSchema.safeParse({
		search: url.searchParams.get('search'),
		offset: Number(url.searchParams.get('offset')),
		limit: Number(url.searchParams.get('limit')),
		count: url.searchParams.get('count') === 'true',
		all: url.searchParams.get('all') === 'true',
		onlyWithoutGroup: url.searchParams.get('onlyWithoutGroup') === 'true'
	});

	if (!result.success) {
		return new Response(null, { status: 400 });
	}

	let users = await prisma.user.findMany({
		take: result.data.limit || 5,
		skip: result.data.offset || 0,
		orderBy: {
			username: 'asc'
		},
		where: {
			OR: [
				{ username: { contains: result.data.search, mode: 'insensitive' } },
				{ email: { contains: result.data.search, mode: 'insensitive' } },
				{ group: { name: { contains: result.data.search, mode: 'insensitive' } } }
			],
			group: result.data.onlyWithoutGroup ? null : undefined,
			id: result.data.all ? undefined : { not: locals.user.id }
		},
		select: {
			id: true,
			email: true,
			username: true,
			group: true
		}
	});

	const count = result.data.count
		? await prisma.user.count({
				where: {
					OR: [
						{ username: { contains: result.data.search, mode: 'insensitive' } },
						{ email: { contains: result.data.search, mode: 'insensitive' } },
						{ group: { name: { contains: result.data.search, mode: 'insensitive' } } }
					]
				}
			})
		: null;

	return json({ users, count });
};
