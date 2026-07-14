import { Module } from '@nestjs/common';
import { CategoriesModule } from '../categories/categories.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [CategoriesModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
