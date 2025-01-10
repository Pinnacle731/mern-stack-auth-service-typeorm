import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Roles } from '../../types';
import { Tenant } from './Tenant';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  userName!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  password!: string;

  @Column({
    type: 'enum',
    enum: Roles,
    default: Roles.CUSTOMER,
  })
  role!: Roles;

  // multiple tanants and one user
  @ManyToOne(() => Tenant)
  tenant!: Tenant | null;
}
