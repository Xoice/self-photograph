import { IsString, IsOptional, IsBoolean, IsNumber, IsNotEmpty, IsISO8601 } from 'class-validator';
import { IsArray } from 'class-validator';

export class CreateWorkshopDto {
  @IsString({ message: '标题必须是字符串' })
  @IsNotEmpty({ message: '标题不能为空' })
  title: string;

  @IsString({ message: 'URL标识必须是字符串' })
  @IsNotEmpty({ message: 'URL标识不能为空' })
  slug: string;

  @IsString({ message: '副标题必须是字符串' })
  @IsOptional()
  subtitle?: string;

  @IsString({ message: '摘要必须是字符串' })
  @IsOptional()
  summary?: string;

  @IsString({ message: '活动介绍必须是字符串' })
  @IsOptional()
  content?: string;

  @IsString({ message: '封面图必须是字符串' })
  @IsOptional()
  coverImage?: string;

  @IsString({ message: '价格必须是字符串' })
  @IsOptional()
  priceText?: string;

  @IsNumber({}, { message: '价格(分)必须是数字' })
  @IsOptional()
  priceCents?: number;

  @IsString({ message: '地点必须是字符串' })
  @IsOptional()
  location?: string;

  @IsISO8601({}, { message: '开始日期格式不正确' })
  @IsOptional()
  startDate?: string;

  @IsISO8601({}, { message: '结束日期格式不正确' })
  @IsOptional()
  endDate?: string;

  @IsNumber({}, { message: '名额必须是数字' })
  @IsOptional()
  capacity?: number;

  @IsString({ message: '等级必须是字符串' })
  @IsOptional()
  level?: string;

  @IsString({ message: '时长必须是字符串' })
  @IsOptional()
  durationText?: string;

  @IsString({ message: '状态必须是字符串' })
  @IsOptional()
  status?: string;

  @IsBoolean({ message: '精选必须是布尔值' })
  @IsOptional()
  isFeatured?: boolean;

  @IsBoolean({ message: '发布状态必须是布尔值' })
  @IsOptional()
  isPublished?: boolean;

  @IsNumber({}, { message: '排序必须是数字' })
  @IsOptional()
  sortOrder?: number;
  @IsArray({ message: '标签必须是数组' })
  @IsOptional()
  @IsString({ each: true, message: '标签必须是字符串数组' })
  tags?: string[];
}

export class UpdateWorkshopDto {
  @IsString({ message: '标题必须是字符串' })
  @IsOptional()
  title?: string;

  @IsString({ message: 'URL标识必须是字符串' })
  @IsOptional()
  slug?: string;

  @IsString({ message: '副标题必须是字符串' })
  @IsOptional()
  subtitle?: string;

  @IsString({ message: '摘要必须是字符串' })
  @IsOptional()
  summary?: string;

  @IsString({ message: '活动介绍必须是字符串' })
  @IsOptional()
  content?: string;

  @IsString({ message: '封面图必须是字符串' })
  @IsOptional()
  coverImage?: string;

  @IsString({ message: '价格必须是字符串' })
  @IsOptional()
  priceText?: string;

  @IsNumber({}, { message: '价格(分)必须是数字' })
  @IsOptional()
  priceCents?: number;

  @IsString({ message: '地点必须是字符串' })
  @IsOptional()
  location?: string;

  @IsISO8601({}, { message: '开始日期格式不正确' })
  @IsOptional()
  startDate?: string;

  @IsISO8601({}, { message: '结束日期格式不正确' })
  @IsOptional()
  endDate?: string;

  @IsNumber({}, { message: '名额必须是数字' })
  @IsOptional()
  capacity?: number;

  @IsString({ message: '等级必须是字符串' })
  @IsOptional()
  level?: string;

  @IsString({ message: '时长必须是字符串' })
  @IsOptional()
  durationText?: string;

  @IsString({ message: '状态必须是字符串' })
  @IsOptional()
  status?: string;

  @IsBoolean({ message: '精选必须是布尔值' })
  @IsOptional()
  isFeatured?: boolean;

  @IsBoolean({ message: '发布状态必须是布尔值' })
  @IsOptional()
  isPublished?: boolean;

  @IsNumber({}, { message: '排序必须是数字' })
  @IsOptional()
  sortOrder?: number;
  @IsArray({ message: '标签必须是数组' })
  @IsOptional()
  @IsString({ each: true, message: '标签必须是字符串数组' })
  tags?: string[];
}
