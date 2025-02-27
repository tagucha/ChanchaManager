import {InputPermissionCategory, world} from "@minecraft/server";
import {ActionFormData} from "@minecraft/server-ui";
import * as permission from "./permission";

export function showAdminMenu(admin) {
  const form = new ActionFormData();
  form.title("プレイヤー管理");
  const player_list = [];
  world.getAllPlayers().filter((player) => !player.isOp()).forEach((player) => {
    admin.sendMessage(player.name);
    form.button(player.name);
    player_list.push(player);
  });
  if (player_list.length === 0) {
    form.body("プレイヤーがいません");
  }
  form.show(admin).then((data) => {
    const player = player_list[data.selection];
    showPlayerMenu(player, admin);
  });
}

function showPlayerMenu(player, admin) {
  const form = new ActionFormData();
  form.title(player.name);
  if (permission.isTrusted(player)) {
    form.body("信頼中");
  }
  if (!player.inputPermissions.isPermissionCategoryEnabled(InputPermissionCategory.Movement)) {
    form.body("移動制限中");
  }
  form.button("信頼する");
  form.button("信頼を解除");
  form.button("移動を制限する");
  form.button("移動制限を解除");
  form.button("戻る");
  form.show(admin).then((data) => {
    switch (data.selection) {
      case 0:
        permission.trust(player);
        break;
      case 1:
        permission.untrust(player);
        break;
      case 2:
        player.inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, false);
        player.inputPermissions.setPermissionCategory(InputPermissionCategory.Jump, false);
        player.inputPermissions.setPermissionCategory(InputPermissionCategory.Sneak, false);
        player.inputPermissions.setPermissionCategory(InputPermissionCategory.Camera, false);
        player.inputPermissions.setPermissionCategory(InputPermissionCategory.Mount, false);
        player.inputPermissions.setPermissionCategory(InputPermissionCategory.Dismount, false);
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
        showAdminMenu(admin);
        return;
    }
    showPlayerMenu(player, admin);
  });
}