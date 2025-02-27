import {system, world} from "@minecraft/server";
import * as permission from "./permission";
import {showAdminMenu} from "./gui";

//def
const chat_cooldown = 5;
const chat_max_length = 30;
const warning_items = [
  "minecraft:flint_and_steel",
  "minecraft:fire_charge",
  "minecraft:lava_bucket",
]
const warning_placed_blocks = [
  "minecraft:tnt",
]
const warning_broken_blocks = [
  "minecraft:chest",
  "minecraft:trapped_chest",
]


const player_last_chat_time = {};

// 火を付けられたのを検知
world.afterEvents.itemUse.subscribe((event) => {
  const item = event.itemStack;
  const target = event.source

  if (target.isOp()) {
    if (item.typeId === "minecraft:stick") {
      showAdminMenu(target);
      return;
    }
  }

  if (permission.isTrusted(target)) return;

  if (warning_items.includes(item.typeId)) {
    world.getAllPlayers().filter((player)=> player.isOp()).forEach((player) => {
      player.dimension.runCommand(`/title ${player.name} actionbar §c${target.name}を${item.typeId}使いました！(${target.location.x},${target.location.y},${target.location.z})`);
    });
  }
});

world.afterEvents.playerPlaceBlock.subscribe((event) => {
  const target = event.player;
  const block = event.block;

  if (permission.isTrusted(target)) return;

  if (warning_placed_blocks.includes(block.typeId)) {
    world.getAllPlayers().filter((player)=> player.isOp()).forEach((player) => {
      player.dimension.runCommand(`/title ${player.name} actionbar §c${target.name}が${block.typeId}を設置しました！(${block.x},${block.y},${block.z})`);
    });
  }
});

world.afterEvents.playerBreakBlock.subscribe((event) => {
  const target = event.player;
  const block = event.block;

  if (permission.isTrusted(target)) return;

  if (warning_broken_blocks.includes(block.typeId)) {
    world.getAllPlayers().filter((player)=> player.isOp()).forEach((player) => {
      player.dimension.runCommand(`/title ${player.name} actionbar §c${target.name}が${block.typeId}を破壊しました！(${block.x},${block.y},${block.z})`);
    });
  }
});

world.beforeEvents.chatSend.subscribe((event) => {
  const player = event.sender;

  if (player.isOp()) return;

  if (event.message.length > chat_max_length) {
    event.cancel = true;
    system.run(() => {
      player.sendMessage(`§cメッセージが長すぎます！`);
      player.sendMessage(`§c長いメッセージはYouTubeのチャットで送信してください`);
    });
  }

  if (player_last_chat_time[player.id]) {
    const last = player_last_chat_time[player.id];
    const now = system.currentTick;
    if (now - last < chat_cooldown * 20) {
      event.cancel = true;
      system.run(() => {
        player.sendMessage(`§c連続でメッセージを送信することはできません`);
      });
    }
  }

  player_last_chat_time[player.id] = system.currentTick;
})
