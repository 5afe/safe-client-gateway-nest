import { Module } from '@nestjs/common';
import { ConfigApi } from './config-api.service';
import { CacheFirstDataSourceModule } from '../cache/cache.first.data.source.module';
import { ValidationErrorFactory } from '../errors/validation-error-factory';

@Module({
  imports: [CacheFirstDataSourceModule],
  providers: [ConfigApi, ValidationErrorFactory],
  exports: [ConfigApi],
})
export class ConfigApiModule {}
