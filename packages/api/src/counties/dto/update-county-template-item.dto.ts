import { PartialType } from '@nestjs/swagger';
import { CreateCountyTemplateItemDto } from './create-county-template-item.dto';

export class UpdateCountyTemplateItemDto extends PartialType(CreateCountyTemplateItemDto) {}
