import { ApiProperty } from '@nestjs/swagger';

export class GetPaginationTodoForUserResponseDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ type: String, nullable: true })
  description: string | null;

  @ApiProperty()
  isCompleted: boolean;

  @ApiProperty()
  isDeleted: boolean;

  @ApiProperty({ nullable: true, type: Date })
  deadline: Date | null;
}

export class GetPaginationTodoForUserResponse {
  @ApiProperty({ type: [GetPaginationTodoForUserResponseDto] })
  items: GetPaginationTodoForUserResponseDto[];
}
