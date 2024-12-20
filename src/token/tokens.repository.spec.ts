import { Test, TestingModule } from '@nestjs/testing';
import { TokensRepository } from './tokens.repository';
import { PrismaService } from '../prisma/prisma.service';
import { Token } from '@prisma/client';

describe('TokensRepository', () => {
  let tokensRepository: TokensRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokensRepository,
        {
          provide: PrismaService,
          useValue: {
            token: {
              findFirst: jest.fn(),
              create: jest.fn(),
              findMany: jest.fn(),
              deleteMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    tokensRepository = module.get<TokensRepository>(TokensRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should find one token by userId', async () => {
    const userId = 1;
    const token: Token = {
      id: 1,
      userId,
      token: 'refreshToken',
      expiresAt: new Date(),
      createdAt: new Date(),
    };
    jest.spyOn(prismaService.token, 'findFirst').mockResolvedValue(token);

    expect(await tokensRepository.findOne(userId)).toBe(token);
    expect(prismaService.token.findFirst).toHaveBeenCalledWith({
      where: { userId },
    });
  });

  it('should create a new token', async () => {
    const userId = 1;
    const refreshToken = 'refreshToken';
    const expiresAt = new Date();
    const token: Token = {
      id: 1,
      userId,
      token: refreshToken,
      expiresAt,
      createdAt: new Date(),
    };
    jest.spyOn(prismaService.token, 'create').mockResolvedValue(token);

    expect(await tokensRepository.create(userId, refreshToken, expiresAt)).toBe(
      token,
    );
    expect(prismaService.token.create).toHaveBeenCalledWith({
      data: { userId, expiresAt, token: refreshToken },
    });
  });

  it('should find user tokens by userId', async () => {
    const userId = 1;
    const tokens: Token[] = [
      {
        id: 1,
        userId,
        token: 'refreshToken',
        expiresAt: new Date(),
        createdAt: new Date(),
      },
    ];
    jest.spyOn(prismaService.token, 'findMany').mockResolvedValue(tokens);

    expect(await tokensRepository.findUserTokens(userId)).toBe(tokens);
    expect(prismaService.token.findMany).toHaveBeenCalledWith({
      where: { userId },
    });
  });

  it('should delete user tokens by token', async () => {
    const token = 'refreshToken';
    jest
      .spyOn(prismaService.token, 'deleteMany')
      .mockResolvedValue({ count: 1 });

    expect(await tokensRepository.deleteUserTokens(token)).toEqual({
      count: 1,
    });
    expect(prismaService.token.deleteMany).toHaveBeenCalledWith({
      where: { token },
    });
  });

  it('should delete expired tokens', async () => {
    const now = new Date();
    jest
      .spyOn(prismaService.token, 'deleteMany')
      .mockResolvedValue({ count: 1 });

    expect(await tokensRepository.deleteExpiredTokens(now)).toEqual({
      count: 1,
    });
    expect(prismaService.token.deleteMany).toHaveBeenCalledWith({
      where: { expiresAt: { lt: now } },
    });
  });
});
