import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { HypeRole } from '../entity';

export function ApiSpecGetRoles() {
  return applyDecorators(
    ApiOperation({
      description: 'This API endpoint is used to retrieve all the roles.',
    }),

    ApiResponse({ status: 200, description: 'Successfully retrieved roles.' }),
    ApiResponse({ status: 403, description: 'Forbidden.' }),
    ApiOkResponse({
      description: 'The roles have been successfully retrieved.',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(HypeRole) },
          },
          total: {
            type: 'number',
          },
        },
      },
    }),
  );
}

export function ApiSpecGetRole() {
  return applyDecorators(
    ApiOperation({
      description:
        'This API endpoint is used to retrieve a specific role by its ID.',
    }),
    ApiResponse({
      status: 200,
      description: 'Successfully retrieved the role.',
    }),
    ApiResponse({ status: 403, description: 'Forbidden.' }),
    ApiOkResponse({
      description: 'The role has been successfully retrieved.',
      type: HypeRole,
      schema: { $ref: getSchemaPath(HypeRole) },
    }),
  );
}

export function ApiSpecCreateRole() {
  return applyDecorators(
    ApiOperation({
      description: 'This API endpoint is used to create a new role.',
    }),
    ApiResponse({ status: 201, description: 'Successfully created the role.' }),
    ApiResponse({ status: 403, description: 'Forbidden.' }),
    ApiOkResponse({
      description: 'The role has been successfully created.',
      schema: { $ref: getSchemaPath(HypeRole) },
    }),
  );
}

export function ApiSpecDeleteRole() {
  return applyDecorators();
}

export function ApiSpecGetAssignRole() {
  return applyDecorators();
}

export function ApiSpecGetPermissions() {
  return applyDecorators();
}

export function ApiSpecCreatePermission() {
  return applyDecorators();
}

export function ApiSpecDeletePermission() {
  return applyDecorators();
}

export function ApiSpecAssignPermission() {
  return applyDecorators();
}

export function ApiSpecAssignRole() {
  return applyDecorators();
}
