<script lang="ts">
	import '../app.postcss';
	import CreateConversation from '$lib/modals/CreateConversation.svelte';
	import ModifyUser from '$lib/modals/ModifyUser.svelte';
	import ModifyGroup from '$lib/modals/ModifyGroup.svelte';
	import {
		autoModeWatcher,
		AppShell,
		initializeStores,
		storePopup,
		Modal,
		type ModalComponent
	} from '@skeletonlabs/skeleton';
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';

	initializeStores();

	const modalRegistry: Record<string, ModalComponent> = {
		createConversation: { ref: CreateConversation },
		modifyUser: { ref: ModifyUser },
		modifyGroup: { ref: ModifyGroup }
	};

	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
</script>

<svelte:head>{@html '<script>(' + autoModeWatcher.toString() + ')();</script>'}</svelte:head>

<Modal components={modalRegistry} />
<AppShell>
	<slot />
</AppShell>
