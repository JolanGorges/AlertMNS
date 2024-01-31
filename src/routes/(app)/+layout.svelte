<script lang="ts">
	import '../../app.postcss';
	import { AppShell, storePopup } from '@skeletonlabs/skeleton';
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
	import Navigation from '$lib/components/navigation/Navigation.svelte';
	import SidebarRight from '$lib/components/SidebarRight.svelte';

	import type { LayoutData } from './$types';

	export let data: LayoutData;
</script>

<AppShell slotSidebarLeft="bg-surface-500/5 w-56" slotSidebarRight="bg-surface-500/5 w-1/6">
	<svelte:fragment slot="sidebarLeft">
		<Navigation bind:value={data} />
	</svelte:fragment>
	<svelte:fragment slot="sidebarRight">
		<SidebarRight bind:value={data} />
	</svelte:fragment>
	<slot />
</AppShell>
