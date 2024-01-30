<script lang="ts">
	import type { PageData } from './$types';
	import { superForm } from 'sveltekit-superforms/client';
	export let data: PageData;
	const { errors, form, constraints, enhance } = superForm(data.form);
</script>

<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
	<div class="card p-5 sm:mx-auto sm:w-full sm:max-w-sm">
		<h2 class="text-2xl font-semibold text-center">Réinitialiser le mot de passe</h2>
		<form class="space-y-6 mt-6" method="POST" use:enhance>
			<label class="label">
				<span>Adresse e-mail</span>
				<input
					class="input"
					type="email"
					name="email"
					aria-invalid={$errors.email ? 'true' : undefined}
					bind:value={$form.email}
					{...$constraints.email}
				/>
				{#if $errors.email}
					<small class="text-error-500">{$errors.email}</small>
				{/if}
			</label>
			<div class="justify-center flex">
				<button type="submit" class="btn variant-filled">Envoyer</button>
			</div>
		</form>
	</div>
</div>
