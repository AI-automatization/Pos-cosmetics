import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RealestateService } from './realestate.service';

@ApiTags('RealEstate')
@Controller('real-estate')
export class RealestateController {
  constructor(private readonly realestateService: RealestateService) {}
}
