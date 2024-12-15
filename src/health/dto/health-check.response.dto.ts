import { ApiProperty } from "@nestjs/swagger";

export class HealthCheckResponseDto {
  @ApiProperty({
    description: "The current status of the API",
    example: 200,
    enum: [200, 503],
  })
  status: number;

  @ApiProperty({
    description: "The timestamp when the health check was performed",
    example: "2023-12-20T10:00:00.000Z",
    format: "date-time",
  })
  timestamp: string;
}
