import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import prisma from '$lib/prisma';

const schema = z.object({
	userId: z.string().length(15)
});

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	const result = schema.safeParse(await request.json());

	if (!result.success) {
		return new Response(null, { status: 400 });
	}

	let conversation = await prisma.conversation.findFirst({
		where: {
			users: {
				every: {
					id: {
						in: [locals.user.id, result.data.userId]
					}
				}
			},
			isSpace: false
		}
	});

	if (conversation) {
		return new Response(JSON.stringify(conversation));
	}

	conversation = await prisma.conversation.create({
		data: {
			isSpace: false,
			users: {
				connect: [
					{
						id: locals.user.id
					},
					{
						id: result.data.userId
					}
				]
			}
		}
	});

	return new Response(JSON.stringify(conversation));
};
