<script lang="ts">
	import type { PageServerData } from './$types';
	import {
		Table,
		tableMapperValues,
		Paginator,
		getModalStore,
		type ModalSettings,
		type PaginationSettings
	} from '@skeletonlabs/skeleton';
	import { browser } from '$app/environment';

	export let data: PageServerData;

	let page = 0;
	async function onPageChange(e: CustomEvent) {
		page = e.detail;
		await getUsers(e.detail * 10);
	}

	async function getUsers(offset: number = 0, search: string = '', count = false) {
		const response = await fetch(
			`/api/user?search=${search}&offset=${offset}&limit=10&count=${count}&all=true`
		);
		const data = await response.json();
		source = data.users.map((user: any) => {
			return {
				id: user.id,
				username: user.username,
				email: user.email,
				groupName: user.group?.name || 'Aucun groupe',
				groupId: user.group?.id || '0'
			};
		});
		userCount = data.count;
	}

	let source: {
		id: number;
		username: string;
		email: string;
		groupName: string;
		groupId: string;
	}[] = data.users.map((user: any) => {
		return {
			id: user.id,
			username: user.username,
			email: user.email,
			groupName: user.group?.name || 'Aucun groupe',
			groupId: user.group?.id || '0'
		};
	});

	let userCount = data.totalUsers;

	let paginationSettings = {
		page: 0,
		limit: 10,
		size: 0,
		amounts: []
	} satisfies PaginationSettings;

	let tableHeaders: string[] = ["Nom d'utilisateur", 'Adresse e-mail', 'Groupe'];

	$: paginationSettings.size = userCount;

	const modalStore = getModalStore();

	async function showModal(e: CustomEvent<string[]>) {
		const modal: ModalSettings = {
			type: 'component',
			component: 'modifyUser',
			meta: {
				id: e.detail[0],
				username: e.detail[1],
				email: e.detail[2],
				groupId: e.detail[3],
				groups: data.groups
			},
			response: async (r: boolean) => {
				if (r) {
					new Promise<boolean>((resolve) => {
						const deleteModal: ModalSettings = {
							type: 'confirm',
							title: 'Veuillez confirmer',
							body: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
							buttonTextCancel: 'Annuler',
							buttonTextConfirm: 'Supprimer',
							response: (r: boolean) => {
								resolve(r);
							}
						};
						modalStore.trigger(deleteModal);
					}).then(async (r: boolean) => {
						if (r) {
							await fetch(`/api/user?id=${e.detail[0]}`, {
								method: 'DELETE'
							});
							await getUsers(page * 10);
						}
					});
				} else {
					await getUsers(page * 10);
				}
			}
		};
		modalStore.trigger(modal);
	}

	let search = '';
	$: if (search.length >= 0) {
		if (browser) {
			getUsers(page * 10, search, true);
		}
	}
</script>

<div class="flex items-center flex-col h-full px-6 py-12 lg:px-8 space-y-6">
	<label class="label">
		<span>Rechercher</span>
		<input
			bind:value={search}
			type="text"
			class="input"
			placeholder="Nom, adresse e-mail ou groupe"
		/>
	</label>

	<Table
		interactive={true}
		on:selected={showModal}
		source={{
			head: tableHeaders,
			body: tableMapperValues(source, ['username', 'email', 'groupName']),
			meta: tableMapperValues(source, ['id', 'username', 'email', 'groupId', 'groupName'])
		}}
	/>
	<Paginator bind:settings={paginationSettings} on:page={onPageChange} showNumerals />
</div>
