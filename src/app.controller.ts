import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  @Get()
  @ApiOkResponse({ description: 'API status and documentation link.' })
  getRoot() {
    return {
      name: 'Task Management API',
      status: 'ok',
      docs: '/api/docs',
    };
  }
}
