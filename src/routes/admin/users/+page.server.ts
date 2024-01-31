import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import prisma from '$lib/prisma';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	} else if (!locals.user.isAdmin) {
		return fail(403);
	}

	const [groups, users, totalUsers] = await prisma.$transaction([
		prisma.group.findMany(),
		prisma.user.findMany({
			take: 10,
			skip: 0,
			orderBy: {
				username: 'asc'
			},
			select: {
				id: true,
				email: true,
				username: true,
				group: true
			}
		}),
		prisma.user.count()
	]);

	return { groups, users, totalUsers };
};
