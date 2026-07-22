import { IsString, IsOptional, IsBoolean, IsNumber, IsNotEmpty, Matches } from 'class-validator';

export class CreateVideoDto {
  @IsString({ message: '标题必须是字符串' })
  @IsNotEmpty({ message: '标题不能为空' })
  title: string;

  @IsString({ message: 'URL标识必须是字符串' })
  @IsNotEmpty({ message: 'URL标识不能为空' })
  slug: string;

  @IsString({ message: '描述必须是字符串' })
  @IsOptional()
  description?: string;

  @IsString({ message: '平台必须是字符串' })
  @IsNotEmpty({ message: '平台不能为空' })
  platform: string;

  @IsString({ message: '视频链接必须是字符串' })
  @IsNotEmpty({ message: '视频链接不能为空' })
  @Matches(/^https?:\/\//, { message: '视频链接必须以 http:// 或 https:// 开头' })
  videoUrl: string;

  @IsString({ message: '封面图必须是字符串' })
  @IsOptional()
  coverImage?: string;

  @IsNumber({}, { message: '时长必须是数字' })
  @IsOptional()
  durationSeconds?: number;

  @IsString({ message: '分类必须是字符串' })
  @IsOptional()
  category?: string;

  @IsBoolean({ message: '发布状态必须是布尔值' })
  @IsOptional()
  isPublished?: boolean;

  @IsNumber({}, { message: '排序必须是数字' })
  @IsOptional()
  sortOrder?: number;
}

export class UpdateVideoDto {
  @IsString({ message: '标题必须是字符串' })
  @IsOptional()
  title?: string;

  @IsString({ message: 'URL标识必须是字符串' })
  @IsOptional()
  slug?: string;

  @IsString({ message: '描述必须是字符串' })
  @IsOptional()
  description?: string;

  @IsString({ message: '视频链接必须是字符串' })
  @IsOptional()
  @Matches(/^https?:\/\//, { message: '视频链接必须以 http:// 或 https:// 开头' })
  videoUrl?: string;

  @IsString({ message: '封面图必须是字符串' })
  @IsOptional()
  coverImage?: string;

  @IsNumber({}, { message: '时长必须是数字' })
  @IsOptional()
  durationSeconds?: number;

  @IsString({ message: '分类必须是字符串' })
  @IsOptional()
  category?: string;

  @IsBoolean({ message: '发布状态必须是布尔值' })
  @IsOptional()
  isPublished?: boolean;

  @IsNumber({}, { message: '排序必须是数字' })
  @IsOptional()
  sortOrder?: number;
}
