import {
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
  Matches,
  IsIn,
} from 'class-validator';

export class CreateWithdrawalOrderDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]{10,}$/, { message: 'Invalid child ID format' })
  childId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @MinLength(3)
  pickerName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{8,13}$/, { message: 'Cedula must be 8-13 digits' })
  pickerCedula: string;

  @IsString()
  @IsNotEmpty()
  @Matches(
    /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
    { message: 'Invalid phone format' },
  )
  pickerPhone: string;

  @IsString()
  @IsNotEmpty()
  @IsIn([
    'padre',
    'madre',
    'abuelo',
    'abuela',
    'tío',
    'tía',
    'hermano',
    'hermana',
    'otro',
  ])
  relationship: string;
}
