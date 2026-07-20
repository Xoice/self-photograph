import { IsString, IsNotEmpty, IsEmail, IsOptional, MaxLength } from 'class-validator';

export class CreateContactLeadDto {
  @IsString({ message: '姓名必须是字符串' })
  @IsNotEmpty({ message: '请输入姓名' })
  @MaxLength(100, { message: '姓名不能超过100个字符' })
  name: string;

  @IsEmail({}, { message: '请输入有效邮箱' })
  @IsNotEmpty({ message: '请输入邮箱' })
  email: string;

  @IsString({ message: '消息必须是字符串' })
  @IsNotEmpty({ message: '请输入消息内容' })
  @MaxLength(5000, { message: '消息不能超过5000个字符' })
  message: string;

  @IsString({ message: '来源页面必须是字符串' })
  @IsOptional()
  @MaxLength(200, { message: '来源页面不能超过200个字符' })
  sourcePage?: string;
}

export class CreateEnrollmentDto {
  @IsString({ message: '研学Slug必须是字符串' })
  @IsNotEmpty({ message: '请指定研学活动' })
  workshopSlug: string;

  @IsString({ message: '姓名必须是字符串' })
  @IsNotEmpty({ message: '请输入姓名' })
  @MaxLength(100, { message: '姓名不能超过100个字符' })
  name: string;

  @IsString({ message: '电话必须是字符串' })
  @IsNotEmpty({ message: '请输入电话' })
  @MaxLength(30, { message: '电话不能超过30个字符' })
  phone: string;

  @IsString({ message: '微信号必须是字符串' })
  @IsNotEmpty({ message: '请输入微信号' })
  @MaxLength(50, { message: '微信号不能超过50个字符' })
  wechat: string;

  @IsEmail({}, { message: '请输入有效邮箱' })
  @IsNotEmpty({ message: '请输入邮箱' })
  email: string;

  @IsString({ message: '留言必须是字符串' })
  @IsOptional()
  @MaxLength(2000, { message: '留言不能超过2000个字符' })
  message?: string;
}
