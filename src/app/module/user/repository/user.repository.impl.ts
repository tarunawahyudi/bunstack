import {Repository} from "typeorm"
import {User} from "@module/user/entity/user"
import {injectable} from "tsyringe"
import type {UserRepository} from "@module/user/repository/user.repository"

@injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly userRepository: Repository<User>) {
  }

  create(data: Partial<User>): User {
    return this.userRepository.create(data)
  }

  save(user: User): Promise<User> {
    return this.userRepository.save(user)
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find()
  }

  findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } })
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } })
  }
}
