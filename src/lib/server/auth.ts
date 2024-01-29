import { Lucia } from 'lucia';
import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import { PrismaClient } from '@prisma/client';
import { dev } from '$app/environment';

const client = new PrismaClient();
const adapter = new PrismaAdapter(client.session, client.user);

const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => ({
		email: attributes.email,
		username: attributes.username,
		emailVerified: attributes.emailVerified,
		forceReset: attributes.forceReset,
		isAdmin: attributes.isAdmin
	})
});

export default lucia;

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
	interface DatabaseUserAttributes {
		email: string;
		username: string;
		emailVerified: boolean;
		forceReset: boolean;
		isAdmin: boolean;
	}
}
