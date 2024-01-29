import { isWithinExpirationDate } from 'oslo';
import { z } from 'zod';
import lucia from '$lib/server/auth';
import prisma from '$lib/prisma';

import type { RequestHandler } from './$types';

const schema = z.object({
	token: z.string().length(40)
});

export const GET: RequestHandler = async ({ params }) => {
	const result = schema.safeParse({
		token: params.token
	});

	if (!result.success) {
		console.log(result.error);
		return new Response(null, {
			status: 401
		});
	}

	console.log('success');

	const token = await prisma.$transaction(async (trx) => {
		const token = await trx.emailVerificationToken.findUnique({
			where: {
				id: result.data.token
			}
		});
		await trx.emailVerificationToken.delete({
			where: {
				id: result.data.token
			}
		});
		return token;
	});

	if (!token || !isWithinExpirationDate(token.expiresAt)) {
		return new Response(null, {
			status: 400
		});
	}

	const user = await prisma.user.findUnique({
		where: {
			id: token.userId
		}
	});

	if (!user || user.email !== token.email) {
		return new Response(null, {
			status: 400
		});
	}

	await lucia.invalidateUserSessions(user.id);
	await prisma.user.update({
		where: {
			id: user.id
		},
		data: {
			emailVerified: 1
		}
	});

	const session = await lucia.createSession(user.id, {});
	const sessionCookie = lucia.createSessionCookie(session.id);

	return new Response(null, {
		status: 302,
		headers: {
			Location: '/',
			'Set-Cookie': sessionCookie.serialize()
		}
	});
};
