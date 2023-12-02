import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        // {
        //   provide: getModelToken(User),
        //   useValue: mockModel,
        // },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // generate unit-test from user.service.ts
  // it('should return a user', async () => {
  //   const result = {
  //     id: 1,
  //     username: 'test',
  //     email: '',
  //   };
  //   jest.spyOn(service, 'findOne').mockImplementation(async () => result);
  //   expect(await service.findOne(1)).toBe(result);
  // });
  //
  // // test for find
  // it('find return users', async () => {
  //   const result = [
  //     {
  //       id: 1,
  //       username: 'test',
  //       email: '',
  //     },
  //   ];
  //   jest.spyOn(service, 'find').mockImplementation(async () => result);
  //   expect(await service.find({})).toBe(result);
  // });
  //
  // // test for hashPassword
  // it('hashPassword  work correctly', async () => {
  //   const result = 'test';
  //   jest.spyOn(service, 'hashPassword').mockImplementation(async () => result);
  //   expect(await service.hashPassword('test')).toBe(result);
  // });

  // test for findByUserName
  // test for getUserRoles
  // test for createApiKey
  // test for revokeUserApiKey
});
