<script lang="ts">
	import '../app.postcss';
	import { AppShell, initializeStores, storePopup } from '@skeletonlabs/skeleton';
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';

	initializeStores();

	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
</script>

<AppShell>
	<slot />
</AppShell>
