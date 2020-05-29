import { IsDefined, IsString } from 'class-validator';

export class CreatePartyDto {
  @IsDefined()
  @IsString()
  name: string;
}
