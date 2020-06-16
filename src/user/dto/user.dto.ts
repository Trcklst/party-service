import { IsArray, IsNumber, IsString } from 'class-validator';
import { SubscriptionEnum } from '../enum/subscription.enum';
import { RoleEnum } from '../enum/role.enum';

export class UserDto {
  @IsNumber()
  userId: number;

  @IsArray()
  authorities: RoleEnum[];

  @IsString()
  subscription: SubscriptionEnum;
}
