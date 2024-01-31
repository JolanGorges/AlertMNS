import { redirect } from '@sveltejs/kit';
import { events } from 'sveltekit-sse';
import storeMessageNext from '$lib/stores/conversations';

type EmitterOfManyEvents = (eventName: string, data: string) => any;
const emitters: Map<string, EmitterOfManyEvents> = new Map();

storeMessageNext.subscribe(function run(message) {
	emitters.forEach(function run(emit) {
		emit(message.conversationId, JSON.stringify(message));
	});
});

export async function GET({ params, locals }) {
	if (!locals.user) {
		redirect(302, '/login');
	}

	const conversationId = params.slug;
	const userId = locals.user.id;

	if (!conversationId) {
		return new Response('', { status: 400 });
	}

	const e = events(async function stfart(emit) {
		emitters.set(userId, emit);

		while (true) {
			await delay(1000);
		}
	}).onCancel(function stop() {
		emitters.delete(userId);
	});

	return e.toResponse();
}

function delay(milliseconds: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, milliseconds);
	});
}
