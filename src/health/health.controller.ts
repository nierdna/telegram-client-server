import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthCheckResponseDto } from './dto/health-check.response.dto';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ 
    summary: 'Check API health status',
    description: 'Returns the current health status of the API and the timestamp of the check'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'The API is healthy and operating normally',
    type: HealthCheckResponseDto 
  })
  @ApiResponse({
    status: 503,
    description: 'The API is currently unavailable or experiencing issues'
  })
  check(): HealthCheckResponseDto {
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  }
}