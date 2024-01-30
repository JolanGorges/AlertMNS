import { json, type RequestHandler, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import prisma from '$lib/prisma';

const getSchema = z.object({
	id: z.string().uuid().nullable(),
	all: z.boolean().optional()
});

const deleteSchema = z.object({
	id: z.string().uuid()
});

const patchSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(3).max(32),
	remove: z.array(z.string().length(15)),
	add: z.array(z.string().length(15))
});

export const GET: RequestHandler = async ({ locals, url }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	const result = getSchema.safeParse({
		id: url.searchParams.get('id'),
		all: url.searchParams.get('all') === 'true'
	});

	if (!result.success) {
		return new Response(null, { status: 400 });
	}

	if (result.data.id) {
		return json(
			await prisma.group.findFirst({
				where: {
					id: result.data.id
				},

				include: {
					users: result.data.all
						? true
						: {
								where: {
									NOT: {
										id: locals.user.id
									}
								}
							}
				}
			})
		);
	}
	return json(
		await prisma.group.findMany({
			include: {
				_count: {
					select: { users: true }
				}
			}
		})
	);
};

export const DELETE: RequestHandler = async ({ locals, url }) => {
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

	await prisma.group.delete({
		where: {
			id: result.data.id
		}
	});
	return new Response();
};

export const PATCH: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) {
		redirect(302, '/login');
	} else if (!locals.user.isAdmin) {
		redirect(302, '/');
	}
	const result = patchSchema.safeParse(await request.json());

	if (!result.success) {
		return new Response(null, { status: 400 });
	}

	const group = await prisma.group.findUnique({
		where: {
			id: result.data.id
		}
	});

	if (!group) {
		return new Response(null, { status: 404 });
	}

	await prisma.group.update({
		where: {
			id: result.data.id
		},
		data: {
			name: result.data.name,
			users: {
				disconnect: result.data.remove?.map((id) => ({
					id
				})),
				connect: result.data.add?.map((id) => ({
					id
				}))
			}
		}
	});

	return new Response();
};
