import { fail, redirect } from '@sveltejs/kit';
import prisma from '$lib/prisma';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	} else if (!locals.user.isAdmin) {
		return fail(403);
	}
	const groups = await prisma.group.findMany({
		include: {
			_count: {
				select: { users: true }
			}
		}
	});

	return {
		groups
	};
};
