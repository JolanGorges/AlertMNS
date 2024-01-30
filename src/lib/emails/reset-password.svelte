<script>
	import { Button, Head, Html, Text } from '@jolan57/svelte-email';

	export let name = '';
	export let passwordResetUrl = '';
</script>

<Html>
	<Head />
	<Text>
		Bonjour {name},
	</Text>
	<Text>
		Votre mot de passe AlertMNS peut être réinitialisé en cliquant sur le bouton ci-dessous. Si vous
		n'avez pas demandé de nouveau mot de passe, ignorez cet e-mail.
	</Text>
	<Button href={passwordResetUrl}>Réinitialiser le mot de passe</Button>
</Html>
