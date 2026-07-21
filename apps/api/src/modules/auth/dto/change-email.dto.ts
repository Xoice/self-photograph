import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class ChangeEmailDto {
  @IsString({ message: '当前密码必须是字符串' })
  @IsNotEmpty({ message: '当前密码不能为空' })
  currentPassword: string;

  @IsEmail({}, { message: '新邮箱格式不正确' })
  @IsNotEmpty({ message: '新邮箱不能为空' })
  newEmail: string;
}
