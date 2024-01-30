import { redirect } from '@sveltejs/kit';
import prisma from '$lib/prisma';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	const conversations = await prisma.conversation.findMany({
		where: {
			users: {
				some: {
					id: locals.user.id
				}
			}
		},
		select: {
			name: true,
			isSpace: true,
			id: true,
			users: {
				where: {
					id: {
						not: locals.user.id
					}
				},
				select: {
					id: true,
					username: true,
					email: true
				}
			}
		}
	});

	return {
		username: locals.user.username,
		isAdmin: locals.user.isAdmin,
		conversations
	};
};
