<script lang="ts">
	import { onMount } from 'svelte';
	import Close from '~icons/mdi/close';
	import {
		TabGroup,
		Tab,
		ListBox,
		ListBoxItem,
		Autocomplete,
		type AutocompleteOption
	} from '@skeletonlabs/skeleton';
	import { browser } from '$app/environment';

	let tabSet: number = 0;

	type User = { email: string; username: string };
	let users: AutocompleteOption<string, User>[] = [];
	let usersToAdd: User[] = [];

	const fetchUsers = async (search: string = '') => {
		if (browser) {
			const response = await fetch(`/api/user?search=${search}`);
			const data = await response.json();
			users = data.users.map((user: { email: string; username: string }) => ({
				label: `${user.username} (${user.email})`,
				value: user
			}));
		}
	};

	const addGroupUsers = async () => {
		if (groupId !== '') {
			const response = await fetch(`/api/group?id=${groupId}`);
			const data = await response.json();
			if (data && data.users) {
				usersToAdd = [...usersToAdd, ...data.users];
			}
		}
	};

	let groups: {
		id: string;
		name: string;
	}[] = [];

	let groupId: string = '';

	onMount(async () => {
		fetchUsers();
		const response = await fetch('/api/group');
		groups = await response.json();
	});

	let name = '';
	let search = '';
	$: if (search.length >= 0) {
		fetchUsers(search);
	}

	function onUserSelection(event: CustomEvent<AutocompleteOption<string, User>>): void {
		const userToAdd = event.detail.value as unknown as User;
		if (usersToAdd.find((user) => user.email === userToAdd.email)) return;
		if (tabSet === 0) usersToAdd = [userToAdd];
		else usersToAdd = [...usersToAdd, userToAdd];
	}

	function removeUser(event: MouseEvent, userToRemove: User) {
		event.preventDefault();
		usersToAdd = usersToAdd.filter((user) => user !== userToRemove);
	}

	function onTabChange() {
		usersToAdd = [];
		name = '';
		groupId = '';
	}

	let valueMultiple: string[] = [];
</script>

<form method="POST" action="/chat/new" class="card p-5 space-y-4">
	<TabGroup>
		<Tab bind:group={tabSet} on:change={onTabChange} name="direct" value={0}>Discussion</Tab>
		<Tab bind:group={tabSet} on:change={onTabChange} name="space" value={1}>Espace</Tab>
		<svelte:fragment slot="panel">
			{#if tabSet === 1}
				<div class="space-y-4">
					<label class="label">
						<span>Nom de l'espace</span>
						<input
							bind:value={name}
							class="input"
							type="text"
							name="name"
							placeholder="Nom de l'espace..."
						/>
					</label>
					<label class="label">
						<span>Ajouter un groupe</span>
						<select bind:value={groupId} on:change={addGroupUsers} class="select">
							<option value="">Aucun</option>
							{#each groups as group}
								<option value={group.id}>{group.name}</option>
							{/each}
						</select>
					</label>
				</div>
			{/if}
		</svelte:fragment>
	</TabGroup>

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
	<input type="hidden" name="usersToAdd" value={JSON.stringify(usersToAdd)} />
	<button
		type="submit"
		class="btn variant-filled w-full"
		disabled={usersToAdd.length < 1 || (tabSet === 1 && name.length < 1)}
		>Créer un{tabSet === 0 ? 'e discussion' : ' espace'}</button
	>
</form>
