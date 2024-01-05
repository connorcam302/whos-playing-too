<script lang='ts'>
    export let player: any;
    console.log(player);

</script>

<div>
    <div class='my-1 flex items-center gap-2'>
        <img src={player.hero.img} alt={player.hero.name} class='h-10'/> 
        <div class='font-bold text-xl'>{player.username}</div>
    </div>
</div>
