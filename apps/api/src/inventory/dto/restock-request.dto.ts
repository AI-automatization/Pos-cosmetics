import { IsString, IsNumber, Min } from 'class-validator';

export class RestockRequestDto {
  @IsString()
  productId!: string;

  @IsString()
  productName!: string;

  @IsNumber()
  @Min(0)
  currentStock!: number;
}
