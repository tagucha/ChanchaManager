import {system, world} from "@minecraft/server";
import * as permission from "./permission";
import {showAdminMenu} from "./gui";
import {isTrusted} from "./permission";

//def
const chat_cooldown = 15;
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
const inventory_blocks = [
  "minecraft:chest",
  "minecraft:trapped_chest",
  "minecraft:barrel",
  "minecraft:shulker_box",
  "minecraft:white_shulker_box",
  "minecraft:orange_shulker_box",
  "minecraft:magenta_shulker_box",
  "minecraft:light_blue_shulker_box",
  "minecraft:yellow_shulker_box",
  "minecraft:lime_shulker_box",
  "minecraft:pink_shulker_box",
  "minecraft:gray_shulker_box",
  "minecraft:light_gray_shulker_box",
  "minecraft:cyan_shulker_box",
  "minecraft:purple_shulker_box",
  "minecraft:blue_shulker_box",
  "minecraft:brown_shulker_box",
  "minecraft:green_shulker_box",
  "minecraft:red_shulker_box",
  "minecraft:black_shulker_box",
  "minecraft:dispenser",
  "minecraft:dropper",
  "minecraft:hopper",
]

const translatable = {
  "minecraft:flint_and_steel": "火打石",
  "minecraft:fire_charge": "ファイヤーチャージ",
  "minecraft:lava_bucket": "溶岩バケツ",
  "minecraft:tnt": "TNT",
  "minecraft:chest": "チェスト",
  "minecraft:trapped_chest": "トラップチェスト",
}


const player_last_chat_time = {};


world.afterEvents.itemUse.subscribe((event) => {
  const item = event.itemStack;
  const target = event.source

  if (target.isOp()) {
    if (item.typeId === "minecraft:compass") {
      showAdminMenu(target);
    } else if (item.typeId === "minecraft:clock") {
      target.sendMessage("§a=== Server Status ===");
      target.sendMessage(`§aCurrentTick: ${system.currentTick}`);
      target.sendMessage(`§aWeather: ${world.getAbsoluteTime()}`);
      target.sendMessage(`§aTimeOfDay: ${world.getTimeOfDay()}`);
      target.sendMessage(`§aDay: ${world.getDay()}`);
      target.sendMessage(`§aMoonPhase: ${world.getMoonPhase()}`);
      target.sendMessage(`§aDifficulty: ${world.getDifficulty().valueOf()}`);
      const players = world.getAllPlayers();
      target.sendMessage(`§aPlayers: ${players.length}`);
      players.forEach((player) => {
        target.sendMessage(`§a- ${player.name}`);
      });

      target.sendMessage("$a=== Player Status ===");
      target.sendMessage(`§aPlayer: ${target.name}`);
      target.sendMessage(`§aDimension: ${target.dimension.id}`);
      target.sendMessage(`§aLocation: (${target.location.x}, ${target.location.y}, ${target.location.z})`);
      target.sendMessage(`§aHP: ${target.getComponent("minecraft:health").currentValue}`);
      target.sendMessage(`§aGameMode: ${target.getGameMode().valueOf()}`);
      target.sendMessage(`§aValid: ${target.isValid}`);
      target.sendMessage(`§aTrusted: ${permission.isTrusted(target)}`);
      target.sendMessage(`$aLocation : (${target.getSpawnPoint().x}, ${target.getSpawnPoint().y}, ${target.getSpawnPoint().z})`);
      target.sendMessage(`§aTags: ${target.getTags().join(", ")}`);
      const properties = target.getDynamicPropertyIds();
      target.sendMessage(`§aProperties: ${properties.length}`);
      properties.forEach((property) => {
        target.sendMessage(`§a- ${property}: ${target.getDynamicProperty(property)}`);
      });
      const components = target.getComponents();
      target.sendMessage(`§aComponents: ${components.length}`);
      components.forEach((component) => {
        target.sendMessage(`§a- ${component.typeId}`);
      });

    }
  }
});

world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
  const target = event.player;
  const block = event.block;
  const item = event.itemStack;

  if (target.isOp()) {
    if (item?.typeId === "minecraft:clock") {
      if (inventory_blocks.includes(block.typeId)) {
        system.run(() => {
          const chest = block.getComponent("inventory");
          const size = chest.container.size;
          const items = [];
          for (let i = 0; i < size; i++) {
            const slot = chest.container.getSlot(i);
            if (slot.hasItem()) {
              items.push(slot.getItem());
            }
          }
          chest.container.clearAll();
          items.sort((a, b) => {
            if (a.typeId < b.typeId) return -1;
            if (a.typeId > b.typeId) return 1;
            return 0;
          });
          items.forEach((item) => {
            chest.container.addItem(item);
          });
          target.sendMessage(`§aチェストの中身を整理しました！`);
        });
        event.cancel = true;
      }
    }
  }
})

world.afterEvents.playerInteractWithBlock.subscribe((event) => {
  const target = event.player;
  const block = event.block;
  const item = event.itemStack;

  if (permission.isTrusted(target)) return;

  if (warning_items.includes(item.typeId)) {
    world.getAllPlayers().filter((player)=> player.isOp()).forEach((player) => {
      player.dimension.runCommand(`/title ${player.name} actionbar §c"${target.name}"が"${translatable[item.typeId]}"を使いました！(${block.x},${block.y},${block.z})`);
    });
  }
})

world.afterEvents.playerPlaceBlock.subscribe((event) => {
  const target = event.player;
  const block = event.block;

  if (permission.isTrusted(target)) return;

  if (warning_placed_blocks.includes(block.typeId)) {
    world.getAllPlayers().filter((player)=> player.isOp()).forEach((player) => {
      player.dimension.runCommand(`/title ${player.name} actionbar §c"${target.name}"が"${translatable[block.typeId]}"を設置しました！(${block.x},${block.y},${block.z})`);
    });
  }
});

world.afterEvents.playerBreakBlock.subscribe((event) => {
  const target = event.player;
  const block = event.block;

  if (permission.isTrusted(target)) return;

  if (warning_broken_blocks.includes(block.typeId)) {
    world.getAllPlayers().filter((player)=> player.isOp()).forEach((player) => {
      player.dimension.runCommand(`/title ${player.name} actionbar §c"${target.name}"が"${translatable[block.typeId]}"を破壊しました！(${block.x},${block.y},${block.z})`);
    });
  }
});

world.beforeEvents.chatSend.subscribe((event) => {
  const player = event.sender;

  if (isTrusted(player)) return;

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

