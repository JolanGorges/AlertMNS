<script lang="ts">
	import Close from '~icons/mdi/close';
	import {
		Autocomplete,
		ListBox,
		ListBoxItem,
		getModalStore,
		type AutocompleteOption
	} from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	const modalStore = getModalStore();

	type User = { id: string; email: string; username: string };
	let users: AutocompleteOption<string, User>[] = [];
	let usersToAdd: User[] = [];

	const fetchUsers = async (search: string = '') => {
		const response = await fetch(`/api/user?search=${search}&all=true&onlyWithoutGroup=true`);
		const data = await response.json();
		users = data.users.map((user: { id: string; email: string; username: string }) => ({
			label: `${user.username} (${user.email})`,
			value: user
		}));
	};

	let groupUsers: User[] = [];

	const fetchGroupUsers = async () => {
		const response = await fetch(`/api/group?id=${meta.id}&all=true`);
		const data = await response.json();
		if (data && data.users) {
			groupUsers = data.users;
			usersToAdd = [...groupUsers];
		}
	};

	onMount(() => {
		fetchGroupUsers();
		fetchUsers();
	});

	function onUserSelection(event: CustomEvent<AutocompleteOption<string, User>>): void {
		const userToAdd = event.detail.value as unknown as User;
		if (usersToAdd.find((user) => user.email === userToAdd.email)) return;
		else usersToAdd = [...usersToAdd, userToAdd];
	}

	function removeUser(event: MouseEvent, userToRemove: User) {
		event.preventDefault();
		usersToAdd = usersToAdd.filter((user) => user !== userToRemove);
	}

	let search = '';
	$: if (search.length >= 0) {
		fetchUsers(search);
	}
	const meta = $modalStore[0].meta;

	let valueMultiple: string[] = [];

	async function showDeleteConfirmation() {
		if ($modalStore[0].response) $modalStore[0].response(true);
		modalStore.close();
	}

	async function updateGroup() {
		await fetch('/api/group', {
			method: 'PATCH',
			body: JSON.stringify({
				id: meta.id,
				name: meta.name,
				remove: groupUsers
					.filter((user) => !usersToAdd.map((u) => u.id).includes(user.id))
					.map((user) => user.id),
				add: usersToAdd.map((user) => user.id)
			})
		});
		if ($modalStore[0].response) $modalStore[0].response(false);
		modalStore.close();
	}
</script>

<div class="card p-5 space-y-4">
	<label class="label">
		<span>Nom du groupe</span>
		<input
			class="input"
			type="text"
			name="name"
			bind:value={meta.name}
			placeholder="Nom d'utilisateur..."
		/>
	</label>

	<label class="label">
		<span>Ajouter un utilisateur</span>
		<input
			class="input"
			type="search"
			bind:value={search}
			placeholder="Chercher un utilisateur..."
		/>
	</label>
	<div class="card variant-ghost" tabindex="-1">
		<Autocomplete
			bind:input={search}
			emptyState="Aucun utilisateur trouvé."
			options={users}
			on:selection={onUserSelection}
		/>
	</div>
	<div class="space-y-1">
		<span>Utilisateurs dans le groupe ({usersToAdd.length})</span>
		<div class="card variant-ghost overflow-y-auto max-h-52">
			{#if usersToAdd.length > 0}
				<ListBox multiple>
					{#each usersToAdd as user}
						<ListBoxItem
							bind:group={valueMultiple}
							name="user"
							value={user}
							on:click={(event) => removeUser(event, user)}
						>
							{user.username} ({user.email})
							<svelte:fragment slot="trail"><Close /></svelte:fragment>
						</ListBoxItem>
					{/each}
				</ListBox>
			{/if}
		</div>
	</div>
	<div class="flex space-x-4 justify-between">
		<button on:click={updateGroup} class="btn btn-sm variant-filled">Modifier le groupe</button>
		<button on:click={showDeleteConfirmation} class="btn btn-sm variant-filled-error"
			>Supprimer le groupe</button
		>
	</div>
</div>
