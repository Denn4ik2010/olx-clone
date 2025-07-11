import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatRepository } from './chat.repository';
import { ChatMessages, UserChat } from './types/chat.types';
import { Chat } from '@prisma/client';

import { ChatErrorMessages as ChatErrMsg } from './enum/chat-error-message.enum';
import { UserErrorMessages as UserErrMsg } from '../user/constants/user-error-messages.constants';

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ChatMemberValidationService } from '../chat-message/chat-member-validation.service';

@Injectable()
export class ChatService {
  private readonly logger: Logger = new Logger(ChatService.name);

  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly validationService: ChatMemberValidationService,
  ) {}

  async findChatBetweenUsers(
    sellerId: number,
    buyerId: number,
  ): Promise<Chat | null> {
    const chat = await this.chatRepository.findChatBetweenUsers(
      sellerId,
      buyerId,
    );

    if (!chat) {
      this.logger.warn(
        `No chat found between user ${buyerId} and user ${sellerId}.`,
      );
      return null;
    }

    this.logger.log(`Chat found between user ${buyerId} and user ${sellerId}.`);
    return chat;
  }

  async getUserChats(userId: number): Promise<UserChat[]> {
    const userChats = await this.chatRepository.getUserChats(userId);

    if (!userChats) {
      this.logger.warn(`User with ID ${userId} has no chats.`);
    }

    this.logger.log(`User with ID ${userId} has ${userChats.length} chats.`);

    return userChats;
  }

  async getChatById(id: number, userId: number): Promise<ChatMessages> {
    await this.validationService.validateChatMembers(id, userId);

    const chat = await this.chatRepository.getChatById(id);

    if (!chat) {
      this.logger.warn(`Chat with ID ${id} not found.`);
      throw new NotFoundException(ChatErrMsg.ChatNotFound);
    }

    this.logger.log(`Fetched chat with ID ${id}.`);

    return chat;
  }

  async createChat(createDto: CreateChatDto): Promise<Chat> {
    try {
      const chat = await this.chatRepository.createChat(createDto);

      this.logger.log(
        `Chat created successfully between user ${createDto.buyerId} and user ${createDto.sellerId}.`,
      );
      return chat;
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        this.logger.warn(
          `User with ID ${createDto.buyerId} or ${createDto.sellerId} not found.`,
        );
        throw new NotFoundException(UserErrMsg.UserNotFound);
      }
    }
  }

  async deleteChat(chatId: number, userId: number): Promise<void> {
    await this.validationService.validateChatMembers(chatId, userId);

    try {
      this.logger.log(`Deleting chat with ID ${chatId}.`);

      return await this.chatRepository.deleteChat(chatId);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        this.logger.warn(`Chat with ID ${chatId} not found for deletion.`);
        throw new NotFoundException(ChatErrMsg.ChatNotFound);
      }
    }
  }
}
