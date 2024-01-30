<script>
	import { Button, Head, Html, Text } from '@jolan57/svelte-email';

	export let name = '';
	export let emailVerificationUrl = '';
</script>

<Html>
	<Head />
	<Text>
		Bonjour {name},
	</Text>
	<Text>
		Nous sommes ravis de vous accueillir sur AlertMNS ! Avant de commencer à profiter de nos
		services, nous devons vérifier votre adresse e-mail pour garantir la sécurité de votre compte.
	</Text>
	<Text>Pour vérifier votre adresse e-mail, veuillez cliquer sur le lien ci-dessous :</Text>
	<Button href={emailVerificationUrl}>Vérifier l'adresse e-mail</Button>
	<Text>
		Si vous ne parvenez pas à cliquer sur le lien ci-dessus, copiez et collez l'URL suivante dans
		votre navigateur : {emailVerificationUrl}
	</Text>
	<Text>
		Veuillez noter que ce lien de vérification est valable pendant 2 heures, après quoi il expirera.
		Si vous n'avez pas demandé cette vérification, veuillez ignorer cet email.
	</Text>
</Html>
