export class ResponsePatotaDto {
  id: string;
  title: string;
  patotaOwner: string;
  patotaDate: Date;
  amountPlayers: number;
  monthlyValue: number;
  players: string[];
  createdAt: Date;
  updatedAt: Date | null;

  constructor(
    title: string,
    patotaOwner: string,
    patotaDate: Date,
    amountPlayers: number,
    monthlyValue: number,
    players: string[],
    createdAt: Date,
    updatedAt: Date | null = null,
    id: string
  ) {
    this.title = title;
    this.patotaOwner = patotaOwner;
    this.patotaDate = patotaDate;
    this.amountPlayers = amountPlayers;
    this.monthlyValue = monthlyValue;
    this.players = players;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.id = id;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromJson(json: any): ResponsePatotaDto {
    return new ResponsePatotaDto(
      json.title,
      json.patotaOwner,
      new Date(json.patotaDate),
      json.amountPlayers,
      json.monthlyValue,
      json.players || [],
      new Date(json.createdAt),
      json.updatedAt ? new Date(json.updatedAt) : null,
      json.id
    );
  }
}
