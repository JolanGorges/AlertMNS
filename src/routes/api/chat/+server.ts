import { z } from 'zod';
import type { RequestHandler } from './$types';
import prisma from '$lib/prisma';
import storeMessageNext from '$lib/stores/conversations';
import { redirect } from '@sveltejs/kit';

const postSchema = z.object({
	text: z.string(),
	hostId: z.string().length(15),
	conversationId: z.string().uuid()
});

const getSchema = z.object({
	mid: z.string().uuid()
});

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}
	const result = getSchema.safeParse({
		mid: url.searchParams.get('mid')
	});
	if (!result.success) {
		return new Response(null, { status: 400 });
	}

	const message = await prisma.message.findUnique({
		where: {
			id: result.data.mid
		},
		select: {
			createdAt: true,
			conversationId: true
		}
	});

	if (!message) {
		return new Response(null, { status: 404 });
	}

	const messages = await prisma.message.findMany({
		where: {
			conversationId: message.conversationId,
			createdAt: {
				lt: message.createdAt
			}
		},
		select: {
			id: true,
			text: true,
			createdAt: true,
			user: {
				select: {
					id: true,
					username: true
				}
			}
		},
		orderBy: {
			createdAt: 'desc'
		},
		take: 10
	});

	return new Response(
		JSON.stringify({
			messages: messages.toReversed()
		})
	);
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}
	const data = await request.json();
	const result = postSchema.safeParse(data);
	if (!result.success) {
		return new Response(null, { status: 400 });
	}
	const message = await prisma.message.create({
		data: {
			text: result.data.text,
			user: {
				connect: {
					id: result.data.hostId
				}
			},
			conversation: {
				connect: {
					id: result.data.conversationId
				}
			}
		},
		include: {
			user: {
				select: {
					id: true,
					username: true
				}
			}
		}
	});

	storeMessageNext.set({
		id: message.id,
		createdAt: message.createdAt,
		user: {
			id: message.userId,
			username: message.user.username
		},
		conversationId: message.conversationId || '',
		text: message.text
	});

	return new Response(
		JSON.stringify({
			id: message.id,
			createdAt: message.createdAt,
			user: {
				id: message.userId,
				username: message.user.username
			},
			text: message.text
		})
	);
};
