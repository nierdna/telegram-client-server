import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckResponseDto {
  @ApiProperty({
    description: 'The current status of the API',
    example: 'ok',
    enum: ['ok', 'error'],
  })
  status: string;

  @ApiProperty({
    description: 'The timestamp when the health check was performed',
    example: '2023-12-20T10:00:00.000Z',
    format: 'date-time'
  })
  timestamp: string;
}