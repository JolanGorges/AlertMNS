import { render } from '@jolan57/svelte-email';
import nodemailer from 'nodemailer';
import type { User } from '@prisma/client';
import emailVerification from '$lib/emails/email-verification.svelte';
import { BASE_URL, GOOGLE_EMAIL, GOOGLE_EMAIL_PASSWORD } from '$env/static/private';

const transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 587,
	secure: false,
	auth: {
		user: GOOGLE_EMAIL,
		pass: GOOGLE_EMAIL_PASSWORD
	}
});

export const sendEmailVerificationLink = async (token: string, user: User) => {
	const emailHtml = render({
		template: emailVerification,
		props: {
			name: user.username,
			emailVerificationUrl: `${BASE_URL}/email-verification/${token}`
		}
	});
	const options = {
		from: GOOGLE_EMAIL,
		to: user.email,
		subject: 'Vérification de votre adresse e-mail',
		html: emailHtml
	};
	await transporter.sendMail(options);
};
