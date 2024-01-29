import { redirect, type Handle } from '@sveltejs/kit';
import lucia from '$lib/server/auth';
import { createPasswordResetToken } from '$lib/server/token';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(lucia.sessionCookieName);
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await lucia.validateSession(sessionId);
	if (session?.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}
	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}
	if (event.route.id?.startsWith('/(app)')) {
		if (!user) {
			redirect(302, '/login');
		}
		if (user.forceReset) {
			const token = await createPasswordResetToken(user.id);
			redirect(302, `/reset-password/${token}`);
		}
	} else if (event.url.pathname.startsWith('/admin')) {
		if (!user) {
			redirect(302, '/login');
		} else if (!user.isAdmin) {
			redirect(302, '/');
		}
	}

	event.locals.user = user;
	event.locals.session = session;
	return resolve(event);
};
