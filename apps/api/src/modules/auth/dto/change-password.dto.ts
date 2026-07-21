import { IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @IsString({ message: '当前密码必须是字符串' })
  @IsNotEmpty({ message: '当前密码不能为空' })
  currentPassword: string;

  @IsString({ message: '新密码必须是字符串' })
  @MinLength(6, { message: '新密码长度不能少于6位' })
  @MaxLength(72, { message: '新密码长度不能超过72位（bcrypt 限制）' })
  @IsNotEmpty({ message: '新密码不能为空' })
  newPassword: string;
}
