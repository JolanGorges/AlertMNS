<script lang="ts">
	import '../../app.postcss';
	import { AppShell } from '@skeletonlabs/skeleton';
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
	import NavigationAdmin from '$lib/components/navigation/NavigationAdmin.svelte';
</script>

<AppShell slotSidebarLeft="bg-surface-500/5 w-70">
	<svelte:fragment slot="header"></svelte:fragment>
	<svelte:fragment slot="sidebarLeft">
		<NavigationAdmin />
	</svelte:fragment>
	<slot />
</AppShell>
