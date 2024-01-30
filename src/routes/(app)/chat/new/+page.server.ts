import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';

import prisma from '$lib/prisma';

const schema = z.object({
	name: z.string(),
	usersToAdd: z.array(
		z.object({
			email: z.string().email(),
			username: z.string().min(3).max(32)
		})
	),
	isSpace: z.boolean()
});

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}
	return {
		userId: locals.user.id,
		username: locals.user.username
	};
};

export const actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			redirect(302, '/login');
		}

		const form = await request.formData();
		const result = schema.safeParse({
			name: form.get('name') || '',
			usersToAdd: JSON.parse(form.get('usersToAdd') as string),
			isSpace: form.get('space') === '1'
		});

		if (!result.success) {
			return fail(404);
		}

		type User = { email: string; username: string };
		let usersToAdd: User[] = result.data.usersToAdd.filter(
			(user: User) => user.email !== locals.user?.email
		);
		if (!usersToAdd.length) return;
		const users = await prisma.user.findMany({
			where: {
				email: {
					in: usersToAdd.map((user) => user.email)
				}
			},
			select: {
				id: true
			}
		});

		if (!result.data.isSpace && users.length === 1) {
			const conversation = await prisma.conversation.findFirst({
				where: {
					users: {
						every: {
							id: {
								in: [locals.user.id, users[0].id]
							}
						}
					},
					isSpace: result.data.isSpace
				}
			});
			console.log(conversation);
			if (conversation) redirect(302, `/chat/${conversation.id}`);
		}

		const conversation = await prisma.conversation.create({
			data: {
				name: result.data.isSpace ? result.data.name : null,
				isSpace: result.data.isSpace,
				users: {
					connect: [{ id: locals.user.id }, ...users]
				}
			}
		});

		redirect(302, `/chat/${conversation.id}`);
	}
} satisfies Actions;
