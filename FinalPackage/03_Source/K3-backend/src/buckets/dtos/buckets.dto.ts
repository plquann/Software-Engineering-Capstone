import { IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";
import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntityDto } from "base/base-entity.dto";
import { UserDto } from "users/dtos/users.dto";

export class BucketIdRequestParamsDto {
  constructor(bucketId) {
    this.id = bucketId;
  }

  @IsString()
  @IsNotEmpty()
  id: string;
}

@Entity("buckets")
export class BucketDto extends BaseEntityDto {
  constructor(tokenId, price, user: UserDto) {
    super();
    this.tokenId = tokenId;
    this.price = price;
    // this.user = user;
  }

  @IsNotEmpty()
  @IsString()
  @Column({
    name: "token_id",
  })
  tokenId: string;

  @IsNumber()
  @IsPositive()
  @Column({
    name: "price",
  })
  price: number;

  // @ManyToOne(type => UserDto, UserDto => UserDto.buckets)
  // user: UserDto;
}
