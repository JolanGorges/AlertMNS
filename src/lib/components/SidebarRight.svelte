<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { popup } from '@skeletonlabs/skeleton';

	export let value: {
		username: string;
		conversations: {
			name: string | null;
			isSpace: boolean;
			id: string;
			users: {
				id: string;
				username: string;
				email: string;
			}[];
		}[];
	};

	async function startConversation(userId: string) {
		console.log('start conversation userId', userId);
		const response = await fetch('/api/conversation', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ userId })
		});
		if (response.ok) {
			const data = await response.json();
			await goto(`/chat/${data.id}`);
		}
	}

	$: conversation = value.conversations.find((c) => c.id === $page.params.slug);
</script>

<div class="h-full flex flex-col">
	<div class="flex-grow">
		<nav class="list-nav">
			<ul>
				{#if conversation}
					{#each conversation.users as user, i}
						<li>
							<button
								class="w-full"
								use:popup={{ event: 'click', target: 'userPopup-' + i, placement: 'right' }}
								>{user.username}</button
							>
							<div class="card p-4 w-72 shadow-xl" data-popup="userPopup-{i}">
								<div class="flex flex-col items-center space-y-1">
									<div><p>{user.username}</p></div>
									<div><p>{user.email}</p></div>
									<button
										id={user.id}
										on:click={() => startConversation(user.id)}
										class="btn variant-soft w-full"
									>
										Envoyer un message
									</button>
								</div>
								<div class="arrow bg-surface-100-800-token" />
							</div>
						</li>
					{/each}
				{/if}
			</ul>
		</nav>
	</div>
</div>
