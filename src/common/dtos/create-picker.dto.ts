import {
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
  Matches,
  IsIn,
} from 'class-validator';

export class CreatePickerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @MinLength(3)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{8,13}$/, { message: 'Cedula must be 8-13 digits' })
  cedula: string;

  @IsString()
  @IsNotEmpty()
  @Matches(
    /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
    { message: 'Invalid phone format' },
  )
  phone: string;

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
