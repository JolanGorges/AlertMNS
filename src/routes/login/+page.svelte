<script lang="ts">
	import type { PageData } from './$types';
	import { superForm } from 'sveltekit-superforms/client';

	export let data: PageData;

	const { form, errors, constraints, enhance } = superForm(data.form);
</script>

<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
	<div class="card p-5 sm:mx-auto sm:w-full sm:max-w-sm">
		<h2 class="text-2xl font-semibold text-center">Connexion</h2>
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
				{#if $errors.password}
					<small class="text-error-500">{$errors.password}</small>
				{/if}
			</label>
			<label class="label">
				<span>Mot de passe</span>
				<input
					class="input"
					type="password"
					name="password"
					aria-invalid={$errors.password ? 'true' : undefined}
					bind:value={$form.password}
					{...$constraints.password}
				/>
				{#if $errors.password}
					<small class="text-error-500">{$errors.password}</small>
				{/if}
			</label>

			<a href="/reset-password" class="anchor">Mot de passe oublié ?</a>

			<div class="justify-center flex">
				<button type="submit" class="btn variant-filled">Se connecter</button>
			</div>
		</form>
	</div>
</div>
