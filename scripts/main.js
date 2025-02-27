import {system, world} from "@minecraft/server";
import * as permission from "./permission";
import * as command from "./command";

//def
const chat_cooldown = 5;
const chat_max_length = 30;
const warning_items = [
  "minecraft:flint_and_steel",
  "minecraft:fire_charge",
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
  const player = event.source

  if (permission.isTrusted(player)) return;

  if (warning_items.includes(item.typeId)) {
    world.getAllPlayers().filter((player)=> player.isOp()).forEach((player) => {
      player.dimension.runCommand(`/title ${player.name} actionbar §c${player.name}が着火しました！(${player.location})`);
    });
  }
});

world.afterEvents.playerPlaceBlock.subscribe((event) => {
  const player = event.player;
  const block = event.block;

  if (permission.isTrusted(player)) return;

  if (warning_placed_blocks.includes(block.typeId)) {
    world.getAllPlayers().filter((player)=> player.isOp()).forEach((player) => {
      player.dimension.runCommand(`/title ${player.name} actionbar §c${player.name}が${block.typeId}を設置しました！(${block.x},${block.y},${block.z})`);
    });
  }
});

world.afterEvents.playerBreakBlock.subscribe((event) => {
  const player = event.player;
  const block = event.block;

  if (permission.isTrusted(player)) return;

  if (warning_broken_blocks.includes(block.typeId)) {
    world.getAllPlayers().filter((player)=> player.isOp()).forEach((player) => {
      player.dimension.runCommand(`/title ${player.name} actionbar §c${player.name}が${block.typeId}を破壊しました！(${block.x},${block.y},${block.z})`);
    });
  }
});

world.beforeEvents.chatSend.subscribe((event) => {
  const player = event.sender;

  if (command.isCommand(event.message)) {
    const {command: cmd, args} = command.parse(event.message);
    system.run(() => {
      command.execute(player, cmd, args);
    });
  } else {
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
  }
})
