import { world, Player } from "@minecraft/server";

world.afterEvents.projectileHitBlock.subscribe((event) => {
  world.sendMessage("Projectile hit block event");
  if (!(event.source instanceof Player)) return;
  const dim = event.dimension;
  const projectile = event.projectile;
  const attacker = Player(event.source);
  const vec = event.location;

  if (projectile.typeId === "minecraft:arrow") {
    world.sendMessage(`Arrow named ${projectile.nameTag} hit block event`);
  }
});