import { IsDefined, IsString } from 'class-validator';

export class AddTrackDto {
  @IsDefined()
  @IsString()
  id: string;

  @IsDefined()
  @IsString()
  name: string;

  @IsDefined()
  @IsString()
  imageUrl: string;
}
