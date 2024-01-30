import { fail } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms/server';
import { z } from 'zod';
import type { PageServerLoad, Actions } from './$types';
import { createPasswordResetToken } from '$lib/server/token';
import { sendPasswordResetLink } from '$lib/server/email';
import prisma from '$lib/prisma';

const resetPasswordSchema = z.object({
	email: z.string()
});

export const load: PageServerLoad = async (event) => {
	const form = await superValidate(event, resetPasswordSchema);
	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, resetPasswordSchema);
		const { email } = form.data;

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const user = await prisma.user.findUnique({
				where: {
					email: email.toLowerCase()
				}
			});
			if (!user) {
				return setError(form, 'email', "Aucun compte n'existe avec cet adresse e-mail");
			}

			const token = await createPasswordResetToken(user.id);
			await sendPasswordResetLink(token, user);
			return {
				success: true
			};
		} catch (e) {
			return fail(500, {
				message: 'Une erreur inconnue est survenue'
			});
		}
	}
};
