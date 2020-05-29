import { IsNumber } from 'class-validator';

export class UserDto {
  @IsNumber()
  id: number;

  @IsNumber()
  role: number;
}
