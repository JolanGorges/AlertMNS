import { TimeSpan, createDate } from 'oslo';
import { generateId } from 'lucia';
import prisma from '$lib/prisma';

export async function createPasswordResetToken(userId: string): Promise<string> {
	await prisma.passwordResetToken.deleteMany({
		where: {
			userId
		}
	});
	const tokenId = generateId(40);
	await prisma.passwordResetToken.create({
		data: {
			id: tokenId,
			userId,
			expiresAt: createDate(new TimeSpan(2, 'h'))
		}
	});
	return tokenId;
}

export async function createEmailVerificationToken(userId: string, email: string): Promise<string> {
	await prisma.emailVerificationToken.deleteMany({
		where: {
			userId
		}
	});
	const tokenId = generateId(40);
	await prisma.emailVerificationToken.create({
		data: {
			id: tokenId,
			userId,
			email,
			expiresAt: createDate(new TimeSpan(2, 'h'))
		}
	});
	return tokenId;
}
