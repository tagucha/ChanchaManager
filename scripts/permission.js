import {Player, world} from "@minecraft/server";

export function isTrusted(player: Player) {
  return player.hasTag("trusted") || player.isOp();
}

export function trust(player: Player) {
  player.addTag("trusted");
}

export function untrust(player: Player) {
  player.removeTag("trusted");
}
