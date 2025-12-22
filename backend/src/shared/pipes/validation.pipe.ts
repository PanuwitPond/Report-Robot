/**
 * Validation Pipe
 * Validates request bodies against DTOs
 */

import {
    PipeTransform,
    Injectable,
    ArgumentMetadata,
    BadRequestException,
    ValidationError,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
    async transform(value: any, { metatype }: ArgumentMetadata) {
        if (!metatype || !this.toValidate(metatype)) {
            return value;
        }

        const object = plainToInstance(metatype, value);
        const errors = await validate(object);

        if (errors.length > 0) {
            const messages = this.buildErrorMessages(errors);
            throw new BadRequestException({
                message: 'Validation failed',
                errors: messages,
            });
        }

        return object;
    }

    private toValidate(metatype: Function): boolean {
        const types: Function[] = [String, Boolean, Number, Array, Object];
        return !types.includes(metatype);
    }

    private buildErrorMessages(errors: ValidationError[]): Record<string, string[]> {
        const messages: Record<string, string[]> = {};

        errors.forEach((error) => {
            const property = error.property;
            const constraints = error.constraints || {};

            messages[property] = Object.values(constraints);
        });

        return messages;
    }
}
