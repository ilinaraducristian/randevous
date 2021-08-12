const ItemTypes = {
  CHANNEL: "channel",
  GROUP: "group"
};

export type ChannelDragObject = {
  id: number,
  order: number,
  groupId: number | null
};

export {ItemTypes};