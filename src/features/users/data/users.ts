import { faker } from '@faker-js/faker'

export const users = Array.from({ length: 20 }, () => {
  const name = faker.person.firstName()
  return {
    id: faker.string.uuid(),
    name: faker.person.firstName(),
    email: faker.internet.email({ firstName: name }).toLocaleLowerCase(),
    phoneNumber: faker.phone.number({ style: 'international' }),
    status: faker.helpers.arrayElement([
      'active',
      'inactive',
      'suspended',
    ]),
    role: faker.helpers.arrayElement([
      'admin',
      'customer',
      'delivery_person',
    ]),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }
})
