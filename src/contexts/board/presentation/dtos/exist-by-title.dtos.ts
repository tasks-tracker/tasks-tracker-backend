import { ApiProperty } from '@nestjs/swagger';

export class ExistByTitleQueryDto {
  @ApiProperty({
    example: 'Example title',
    description: 'Title of the board',
  })
  title: string;
}
