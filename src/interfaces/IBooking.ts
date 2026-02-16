export interface IBooking {
  id?: number;
  user_id: number;
  show_id: number;
  seats: string;
  total_price: number;
}