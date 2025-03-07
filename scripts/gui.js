import {EntityComponentTypes, InputPermissionCategory, world} from "@minecraft/server";
import {ActionFormData} from "@minecraft/server-ui";
import * as permission from "./permission";

export function showAdminMenu(admin) {
  const form = new ActionFormData();
  form.title("プレイヤー管理");
  const player_list = [];
  world.getAllPlayers().filter((player) => !player.isOp()).forEach((player) => {
    form.button(player.name);
    player_list.push(player);
  });
  if (player_list.length === 0) {
    form.body("プレイヤーがいません");
  }
  form.button("閉じる");
  form.show(admin).then((data) => {
    const player = player_list[data.selection];
    if (player) showPlayerMenu(player, admin);
  });
}

function showPlayerMenu(player, admin) {
  const form = new ActionFormData();
  form.title(player.name);
  let bodyText = "";
  bodyText += "Dimension: " + player.dimension.id + "\n";
  bodyText += "Location: (" + Math.trunc(player.location.x) + ", " + Math.trunc(player.location.y) + ", " + Math.trunc(player.location.z) + ")\n";
  bodyText += "HP: " + player.getComponent(EntityComponentTypes.Health).currentValue + "\n";
  bodyText += player.isValid
  if (permission.isTrusted(player)) {
    bodyText += "信頼中\n";
  }
  if (!player.inputPermissions.isPermissionCategoryEnabled(InputPermissionCategory.Movement)) {
    bodyText += "移動制限中\n";
  }
  form.body(bodyText);
  form.button("信頼する");
  form.button("信頼を解除");
  form.button("移動を制限する");
  form.button("移動制限を解除");
  form.button("インベントリを見る");
  form.button("戻る");
  form.show(admin).then((data) => {
    switch (data.selection) {
      case 0:
        permission.trust(player);
        showPlayerMenu(player, admin);
        break;
      case 1:
        permission.untrust(player);
        showPlayerMenu(player, admin);
        break;
      case 2:
        player.inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, false);
        player.inputPermissions.setPermissionCategory(InputPermissionCategory.Jump, false);
        player.inputPermissions.setPermissionCategory(InputPermissionCategory.Sneak, false);
        player.inputPermissions.setPermissionCategory(InputPermissionCategory.Camera, false);
        player.inputPermissions.setPermissionCategory(InputPermissionCategory.Mount, false);
        player.inputPermissions.setPermissionCategory(InputPermissionCategory.Dismount, false);
        showPlayerMenu(player, admin);
        break;
      case 3:
        player.inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, true);
        player.inputPermissions.setPermissionCategory(InputPermissionCategory.Jump, true);
        player.inputPermissions.setPermissionCategory(InputPermissionCategory.Sneak, true);
        player.inputPermissions.setPermissionCategory(InputPermissionCategory.Camera, true);
        player.inputPermissions.setPermissionCategory(InputPermissionCategory.Mount, true);
        player.inputPermissions.setPermissionCategory(InputPermissionCategory.Dismount, true);
        break;
      case 4:
        showPlayersInventory(player, admin);
        break;
      case 5:
        showAdminMenu(admin);
        break;
    }
  });
}

function showPlayersInventory(player, admin) {
  const form = new ActionFormData();
  form.title(player.name + "のインベントリ");
  const inventory = player.getComponent(EntityComponentTypes.Inventory);
  const slots = [];
  for (let i = 0; i < inventory.container.size; i++) {
    const slot = inventory.container.getSlot(i);
    if (slot.hasItem()) {
      form.button(`${slot.getItem().amount}x${slot.getItem().typeId}を消去`);
      slots.push(slot);
    }
  }
  form.button("戻る");
  form.show(admin).then((data) => {
    if (data.selection < slots.length) {
      slots[data.selection].setItem();
      showPlayersInventory(player, admin);
    } else {
      showPlayerMenu(player, admin);
    }
  });
}