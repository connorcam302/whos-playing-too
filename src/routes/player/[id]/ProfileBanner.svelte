<script lang="ts">
	interface Props {
		data: any;
	}

	let { data }: Props = $props();

	let {
		player,
		mainAccount,
		smurfAccounts
	} = $derived(data);

	const shortenName = (name: string | undefined, maxLength = 24) => {
		if (!name) return '';
		return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
	};

	const getDotaAccountId = (profile: { accountId?: number; steamid?: string }) => {
		if (profile.accountId !== undefined) return profile.accountId.toString();
		if (!profile.steamid) return '';

		return (BigInt(profile.steamid) - BigInt('76561197960265728')).toString();
	};
</script>

<div class="w-full max-w-6xl">
	<div class="flex w-full flex-col gap-4 rounded-lg border border-zinc-700 bg-card p-3 sm:flex-row sm:items-center sm:p-4">
		<img
			src={player.image}
			alt={`${player.username} avatar`}
			class="h-24 w-24 rounded-md border border-zinc-700 object-cover sm:h-28 sm:w-28 lg:h-32 lg:w-32"
		/>
		<div class="flex min-w-0 flex-1 flex-col gap-3">
			<div class="min-w-0">
				<div class="truncate text-3xl font-semibold leading-tight text-zinc-100 sm:text-4xl">
					{player.username}
				</div>
				<div class="mt-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
					Player profile
				</div>
			</div>
			<div class="grid gap-2 lg:grid-cols-2">
				<div class="flex min-w-0 items-center gap-2 rounded-md bg-zinc-900/70 px-3 py-2">
					<div class="min-w-0 flex-1">
						<div class="flex min-w-0 items-center gap-1 text-sm text-zinc-200">
						{#if mainAccount}
								<span class="truncate">{shortenName(mainAccount.personaname, 30)}</span>
						{:else}
								<span>Main account</span>
						{/if}

							<span class="text-xs text-zinc-500">(main)</span>
						</div>
						<div class="text-xs text-zinc-500">{player.accountId}</div>
					</div>
					{#if mainAccount}
						<div class="flex h-5 w-5 items-center justify-center" aria-label={mainAccount.gameextrainfo === 'Dota 2' ? 'Playing Dota 2' : 'Offline'}>
							{#if mainAccount.gameextrainfo === 'Dota 2'}
								<div class="h-2.5 w-2.5 rounded-full bg-sky-500"></div>
							{/if}
						</div>
					{/if}
					<div class="flex items-center gap-1">
					{#if mainAccount}
						<a
							href={mainAccount.profileurl}
							target="_blank"
							rel="noopener noreferrer"
								class="hidden rounded-md p-1.5 transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:inline-flex"
								aria-label="Open Steam profile"
						>
								<img src={'/steam.png'} alt="" class="h-5 w-5" />
						</a>
					{/if}
					<a
						href={`https://dotabuff.com/players/${player.accountId}`}
						target="_blank"
						rel="noopener noreferrer"
							class="rounded-md p-1.5 transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							aria-label="Open Dotabuff profile"
					>
							<img src={'/dotabuff.png'} alt="" class="h-5 w-5" />
					</a>
					<a
						href={`https://www.opendota.com/players/${player.accountId}`}
						target="_blank"
						rel="noopener noreferrer"
							class="hidden rounded-md p-1.5 transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:inline-flex"
							aria-label="Open OpenDota profile"
					>
							<img src={'/opendota.png'} alt="" class="h-5 w-5" />
					</a>
					<a
						href={`https://stratz.com/en-us/player/${player.accountId}`}
						target="_blank"
						rel="noopener noreferrer"
							class="hidden rounded-md p-1.5 transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:inline-flex"
							aria-label="Open Stratz profile"
					>
							<img src={'/stratz.png'} alt="" class="h-5 w-5" />
					</a>
				</div>
				</div>
				{#each smurfAccounts as profile, i}
					<div class="flex min-w-0 items-center gap-2 rounded-md bg-zinc-900/70 px-3 py-2">
						<div class="min-w-0 flex-1">
							<div class="flex min-w-0 items-center gap-1 text-sm text-zinc-200">
							{#if profile.personaname}
									<span class="truncate">{shortenName(profile.personaname, 30)}</span>
								{#if profile.accountId === player.accountId}
										<span class="text-xs text-zinc-500">(main)</span>
								{/if}
							{:else}
								Smurf {i + 1}
							{/if}
							</div>
							<div class="text-xs text-zinc-500">Smurf {i + 1}</div>
						</div>

						<div class="flex items-center gap-1">
						<a
							href={profile.profileurl}
							target="_blank"
							rel="noopener noreferrer"
								class="hidden rounded-md p-1.5 transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:inline-flex"
								aria-label="Open Steam profile"
						>
								<img src={'/steam.png'} alt="" class="h-5 w-5" />
						</a>
						<a
							href={`https://dotabuff.com/players/${getDotaAccountId(profile)}`}
							target="_blank"
							rel="noopener noreferrer"
								class="rounded-md p-1.5 transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								aria-label="Open Dotabuff profile"
						>
								<img src={'/dotabuff.png'} alt="" class="h-5 w-5" />
						</a>
						<a
							href={`https://www.opendota.com/players/${getDotaAccountId(profile)}`}
							target="_blank"
							rel="noopener noreferrer"
								class="hidden rounded-md p-1.5 transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:inline-flex"
								aria-label="Open OpenDota profile"
						>
								<img src={'/opendota.png'} alt="" class="h-5 w-5" />
						</a>
						<a
							href={`https://stratz.com/en-us/player/${getDotaAccountId(profile)}`}
							target="_blank"
							rel="noopener noreferrer"
								class="hidden rounded-md p-1.5 transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:inline-flex"
								aria-label="Open Stratz profile"
						>
								<img src={'/stratz.png'} alt="" class="h-5 w-5" />
						</a>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
