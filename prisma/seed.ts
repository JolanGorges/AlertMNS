import { Lucia } from 'lucia';
import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import { PrismaClient } from '@prisma/client';
import { Argon2id } from 'oslo/password';
import { generateId } from 'lucia';

const prisma = new PrismaClient();
const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: false
		}
	},
	getUserAttributes: (attributes) => {
		return {
			email: attributes.email,
			username: attributes.username,
			emailVerified: attributes.emailVerified
		};
	}
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
	interface DatabaseUserAttributes {
		email: string;
		username: string;
		emailVerified: boolean;
	}
}

await prisma.user.deleteMany();
await prisma.session.deleteMany();
await prisma.passwordResetToken.deleteMany();
await prisma.emailVerificationToken.deleteMany();
await prisma.conversation.deleteMany();
await prisma.message.deleteMany();
await prisma.group.deleteMany();

let data = [
	{
		email: 'jolan.gorges@outlook.com',
		firstName: 'Jolan',
		isAdmin: true
	}
];

const res = await fetch('https://dummyjson.com/users');
data.push(...(await res.json()).users);

for (const user of data) {
	await prisma.user.create({
		data: {
			id: generateId(15),
			email: user.email || `${user.firstName.toLowerCase().replace(/\s/g, '')}@gmail.com`,
			username: user.firstName || user.firstName,
			hashedPassword: await new Argon2id().hash('admin'),
			emailVerified: 1,
			forceReset: 0,
			isAdmin: user.isAdmin || false
		}
	});
}
