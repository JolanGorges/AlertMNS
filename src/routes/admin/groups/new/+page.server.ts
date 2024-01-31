import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { setError, superValidate } from 'sveltekit-superforms/server';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import type { Actions, PageServerLoad } from './$types';
import prisma from '$lib/prisma';

const schema = z.object({
	name: z.string().min(3).max(32)
});

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	} else if (!locals.user.isAdmin) {
		return fail(403);
	}
	const form = await superValidate(schema);
	return { form };
};

export const actions: Actions = {
	default: async ({ locals, request }) => {
		if (!locals.user) {
			redirect(302, '/login');
		} else if (!locals.user.isAdmin) {
			return fail(403);
		}
		const form = await superValidate(request, schema);
		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await prisma.group.create({ data: { name: form.data.name } });
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
				return setError(form, 'name', 'Un groupe avec ce nom existe déjà');
			}
			return setError(form, 'name', 'Une erreur inconnue est survenue');
		}
	}
};
