import {Player} from "@minecraft/server";
import {showAdminMenu} from "./gui";

const prefix = '!';

export const isCommand = (message: string) => {
  return message.startsWith(prefix);
}

export const parse = (message: string): {command: string, args: string[]}|null => {
  if (!isCommand(message)) return null;
  const [command, ...args] = message.slice(prefix.length).split(' ');
  return {command, args};
}

export function execute(player: Player, command: string, args: string[]) {
  if (!player.isOp()) {
    player.sendMessage('権限がありません');
    return;
  }
  if (command === 'help') {
    player.sendMessage('help: このメッセージを表示します');
    player.sendMessage('menu: 管理メニューを表示します');
  } else if (command === 'menu') {
    showAdminMenu(player);
  }
}