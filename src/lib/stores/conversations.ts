import { writable } from 'svelte/store';

type Message = {
	id: string;
	createdAt: Date;
	user: {
		id: string;
		username: string;
	};
	text: string;
	conversationId: string;
};

const storeMessageNext = writable<Message>();

export default storeMessageNext;
