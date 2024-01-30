<script lang="ts">
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import ifa from '$lib/assets/ifa.png';
	import mns from '$lib/assets/mns2.png';
	import Cog from '~icons/mdi/cog';
	import Plus from '~icons/mdi/plus';
	import { page } from '$app/stores';

	export let value: {
		username: string;
		isAdmin: boolean;
		conversations: {
			name: string | null;
			isSpace: boolean;
			id: string;
			users: {
				id: string;
				username: string;
			}[];
		}[];
	};
	let refs: HTMLAnchorElement[] = [];
	$: value, (refs = Array(value.conversations.length).fill(null));
</script>

<div class="h-full flex flex-col">
	<a href="/" class="flex justify-evenly items-center py-2">
		<img src={ifa} alt="IFA" class="w-8" />
		<img src={mns} alt="MNS" class="w-16" />
	</a>
	<div class="flex-grow">
		<nav class="list-nav">
			<button class="flex w-full"><Plus /> Nouveau</button>
		</nav>
		<Accordion>
			<AccordionItem open>
				<svelte:fragment slot="summary">Discussions</svelte:fragment>
				<svelte:fragment slot="content">
					<nav class="list-nav">
						<ul>
							{#each value.conversations as conversation, i}
								{#if !conversation.isSpace}
									<li>
										<a
											bind:this={refs[i]}
											class={$page.params.slug === conversation.id ? 'bg-black' : ''}
											href="/chat/{conversation.id}">{conversation.users[0].username}</a
										>
									</li>
								{/if}
							{/each}
						</ul>
					</nav>
				</svelte:fragment>
			</AccordionItem>
			<AccordionItem open>
				<svelte:fragment slot="summary">Espaces</svelte:fragment>
				<svelte:fragment slot="content">
					<nav class="list-nav">
						<ul>
							{#each value.conversations as conversation, i}
								{#if conversation.isSpace}
									<li>
										<a
											bind:this={refs[i]}
											class={$page.params.slug === conversation.id ? 'bg-black' : ''}
											href="/chat/{conversation.id}">{conversation.name}</a
										>
									</li>
								{/if}
							{/each}
						</ul>
					</nav>
				</svelte:fragment>
			</AccordionItem>
		</Accordion>
	</div>
	<div class="flex text-xl items-center p-2 bg-surface-800">
		<p class="flex-grow">{value.username}</p>

		<button class="btn btn-icon"><Cog /></button>
		<div class="card w-56 shadow-xl" data-popup="popupClick">
			<div class="flex flex-col items-center space-y-1">
				<nav class="list-nav w-full text-sm">
					<ul>
						{#if value.isAdmin}
							<li>
								<a href="/admin/users">Paramètres administrateur </a>
							</li>
						{/if}
						<li>
							<a href="/logout">Déconnexion</a>
						</li>
					</ul>
				</nav>
			</div>
			<div class="arrow bg-surface-100-800-token" />
		</div>
	</div>
</div>
