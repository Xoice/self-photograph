import { IsString, IsOptional, IsBoolean, IsNumber, IsNotEmpty, IsISO8601, IsUUID } from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: '名称必须是字符串' })
  @IsNotEmpty({ message: '名称不能为空' })
  name: string;

  @IsString({ message: 'URL标识必须是字符串' })
  @IsNotEmpty({ message: 'URL标识不能为空' })
  slug: string;

  @IsUUID('4', { message: '父分类ID必须是有效的UUID' })
  @IsOptional()
  parentId?: string;

  @IsNumber({}, { message: '排序必须是数字' })
  @IsOptional()
  sortOrder?: number;

  @IsBoolean({ message: '可见性必须是布尔值' })
  @IsOptional()
  isVisible?: boolean;
}

export class UpdateCategoryDto {
  @IsString({ message: '名称必须是字符串' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'URL标识必须是字符串' })
  @IsOptional()
  slug?: string;

  @IsUUID('4', { message: '父分类ID必须是有效的UUID' })
  @IsOptional()
  parentId?: string | null;

  @IsNumber({}, { message: '排序必须是数字' })
  @IsOptional()
  sortOrder?: number;

  @IsBoolean({ message: '可见性必须是布尔值' })
  @IsOptional()
  isVisible?: boolean;
}

export class CreateWorkDto {
  @IsString({ message: '标题必须是字符串' })
  @IsNotEmpty({ message: '标题不能为空' })
  title: string;

  @IsString({ message: 'URL标识必须是字符串' })
  @IsNotEmpty({ message: 'URL标识不能为空' })
  slug: string;

  @IsString({ message: '摘要必须是字符串' })
  @IsNotEmpty({ message: '摘要不能为空' })
  summary: string;

  @IsString({ message: '描述必须是字符串' })
  @IsOptional()
  description?: string;

  @IsString({ message: '封面图必须是字符串' })
  @IsNotEmpty({ message: '封面图不能为空' })
  coverImage: string;

  @IsUUID('4', { message: '分类ID必须是有效的UUID' })
  @IsOptional()
  categoryId?: string | null;

  @IsString({ message: '缩略图必须是字符串' })
  @IsOptional()
  thumbnailImage?: string;

  @IsISO8601({}, { message: '拍摄日期必须是有效的ISO8601日期' })
  @IsOptional()
  shootDate?: string;

  @IsString({ message: '拍摄地点必须是字符串' })
  @IsOptional()
  location?: string;

  @IsString({ message: '相机信息必须是字符串' })
  @IsOptional()
  cameraInfo?: string;

  @IsBoolean({ message: '精选必须是布尔值' })
  @IsOptional()
  isFeatured?: boolean;

  @IsBoolean({ message: '发布状态必须是布尔值' })
  @IsOptional()
  isPublished?: boolean;

  @IsNumber({}, { message: '排序必须是数字' })
  @IsOptional()
  sortOrder?: number;
}

export class UpdateWorkDto {
  @IsString({ message: '标题必须是字符串' })
  @IsOptional()
  title?: string;

  @IsString({ message: 'URL标识必须是字符串' })
  @IsOptional()
  slug?: string;

  @IsString({ message: '摘要必须是字符串' })
  @IsOptional()
  summary?: string;

  @IsString({ message: '描述必须是字符串' })
  @IsOptional()
  description?: string;

  @IsString({ message: '封面图必须是字符串' })
  @IsOptional()
  coverImage?: string;

  @IsUUID('4', { message: '分类ID必须是有效的UUID' })
  @IsOptional()
  categoryId?: string | null;

  @IsString({ message: '缩略图必须是字符串' })
  @IsOptional()
  thumbnailImage?: string;

  @IsISO8601({}, { message: '拍摄日期必须是有效的ISO8601日期' })
  @IsOptional()
  shootDate?: string;

  @IsString({ message: '拍摄地点必须是字符串' })
  @IsOptional()
  location?: string;

  @IsString({ message: '相机信息必须是字符串' })
  @IsOptional()
  cameraInfo?: string;

  @IsBoolean({ message: '精选必须是布尔值' })
  @IsOptional()
  isFeatured?: boolean;

  @IsBoolean({ message: '发布状态必须是布尔值' })
  @IsOptional()
  isPublished?: boolean;

  @IsNumber({}, { message: '排序必须是数字' })
  @IsOptional()
  sortOrder?: number;
}
