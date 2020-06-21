import { IsArray, IsEmail, IsNumber, IsString } from 'class-validator';
import { SubscriptionEnum } from '../enum/subscription.enum';
import { RoleEnum } from '../enum/role.enum';

export class UserDto {
  @IsNumber()
  userId: number;

  @IsEmail()
  email: string;

  @IsArray()
  authorities: RoleEnum[];

  @IsString()
  subscription: SubscriptionEnum;
}
