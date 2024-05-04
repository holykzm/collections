import { Post } from '@prisma/client';
import { v4 } from 'uuid';
import { UnexpectedException } from '../../../exceptions/unexpected.js';
import { LocalizedPost } from '../../../types/index.js';
import { ContentEntity } from '../content/content.entity.js';
import { FileEntity } from '../file/file.entity.js';
import { PostHistoryEntity } from '../postHistory/postHistory.entity.js';
import { PrismaBaseEntity } from '../prismaBaseEntity.js';
import { UserEntity } from '../user/user.entity.js';

export class PostEntity extends PrismaBaseEntity<Post> {
  static Construct({
    projectId,
    defaultLocale,
    createdById,
  }: {
    projectId: string;
    defaultLocale: string;
    createdById: string;
  }): { post: PostEntity; content: ContentEntity } {
    const postId = v4();
    const post = new PostEntity({
      id: postId,
      projectId,
      slug: this.GenerateSlug(),
      status: 'init',
      publishedAt: null,
      defaultLocale,
      version: 0,
      createdById,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const content = ContentEntity.Construct({ projectId, postId, locale: defaultLocale });

    return { post, content };
  }

  private isValid() {
    if (!this.props.id) {
      throw new UnexpectedException({ message: 'id is required' });
    }
  }

  public beforeUpdateValidate(): void {
    this.isValid();
  }

  public beforeInsertValidate(): void {
    this.isValid();
  }

  static GenerateSlug = () => {
    return v4().trim().replace(/-/g, '').substring(0, 10);
  };

  get id(): string {
    return this.props.id;
  }

  get projectId(): string {
    return this.projectId;
  }

  get status(): string {
    return this.props.status;
  }

  get defaultLocale(): string {
    return this.props.defaultLocale;
  }

  get version(): number {
    return this.props.version;
  }

  get createdById(): string {
    return this.props.createdById;
  }

  updatePost(status: string) {
    this.props.status = status;

    if (status === 'published') {
      this.props.publishedAt = new Date();
      this.props.version += 1;
    }
  }

  updateStatus(status: string) {
    this.props.status = status;
  }

  toLocalizedWithContentsResponse(
    locale: string,
    contents: { content: ContentEntity; file: FileEntity | null }[],
    histories: PostHistoryEntity[],
    createdBy: UserEntity
  ): LocalizedPost {
    const localizedContent = contents.find((c) => c.content.isSameLocaleContent(locale));
    const locales = contents.map((c) => c.content.locale);

    return {
      id: this.props.id,
      slug: this.props.slug,
      status: this.props.status,
      updatedAt: this.props.updatedAt,
      publishedAt: this.props.publishedAt,
      defaultLocale: this.props.defaultLocale,
      title: localizedContent?.content.title ?? '',
      body: localizedContent?.content.body ?? '',
      bodyJson: localizedContent?.content.bodyJson ?? '',
      bodyHtml: localizedContent?.content.bodyHtml ?? '',
      contentLocale: localizedContent?.content.locale || this.props.defaultLocale,
      locales,
      authorName: createdBy.name,
      contents: contents.map((c) => ({
        ...c.content.toResponse(),
        file: c.file?.toResponseWithUrl() ?? null,
      })),
      histories: histories.map((history) => history.toResponse()),
    };
  }
}
