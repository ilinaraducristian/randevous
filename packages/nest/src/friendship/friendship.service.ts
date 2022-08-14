import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Friendship, FriendshipDocument } from "../entities/friendship.schema";
import { User, UserDocument } from "../entities/user.schema";
import { FriendshipMessage, FriendshipMessageDocument } from "./entities/friendship-message.schema";
import FriendshipAcceptedHttpException from "./exceptions/friendship-accepted.httpexception";
import FriendshipNotFoundHttpException from "./exceptions/friendship-not-found.httpexception";
import FriendshipExistsHttpException from "./exceptions/friendship-exists.httpexception";
import UserLacksPermissionForFriendshipHttpException from "./exceptions/friendship-no-permission.httpexception";
import UserNotFoundHttpException from "./exceptions/user-not-found.httpexception";
import FriendshipMessageNotFoundHttpException from "./exceptions/friendship-message-not-found.httpexception";
import { SseService } from "../sse.service";
import SseEvents from "../sse-events";

@Injectable()
export class FriendshipService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Friendship.name) private readonly friendshipModel: Model<FriendshipDocument>,
    @InjectModel(FriendshipMessage.name) private readonly friendshipMessageModel: Model<FriendshipMessageDocument>,
    private readonly sseService: SseService
  ) { }

  async createFriendship(user: UserDocument, friendUserId: string) {
    const friendUser = await this.userModel.findById(friendUserId);
    if (friendUser === null) throw new UserNotFoundHttpException();
    const exisingFriendship = await this.friendshipModel.findOne({ user1: { $in: [user._id, friendUser._id] }, user2: { $in: [user._id, friendUser._id] } });
    if (exisingFriendship !== null) throw new FriendshipExistsHttpException();
    const newFriendship = await new this.friendshipModel({ user1: user, user2: friendUser }).save();
    user.friendships.push(newFriendship.id);
    friendUser.friendships.push(newFriendship.id);
    await Promise.all([user.save(), friendUser.save()]);
    this.sseService.next({ type: SseEvents.friendRequest, data: { userId: friendUser.id, friendship: newFriendship } });
    return newFriendship;
  }

  async getFriendship(user: UserDocument, id: string) {
    const userFriendship = user.friendships.find(friendshipId => friendshipId.toString() === id);
    if (userFriendship === null) throw new FriendshipNotFoundHttpException();
    const friendship = await this.friendshipModel.findById(userFriendship);
    return friendship;
  }

  async getFriendships(user: UserDocument) {
    const friendshipsDocuments = await this.friendshipModel.find({ _id: { $in: user.friendships } });
    const friendships = {
      incoming: [],
      outgoing: []
    };
    const friendsIds = [];
    friendshipsDocuments.forEach(friendship => {
      let userObjectId;
      if (friendship.user1.toString() === user.id) {
        userObjectId = friendship.user2;
        friendships.outgoing.push({
          id: friendship.id,
          userId: friendship.user2.toString(),
          status: friendship.status
        });
      } else {
        userObjectId = friendship.user1;
        friendships.incoming.push({
          id: friendship.id,
          userId: friendship.user1.toString(),
          status: friendship.status
        });
      }
      friendsIds.push(userObjectId);
    });
    return {
      friendships,
      friendsIds
    }
  }

  async acceptFriendshipRequest(user: UserDocument, id: string) {
    let friendship;
    try {
      friendship = await this.friendshipModel.findById(id);
    }catch{}
    if (friendship === null || friendship === undefined) throw new FriendshipNotFoundHttpException();
    if (friendship.user1._id.toString() === user.id) throw new UserLacksPermissionForFriendshipHttpException();
    if (friendship.status === 'accepted') throw new FriendshipAcceptedHttpException();
    friendship.status = 'accepted';
    const savedFriendship = await friendship.save();
    this.sseService.next({ type: SseEvents.friendRequestAccepted, data: { userId: friendship.user1.id } })
    return savedFriendship;
  }

  async deleteFriendship(user: UserDocument, id: string) {
    const deleteFriendship = await this.friendshipModel.deleteOne({ id, $or: [{ user1: user._id }, { user2: user._id }] });
    if (deleteFriendship.deletedCount === 0) throw new FriendshipNotFoundHttpException();
    const friendshipIndex = user.friendships.findIndex(friendship => friendship.id === id);
    user.friendships.splice(friendshipIndex, 1);
    await user.save();
    return deleteFriendship;
  }

  async createFriendshipMessage(user: UserDocument, id: string, text: string) {
    const friendship = await this.getFriendship(user, id);
    return new this.friendshipMessageModel({
      friendshipId: friendship._id,
      userId: user._id,
      timestamp: new Date(),
      text
    }).save();
  }

  async getFriendshipMessages(user: UserDocument, id: string, offset: number, limit: number) {
    const friendship = await this.getFriendship(user, id);
    return this.friendshipMessageModel.find({ friendshipId: friendship._id }).sort({ timestamp: -1 }).skip(offset).limit(limit);
  }

  async getFriendshipMessage(user: UserDocument, id: string, messageId: string) {
    const friendship = await this.getFriendship(user, id);
    const message = await this.friendshipMessageModel.findOne({ _id: new Types.ObjectId(messageId), friendshipId: friendship._id });
    if (message === null) throw new FriendshipMessageNotFoundHttpException();
    return message;
  }

  async deleteFriendshipMessage(user: UserDocument, id: string, messageId: string) {
    const friendship = await this.getFriendship(user, id);
    const message = await this.friendshipMessageModel.deleteOne({ _id: new Types.ObjectId(messageId), friendshipId: friendship._id });
    if (message.deletedCount === 0) throw new FriendshipMessageNotFoundHttpException();
  }


}
