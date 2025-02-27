export function isTrusted(player) {
  return player.hasTag("trusted") || player.isOp();
}

export function trust(player) {
  player.addTag("trusted");
}

export function untrust(player) {
  player.removeTag("trusted");
}
