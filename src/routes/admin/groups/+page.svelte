<script lang="ts">
	import {
		Table,
		tableMapperValues,
		getModalStore,
		type ModalSettings
	} from '@skeletonlabs/skeleton';
	import type { PageServerData } from './$types';

	export let data: PageServerData;

	let source: {
		id: string;
		name: string;
		count: number;
	}[] = data.groups.map((group) => ({
		id: group.id,
		name: group.name,
		count: group._count.users
	}));

	const tableHeaders: string[] = ['Nom du groupe', "Nombre d'utilisateurs"];

	const modalStore = getModalStore();

	async function fetchGroups() {
		const response = await fetch('/api/group');
		const data = await response.json();
		source = data.map((group: typeof data.groups) => {
			return {
				id: group.id,
				name: group.name,
				count: group._count.users
			};
		});
	}

	const showModal = async (e: CustomEvent<string[]>) => {
		const modal: ModalSettings = {
			type: 'component',
			component: 'modifyGroup',
			meta: {
				id: e.detail[0],
				name: e.detail[1]
			},
			response: async (r: boolean) => {
				if (r) {
					new Promise<boolean>((resolve) => {
						const deleteModal: ModalSettings = {
							type: 'confirm',
							title: 'Veuillez confirmer',
							body: 'Êtes-vous sûr de vouloir supprimer ce groupe ?',
							buttonTextCancel: 'Annuler',
							buttonTextConfirm: 'Supprimer',
							response: (r: boolean) => {
								resolve(r);
							}
						};
						modalStore.trigger(deleteModal);
					}).then(async (r: boolean) => {
						if (r) {
							await fetch(`/api/group?id=${e.detail[0]}`, {
								method: 'DELETE'
							});
							await fetchGroups();
						}
					});
				} else {
					await fetchGroups();
				}
			}
		};
		modalStore.trigger(modal);
	};

	async function delay() {
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}
</script>

<div class="flex items-center min-h-full flex-col px-6 py-12 lg:px-8 space-y-6">
	<Table
		interactive={true}
		on:selected={showModal}
		source={{
			head: tableHeaders,
			body: tableMapperValues(source, ['name', 'count']),
			meta: tableMapperValues(source, ['id', 'name'])
		}}
	/>
</div>
