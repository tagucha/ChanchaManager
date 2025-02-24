import { world } from "@minecraft/server";
import * as permission from "./permission";
import {Player} from "@minecraft/server";

// 火を付けられたのを検知
world.afterEvents.itemUseOn.subscribe((event) => {
  const item = event.itemStack;
  const player = event.source

  const fire_items = [
    "minecraft:flint_and_steel",
    "minecraft:fire_charge",
  ]

  if (fire_items.includes(item.typeId)) {
    if (permission.isTrusted(player)) return;
    world.getPlayers((player: Player) => {
      return player.isOp();
    }).forEach((player: Player) => {
      player.dimension.runCommand(`/title ${player.name} actionbar §c${player.name}が着火しました！`);
    });
  }
})


world.beforeEvents.chatSend.subscribe((event) => {

})

