import { User } from '@auth/express';
import { Content, File, Post, PostHistory } from '@prisma/client';
import { ProjectPrismaType } from '../../database/prisma/client.js';
import { ContentEntity } from '../content/content.entity.js';
import { FileEntity } from '../file/file.entity.js';
import { PostHistoryEntity } from '../postHistory/postHistory.entity.js';
import { UserEntity } from '../user/user.entity.js';
import { PostEntity } from './post.entity.js';

export class PostRepository {
  async findManyByProjectId(prisma: ProjectPrismaType): Promise<
    {
      post: PostEntity;
      contents: { content: ContentEntity; file: FileEntity | null; createdBy: UserEntity }[];
      histories: PostHistoryEntity[];
    }[]
  > {
    const records = await prisma.post.findMany({
      include: {
        contents: {
          include: {
            file: true,
            createdBy: true,
          },
        },
        postHistories: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return records.map((record) => {
      const post = PostEntity.Reconstruct<Post, PostEntity>(record);
      const contents: { content: ContentEntity; file: FileEntity | null; createdBy: UserEntity }[] =
        [];
      for (const content of record.contents) {
        contents.push({
          content: ContentEntity.Reconstruct<Content, ContentEntity>(content),
          file: content.file ? FileEntity.Reconstruct<File, FileEntity>(content.file) : null,
          createdBy: UserEntity.Reconstruct<User, UserEntity>(content.createdBy),
        });
      }
      const histories = record.postHistories.map((history) =>
        PostHistoryEntity.Reconstruct<PostHistory, PostHistoryEntity>(history)
      );

      return {
        post,
        contents,
        histories,
      };
    });
  }

  async findOneById(prisma: ProjectPrismaType, id: string): Promise<PostEntity> {
    const record = await prisma.post.findFirstOrThrow({
      where: {
        id,
      },
    });

    return PostEntity.Reconstruct<Post, PostEntity>(record);
  }

  async findOneWithContentsById(
    prisma: ProjectPrismaType,
    id: string
  ): Promise<{
    post: PostEntity;
    contents: { content: ContentEntity; file: FileEntity | null; createdBy: UserEntity }[];
    histories: PostHistoryEntity[];
  }> {
    const record = await prisma.post.findFirstOrThrow({
      where: {
        id,
      },
      include: {
        contents: {
          include: {
            file: true,
            createdBy: true,
          },
        },
        postHistories: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const post = PostEntity.Reconstruct<Post, PostEntity>(record);
    const contents = [];
    for (const content of record.contents) {
      contents.push({
        content: ContentEntity.Reconstruct<Content, ContentEntity>(content),
        file: content.file ? FileEntity.Reconstruct<File, FileEntity>(content.file) : null,
        createdBy: UserEntity.Reconstruct<User, UserEntity>(content.createdBy),
      });
    }
    const histories = record.postHistories.map((history) =>
      PostHistoryEntity.Reconstruct<PostHistory, PostHistoryEntity>(history)
    );

    return {
      post,
      contents,
      histories,
    };
  }

  async create(prisma: ProjectPrismaType, postEntity: PostEntity): Promise<PostEntity> {
    const record = await prisma.post.create({
      data: postEntity.toPersistence(),
    });

    return PostEntity.Reconstruct<Post, PostEntity>(record);
  }

  async delete(prisma: ProjectPrismaType, projectId: string, id: string): Promise<PostEntity> {
    const record = await prisma.post.delete({
      where: {
        id,
        projectId,
      },
    });

    return PostEntity.Reconstruct<Post, PostEntity>(record);
  }
}
