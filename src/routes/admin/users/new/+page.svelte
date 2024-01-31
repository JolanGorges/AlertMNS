<script lang="ts">
	import type { PageServerData } from './$types';
	import { superForm } from 'sveltekit-superforms/client';

	export let data: PageServerData;
	const { form, errors, constraints, enhance } = superForm(data.form);
</script>

<section class="card p-5 mt-10 flex flex-col justify-between items-center max-w-md mx-auto">
	<h2 class="text-xl font-bold mb-4">Créer un utilisateur</h2>
	<form method="POST" class="w-full space-y-5" use:enhance>
		<label class="label">
			<span>Nom d'utilisateur</span>
			<input
				class="input"
				type="text"
				name="username"
				bind:value={$form.username}
				{...$constraints.username}
			/>
			{#if $errors.username}<span class="text-error-500">{$errors.username}</span>{/if}
		</label>
		<label class="label">
			<span>Adresse e-mail</span>
			<input
				class="input"
				type="email"
				name="email"
				bind:value={$form.email}
				{...$constraints.email}
			/>
			{#if $errors.email}<span class="text-error-500">{$errors.email}</span>{/if}
		</label>
		<label class="label">
			<span>Groupe</span>
			<select bind:value={$form.groupId} class="select">
				<option value="">Aucun</option>
				{#each data.groups as group}
					<option value={group.id}>{group.name}</option>
				{/each}
			</select>
		</label>
		<button type="submit" class="btn variant-filled w-full">Créer et inviter l'utilisateur</button>
	</form>
</section>
