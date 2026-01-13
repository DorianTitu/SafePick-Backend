import { Module } from '@nestjs/common';
import { SecretsService } from './secrets.service';

@Module({
  providers: [SecretsService],
  exports: [SecretsService], // Export to make available in other modules
})
export class ConfigModule {}
