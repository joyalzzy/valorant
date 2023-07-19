// import { Auth } from "./auth";
// import { Match } from "./match";
// import { Party } from "./party";
// import { ValUser } from "./client";
import { Client } from "./client";
import {
  CurrentGameMatchResponse,
  MatchDetailsResponse,
  PartyInviteResponse,
  PartyPlayerResponse,
} from "valorant-api-types";
import axios, { Axios, AxiosResponse } from "axios";
import { ValCache } from "./cache";
import { bot } from "../main";

export class Session {
  protected cache: ValCache;
  protected client: Client;
  async run() {
    this.cache = new ValCache();
    this.client = new Client();
    await this.client.init(
      process.env.VAL_USER || "",
      process.env.VAL_PASS || ""
    );
    await this.cache.ready;
    console.log("ready");
    // console.log(await this.cache.getPuuid('whiffdemon', 'luvcb'))
  }
  async getPlayerPuuid(name: string, tag: string) {
    return await this.cache.getPuuid(name, tag).then((id) => {
      return id
        ? id
        : (async () => {
            const res = await this.getPlayerParty(this.client.puuid);
            const res_1 = await this.sendInvite(
              name,
              tag,
              res.data.CurrentPartyID
            );
            const id = <string>res_1.data.Invites![0]["Subject"];
            console.log(id)
            this.cache.setPuuid(name, tag, id);
            return id;
          })();
    }).catch(async () => {return (await axios.get(`http://api.henrikdev.xyz/valorant/v1/account/${name}/${tag}`)).data.data.puuid}).then(_ => {
      this.cache.setPuuid(name, tag, _)
      return _
    }).catch(_ => {
      throw Error('Not found')
    });
  }

  async getPlayerKillsfromMatchResposne(
    match: MatchDetailsResponse,
    puuid: string
  ) {
    return match.players.find((x) => x.subject == puuid)?.stats?.kills;
  }

  async getCurrentMatch(
    puuid: string
  ): Promise<AxiosResponse<CurrentGameMatchResponse>> {
    return await this.client.sendGetRequest(
      `https://pd.ap.a.pvp.net/store/v2/storefront/${puuid}`
    );
  }
  async getLastMatchID(puuid: string) {
    return await this.client
      .sendGetRequest(
        `https://pd.ap.a.pvp.net/match-history/v1/history/${puuid}`
        //?startIndex={startIndex}&endIndex={endIndex}&queue={queue}`, {
      )
      .then((res) => {
        return res.data.History[0]["MatchID"];
      });
  }
  async getUserLastMatchKills(puuid: string) {
    const kills = await this.getLastMatchID(puuid)
      .then((_) => {
        return this.getMatchInfo(_);
      })
      .then((_) => {
        return this.getPlayerKillsfromMatchResposne(_.data, puuid);
      });
    return kills;
  }

  async getMatchInfo(matchID: string) {
    return await this.client
      .sendGetRequest(
        `https://pd.ap.a.pvp.net/match-details/v1/matches/${matchID}`
      )
      //?startIndex={startIndex}&endIndex={endIndex}&queue={queue}`, {)
      .then((res) => res);
  }
  async getPlayerParty(
    puuid: string
  ): Promise<AxiosResponse<PartyPlayerResponse>> {
    return Promise.resolve(
      await this.client.sendGetRequest(
        `https://glz-${this.client.region}-1.${this.client.shard}.a.pvp.net/parties/v1/players/${puuid}`,
        this.client.hversion
      )
    );
  }

  async sendInvite(
    name: string,
    tag: string,
    party_id: string
  ): Promise<AxiosResponse<PartyInviteResponse>> {
    return Promise.resolve(
      await this.client.sendPostRequest(
        `https://glz-${this.client.region}-1.${this.client.shard}.a.pvp.net/parties/v1/parties/${party_id}/invites/name/${name}/tag/${tag}`, {},
        this.client.hversion
      )
    );
  }
}
