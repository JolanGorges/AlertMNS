<script lang="ts">
	import { getModalStore } from '@skeletonlabs/skeleton';

	const modalStore = getModalStore();

	const meta = $modalStore[0].meta;
	async function showDeleteConfirmation() {
		if ($modalStore[0].response) $modalStore[0].response(true);
		modalStore.close();
	}

	async function resetPassword() {
		await fetch(`/api/user`, {
			method: 'PATCH',
			body: JSON.stringify({
				id: meta.id,
				forceReset: true
			})
		});
		modalStore.close();
	}

	let errors = {
		username: '',
		email: ''
	};

	async function updateUser() {
		const response = await fetch(`/api/user`, {
			method: 'PATCH',
			body: JSON.stringify({
				id: meta.id,
				username: meta.username,
				email: meta.email,
				groupId: meta.groupId === '0' ? null : meta.groupId
			})
		});
		if (response.status === 400) {
			errors = await response.json();
			return;
		}
		if ($modalStore[0].response) $modalStore[0].response(false);
		modalStore.close();
	}
</script>

<div class="card p-5 space-y-4">
	<label class="label">
		<span>Nom d'utilisateur</span>
		<input
			class="input"
			type="text"
			name="username"
			bind:value={meta.username}
			placeholder="Nom d'utilisateur..."
		/>
		{#if errors.username}
			<p class="text-error-500">{errors.username}</p>
		{/if}
	</label>
	<label class="label">
		<span>Adresse e-mail</span>
		<input
			class="input"
			type="email"
			name="email"
			bind:value={meta.email}
			placeholder="Adresse e-mail..."
		/>
		{#if errors.email}
			<p class="text-error-500">{errors.email}</p>
		{/if}
	</label>
	<label class="label">
		<span>Groupe</span>
		<select bind:value={meta.groupId} class="select">
			<option value="0">Aucun</option>
			{#each meta.groups as group}
				<option selected={group.id === meta.groupId} value={group.id}>{group.name}</option>
			{/each}
		</select>
	</label>

	<div class="flex space-x-4">
		<button on:click={resetPassword} class="btn btn-sm variant-filled"
			>Réinitialiser le mot de passe</button
		>
		<button on:click={showDeleteConfirmation} class="btn btn-sm variant-filled-error"
			>Supprimer l'utilisateur</button
		>
	</div>
	<button on:click={updateUser} class="btn w-full variant-filled">Modifier l'utilisateur</button>
</div>
