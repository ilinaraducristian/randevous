import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from 'mongoose';
import { FriendshipDocument } from "./friendship.schema";
import { GroupDocument } from "./group.schema";
import { ServerDocument } from "./server.schema";

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: [], type: [{type: Types.ObjectId, ref: 'Friendship'}] })
  friendships: FriendshipDocument[];

  @Prop({ default: [], type: [{type: Types.ObjectId, ref: 'Group'}] })
  groups: GroupDocument[];

  @Prop({ default: [], type: [{type: Types.ObjectId, ref: 'Server'}] })
  servers: ServerDocument[];

}

export const UserSchema = SchemaFactory.createForClass(User);
