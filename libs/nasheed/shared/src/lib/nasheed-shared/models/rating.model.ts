export interface RatingModel {
  userId: number;
  songId: number;
  value: number;
  createdAt: string;
  updatedAt?: string;
}

export interface AddRatingCommand {
  value: number;
}
