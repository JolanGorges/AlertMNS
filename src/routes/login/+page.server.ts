import { redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { setError, superValidate } from 'sveltekit-superforms/server';
import { Argon2id } from 'oslo/password';
import type { Actions, PageServerLoad } from './$types';
import prisma from '$lib/prisma';
import lucia from '$lib/server/auth';

const schema = z.object({
	email: z.string().email(),
	password: z.string()
});

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		if (!locals.user.emailVerified) redirect(302, '/email-verification');
		redirect(302, '/');
	}
	const form = await superValidate(schema);

	return { form };
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await superValidate(request, schema);
		if (!form.valid) {
			return setError(form, 'password', 'Adresse e-mail ou mot de passe invalide');
		}
		const { email, password } = form.data;

		const existingUser = await prisma.user.findFirst({
			where: {
				email: email.toLowerCase()
			}
		});

		if (!existingUser) {
			return setError(form, 'password', 'Adresse e-mail ou mot de passe invalide');
		}

		const validPassword = await new Argon2id().verify(existingUser.hashedPassword, password);
		if (!validPassword) {
			return setError(form, 'password', 'Adresse e-mail ou mot de passe invalide');
		}

		const session = await lucia.createSession(existingUser.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/');
	}
};
