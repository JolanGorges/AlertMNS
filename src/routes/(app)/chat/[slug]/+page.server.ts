import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import prisma from '$lib/prisma';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	const conversation = await prisma.conversation.findUnique({
		where: {
			id: params.slug,
			users: {
				some: {
					id: locals.user.id
				}
			}
		},
		select: {
			messages: {
				take: 10,
				orderBy: {
					createdAt: 'desc'
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
					},
					conversationId: true
				}
			}
		}
	});
	const messages = conversation?.messages.reverse() || [];

	return { messages, userId: locals.user.id };
};
