import { IsString, IsOptional, IsEmail } from 'class-validator';

export class UpdateSiteConfigDto {
  @IsString()
  @IsOptional()
  brandName?: string;

  @IsString()
  @IsOptional()
  heroTitle?: string;

  @IsString()
  @IsOptional()
  heroSubtitle?: string;

  @IsString()
  @IsOptional()
  bioTitle?: string;

  @IsString()
  @IsOptional()
  bioContent?: string;

  @IsString()
  @IsOptional()
  bioImage?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  contactWechat?: string;

  @IsString()
  @IsOptional()
  locationText?: string;

  @IsString()
  @IsOptional()
  bilibiliUrl?: string;

  @IsString()
  @IsOptional()
  footerText?: string;
}
