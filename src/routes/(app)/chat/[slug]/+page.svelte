<script lang="ts">
	import { page } from '$app/stores';
	import { source } from 'sveltekit-sse';

	export let data;

	let hostId: string;
	let conversationId: string;
	let sse: ReturnType<typeof source>;
	let messageFeed: Message[] = [];

	let lastMessageId: string;

	$: hostId = data.userId;
	$: if (conversationId !== $page.params.slug) {
		conversationId = $page.params.slug;
		messageFeed = data.messages;
		if (messageFeed.length > 0) lastMessageId = messageFeed[0].id;
		scrollToEnd();
		text = '';

		if (sse) sse.close();
		sse = source(`/api/conversation/${conversationId}`, false);
		sse.select(conversationId).subscribe((data: string) => {
			if (data === '') return;
			const message: Message = JSON.parse(data);
			if (message.user.id === hostId) return;
			messageFeed = [...messageFeed, message];
		});
	}

	type Message = {
		id: string;
		createdAt: Date;
		user: {
			id: string;
			username: string;
		};
		text: string;
		conversationId: string | null;
	};

	import { beforeUpdate, afterUpdate } from 'svelte';

	let autoscroll: boolean;

	beforeUpdate(() => {
		// autoscroll =
		// 	scroller && scroller.offsetHeight + scroller.scrollTop > scroller.scrollHeight - 20;
	});

	afterUpdate(() => {
		if (isLoading && lastMessageId != '') {
			const element = document.getElementById(lastMessageId);
			if (element) scroller.scrollTop = element.offsetTop - 10;
			lastMessageId = messageFeed[0].id;
			isLoading = false;
		}
		// if (autoscroll) scroller.scrollTo(0, scroller.scrollHeight);
	});

	function scrollToEnd() {
		tick().then(() => {
			if (scroller) scroller.scroll({ top: scroller.scrollHeight });
		});
	}

	import { tick } from 'svelte';
	async function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			await sendMessage();
		}
	}

	async function sendMessage() {
		if (text.trim() === '') {
			return;
		}

		const res = await fetch('/api/chat', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ text, hostId, conversationId })
		});
		if (res.ok) {
			const data = await res.json();
			messageFeed = [...messageFeed, data];
			text = '';
		}
	}

	let text = '';
	let scroller: HTMLElement;
	// $: if (scroller && text === '') {
	// 	tick().then(() => {
	// 		scroller.scroll({ top: scroller.scrollHeight });
	// 	});
	// }

	let isLoading: boolean = false;

	async function handleScroll(event: Event) {
		const target = event.target as HTMLElement;
		if (target.scrollTop === 0 && !isLoading) {
			isLoading = true;
			const res = await fetch(`/api/chat?mid=${lastMessageId}`);
			if (res.ok) {
				const data = await res.json();
				const messages: Message[] = data.messages;
				if (messages.length === 0) return;
				messageFeed = [...messages, ...messageFeed];
			}
		}
	}

	function toHumanDate(date: Date | string) {
		if (typeof date === 'string') date = new Date(date);
		return date.toLocaleDateString('fr') + ' ' + date.toLocaleTimeString('fr');
	}

	let files: FileList;
	let fileInput: HTMLInputElement;
</script>

<div class="grid grid-rows-[1fr_auto] gap-4 h-screen">
	<section
		on:scroll={handleScroll}
		bind:this={scroller}
		class="w-full p-4 overflow-y-auto space-y-4"
	>
		{#each messageFeed as bubble, i}
			{#if bubble.user.id === hostId}
				<div id={bubble.id} class="grid grid-cols-[auto_1fr] gap-2">
					<div class="w-12"></div>
					<div class="card p-4 variant-soft rounded-tl-none space-y-2">
						<header class="flex justify-between items-center">
							<p class="font-bold">{bubble.user.username}</p>
							<small class="opacity-50">{toHumanDate(bubble.createdAt)}</small>
						</header>
						<p class="whitespace-pre-wrap">{bubble.text}</p>
					</div>
				</div>
			{:else}
				<div id={bubble.id} class="grid grid-cols-[1fr_auto] gap-2">
					<div class="card p-4 rounded-tr-none space-y-2 variant-soft-primary">
						<header class="flex justify-between items-center">
							<p class="font-bold">{bubble.user.username}</p>
							<small class="opacity-50">{toHumanDate(bubble.createdAt)}</small>
						</header>
						<p class="whitespace-pre-wrap">{bubble.text}</p>
					</div>
					<div class="w-12"></div>
				</div>
			{/if}
		{/each}
	</section>
	<section class="border-t border-surface-500/30 p-4 self-end">
		<div class="input-group input-group-divider grid-cols-[auto_1fr_auto] rounded-container-token">
			<input bind:files bind:this={fileInput} type="file" class="hidden" />
			<button on:click={() => fileInput.click()} class="input-group-shim">+</button>
			<textarea
				bind:value={text}
				class="bg-transparent border-0 ring-0 resize-none overflow-hidden"
				name="prompt"
				id="prompt"
				placeholder="Écrire un message..."
				rows="1"
				on:keydown={onKeydown}
			/>
			<button on:click={sendMessage} class="variant-filled-primary">Envoyer</button>
		</div>
	</section>
</div>
