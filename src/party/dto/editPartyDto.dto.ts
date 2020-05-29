import { IsDefined, IsString } from 'class-validator';

export class EditPartyDto {
  @IsDefined()
  @IsString()
  name: string;
}
