<script lang="ts">
	import ifa from '$lib/assets/ifa.png';
	import mns from '$lib/assets/mns.png';
</script>

<div class="p-4 h-full flex flex-col">
	<a href="/" class="flex justify-evenly items-center py-2">
		<img src={ifa} alt="IFA" class="w-8" />
		<img src={mns} alt="MNS" class="w-16" />
	</a>
	<nav class="list-nav" aria-labelledby="admin">
		<h2 id="admin" class="mx-4 my-2">Paramètres administrateur</h2>
		<ul>
			<li><a href="/admin/users">Gérer les utilisateurs</a></li>
			<li><a href="/admin/users/new">Créer un utilisateur</a></li>
			<li><a href="/admin/groups">Gérer les groupes</a></li>
			<li><a href="/admin/groups/new">Créer un groupe</a></li>
		</ul>
	</nav>
</div>
