import { fail, redirect } from '@sveltejs/kit';
import { isWithinExpirationDate } from 'oslo';
import { Argon2id } from 'oslo/password';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';
import prisma from '$lib/prisma';
import type { Actions } from './$types';
import lucia from '$lib/server/auth';

const schema = z.object({
	password: z.string().refine((password) => {
		const hasUpper = /[A-Z]/.test(password);
		const hasLower = /[a-z]/.test(password);
		const hasNumber = /\d/.test(password);
		const hasSymbol = /[\W_]/.test(password);
		return (
			password.length >= 8 && [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length >= 3
		);
	}, 'Le mot de passe doit comporter au moins 8 caractères et contenir trois des quatre types de caractères suivants : majuscules, minuscules, chiffres et symboles')
});

export const load = async () => {
	const form = await superValidate(schema);
	return { form };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const form = await superValidate(request, schema);
		if (!form.valid) {
			return fail(400, { form });
		}

		const { password } = form.data;

		const verificationToken = params.token;

		const token = await prisma.$transaction(async (trx) => {
			const token = await trx.passwordResetToken.findUnique({
				where: {
					id: verificationToken
				}
			});
			if (token) {
				await trx.passwordResetToken.delete({
					where: {
						id: token.id
					}
				});
			}
			return token;
		});

		if (!token || !isWithinExpirationDate(token.expiresAt)) {
			return fail(400, { form });
		}

		await lucia.invalidateUserSessions(token.userId);
		const hashedPassword = await new Argon2id().hash(password);
		await prisma.user.update({
			where: {
				id: token.userId
			},
			data: {
				hashedPassword,
				forceReset: 0
			}
		});

		const session = await lucia.createSession(token.userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		redirect(302, '/');
		// return {
		// 	status: 302,
		// 	headers: {
		// 		Location: '/',
		// 		'Set-Cookie': sessionCookie.serialize()
		// 	}
		// };
	}
};
