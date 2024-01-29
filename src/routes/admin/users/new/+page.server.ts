import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import generator from 'generate-password';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Argon2id } from 'oslo/password';
import { generateId } from 'lucia';
import { setError, superValidate } from 'sveltekit-superforms/server';
import prisma from '$lib/prisma';
import type { PageServerLoad, Actions } from './$types';
import { createEmailVerificationToken } from '$lib/server/token';
import { sendEmailVerificationLink } from '$lib/server/email';

const schema = z.object({
	email: z.string().email({ message: "L'adresse email n'est pas valide" }),
	username: z.string().min(3).max(32),
	groupId: z.string().uuid().or(z.string().max(0)).default('')
});

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	} else if (!locals.user.isAdmin) {
		throw fail(403);
	}
	const form = await superValidate(schema);
	const groups = await prisma.group.findMany();

	return { form, groups };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			redirect(302, '/login');
		} else if (!locals.user.isAdmin) {
			throw fail(403);
		}
		const form = await superValidate(request, schema);

		if (!form.valid) {
			// const errors = { username: '', email: '' };
			// for (const error of result.error.errors) {
			// 	if (error.path[0] === 'username') {
			// 		errors.username = "Le nom d'utilisateur doit faire entre 3 et 32 caractères.";
			// 	} else if (error.path[0] === 'email') {
			// 		errors.email = "L'adresse email n'est pas valide.";
			// 	}
			// }
			// return new Response(JSON.stringify(errors), { status: 400 });
			// return setError(form, 'username', "Le nom d'utilisateur doit faire entre 3 et 32 caractères");
			return fail(400, { form });
		}

		// const user = await prisma.user.findUnique({
		// 	where: {
		// 		email: result.data.email
		// 	}
		// });

		// if (user) {
		// 	return new Response(null, { status: 409 });
		// }

		let group: Prisma.GroupCreateNestedOneWithoutUsersInput | undefined;
		if (form.data.groupId !== '') {
			group = {
				connect: {
					id: form.data.groupId
				}
			};
		}

		const password = generator.generate({
			length: 10,
			numbers: true,
			symbols: true,
			strict: true
		});

		try {
			const user = await prisma.user.create({
				data: {
					id: generateId(15),
					email: form.data.email.toLowerCase(),
					username: form.data.username,
					hashedPassword: await new Argon2id().hash(password),
					emailVerified: 0,
					forceReset: 1,
					group
				}
			});

			const verificationToken = await createEmailVerificationToken(
				user.id,
				form.data.email.toLowerCase()
			);

			await sendEmailVerificationLink(verificationToken, user);
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
				return setError(form, 'email', "L'adresse email est déjà utilisée");
			}
		}

		// const user = await auth.createUser({
		// 	key: {
		// 		providerId: 'email',
		// 		providerUserId: result.data.email.toLowerCase(),
		// 		password
		// 	},
		// 	attributes: {
		// 		username: result.data.username,
		// 		email: result.data.email.toLowerCase(),
		// 		email_verified: 0,
		// 		force_reset: 1
		// 	}
		// });
	}
};
