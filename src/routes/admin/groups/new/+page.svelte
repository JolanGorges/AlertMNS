<script lang="ts">
	import type { PageServerData } from './$types';
	import { superForm } from 'sveltekit-superforms/client';
	export let data: PageServerData;
	const { form, errors, constraints, enhance } = superForm(data.form, {
		taintedMessage: null
	});
</script>

<section class="card p-5 mt-10 flex flex-col justify-between items-center max-w-md mx-auto">
	<h2 class="text-xl font-bold mb-4">Créer un groupe</h2>
	<form method="POST" class="w-full space-y-5" use:enhance>
		<label class="label">
			<span>Nom du groupe</span>
			<input class="input" type="text" name="name" bind:value={$form.name} {...$constraints.name} />
			{#if $errors.name}
				<p class="text-error-500">{$errors.name}</p>
			{/if}
		</label>
		<button type="submit" class="btn variant-filled w-full">Créer le groupe</button>
	</form>
</section>
