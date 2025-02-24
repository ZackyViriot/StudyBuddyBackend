import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/schemas/user.schema';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboardData(@GetUser() user: User) {
    try {
      const userId = typeof user._id === 'object' ? user._id.toString() : user._id;
      return await this.dashboardService.getDashboardData(userId);
    } catch (error) {
      throw error;
    }
  }
} 