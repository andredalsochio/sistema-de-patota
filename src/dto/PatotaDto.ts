export class PatotaDto {
  title: string;
  patotaOwner: string;
  patotaDate: Date | string;
  amountPlayers: number;
  monthlyValue: number;
  players?: string[];

  constructor(
    title: string,
    patotaOwner: string,
    patotaDate: Date,
    amountPlayers: number,
    monthlyValue: number,
    players?: string[]
  ) {
    this.title = title;
    this.patotaOwner = patotaOwner;
    this.patotaDate = patotaDate;
    this.amountPlayers = amountPlayers;
    this.monthlyValue = monthlyValue;
    this.players = players;
  }
}
