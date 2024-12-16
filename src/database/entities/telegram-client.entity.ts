import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";

@Entity("telegram_client")
export class TelegramClient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "api_id" })
  apiId: number;

  @Column({ name: "api_hash" })
  apiHash: string;

  @Column({ name: "string_session" })
  stringSession: string;

  @Column({ name: "group_ids", type: "simple-array" })
  groupIds: string[];

  @Column({ name: "is_active", default: true })
  isActive: boolean;

  @Column({ name: "min_reply_delay_minutes", type: "int", default: 1 })
  minReplyDelayMinutes: number;

  @Column({ name: "max_reply_delay_minutes", type: "int", default: 5 })
  maxReplyDelayMinutes: number;

  @Column({ name: "min_reaction_delay_minutes", type: "int", default: 2 })
  minReactionDelayMinutes: number;

  @Column({ name: "max_reaction_delay_minutes", type: "int", default: 8 })
  maxReactionDelayMinutes: number;

  @Column({
    name: "character_id",
    nullable: true,
    default: "d089d51f-e1fa-4ae1-b85a-1e00fe8bc295",
  })
  characterId: string;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @DeleteDateColumn({
    name: "deleted_at",
    type: "timestamptz",
    nullable: true,
  })
  deletedAt: Date | null;
}
