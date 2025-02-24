import { world, Player, Entity } from "@minecraft/server";

world.afterEvents.projectileHitBlock.subscribe((event) => {
  if (!(event.source instanceof Player)) return;
  const dim = event.dimension;
  const projectile = event.projectile;
  const attacker = Player(event.source);
  const vec = event.location;

  if (projectile.typeId === "minecraft:arrow") {
    attacker.sendMessage(`You shot an arrow named ${projectile.nameTag} at ${vec}`);
  }
});